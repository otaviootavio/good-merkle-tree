import { sha256 } from "@noble/hashes/sha256";
import MerkleTree from "merkletreejs";

export function testMerkleTreeJS(data: Uint8Array[], leaf: Uint8Array) {
  console.time("Merkle tree generation for merkletreejs");
  const leaves = data.map((x) => sha256(x));
  const tree = new MerkleTree(leaves, sha256, {
    sortPairs: true,
    sortLeaves: false,
  });
  console.timeEnd("Merkle tree generation for merkletreejs");

  const root = tree.getRoot().toString("hex");

  console.time("Proof generation for merkletreejs");
  const proof = tree.getProof(Buffer.from(leaf));
  console.timeEnd("Proof generation for merkletreejs");

  console.time("Proof verification for merkletreejs");
  const isValid = tree.verify(proof, Buffer.from(leaf), root);
  console.timeEnd("Proof verification for merkletreejs");

  console.log("Merkle Root:", root);
}
