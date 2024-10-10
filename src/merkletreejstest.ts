import { sha256 } from "@noble/hashes/sha256";
import MerkleTree from "merkletreejs";

export function testMerkleTreeJS(data: Uint8Array[], leaf: Uint8Array) {
  console.time("Merkle tree generation for MerkleTreeJS");
  const leaves = data.map((x) => sha256(x));
  const tree = new MerkleTree(leaves, sha256, {
    sortPairs: true,
    sortLeaves: false,
  });
  console.timeEnd("Merkle tree generation for MerkleTreeJS");
  MerkleTree;
  const root = tree.getRoot().toString("hex");

  console.time("Proof generation for MerkleTreeJS");
  const proof = tree.getProof(Buffer.from(leaf));
  console.timeEnd("Proof generation for MerkleTreeJS");

  console.time("Proof verification for MerkleTreeJS");
  const isValid = tree.verify(proof, Buffer.from(leaf), root);
  console.timeEnd("Proof verification for MerkleTreeJS");

  console.log("Merkle Root:", root);
}
