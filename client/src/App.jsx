import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

const TrackQuery = graphql`
  query App_TracksQuery {
    tracks {id title}
  }
`;

export default function App() {
  const data = useLazyLoadQuery(TrackQuery, {});
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <h1>Tracks</h1>
      <ul>
        {data.tracks.map(t => (
          <li key={t.id}>{t.title} <small>({t.id})</small></li>
        ))}
      </ul>
    </div>
  );
}
