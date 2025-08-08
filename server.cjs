const express = require('express');
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
];

const ratings = [
  { id: 'r1', score: 4.5, trackId: 't1' }
];

const schema = buildSchema(`
    type Query {
        tracks: [Track!]!
        track(id: ID!): Track
    }

    type Mutation {
        rateTrack(trackId: ID!, score: Float!): Rating!
    }

    type Track {
        id: ID!
        title: String!
        artist: Artist!
        averageRating: Float
    }

    type Artist {
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

`);

// helpers
function avg(nums) {
    if (nums.length === 0) return null;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
}

// resolvers
// with express-graphql + buildSchema we put resolvers on rootValue
// and for nested fields we provide resolver *methods* on the returned objects
const rootValue = {
    // Queries
    tracks() {
        return tracks.map(trackToAPI);
    },

    track({ id }) {
        const t = tracks.find((t) => t.id === id);
        return t ? trackToAPI(t) : null;
    },

    // Mutations
    rateTrack({ trackId, score }) {
        if (score < 0 || score > 5) {
            throw new GraphQLError('Score must be between 0 and 5');
        }

        const t = tracks.find((t) => t.id === trackId);
        if (!t) throw new GraphQLError('track not found');

        const rating = {id: 'r' + (ratings.length + 1), score, trackId};
        ratings.push(rating);
        return ratingToAPI(rating);

    },
};

// field resolvers attached to returned objects
// // default resolver: if a field is a plain value (like obj.id), it
// // returns that, if it's a function, it calls it to get the value
function trackToAPI(t) {
    return {
        id: t.id,
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
        id: a.id,
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
