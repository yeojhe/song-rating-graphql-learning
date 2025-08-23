/**
 * @generated SignedSource<<2583d09da6c28a409d45d2bc7836a907>>
 * @relayHash 0a50e3b91364f38b02b4e7e9202fbe71
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 448bd5f4a11a120d32be6bac8d1101539bea7edf0ac5e79c50689ac1af17d984

import { ConcreteRequest } from 'relay-runtime';
export type TrackItem_RateTrackMutation$variables = {
  score: number;
  trackId: string;
};
export type TrackItem_RateTrackMutation$data = {
  readonly rateTrack: {
    readonly id: string;
    readonly score: number;
    readonly track: {
      readonly averageRating: number | null | undefined;
      readonly id: string;
    };
  };
};
export type TrackItem_RateTrackMutation = {
  response: TrackItem_RateTrackMutation$data;
  variables: TrackItem_RateTrackMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "score"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "trackId"
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "score",
        "variableName": "score"
      },
      {
        "kind": "Variable",
        "name": "trackId",
        "variableName": "trackId"
      }
    ],
    "concreteType": "Rating",
    "kind": "LinkedField",
    "name": "rateTrack",
    "plural": false,
    "selections": [
      (v2/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "score",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Track",
        "kind": "LinkedField",
        "name": "track",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "averageRating",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "TrackItem_RateTrackMutation",
    "selections": (v3/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "TrackItem_RateTrackMutation",
    "selections": (v3/*: any*/)
  },
  "params": {
    "id": "448bd5f4a11a120d32be6bac8d1101539bea7edf0ac5e79c50689ac1af17d984",
    "metadata": {},
    "name": "TrackItem_RateTrackMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "0822c105e314b7e87db0479129845f2b";

export default node;
