require('dotenv').config();
import express from 'express';
import cors from 'cors';
import { createHandler } from 'graphql-http/lib/use/express';
// build the schema from SDL + resolvers
import { makeExecutableSchema } from '@graphql-tools/schema';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ruruHTML } = require('ruru/server');
import { GraphQLError } from 'graphql'; 
import DataLoader from 'dataloader';
import { PrismaClient, Artist, Track, Rating } from './generated/prisma';
const prisma = new PrismaClient();
import fs from 'node:fs';
import path from 'node:path';

// load manifest once at startup
const PERSISTED_PATH = path.resolve(__dirname, 'persisted-queries.json');
let PERSISTED: Record<string, string> = {};
try {
    PERSISTED = JSON.parse(fs.readFileSync(PERSISTED_PATH, 'utf8'));
    console.log(`Loaded ${Object.keys(PERSISTED).length} persisted queries`)
} catch {
    console.warn('No persisted-queries.json found yet')
}

const PERSISTED_ONLY = process.env.PERSISTED_ONLY === 'true';

// helpers
type GlobalId = {type: string, id: string};
type GraphQLContext = {
    prisma: PrismaClient,
    loaders: ReturnType<typeof buildLoaders>;
    req: express.Request;
    res: express.Response;
};

function toGlobalId(type: string, id: string | number): string {
    return Buffer.from(`${type}:${id}`, 'utf8').toString('base64');
}

function fromGlobalId(globalId: string): GlobalId {
    try {
        const decoded = Buffer.from(globalId, 'base64').toString('utf8');
        const [type, id] = decoded.split(':');
        if (!type || !id) throw new Error('Bad global id');
        return {type, id};
    } catch {
        throw new GraphQLError('Invalid global ID');
    }
}

function toIdCursor(id: number): string {
  return Buffer.from(`id:${id}`, 'utf8').toString('base64');
}
function fromIdCursor(cursor: string): number {
  const decoded = Buffer.from(cursor, 'base64').toString('utf8'); // "id:123"
  const [label, raw] = decoded.split(':');
  if (label !== 'id') throw new GraphQLError('Invalid cursor');
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) throw new GraphQLError('Invalid cursor id');
  return n;
}

// // turn a numeric index into an opaque base64 cursor
// function toCursor(index: number): string {
//     // create a string tag + index, so we can validate when decoding
//     return Buffer.from(`cursor:${index}`, 'utf8').toString('base64');
// }

// // decode the base64 cursor back into an index
// function fromCursor(cursor: string): number {
//     const decoded = Buffer.from(cursor, 'base64').toString('utf8');
//     const [label, idx] = decoded.split(':');
//     if (label !== 'cursor') throw new GraphQLError('Invalid cursor');
//     const n = Number.parseInt(idx, 10);
//     if (Number.isNaN(n)) throw new GraphQLError('Invalid cursor index');
//     return n;
// }

// dataloader-related functions
function buildLoaders(prisma: PrismaClient) {
    // each DataLoader must return results in the same order as keys

    const artistById = new DataLoader<number, Artist | null>(async (ids) => {
        //ids: [a1, a2, ...]
        const rows = await prisma.artist.findMany({ where: { id: { in: ids as number[] } } });
        const byId = new Map<number, Artist>(rows.map(a => [a.id, a]));
        return ids.map(id => byId.get(id) || null);
    });

    const trackById = new DataLoader<number, Track | null>(async (ids) => {
        const rows = await prisma.track.findMany({ where: { id: { in: ids as number[]} } });
        const byId = new Map<number, Track>(rows.map(t => [t.id, t]));
        return ids.map(id => byId.get(id) || null);
    });

    const tracksByArtistId = new DataLoader<number, Track[]>(async (artistIds) => {
        const rows = await prisma.track.findMany({
            where: { artistId: { in: artistIds as number[] } },
            orderBy: { id: 'asc' },
        });
        const grouped = new Map<number, Track[]>((artistIds as number[]).map(id => [id, [] as Track[]]));
        for (const t of rows) grouped.get(t.artistId)?.push(t);
        return artistIds.map(id => grouped.get(id) || []);
    });

    const ratingsByTrackId = new DataLoader<number, Rating[]>(async (trackIds) => {
        const rows = await prisma.rating.findMany( { where: {trackId: { in: trackIds as number[] } } });
        const grouped = new Map((trackIds as number[]).map(id => [id, [] as Rating[]]));
        for (const r of rows) grouped.get(r.trackId)?.push(r);
        return trackIds.map(id => grouped.get(id) || []);
    })

    return { artistById, trackById, tracksByArtistId, ratingsByTrackId };
}

