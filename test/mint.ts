import { ethers } from "hardhat";

import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

import { ContractFactory } from "../lib";
import { BigNumber } from "ethers";

chai.use(chaiAsPromised);

const mintPrice = ethers.utils.parseEther("0.1");
const maxMintAmount = 10;
const testMintAmounts = [1, 5, 10];

describe("Mint", function () {
  testMintAmounts.forEach(function (amountToBeMinted) {
    it(`${amountToBeMinted} NFTs exist after anybody minted ${amountToBeMinted}.`, async function () {
      const [owner, anybody] = await ethers.getSigners();
      const contract = await ContractFactory({
        owner,
        maxMintAmount,
      });

      await contract
        .connect(anybody)
        .batchMint(anybody.address, amountToBeMinted, {
          value: mintPrice.mul(amountToBeMinted),
        });

      for (const index of [...Array(amountToBeMinted).keys()]) {
        expect(await contract.connect(anybody).exists(index)).to.equal(true);
      }

      expect(await contract.connect(anybody).totalSupply()).to.equal(
        BigNumber.from(amountToBeMinted)
      );
    });

    it(`Anybody is holder of ${amountToBeMinted} NFTs after minting ${amountToBeMinted}.`, async function () {
      const [owner, anybody] = await ethers.getSigners();
      const contract = await ContractFactory({
        owner,
        maxMintAmount,
      });

      await contract
        .connect(anybody)
        .batchMint(anybody.address, amountToBeMinted, {
          value: mintPrice.mul(amountToBeMinted),
        });

      expect(
        await contract.connect(anybody).balanceOf(anybody.address)
      ).to.equal(amountToBeMinted);
    });

    it(`Nobody can mint ${amountToBeMinted} without paying.`, async function () {
      const [owner] = await ethers.getSigners();
      const contract = await ContractFactory({
        owner,
        maxMintAmount,
      });

      await expect(
        contract.connect(owner).batchMint(owner.address, amountToBeMinted)
      ).eventually.to.rejectedWith("Incorrect transaction value!");
    });

    it(`Nobody can mint ${amountToBeMinted} while paying too much.`, async function () {
      const [owner] = await ethers.getSigners();
      const contract = await ContractFactory({
        owner,
        maxMintAmount,
      });

      await expect(
        contract.connect(owner).batchMint(owner.address, amountToBeMinted, {
          value: mintPrice.mul(amountToBeMinted + 1),
        })
      ).eventually.to.rejectedWith("Incorrect transaction value!");
    });

    it(`The mint price ends up in the contract after minting ${amountToBeMinted}.`, async function () {
      const [owner, anybody] = await ethers.getSigners();
      const contract = await ContractFactory({
        owner,
        maxMintAmount,
      });

      await contract
        .connect(anybody)
        .batchMint(anybody.address, amountToBeMinted, {
          value: mintPrice.mul(amountToBeMinted),
        });

      expect(await ethers.provider.getBalance(contract.address)).to.equal(
        mintPrice.mul(amountToBeMinted)
      );
    });
  });

  it("Only the owner may change the mint price and whitelist mint price.", async function () {
    const oldMintPrice = ethers.utils.parseEther("0.1");
    const oldWhitelistMintPrice = ethers.utils.parseEther("0.01");

    const [owner, anybody, anybodyWithWhitelist] = await ethers.getSigners();
    const contract = await ContractFactory({
      owner,
      mintable: false,
      mintPrice: oldMintPrice,
      whitelistMintPrice: oldWhitelistMintPrice,
    });

    await contract.connect(owner).setWhitelist(anybodyWithWhitelist.address, 2);

    await contract
      .connect(anybodyWithWhitelist)
      .batchWhitelistMint(anybodyWithWhitelist.address, 1, {
        value: oldWhitelistMintPrice,
      });

    const newWhitelistMintPrice = ethers.utils.parseEther("0.02");

    await expect(
      contract.connect(anybody).setWhitelistMintPrice(newWhitelistMintPrice)
    ).eventually.to.rejectedWith("Ownable: caller is not the owner");

    await contract.connect(owner).setWhitelistMintPrice(newWhitelistMintPrice);

    expect(await contract.connect(anybody).whitelistMintPrice()).to.equal(
      newWhitelistMintPrice
    );

    await expect(
      contract
        .connect(anybodyWithWhitelist)
        .batchWhitelistMint(anybodyWithWhitelist.address, 1, {
          value: oldWhitelistMintPrice,
        })
    ).eventually.to.rejectedWith("Incorrect transaction value!");

    await contract
      .connect(anybodyWithWhitelist)
      .batchWhitelistMint(anybodyWithWhitelist.address, 1, {
        value: newWhitelistMintPrice,
      });

    await contract.connect(owner).setMintable(true);

    await contract.connect(anybody).batchMint(anybody.address, 1, {
      value: oldMintPrice,
    });

    const newMintPrice = ethers.utils.parseEther("0.2");

    await expect(
      contract.connect(anybody).setMintPrice(newMintPrice)
    ).eventually.to.rejectedWith("Ownable: caller is not the owner");

    await contract.connect(owner).setMintPrice(newMintPrice);

    expect(await contract.connect(anybody).mintPrice()).to.equal(newMintPrice);

    await expect(
      contract.connect(anybody).batchMint(anybody.address, 1, {
        value: oldMintPrice,
      })
    ).eventually.to.rejectedWith("Incorrect transaction value!");

    await contract.connect(anybody).batchMint(anybody.address, 1, {
      value: newMintPrice,
    });
  });

  it("Nobody can mint more than allowed.", async function () {
    const [owner] = await ethers.getSigners();
    const contract = await ContractFactory({
      owner,
      maxMintAmount,
    });

    const amountToBeMinted = maxMintAmount + 1;

    await expect(
      contract.connect(owner).batchMint(owner.address, amountToBeMinted, {
        value: mintPrice.mul(amountToBeMinted),
      })
    ).eventually.to.rejectedWith("Maximum mint amount exceeded!");
  });

  it("Nobody can mint 0.", async function () {
    const [owner, anybody] = await ethers.getSigners();
    const contract = await ContractFactory({
      owner,
    });

    await contract.connect(owner).batchMint(owner.address, 0);

    expect(await contract.connect(anybody).exists(0)).to.equal(false);

    expect(await contract.connect(anybody).totalSupply()).to.equal(
      BigNumber.from(0)
    );
  });

  it("Nobody can mint -1.", async function () {
    const [owner] = await ethers.getSigners();
    const contract = await ContractFactory({
      owner,
    });

    await expect(
      contract.connect(owner).batchMint(owner.address, -1)
    ).eventually.to.rejectedWith("value out-of-bounds");
  });

  it("The tokenURI and baseURI match and only the owner may change it.", async function () {
    const [owner, anybody] = await ethers.getSigners();
    const contract = await ContractFactory({
      owner,
      baseURI: "URI_A/",
    });

    await contract.connect(anybody).batchMint(anybody.address, 1, {
      value: mintPrice,
    });

    expect(await contract.connect(anybody).tokenURI(0)).to.equal(
      "URI_A/0.json"
    );

    await contract.connect(owner).setBaseURI("URI_B/");

    expect(await contract.connect(anybody).tokenURI(0)).to.equal(
      "URI_B/0.json"
    );
  });

  it("Nobody can mint before the launch.", async function () {
    const [owner] = await ethers.getSigners();
    const contract = await ContractFactory({
      owner,
      mintable: false,
    });

    await expect(
      contract.connect(owner).batchMint(owner.address, 1)
    ).eventually.to.rejectedWith("Minting is not active!");
  });

  it("Only the owner may airdrop before the launch.", async function () {
    const maxMintAmount = 10;
    const [owner, anybody] = await ethers.getSigners();
    const contract = await ContractFactory({
      owner,
      maxMintAmount,
      mintable: false,
    });

    await expect(
      contract.connect(anybody).airdropBatchMint(owner.address, 1)
    ).eventually.to.rejectedWith("Ownable: caller is not the owner");

    await contract
      .connect(owner)
      .airdropBatchMint(anybody.address, maxMintAmount);

    for (const tokenId of [...Array(maxMintAmount).keys()]) {
      expect(await contract.connect(anybody).exists(tokenId)).to.equal(true);
    }

    expect(await contract.connect(anybody).totalSupply()).to.equal(
      BigNumber.from(maxMintAmount)
    );
    expect(await contract.connect(anybody).balanceOf(anybody.address)).to.equal(
      maxMintAmount
    );
  });

  it("NFT owners may transfer their collectible to other addresses.", async function () {
    const [owner, personA, personB] = await ethers.getSigners();
    const contract = await ContractFactory({
      owner,
      mintPrice: ethers.utils.parseEther("0.1"),
    });

    await contract.connect(personA).batchMint(personA.address, 2, {
      value: ethers.utils.parseEther("0.2"),
    });

    expect(await contract.connect(personA).balanceOf(personA.address)).to.equal(
      2
    );

    await expect(
      contract
        .connect(personB)
        ["safeTransferFrom(address,address,uint256)"](
          personA.address,
          personB.address,
          1
        )
    ).eventually.to.rejectedWith(
      "ERC721: transfer caller is not owner nor approved"
    );

    await contract
      .connect(personA)
      ["safeTransferFrom(address,address,uint256)"](
        personA.address,
        personB.address,
        1
      );

    expect(await contract.connect(personA).ownerOf(0)).to.equal(
      personA.address
    );

    expect(await contract.connect(personB).ownerOf(1)).to.equal(
      personB.address
    );

    expect(await contract.connect(personB).balanceOf(personB.address)).to.equal(
      1
    );
  });
});
