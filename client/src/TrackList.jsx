import React from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import TrackItem from './TrackItem';

const TrackListFragment = graphql`
    fragment TrackList_tracks on Query
    @refetchable(queryName: "TrackListPaginationQuery")
    @argumentDefinitions(
        count: { type: "Int", defaultValue: 2 }
        cursor: { type: "String" }
    ) {
        tracksConnection(first: $count, after: $cursor)
            @connection(key: "TrackList__tracksConnection") {
                edges {
                    cursor
                    node {
                        id
                        ...TrackItem_track
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
    }
`;

export default function TrackList({ queryRef }) {
    const {
        data,
        loadNext,
        hasNext,
        isLoadingNext
    } = usePaginationFragment(TrackListFragment, queryRef);

    const edges = data.tracksConnection?.edges ?? [];
    return (
        <div style={{ fontFamily: 'system-ui', padding: 16 }}>
            <h1>Tracks (paginated)</h1>
            <ul>
                {edges.map(e => e?.node && (
                    <TrackItem key={e.node.id} trackRef={e.node} />
                ))}
            </ul>

            <button
                onClick={() => loadNext(2)}
                disabled={!hasNext || isLoadingNext}
                style={{ marginTop: 8 }}
            >
                {isLoadingNext ? 'Loading...' : hasNext ? 'Load more' : 'No more'}
            </button>
        </div>
    )
}
