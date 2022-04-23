import hre, { ethers } from "hardhat";
import { ContractFactory } from "../lib";
import dayjs from "dayjs";

async function main() {
  await hre.run("typechain");
  await hre.run("compile");

  const contract = await ContractFactory({
    name: "X Collection",
    symbol: "X",
    contractURI: "placeholder/",
    baseURI: "placeholder/",
    maxCollectibleSupply: 4,
    mintPrice: ethers.utils.parseEther("0.1"),
    whitelistMintPrice: ethers.utils.parseEther("0.05"),
    maxMintAmount: 10,
    mintable: false,
    whitelistMintable: false,
    royalty: {
      receiver: "<ROYALTY_RECEIVER_ADDRESS>",
      basisPoints: 0,
    },
  });

  await contract.deployed();

  console.log("Deployment time:", dayjs().unix());
  console.log("Contract deployed to:", contract.address);
}

// This pattern allows async / await as well as catching errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
