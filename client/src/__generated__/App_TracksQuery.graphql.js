/**
 * @generated SignedSource<<f366a251a27b6a553d12c3eb2c67d153>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

var node = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "App_TracksQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Track",
        "kind": "LinkedField",
        "name": "tracks",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "TrackItem_track"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "App_TracksQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Track",
        "kind": "LinkedField",
        "name": "tracks",
        "plural": true,
        "selections": [
          (v0/*: any*/),
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
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              (v0/*: any*/)
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
      }
    ]
  },
  "params": {
    "cacheID": "59d8868ca91b9c467eced1945ac0fee0",
    "id": null,
    "metadata": {},
    "name": "App_TracksQuery",
    "operationKind": "query",
    "text": "query App_TracksQuery {\n  tracks {\n    id\n    ...TrackItem_track\n  }\n}\n\nfragment TrackItem_track on Track {\n  id\n  title\n  artist {\n    name\n    id\n  }\n  averageRating\n}\n"
  }
};
})();

node.hash = "42bcd5419da700a461e2cb6902ad8f25";

export default node;
