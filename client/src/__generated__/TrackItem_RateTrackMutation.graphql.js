/**
 * @generated SignedSource<<bfc2055b65a129b7741a68c05be4bad7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

var node = (function(){
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
    "cacheID": "0a50e3b91364f38b02b4e7e9202fbe71",
    "id": null,
    "metadata": {},
    "name": "TrackItem_RateTrackMutation",
    "operationKind": "mutation",
    "text": "mutation TrackItem_RateTrackMutation(\n  $trackId: ID!\n  $score: Float!\n) {\n  rateTrack(trackId: $trackId, score: $score) {\n    id\n    score\n    track {\n      id\n      averageRating\n    }\n  }\n}\n"
  }
};
})();

node.hash = "0822c105e314b7e87db0479129845f2b";

export default node;
