const express = require('express');
const cors = require('cors');
const { createHandler } = require('graphql-http/lib/use/express');
// build the schema from SDL + resolvers
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { ruruHTML } = require('ruru/server');
const { GraphQLError } = require('graphql'); 
const DataLoader = require('dataloader');


// in memory data
const artists = [
    { id: 'a1', name: 'Nujabes' },
    { id: 'a2', name: 'J Dilla' }
];

const tracks = [
  {id: 't1', title: 'Feather', artistId: 'a1' },
  { id: 't2', title: 'Luv(sic) pt3', artistId: 'a1' },
  { id: 't3', title: 'Time: The Donut of the Heart', artistId: 'a2' },
  { id: 't4', title: 'Mash', artistId: 'a2' },

];

const ratings = [
  { id: 'r1', score: 4.5, trackId: 't1' }
];

// helpers
function toGlobalId(type, id) {
    return Buffer.from(`${type}:${id}`, 'utf8').toString('base64');
}

function fromGlobalId(globalId) {
    try {
        const decoded = Buffer.from(globalId, 'base64').toString('utf8');
        const [type, id] = decoded.split(':');
        if (!type || !id) throw new Error('Bad global id');
        return {type, id};
    } catch {
        throw new GraphQLError('Invalid global ID');
    }
}

// turn a numeric index into an opaque base64 cursor
function toCursor(index) {
    // create a string tag + index, so we can validate when decoding
    return Buffer.from(`cursor:${index}`, 'utf8').toString('base64');
}

// decode the base64 cursor back into an index
function fromCursor(cursor) {
    const decoded = Buffer.from(cursor, 'base64').toString('utf8');
    const [label, idx] = decoded.split(':');
    if (label !== 'cursor') throw new GraphQLError('Invalid cursor');
    const n = Number.parseInt(idx, 10);
    if (Number.isNaN(n)) throw new GraphQLError('Invalid cursor index');
    return n;
}

