import { sha256 } from "@noble/hashes/sha2";
import { Uint8ArrayUtils } from "./Uint8ArrayUtils";

export interface HashFunction {
  hash(data: Uint8Array): Uint8Array;
}

export class SHA256Hash implements HashFunction {
  hash(data: Uint8Array): Uint8Array {
    return sha256(data);
  }
}

class MerkleTreeTimeEfficient {
  private readonly hashFunction: HashFunction;
  private layers: Uint8Array[][];
  private leafCount: number;

  constructor(hashFunction: HashFunction) {
    this.hashFunction = hashFunction;
    this.layers = [];
    this.leafCount = 0;
  }

  buildTree(data: Uint8Array[]): void {
    this.leafCount = data.length;
    this.layers = [];

    // Hash the input data to create the leaf layer
    let currentLayer = data.map((item) => this.hashFunction.hash(item));
    this.layers.push(currentLayer);

    // Build the tree bottom-up
    while (currentLayer.length > 1) {
      const nextLayer: Uint8Array[] = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i];
        const right = i + 1 < currentLayer.length ? currentLayer[i + 1] : left;
        const parentHash = this.hashFunction.hash(
          Uint8ArrayUtils.compare(left, right) < 0
            ? Uint8ArrayUtils.concat(left, right)
            : Uint8ArrayUtils.concat(right, left)
        );
        nextLayer.push(parentHash);
      }
      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }
  }

  getRoot(): Uint8Array | null {
    const topLayer = this.layers[this.layers.length - 1];
    return topLayer ? topLayer[0] : null;
  }

  generateProof(data: Uint8Array): Uint8Array[] | null {
    const targetHash = this.hashFunction.hash(data);
    let index = this.layers[0].findIndex(
      (hash) => Uint8ArrayUtils.compare(hash, targetHash) === 0
    );
    if (index === -1) return null;

    const proof: Uint8Array[] = [];
    for (let i = 0; i < this.layers.length - 1; i++) {
      const isRightChild = index % 2 === 1;
      const siblingIndex = isRightChild ? index - 1 : index + 1;

      if (siblingIndex < this.layers[i].length) {
        proof.push(this.layers[i][siblingIndex]);
      }

      index = Math.floor(index / 2);
    }

    return proof;
  }

  verifyProof(data: Uint8Array, proof: Uint8Array[]): boolean {
    let hash = this.hashFunction.hash(data);
    for (const proofElement of proof) {
      hash = this.hashFunction.hash(
        Uint8ArrayUtils.compare(hash, proofElement) < 0
          ? Uint8ArrayUtils.concat(hash, proofElement)
          : Uint8ArrayUtils.concat(proofElement, hash)
      );
    }
    const root = this.getRoot();
    return root !== null && Uint8ArrayUtils.compare(hash, root) === 0;
  }

  // Helper method to get the number of leaves
  getLeafCount(): number {
    return this.leafCount;
  }

  // Helper method to get the tree height
  getTreeHeight(): number {
    return this.layers.length;
  }

  // Helper method to get a specific layer of the tree
  getLayer(level: number): Uint8Array[] | null {
    if (level < 0 || level >= this.layers.length) {
      return null;
    }
    return this.layers[level];
  }

  // Method to dump the tree structure (for debugging purposes)
  dumpTree(): string {
    let result = "";
    for (let i = this.layers.length - 1; i >= 0; i--) {
      result += `Level ${i}: `;
      result += this.layers[i].map(Uint8ArrayUtils.toHexString).join(", ");
      result += "\n";
    }
    return result;
  }
}

export function testMerkleTreeTimeEfficient(
  data: Uint8Array[],
  leaf: Uint8Array
) {
  const hashFunction = new SHA256Hash();

  console.time("Merkle tree generation for MerkleTreeTimeEfficient");
  const merkleTree = new MerkleTreeTimeEfficient(hashFunction);
  merkleTree.buildTree(data);
  console.timeEnd("Merkle tree generation for MerkleTreeTimeEfficient");

  console.time("Proof generation for MerkleTreeTimeEfficient");
  const proof = merkleTree.generateProof(leaf);
  console.timeEnd("Proof generation for MerkleTreeTimeEfficient");

  console.time("Proof verification for MerkleTreeTimeEfficient");
  const isValid = merkleTree.verifyProof(leaf, proof!);
  console.timeEnd("Proof verification for MerkleTreeTimeEfficient");

  console.log(
    "Merkle Root:",
    Uint8ArrayUtils.toHexString(merkleTree.getRoot()!)
  );

  // Uncomment the following line to print the entire tree structure
  // console.log("\nTree structure:\n", merkleTree.dumpTree());
}
