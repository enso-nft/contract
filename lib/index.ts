import { ethers } from "hardhat";
import { BigNumberish, Signer } from "ethers";

function createRandomSigner() {
  return new ethers.Wallet(
    ethers.Wallet.createRandom()._signingKey(),
    ethers.provider,
  );
}

const ContractDefaultParameters = {
  name: "",
  symbol: "",
  contractURI: "",
  baseURI: "",
  maxCollectibleSupply: 1111,
  maxMintAmount: 10,
  mintable: true,
  mintPrice: ethers.utils.parseEther("0.1"),
  whitelistMintable: true,
  whitelistMintPrice: ethers.utils.parseEther("0.1"),
  royalty: { receiver: createRandomSigner().address, basisPoints: 500 },
};

async function ContractFactory({
  owner,
  name = ContractDefaultParameters.name,
  symbol = ContractDefaultParameters.symbol,
  contractURI = ContractDefaultParameters.contractURI,
  baseURI = ContractDefaultParameters.baseURI,
  maxCollectibleSupply = ContractDefaultParameters.maxCollectibleSupply,
  maxMintAmount = ContractDefaultParameters.maxMintAmount,
  mintable = ContractDefaultParameters.mintable,
  mintPrice = ContractDefaultParameters.mintPrice,
  whitelistMintable = ContractDefaultParameters.whitelistMintable,
  whitelistMintPrice = ContractDefaultParameters.whitelistMintPrice,
  royalty = ContractDefaultParameters.royalty,
}: {
  owner?: Signer;
  name?: string;
  symbol?: string;
  contractURI?: string;
  baseURI?: string;
  maxCollectibleSupply?: number;
  maxMintAmount?: number;
  mintable?: boolean;
  mintPrice?: BigNumberish;
  whitelistMintable?: boolean;
  whitelistMintPrice?: BigNumberish;
  royalty?: {
    receiver: string;
    basisPoints: number;
  };
}) {
  let contract;

  if (owner === undefined) {
    contract = await ethers.getContractFactory("Contract");
  } else {
    contract = await ethers.getContractFactory("Contract", owner);
  }

  return contract.deploy(
    name,
    symbol,
    contractURI,
    baseURI,
    maxCollectibleSupply,
    maxMintAmount,
    [mintable, whitelistMintable],
    [mintPrice, whitelistMintPrice],
    royalty.receiver,
    royalty.basisPoints,
  );
}

async function InterfaceTesterFactory(
  { owner, deployedContract }: { owner: Signer; deployedContract: string },
) {
  const contract = await ethers.getContractFactory(
    "InterfaceTester",
    owner,
  );

  return contract.deploy(deployedContract);
}

export {
  ContractDefaultParameters,
  ContractFactory,
  createRandomSigner,
  InterfaceTesterFactory,
};
