import React, {useState} from 'react';
import {graphql, useFragment, useMutation} from 'react-relay';

// a fragment is like a resuable subquery, so you can plug this fragment in to a larger query
// whenever you need data in exactly this shape?
// but more than that, does it help with type safety because fragments can implement interfaces?
// I think there are other benefits too?
const TrackItemFragment = graphql`
    fragment TrackItem_track on Track {
        id
        title
        artist { name }
        averageRating
    }
`;

// this defines a mutation, where the track id and score are passed in as parameters and it
// calls the mutation rateTrack defined in the server code's rootValue
// so mutations are resolvers just like track and tracks are?
// the thing that is confusing me with graphQL in general is that everything just seems to be
// "just so" - there is nothing explictly connecting everything together it just works because
// the functions, resolvers, fields, etc are all set up in a way that allows them to join together
// in this loose way? Unless I'm missing something?
// also, am I right in saying that the selection set within rateTrack defines the shape of the
// data that should be returned when the mutation runs?
const RateTrackMutation = graphql`
    mutation TrackItem_RateTrackMutation($trackId: ID!, $score: Float!) {
        rateTrack(trackId: $trackId, score: $score) {
            id
            score
            track {
                id
                averageRating
            }
        }

    }
`;

export default function TrackItem({ trackRef }) {
    const data = useFragment(TrackItemFragment, trackRef);
    // isInFlight I assume is used as a kind of placeholder while the data is still updating
    // on the server?
    const [commit, isInFlight] = useMutation(RateTrackMutation);
    const [score, setScore] = useState(4.5);

    function rate(e) {
        // preventDefault stops the page from reloading, right? Is there a "proper" way to do
        // this or is it just the right way?
        e.preventDefault();
        commit({
            variables: { trackId: data.id, score: Number(score)},
            // optional: optimisticResponse could estimate a new average - how would this work?
            // but we'll rely on server truth
            onError: err => console.error(err),
        })
    }

    return (
        <li>
            <strong>{data.title}</strong> - {data.artist.name}
            {` | avg: ${data.averageRating ?? '-'}`}
            <form onSubmit={rate} style={{display: 'inline-block', marginLeft: 8}}>
                <input
                    type="number" step="0.5" min="0" max="5"
                    value={score}
                    onChange={e => setScore(e.target.value)}
                    style={{width: 64}}
                />
                <button type="submit" disabled={isInFlight} style={{marginLeft:4}}>
                    {isInFlight ? 'Rating...': 'Rate'}
                </button>
            </form>
        </li>
    );
}