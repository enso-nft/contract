import hre, { ethers } from "hardhat";

async function main() {
  await hre.run("verify:verify", {
    address: "<CONTRACT_ADDRESS>",
    constructorArguments: [
      "X Collection",
      "X",
      "placeholder/",
      "placeholder/",
      4,
      10,
      [false, false],
      [ethers.utils.parseEther("0.1"), ethers.utils.parseEther("0.05")],
      "<ROYALTY_RECEIVER_ADDRESS>",
      0,
    ],
  });

  console.log("Contract successfully verified!");
}

// This pattern allows async / await as well as catching errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
