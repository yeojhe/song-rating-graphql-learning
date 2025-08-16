import React, {useState} from 'react';
import {graphql, useFragment, useMutation} from 'react-relay';

// a fragment is like a resuable subquery, but it also helps with:
// - colocation: a component declares the exact fields it needs
// - composition: parents spread child fragments
// - type safety: Relay compiler generates types for the fragment data (strongly typed props)
// - selective fetch: parent queries only need to spread child fragments; you don't manually
// keep fields in sync
const TrackItemFragment = graphql`
    fragment TrackItem_track on Track {
        id
        title
        artist { id name }
        averageRating
    }
`;

// this defines a mutation, where the track id and score are passed in as parameters and it
// calls the mutation rateTrack defined in the server code's rootValue
// the selection set within rateTrack defines the shape of the data that should be returned when 
// the mutation runs
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
    // isInFlight is a boolean that's true while the mutation request is still outstanding. 
    // can be used for disabling a button or showing a spinner
    const [commit, isInFlight] = useMutation(RateTrackMutation);
    const [score, setScore] = useState(4.5);

    function rate(e) {
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