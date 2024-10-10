import { testMerkleTreeJS } from "./merkletreejstest";
import { testMerkleTreeTimeEfficient } from "./MerkleTreeTimeEfficient";
import { testMerkleTreeMemoryEfficient } from "./MerkleTreeMemoryEfficient";
import { Uint8ArrayUtils } from "./Uint8ArrayUtils";

function main() {
  const data = Array.from({ length: 2 ** 16 }, () => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }).map(Uint8ArrayUtils.fromString);

  //select a random leaf
  const randomLeafIndex = Math.floor(Math.random() * data.length);
  const leaf = data[randomLeafIndex];

  testMerkleTreeMemoryEfficient(data, leaf);
  console.log("\n");
  testMerkleTreeJS(data, leaf);
  console.log("\n");
  testMerkleTreeTimeEfficient(data, leaf);
}
main();
