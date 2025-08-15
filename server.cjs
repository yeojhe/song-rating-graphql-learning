const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema, GraphQLError } = require('graphql');

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

const schema = buildSchema(`
    interface Node { id: ID! }

    type Query {
        node(id: ID!): Node
        tracks: [Track!]!
        track(id: ID): Track
        tracksConnection(first: Int!, after: String): TrackConnection!
    }

    type Mutation {
        rateTrack(trackId: ID!, score: Float!): Rating!
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

`);

// helpers
function avg(nums) {
    if (nums.length === 0) return null;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
}

// resolvers
// with express-graphql + buildSchema we put resolvers on rootValue
// and for nested fields we provide resolver *methods* on the returned objects
// with buildSchema + express-graphql functions on rootValue map to top-level fields on Query and Mutation by *name*
// nested fields are handled by the default resolver (reads a value or calls a function on the returned object),
// or by explicit per-type resolvers (in the resolver-map style to be used in production)
const rootValue = {
    // Queries
    // selection sets never use parentheses unless passing arguments
    node({id}) {
        const { type, id: rawId } = fromGlobalId(id);
        if (type === 'Track') {
            const t = tracks.find(t => t.id === rawId);
            return t ? trackToAPI(t) : null;
        }
        if (type === 'Artist') {
            const a = artists.find(a => a.id === rawId);
            return a ? artistToAPI(a) : null;
        }
        return null;
    },

    tracks() {
        return tracks.map(trackToAPI);
    },

    // if there is a non-null argument, as defined by the schema, you have to provide an id
    track({ id }) {
        const {type, id: rawId} = fromGlobalId(id);
        if (type !== 'Track') return null;
        const t = tracks.find((t) => t.id === rawId);
        return t ? trackToAPI(t) : null;
    },

    // Mutations
    // the reason that we know this is a mutation is because it's defined as such in the schema
    // resolver code is "just a function", but graphQL executes mutation fields serially and
    // they're expected to cause side effects
    rateTrack({ trackId, score }) {
        if (score < 0 || score > 5) {
            throw new GraphQLError('Score must be between 0 and 5');
        }

        const { type, id: rawTrackId } = fromGlobalId(trackId);
        if (type !== 'Track') throw new GraphQLError('trackId must be a Track Global ID');

        const t = tracks.find((t) => t.id === rawTrackId);
        if (!t) throw new GraphQLError('track not found');

        const rating = {id: 'r' + (ratings.length + 1), score, trackId: rawTrackId};
        ratings.push(rating);
        return ratingToAPI(rating);

    },

    // resolve the paginated list
    tracksConnection({ first, after }) {
        // compute the starting index. If 'after' is provided, start after that edge
        const start = after ? fromCursor(after) + 1 : 0;
        // take a slice of 'tracks' of length 'first', start at 'start'
        const slice = tracks.slice(start, start + first);

        // convert each item into an edge with a per-item cursor
        const edges = slice.map((t, i) => {
            // global index in the full list
            const absoluteIndex = start + i;
            return {
                // opaque cursor for this position
                cursor: toCursor(absoluteIndex),
                // the track object, with __typename + global id
                node: trackToAPI(t),
            };
        });

        // compute pagination metadata for this page
        const endIndex = start + slice.length - 1; // index of last item on this page
        return {
            edges,
            pageInfo: {
                hasNextPage: start + slice.length < tracks.length,
                hasPreviousPage: start > 0,
                startCursor: edges[0]?.cursor ?? null, // null if page is empty
                endCursor: edges[edges.length - 1]?.cursor ?? null,
            },
        };
    },
};

// field resolvers attached to returned objects
// // default resolver: if a field is a plain value (like obj.id), it
// // returns that, if it's a function, it calls it to get the value
function trackToAPI(t) {
    return {
        // this is for interface resolution
        __typename: 'Track',
        // global id
        id: toGlobalId('Track', t.id),
        title: t.title,
        // parent resolvers:
        artist() {
            const a = artists.find((a) => a.id === t.artistId);
            return artistToAPI(a);
        },
        averageRating() {
            const rs = ratings.filter((r) => r.trackId === t.id).map((r) => r.score);
            return avg(rs);
        },
    };
}

function artistToAPI(a) {
    return {
        __typename: 'Artist',
        id: toGlobalId('Artist', a.id),
        name: a.name,
        tracks () {
            return tracks.filter((t) => t.artistId === a.id).map(trackToAPI);

        },
        averageTrackRating() {
            const artistTrackIds = tracks.filter((t) => t.artistId === a.id).map((t) => t.id);
            const rs = ratings.filter((r) => artistTrackIds.includes(r.trackId)).map((r) => r.score);
            return avg(rs);
        }
    };
}

function ratingToAPI(r) {
    return {
        id: r.id,
        score: r.score,
        track() {
            const t = tracks.find((t) => t.id === r.trackId);
            return trackToAPI(t);
        },
    };
}

// http server
const app = express();
app.use(cors());

app.use(
    '/graphql',
    graphqlHTTP({
        schema,
        rootValue,
        graphiql: true, //graphiql IDE at /graphql
    })
);

app.listen(4000, () => {
    console.log('GraphQL server running at http://localhost:4000/graphql');
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