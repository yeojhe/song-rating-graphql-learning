/**
 * @generated SignedSource<<afc43a39bc863b65ba64f2fd0d4222c3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

var node = (function(){
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
    "cacheID": "e6a5d4d36557aa2de7f87456faefafc9",
    "id": null,
    "metadata": {},
    "name": "TrackList_CreateTrackMutation",
    "operationKind": "mutation",
    "text": "mutation TrackList_CreateTrackMutation(\n  $title: String!\n  $artistId: ID!\n) {\n  createTrack(title: $title, artistId: $artistId) {\n    id\n    ...TrackItem_track\n  }\n}\n\nfragment TrackItem_track on Track {\n  id\n  title\n  artist {\n    id\n    name\n  }\n  averageRating\n}\n"
  }
};
})();

node.hash = "948d77869d903bf64b209e00365f0ab8";

export default node;
