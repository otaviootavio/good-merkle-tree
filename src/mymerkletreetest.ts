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

class MerkleNode {
  constructor(
    public hash: Uint8Array,
    public left: MerkleNode | null = null,
    public right: MerkleNode | null = null
  ) {}
}

class MerkleTree {
  private root: MerkleNode | null = null;
  private readonly hashFunction: HashFunction;
  private leaves: MerkleNode[] = [];

  constructor(hashFunction: HashFunction) {
    this.hashFunction = hashFunction;
  }

  buildTree(data: Uint8Array[]): void {
    this.leaves = data.map(
      (item) => new MerkleNode(this.hashFunction.hash(item))
    );
    this.root = this.buildTreeRecursive(this.leaves);
  }

  private buildTreeRecursive(nodes: MerkleNode[]): MerkleNode {
    if (nodes.length === 1) {
      return nodes[0];
    }

    const parents: MerkleNode[] = [];
    for (let i = 0; i < nodes.length; i += 2) {
      const left = nodes[i];
      const right = i + 1 < nodes.length ? nodes[i + 1] : nodes[i];
      const parentHash = this.hashFunction.hash(
        Uint8ArrayUtils.compare(left.hash, right.hash) < 0
          ? Uint8ArrayUtils.concat(left.hash, right.hash)
          : Uint8ArrayUtils.concat(right.hash, left.hash)
      );
      parents.push(new MerkleNode(parentHash, left, right));
    }

    return this.buildTreeRecursive(parents);
  }

  getRoot(): Uint8Array | null {
    return this.root?.hash ?? null;
  }

  generateProof(data: Uint8Array): Uint8Array[] | null {
    const targetHash = this.hashFunction.hash(data);
    const targetIndex = this.leaves.findIndex(
      (leaf) => Uint8ArrayUtils.compare(leaf.hash, targetHash) === 0
    );
    if (targetIndex === -1) return null;

    const proof: Uint8Array[] = [];
    let currentIndex = targetIndex;
    let currentLevel: MerkleNode[] = this.leaves;

    while (currentLevel.length > 1) {
      const isRightChild = currentIndex % 2 === 1;
      const siblingIndex = isRightChild ? currentIndex - 1 : currentIndex + 1;

      if (siblingIndex < currentLevel.length) {
        proof.push(currentLevel[siblingIndex].hash);
      }

      currentIndex = Math.floor(currentIndex / 2);
      currentLevel = this.getNextLevel(currentLevel);
    }

    return proof;
  }

  private getNextLevel(currentLevel: MerkleNode[]): MerkleNode[] {
    const nextLevel: MerkleNode[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right =
        i + 1 < currentLevel.length ? currentLevel[i + 1] : currentLevel[i];
      const parentHash = this.hashFunction.hash(
        Uint8ArrayUtils.compare(left.hash, right.hash) < 0
          ? Uint8ArrayUtils.concat(left.hash, right.hash)
          : Uint8ArrayUtils.concat(right.hash, left.hash)
      );
      nextLevel.push(new MerkleNode(parentHash, left, right));
    }
    return nextLevel;
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

  dumpTree(): string {
    if (!this.root) return "Empty tree";
    return this.dumpTreeNode(this.root, "", true);
  }

  private dumpTreeNode(
    node: MerkleNode,
    prefix: string,
    isLeft: boolean
  ): string {
    let result = "";

    if (node.right) {
      result += this.dumpTreeNode(
        node.right,
        `${prefix}${isLeft ? "│   " : "    "}`,
        false
      );
    }

    result += `${prefix}${
      isLeft ? "└── " : "┌── "
    }${Uint8ArrayUtils.toHexString(node.hash)}\n`;

    if (node.left) {
      result += this.dumpTreeNode(
        node.left,
        `${prefix}${isLeft ? "    " : "│   "}`,
        true
      );
    }

    return result;
  }
}

export function testMyMerkleTree(data: Uint8Array[], leaf: Uint8Array) {
  // Usage example
  const hashFunction = new SHA256Hash();

  console.time("Merkle tree generation for mymerkletree");
  const merkleTree = new MerkleTree(hashFunction);
  merkleTree.buildTree(data);
  console.log(
    "Merkle Root:",
    Uint8ArrayUtils.toHexString(merkleTree.getRoot()!)
  );
  const proof = merkleTree.generateProof(leaf);
  console.timeEnd("Merkle tree generation for mymerkletree");
  // console.log('Proof for "b":', proof?.map(Uint8ArrayUtils.toHexString));

  console.time("Proof verification for mymerkletree");
  const isValid = merkleTree.verifyProof(leaf, proof!);
  console.timeEnd("Proof verification for mymerkletree");

  // console.log("Is proof valid?", isValid);

  // console.log("\nTree structure:");
  // console.log(merkleTree.dumpTree());
}