// dataloader-related functions
function buildLoaders() {
    // each DataLoader must return results in the same order as keys

    const artistById = new DataLoader(async (ids) => {
        //ids: [a1, a2, ...]
        const byId = new Map(artists.map(a => [a.id, a]));
        return ids.map(id => byId.get(id) || null);
    });

    const trackById = new DataLoader(async (ids) => {
        const byId = new Map(tracks.map(t => [t.id, t]));
        return ids.map(id => byId.get(id) || null);
    });

    const tracksByArtistId = new DataLoader(async (artistIds) => {
        // group once, then map back in order
        const grouped = new Map(artistIds.map(id => [id, []]));
        for (const t of tracks) {
            if (grouped.has(t.artistId)) grouped.get(t.artistId).push(t);
        }
        return artistIds.map(id => grouped.get(id) || []);
    });

    const ratingsByTrackId = new DataLoader(async (trackIds) => {
        const grouped = new Map(trackIds.map(id => [id, []]));
        for (const r of ratings) {
            if (grouped.has(r.trackId)) grouped.get(r.trackId).push(r);
        }
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
function avg(nums) {
    if (nums.length === 0) return null;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
}

//  resolver map
const resolvers = {
    // Interface type resolver: given a JS object, which graphQL type is it?
    Node: {
        __resolveType(obj) {
            // we return raw rows from Query, discriminate by shape
            if (obj && typeof obj == 'object') {
                if ('title' in obj && 'artistId' in obj) return 'Track';
                if ('name' in obj && !('artistId' in obj)) return 'Artist';
            }
            return null; // unresolved -> execution error if it happens
        },
    },
    Query: {
        // non-paginated list (kept for simplicity/testing)
        tracks: () => tracks, // raw rows, Track field resolvers will shape fields
        // note: this version still takes a *local* id like "t1" (fine for now)
        track: (_parent, { id }, { loaders }) => (id ? loaders.trackById.load(id) : null),

        // global refetch: decode the global id, fetch the raw row, return it
        node: (_parent, { id }, { loaders }) => {
            const { type, id: rawId } = fromGlobalId(id);
            if (type === 'Track') return loaders.trackById.load(rawId);
            if (type === 'Artist') return loaders.artistById.load(rawId);
            return null;
        },

        // cursor pagination over the tracks array (stable order as stored)
        tracksConnection: (_p, { first, after }) => {
            const start = after ? fromCursor(after) + 1 : 0;
            const slice = tracks.slice(start, start + first);
            const edges = slice.map((t, i) => ({
                node: t,
                cursor: toCursor(start + i),
            }));
            return {
                edges,
                pageInfo: {
                    hasNextPage: start + slice.length < tracks.length,
                    hasPreviousPage: start > 0,
                    startCursor: edges[0]?.cursor ?? null,
                    endCursor: edges[edges.length - 1]?.cursor ?? null,
                },
            };
        },
    },

    Mutation: {
        // mutates ratings; expects a *global* trackId
        rateTrack: async (_p, { trackId, score }, { loaders }) => {
            if (score < 0 || score > 5) throw new GraphQLError('score must be between 1 and 5');
            const { type, id: rawTrackId } = fromGlobalId(trackId);
            if (type !== 'Track') throw new GraphQLError('trackId must be a Track ID');

            const t = await loaders.trackById.load(rawTrackId);
            if (!t) throw new GraphQLError('track not found');

            const rating = {id: 'r' + (ratings.length + 1), score, trackId: rawTrackId };
            ratings.push(rating);
            
            // keep caches coherent
            loaders.ratingsByTrackId.clear(rawTrackId);
            return rating; // Rating resolvers will handle nested fields
            
        },

        // creates a track; expects a global artistId; returns the new Track
        createTrack: async (_p, { title, artistId }, { loaders }) => {
            const { type, id: rawArtistId } = fromGlobalId(artistId);
            if (type !== 'Artist') throw new GraphQLError('artistId must be an Artist ID');

            const a = await loaders.artistById.load(rawArtistId);
            if (!a) throw new GraphQLError('artist not found');

            const newRawId = 't' + (tracks.length + 1);
            const t = { id: newRawId, title, artistId: rawArtistId };
            tracks.push(t);

            // invalidate caches that involve this artist's track list
            loaders.tracksByArtistId.clear(rawArtistId);
            // make the new track immediately available
            loaders.trackById.clear(newRawId).prime(newRawId, t);
            return t; // track resolvers will shape fields
        },
    },

    // field resolvers for Track (shape raw -> GraphQL fields)
    Track: {
        id: (t) => toGlobalId('Track', t.id),
        title: (t) => t.title,
        artist: (t, _a, { loaders }) => loaders.artistById.load(t.artistId),
        averageRating: async (t, _args, { loaders }) => {
            // batched by artist
            const rs = await loaders.ratingsByTrackId.load(t.id);
            return avg(rs.map(r => r.score));
        },
    },

    // field resolvers for Artist
    Artist: {
        id: (a) => toGlobalId('Artist', a.id),
        name: (a) => a.name,
        tracks: (a, _, { loaders }) => loaders.tracksByArtistId.load(a.id),
        averageTrackRating: async (a, _, { loaders }) => {
            const ts = await loaders.tracksByArtistId.load(a.id);
            const rsArrays = await loaders.ratingsByTrackId.loadMany(ts.map(t => t.id));
            const scores = rsArrays.flat().map(r => r.score);
            return avg(scores);
        },
    },

    Rating: {
        id: (r) => r.id, // not Node; raw id is fine
        score: (r) => r.score,
        track: (r, _, { loaders }) => loaders.trackById.load(r.trackId),
    },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

// http server
const app = express();
app.use(cors());

app.get('/graphql', (_req, res) => {
  res.type('text/html').send(ruruHTML({ endpoint: '/graphql' }));
});

app.post('/graphql', createHandler({ 
    schema,
    context: (req, res) => ({
        loaders: buildLoaders(),
        req,
        res,
    }), 
}));

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