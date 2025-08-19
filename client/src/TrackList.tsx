import React, { useState } from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import TrackItem from './TrackItem';
import { useMutation } from 'react-relay';
import type { TrackList_tracks$key } from './__generated__/TrackList_tracks.graphql';
import type { TrackList_CreateTrackMutation as CreateMut } from './__generated__/TrackList_CreateTrackMutation.graphql';
import type { TrackList_tracks$data } from './__generated__/TrackList_tracks.graphql';

// Mutation: return a Track and declaratively append it to our connection
// - @appendNode: tells Relay to create a new edge for this node and add it
// - connections: the connection IDs that should receive the new node
const CreateTrackMutation = graphql`
    mutation TrackList_CreateTrackMutation(
        $title: String!
        $artistId: ID!
        $connections: [ID!]!
    ) {
        createTrack(title: $title, artistId: $artistId)
            @appendNode(connections: $connections, edgeTypeName: "TrackEdge") {
                id
                ...TrackItem_track
            }
    }
`;

type Edge = NonNullable<
    NonNullable<TrackList_tracks$data['tracksConnection']>['edges']
>[number];

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
                        artist { id }
                        ...TrackItem_track
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
                # Relay injects a hidden __id field on @connection selections
                # we'll use it to target this exact list when appending
                __id
            }
    }
`;

type Props = { queryRef: TrackList_tracks$key };

export default function TrackList({ queryRef }: Props) {
    // usePaginationFragment wires paging state + actions for this fragment
    const {
        data,
        loadNext, // function: load the next N items
        hasNext, // are there more pages?
        isLoadingNext // request in flight
    } = usePaginationFragment(TrackListFragment, queryRef);
    const [commitCreate, isCreating] = useMutation<CreateMut>(CreateTrackMutation);

    const edges: ReadonlyArray<Edge | null> = data.tracksConnection?.edges ?? [];

    const artistIds = Array.from(
        new Set(
            edges
                .map(e => e?.node?.artist?.id ?? null)
                .filter((id): id is string => id !== null)
        )
    );

    const [title, setTitle] = useState('');
    const [artistId, setArtistId] = useState<string>(artistIds[0] ?? "");

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        // connection to append to
        const connectionID = data.tracksConnection.__id
        commitCreate({
            variables: {
                title,
                artistId, // must be a GLOBAL artist ID
                connections: [connectionID],
            },
            onCompleted: () => setTitle(''),
            onError: (err) => console.error(err),
        });
    }

    return (
        <div style={{ fontFamily: 'system-ui', padding: 16 }}>
            <h1>Tracks (paginated)</h1>

            <form onSubmit={submitCreate} style={{ marginBottom: 12 }}>
                <input
                    placeholder="New track title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    style={{ width: 220, marginRight: 8 }}
                />
                <select
                    value={artistId ?? ''}
                    onChange={e => setArtistId(e.target.value)}
                    style={{ marginRight: 8 }}
                >
                    <option value="" disabled>Select artist</option>
                    {artistIds.map(id => <option key={id} value={id}>{id}</option>)}
                </select>
                <button type="submit" disabled={!title || !artistId || isCreating}>
                    {isCreating ? 'Creating…' : 'Create'}
                </button>
            </form>

            <ul>
                {edges.map(e => e?.node && <TrackItem key={e.node.id} trackRef={e.node} />)}
            </ul>

            <button
                onClick={() => loadNext(2)}
                disabled={!hasNext || isLoadingNext}
                style={{ marginTop: 8 }}
            >
                {isLoadingNext ? 'Loading…' : hasNext ? 'Load more' : 'No more'}
            </button>
        </div>
    );
}