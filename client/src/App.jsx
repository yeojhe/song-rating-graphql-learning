import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import TrackItem from './TrackItem';

const TrackQuery = graphql`
  query App_TracksQuery {
    tracks{
      id
      ...TrackItem_track
    }
  }
`;

export default function App() {
  const data = useLazyLoadQuery(TrackQuery, {});
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <h1>Tracks</h1>
      <ul>
        {data.tracks.map(t => <TrackItem key={t.id} trackRef={t} />)}
      </ul>
    </div>
  );
}