const typeDefs = `
    interface Node { id: ID! }

    type Query {
        node(id: ID!): Node
        tracks: [Track!]!
        track(id: ID): Track
        tracksConnection(first: Int!, after: String): TrackConnection!
    }

    type Mutation {
        rateTrack(trackId: ID!, score: Float!): Rating!
        createTrack(title: String!, artistId: ID!): Track!
    }

    type Track implements Node {
        id: ID!
        title: String!
        artist: Artist!
        averageRating: Float
    }

    type Artist implements Node {
        id: ID!
        name: String!
        tracks: [Track!]!
        averageTrackRating: Float
    }

    type Rating {
        id: ID!
        score: Float!
        track: Track!
    }

    type TrackConnection {
        edges: [TrackEdge!]!
        pageInfo: PageInfo!
    }

    type TrackEdge {
        node: Track!
        cursor: String!
    }

    type PageInfo {
        hasNextPage: Boolean!
        hasPreviousPage: Boolean!
        startCursor: String
        endCursor: String
    }

`;

// helpers
// function avg(nums: number[]): number | null {
//     if (nums.length === 0) return null;
//     return nums.reduce((a, b) => a + b, 0) / nums.length;
// }

//  resolver map
const resolvers = {
    // Interface type resolver: given a JS object, which graphQL type is it?
    Node: {
        __resolveType(obj: unknown): 'Track' | 'Artist' | null {
            // we return raw rows from Query, discriminate by shape
            if (obj && typeof obj == 'object') {
                const anyObj = obj as Record<string, unknown>;
                if ('title' in anyObj && 'artistId' in anyObj) return 'Track';
                if ('name' in anyObj && !('artistId' in anyObj)) return 'Artist';
            }
            return null; // unresolved -> execution error if it happens
        },
    },
    Query: {
        // non-paginated list (kept for simplicity/testing)
        tracks: () => prisma.track.findMany({ orderBy: { id: 'asc'}}),
        track: (_p: unknown, { id }: { id?: string | null}, { loaders }: GraphQLContext) => (id ? loaders.trackById.load(Number(id)) : null),

        // global refetch: decode the global id, fetch the raw row, return it
        node: (_parent: unknown, { id }: { id: string }, { loaders }: GraphQLContext) => {
            const { type, id: raw } = fromGlobalId(id);
            const rawId = Number(raw);
            if (type === 'Track') return loaders.trackById.load(rawId);
            if (type === 'Artist') return loaders.artistById.load(rawId);
            return null;
        },

        // cursor pagination over the tracks array (stable order as stored)
        tracksConnection: async (_p: unknown, { first, after }: { first: number; after?: string | null}) => {
            const afterId = after ? fromIdCursor(after) : undefined;
            const rows = await prisma.track.findMany({
                where: afterId ? { id: {gt: afterId } } : undefined,
                orderBy: { id: 'asc'},
                take: first + 1, // fetch one extra to know if there is a next page
            });

            const hasNextPage = rows.length > first;
            const page = hasNextPage ? rows.slice(0, first) : rows;

            const edges = page.map((t) => ({
                node: t,
                cursor: toIdCursor(t.id),
            }));
            return {
                edges,
                pageInfo: {
                    hasNextPage,
                    hasPreviousPage: !!afterId,
                    startCursor: edges[0]?.cursor ?? null,
                    endCursor: edges[edges.length - 1]?.cursor ?? null,
                },
            };
        },
    },

    Mutation: {
        // mutates ratings; expects a *global* trackId
        rateTrack: async (_p: unknown, { trackId, score }: { trackId: string; score: number }, { loaders }: GraphQLContext) => {
            if (score < 0 || score > 5) throw new GraphQLError('score must be between 1 and 5');
            const { type, id: raw } = fromGlobalId(trackId);
            if (type !== 'Track') throw new GraphQLError('trackId must be a Track ID');
            const rawTrackId = Number(raw);

            const t = await loaders.trackById.load(rawTrackId);
            if (!t) throw new GraphQLError('track not found');

            const rating = await prisma.rating.create({ data: { score, trackId: rawTrackId }});
            
            // keep caches coherent
            loaders.ratingsByTrackId.clear(rawTrackId);
            loaders.trackById.clear(rawTrackId);
            return rating; // Rating resolvers will handle nested fields
            
        },

        // creates a track; expects a global artistId; returns the new Track
        createTrack: async (_p: unknown, { title, artistId }: { title: string; artistId: string}, { loaders }: GraphQLContext) => {
            const { type, id: raw } = fromGlobalId(artistId);
            if (type !== 'Artist') throw new GraphQLError('artistId must be an Artist ID');
            const rawArtistId = Number(raw);

            const a = await loaders.artistById.load(rawArtistId);
            if (!a) throw new GraphQLError('artist not found');

            const t = await prisma.track.create({ data: { title, artistId: rawArtistId }});

            // invalidate caches that involve this artist's track list
            loaders.tracksByArtistId.clear(rawArtistId);
            // make the new track immediately available
            loaders.trackById.clear(t.id).prime(t.id, t);
            return t; // track resolvers will shape fields
        },
    },

    // field resolvers for Track (shape raw -> GraphQL fields)
    Track: {
        id: (t: Track) => toGlobalId('Track', t.id),
        title: (t: Track) => t.title,
        artist: (t: Track, _a: unknown, { loaders }: GraphQLContext) => loaders.artistById.load(t.artistId),
        averageRating: async (t: Track, _args: unknown, { loaders }: GraphQLContext) => {
            // batched by artist
            const rs = await loaders.ratingsByTrackId.load(t.id);
            return rs.length ? rs.reduce((s, r) => s + r.score, 0) / rs.length : null;
            // const agg = await prisma.rating.aggregate({ _avg: { score: true}, where: { trackId: t.id }});
            // return agg._avg.score;
        },
    },

    // field resolvers for Artist
    Artist: {
        id: (a: Artist) => toGlobalId('Artist', a.id),
        name: (a: Artist) => a.name,
        tracks: (a: Artist, _: unknown, { loaders }: GraphQLContext) => loaders.tracksByArtistId.load(a.id),
        averageTrackRating: async (a: Artist, _: unknown, { loaders }: GraphQLContext) => {
            const ts = await loaders.tracksByArtistId.load(a.id);
            const ratingsLists = await loaders.ratingsByTrackId.loadMany(ts.map(t => t.id));
            const scores = (ratingsLists as Rating[][]).flat().map(r => r.score);
            return scores.length ? scores.reduce((s, x) => s + x, 0) / scores.length : null;
        },
    },

    Rating: {
        id: (r: Rating) => r.id, // not Node; raw id is fine
        score: (r: Rating) => r.score,
        track: (r: Rating, _: unknown, { loaders }: GraphQLContext) => loaders.trackById.load(r.trackId),
    },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

// http server
const app = express();
app.use(cors());

app.get('/graphql', (_req, res) => {
  res.type('text/html').send(ruruHTML({ endpoint: '/graphql' }));
});

// app.post('/graphql', createHandler({ 
//     schema,
//     context: (req, res) => ({
//         prisma,
//         loaders: buildLoaders(prisma),
//         req,
//         res,
//     }), 
// }));

app.post(
    '/graphql',
    express.json(),
    (req, res, next) => {
        // if client sent an id, fill in req.body.query from the manifest
        if (req.body && typeof req.body.id === 'string' && !req.body.query) {
            const text = PERSISTED[req.body.id];
            if (!text) {
                return res
                    .status(400)
                    .json({ errors: [{message: 'Unknown persisted query id'}]});
            }
            req.body.query = text;
        }

        // in strict mode, reject non-persisted operations
        if (PERSISTED_ONLY && !req.body.id) {
            return res
                .status(400)
                .json({ errors: [{message: 'persisted queries only'}]});
        }

        return next();
    },
    createHandler({
        schema,
        context: (req, res) => ({
            prisma,
            loaders: buildLoaders(prisma),
            req,
            res
        })
    })
);

app.options('/graphql', cors());

app.listen(4000, () => {
  console.log('GraphiQL at http://localhost:4000/graphql');
});


/*
what connects everything together:
- SDL (the schema): declares fields, arg types, and nullability
- Operation documents (your graphql`` tags) are validated against the schema
- Resolvers are bound by field name (top-level via rootValue here, nested via default resolver
or resolver map)
- Relay compiler turns each operation/fragment into artifacts (query text + field metadata +
TypeScript/Flow types if enabled)
- Normalization: relay stores each object by id (and __typename). When a mutation returns 
track { id averageRating }, Relay writes those fields into the existing Track(id) record ->
components re-render
*/