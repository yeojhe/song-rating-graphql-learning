import React from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import TrackItem from './TrackItem';

// fragment lives on Query (a "root" fragment) so we can paginate a root connection
// @refetchable generates a sibling query (TrackListPaginationQuery) Relay uses to load more
// @argumentDefintions defines the paging args our fragment accepts
const TrackListFragment = graphql`
    fragment TrackList_tracks on Query
    @refetchable(queryName: "TrackListPaginationQuery")
    @argumentDefinitions(
        count: { type: "Int", defaultValue: 2 } # how many to load
        cursor: { type: "String" } # where to continue from
    ) {
        # the field name must match your server: tracksConnection(first:, after:)
        tracksConnection(first: $count, after: $cursor)
            # the @connection key must be of the form "<Name>__tracksConnection"
            # it defines a logical list in the Relay store
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
    // usePaginationFragment wires paging state + actions for this fragment
    const {
        data,
        loadNext, // function: load the next N items
        hasNext, // are there more pages?
        isLoadingNext // request in flight
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
