/**
 * @generated SignedSource<<bf4d95bf338ed2d122d1a7d5c04af96d>>
 * @relayHash e6a5d4d36557aa2de7f87456faefafc9
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 311f0197703256483874e8a0f54450a1f32d2ef338890546d22149bc643f8028

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TrackList_CreateTrackMutation$variables = {
  artistId: string;
  connections: ReadonlyArray<string>;
  title: string;
};
export type TrackList_CreateTrackMutation$data = {
  readonly createTrack: {
    readonly id: string;
    readonly " $fragmentSpreads": FragmentRefs<"TrackItem_track">;
  };
};
export type TrackList_CreateTrackMutation = {
  response: TrackList_CreateTrackMutation$data;
  variables: TrackList_CreateTrackMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "artistId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "connections"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "title"
},
v3 = [
  {
    "kind": "Variable",
    "name": "artistId",
    "variableName": "artistId"
  },
  {
    "kind": "Variable",
    "name": "title",
    "variableName": "title"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "TrackList_CreateTrackMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "Track",
        "kind": "LinkedField",
        "name": "createTrack",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "TrackItem_track"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "TrackList_CreateTrackMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "Track",
        "kind": "LinkedField",
        "name": "createTrack",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "title",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Artist",
            "kind": "LinkedField",
            "name": "artist",
            "plural": false,
            "selections": [
              (v4/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "averageRating",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v3/*: any*/),
        "filters": null,
        "handle": "appendNode",
        "key": "",
        "kind": "LinkedHandle",
        "name": "createTrack",
        "handleArgs": [
          {
            "kind": "Variable",
            "name": "connections",
            "variableName": "connections"
          },
          {
            "kind": "Literal",
            "name": "edgeTypeName",
            "value": "TrackEdge"
          }
        ]
      }
    ]
  },
  "params": {
    "id": "311f0197703256483874e8a0f54450a1f32d2ef338890546d22149bc643f8028",
    "metadata": {},
    "name": "TrackList_CreateTrackMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "948d77869d903bf64b209e00365f0ab8";

export default node;
