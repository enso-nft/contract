import { ethers } from "hardhat";

import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

import { ContractFactory, createRandomSigner } from "../lib";

chai.use(chaiAsPromised);

const mintPrice = ethers.utils.parseEther("0.1");

describe("Burn", function () {
  it("Only the NFT holder may burn NFTs.", async function () {
    const [owner, anybody] = await ethers.getSigners();
    const contract = await ContractFactory({
      owner,
      mintable: true,
      mintPrice,
    });

    await contract.connect(anybody).batchMint(
      anybody.address,
      1,
      {
        value: mintPrice,
      },
    );

    expect(await contract.connect(anybody).totalSupply()).to.equal(1);

    await expect(
      contract.connect(owner).burn(0),
    ).eventually.to.rejectedWith(
      "ERC721Burnable: caller is not owner nor approved",
    );

    await contract.connect(anybody).burn(0);

    expect(await contract.connect(anybody).totalSupply()).to.equal(0);
    expect(await contract.connect(anybody).exists(0)).to.be.false;
  });

  it("A new tokenId is minted after burning a previous collectible.", async function () {
    const royaltyReceiver = createRandomSigner().address;

    const [owner, anybody] = await ethers.getSigners();
    const contract = await ContractFactory({
      owner,
      mintable: true,
      mintPrice,
      royalty: {
        receiver: royaltyReceiver,
        basisPoints: 500,
      },
    });

    await contract.connect(anybody).batchMint(
      anybody.address,
      1,
      {
        value: mintPrice,
      },
    );

    expect(await contract.connect(anybody).exists(0)).to.be.true;

    await contract.connect(anybody).burn(0);

    expect(await contract.connect(anybody).exists(0)).to.be.false;

    await contract.connect(anybody).batchMint(
      anybody.address,
      1,
      {
        value: mintPrice,
      },
    );

    expect(await contract.connect(anybody).exists(0)).to.be.false;
    expect(await contract.connect(anybody).exists(1)).to.be.true;
  });
});
