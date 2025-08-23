import React from 'react';
import { useRelayEnvironment } from 'react-relay';
import type { Environment } from 'relay-runtime';

/*
Dev panel for inspecting relay store
- the Relay store is Relay's normalized client-side cache of all the GraphQL data
your app has fetched
    - it lives inside the Environment (environment.getStore())
    - it stores records keyed by ID (usually __typename:id)
    - every component's useFragment subscribes to the fields it needs in those records
    - when a record changes, Relay automatically re-renders any component whose fragment
    depends on it
    - it is like a mini database in memory, kept in sync with the server (via queries,
    mutations or subscriptions)

- why normalization matters
    without normalization:
    - each query result would be stored as-is
    - if two queries both included `track { id, title }` you'd have two
    separate copies of that track in your cache
    - if one updated, the other wouldn't
    with normalization:
    - Relay stores one canonical record per entity ID (Track:123)
    - any query or fragment that mentions `Track(id:123)`
    - update that record one -> all consumers see it

- how the store connects to components
    - each fragment compiles into a selector: "this component needs fields X, Y, Z on record
    Track:1"
    - Relay subscribes the component to the store record(s)
    - when Track:1.title changes, Relay re-runs the fragment selector and React re-renders the 
    component

That's why in this DevPanel, nudging averageRating in the store immediatly updates the UI with no 
network request

- where you touch the store directly
    - mutations: Relay merges the server payload into the store records
    - commitUpdate: lets you write arbitrary fields (optimistic or local state)
    - Garbage collection & retention: Relay evicts records when no fragments/queries retain them

*/

function dumpStore(env: Environment){
    // Relay's RecordSource is intentionally minimal. Try the public API
    // or fall back to the common private shape if needed
    const source: any = env.getStore().getSource();
    const getIDs = typeof source.getRecordIDs === 'function'
        ? source.getRecordIDs.bind(source)
        : () => Object.keys(source._records ?? {});
    const ids: string[] = getIDs();

    const snapshot = Object.fromEntries(ids.map((id) => [id, source.get(id)]));
    // view this in your devtools; it's easier than rendering it on the page
    // you'll see one record per global ID (normalisation)
    // both the paginated list and fragments point at the SAME Track(id) record
    console.log('Relay store snapshot:', snapshot);
}

export default function DevPanel({ targetId }: { targetId?: string | null}) {
    const env = useRelayEnvironment();

    return (
        <div style={{ margin: '12px 0', padding: 8, border: '1px dashed #ccc'}}>
            <strong>DevPanel</strong>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => dumpStore(env)}>Dump store to console</button>
                <button
                    onClick={() => {
                        if (!targetId) return;
                        env.commitUpdate(store => {
                            const rec = store.get(targetId);
                            if (!rec) return;
                            const curr = rec.getValue('averageRating') as number | null;
                            const next = typeof curr === 'number'
                                ? Math.round((curr + 0.1) * 100) / 100
                                : 4.0;
                            rec.setValue(next, 'averageRating'); // triggers fragment subscriptions
                        })

                    }}
                    disabled={!targetId}
                >
                    Nudge avg on first track (+0.1)
                </button>
            </div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6}}>
                Open the console after "Dump" and watch "Nudge" update your
                UI instantly - that's Relay's normalized store + subscriptions
            </div>
        </div>
    );
}
