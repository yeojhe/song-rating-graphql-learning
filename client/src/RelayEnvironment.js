import { Environment, Network, RecordSource, Store } from "relay-runtime";

async function fetchGraphQL(params, variables) {
    const resp = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: params.text, variables }),
    });
    return await resp.json();
}

export default function createRelayEnvironment() {
    return new Environment({
        network: Network.create(fetchGraphQL),
        store: new Store(new RecordSource()),
    });
}