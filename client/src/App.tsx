import { graphql, useLazyLoadQuery } from 'react-relay';
import TrackList from './TrackList';
import type { AppPaginationQuery as AppPaginationQueryType } from './__generated__/AppPaginationQuery.graphql';

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
  const data = useLazyLoadQuery<AppPaginationQueryType>(AppPaginationQuery, {count: 2, cursor: null});
  return <TrackList queryRef={data} />;
  
}
