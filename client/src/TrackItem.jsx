import React from 'react';
import {graphql, useFragment} from 'react-relay';

const TrackItemFragment = graphql`
    fragment TrackItem_track on Track {
        id
        title
        artist { name }
        averageRating
    }
`;

export default function TrackItem({ trackRef }) {
    const data = useFragment(TrackItemFragment, trackRef);

    return (
        <li>
            <strong>{data.title}</strong> - {data.artist.name}
            {` | avg: ${data.averageRating ?? '-'}`}
        </li>
    );
}