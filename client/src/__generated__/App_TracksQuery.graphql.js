/**
 * @generated SignedSource<<99021fe6caeefddec89ca3ece4ecc930>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

var node = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Track",
    "kind": "LinkedField",
    "name": "tracks",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "title",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "App_TracksQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "App_TracksQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "4ceb2a9d0c951d960903c39f8b8e3c9a",
    "id": null,
    "metadata": {},
    "name": "App_TracksQuery",
    "operationKind": "query",
    "text": "query App_TracksQuery {\n  tracks {\n    id\n    title\n  }\n}\n"
  }
};
})();

node.hash = "b0d10de7e504a15ec305ca5d70faede2";

export default node;
