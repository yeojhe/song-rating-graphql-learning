/* these are the four primitives that Relay needs:
- Environment: the orchestrator; ties network + store and executes operations
- Network: how to send a graphQL request
- RecordSource: low-level normalized record storage
- Store: wraps RecordSource (adds subscriptions, GC, etc)*/
import { 
    Environment, 
    Network, 
    RecordSource, 
    Store,
    type RequestParameters,
    type Variables,
    type GraphQLResponse
} from "relay-runtime";

import type { FetchFunction } from "relay-runtime";

const fetchGraphQL: FetchFunction = async (
    params: RequestParameters, 
    variables: Variables
): Promise<GraphQLResponse> => {
  const body = params.id != null
    ? { id: params.id, variables}
    : { query: params.text, variables };

  const resp = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return resp.json();
};

// builds the environment
export default function createRelayEnvironment(): Environment {
    return new Environment({
        // tells Relay: use this function to fetch
        network: Network.create(fetchGraphQL),
        // in-memory normalized cache
        // every object with an id becomes a record keyed by id, so fragments/components can
        // read/write consistently
        store: new Store(new RecordSource()),
    });
}