/**
 * @generated SignedSource<<8e3acc848228ecd4e39921eea29cd114>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TrackItem_track$data = {
  readonly artist: {
    readonly id: string;
    readonly name: string;
  };
  readonly averageRating: number | null | undefined;
  readonly id: string;
  readonly title: string;
  readonly " $fragmentType": "TrackItem_track";
};
export type TrackItem_track$key = {
  readonly " $data"?: TrackItem_track$data;
  readonly " $fragmentSpreads": FragmentRefs<"TrackItem_track">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TrackItem_track",
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
        (v0/*: any*/),
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
  "type": "Track",
  "abstractKey": null
};
})();

(node as any).hash = "22302979b12f8651f0f993bb15f354c2";

export default node;
