import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import TrackItem from './TrackItem';
import TrackList from './TrackList';

// const TrackQuery = graphql`
//   query App_TracksQuery {
//     tracks{
//       id
//       ...TrackItem_track
//     }
//   }
// `;

const AppPaginationQuery = graphql`
  query AppPaginationQuery($count: Int!, $cursor: String) {
    ...TrackList_tracks @arguments(count: $count, cursor: $cursor)
  }
`;

export default function App() {
  const data = useLazyLoadQuery(AppPaginationQuery, {count: 2, cursor: null});
  return <TrackList queryRef={data} />;
  
}
