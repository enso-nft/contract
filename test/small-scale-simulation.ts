import { ethers } from "hardhat";

import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { BigNumber } from "ethers";

import { ContractFactory } from "../lib";

chai.use(chaiAsPromised);

describe("Simulation", function () {
  it("The mint works on a small scale.", async function () {
    const mintPrice = ethers.utils.parseEther("0.1");
    const whitelistMintPrice = ethers.utils.parseEther("0.01");
    const maxCollectibleSupply = 14;

    const [
      owner,
      personA,
      personB,
      personC,
      personD,
      personE,
      personF,
      personG,
    ] = await ethers
      .getSigners();

    const contract = await ContractFactory({
      owner,
      mintPrice,
      whitelistMintPrice,
      maxMintAmount: 5,
      maxCollectibleSupply,
      name: "NAME_A",
      symbol: "A",
      contractURI: "contractURI/",
      baseURI: "baseURI/",
      mintable: false,
      whitelistMintable: false,
    });

    await expect(
      contract.connect(personA).batchMint(
        personA.address,
        1,
        {
          value: mintPrice,
        },
      ),
    ).eventually.to.rejectedWith(
      "Minting is not active!",
    );

    await expect(
      contract.connect(personB).batchWhitelistMint(
        personA.address,
        1,
        {
          value: mintPrice,
        },
      ),
    ).eventually.to.rejectedWith(
      "Whitelist minting is not active!",
    );

    await expect(
      contract.connect(personC).batchWhitelistFreeMint(
        personA.address,
        1,
        {
          value: mintPrice,
        },
      ),
    ).eventually.to.rejectedWith(
      "Whitelist minting is not active!",
    );

    await contract.connect(owner).setWhitelist(personA.address, 1);
    await contract.connect(owner).setWhitelistFree(personA.address, 1);

    await contract.connect(owner).batchSetWhitelist([
      personB.address,
      personC.address,
    ], [1, 2]);

    await contract.connect(owner).batchSetWhitelistFree([
      personD.address,
      personE.address,
    ], [3, 4]);

    await contract.connect(owner).setWhitelistMintable(true);

    await contract.connect(personA).batchWhitelistMint(personA.address, 1, {
      value: whitelistMintPrice,
    });

    expect(await contract.connect(personA).whitelist(personA.address)).to.equal(
      0,
    );

    await contract.connect(personA).batchWhitelistFreeMint(personA.address, 1);

    expect(await contract.connect(personA).whitelistFree(personA.address)).to
      .equal(
        0,
      );

    expect(await contract.connect(personA).balanceOf(personA.address)).to.equal(
      2,
    );

    expect(await contract.connect(personA).tokensOfOwner(personA.address)).to
      .have.deep.members([0, 1].map((value) => BigNumber.from(value)));

    expect(await contract.connect(personA).tokens()).to
      .have.deep.members([0, 1].map((value) => BigNumber.from(value)));

    await contract.connect(personB).batchWhitelistMint(personB.address, 1, {
      value: whitelistMintPrice,
    });

    expect(await contract.connect(personB).whitelist(personB.address)).to
      .equal(
        0,
      );

    expect(await contract.connect(personB).balanceOf(personB.address)).to.equal(
      1,
    );

    expect(await contract.connect(personB).tokensOfOwner(personB.address)).to
      .have.deep.members([2].map((value) => BigNumber.from(value)));

    expect(await contract.connect(personB).tokens()).to
      .have.deep.members([0, 1, 2].map((value) => BigNumber.from(value)));

    await contract.connect(personC).batchWhitelistMint(personC.address, 2, {
      value: whitelistMintPrice.mul(2),
    });

    expect(await contract.connect(personC).whitelist(personC.address)).to
      .equal(
        0,
      );

    expect(await contract.connect(personC).balanceOf(personC.address)).to.equal(
      2,
    );

    expect(await contract.connect(personC).tokensOfOwner(personC.address)).to
      .have.deep.members([3, 4].map((value) => BigNumber.from(value)));

    expect(await contract.connect(personC).tokens()).to
      .have.deep.members([0, 1, 2, 3, 4].map((value) => BigNumber.from(value)));

    await contract.connect(personD).batchWhitelistFreeMint(personD.address, 3);

    expect(await contract.connect(personD).whitelistFree(personD.address)).to
      .equal(
        0,
      );

    expect(await contract.connect(personD).balanceOf(personD.address)).to.equal(
      3,
    );

    expect(await contract.connect(personD).tokensOfOwner(personD.address)).to
      .have.deep.members([5, 6, 7].map((value) => BigNumber.from(value)));

    expect(await contract.connect(personD).tokens()).to
      .have.deep.members(
        [0, 1, 2, 3, 4, 5, 6, 7].map((value) => BigNumber.from(value)),
      );

    await contract.connect(personE).batchWhitelistFreeMint(personE.address, 4);

    expect(await contract.connect(personE).whitelistFree(personE.address)).to
      .equal(
        0,
      );

    expect(await contract.connect(personE).balanceOf(personE.address)).to.equal(
      4,
    );

    expect(await contract.connect(personE).tokensOfOwner(personE.address)).to
      .have.deep.members([8, 9, 10, 11].map((value) => BigNumber.from(value)));

    expect(await contract.connect(personE).tokens()).to
      .have.deep.members(
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((value) =>
          BigNumber.from(value)
        ),
      );

    expect(await contract.connect(personE).balanceOf(personE.address)).to.equal(
      4,
    );

    expect(await contract.connect(personF).isMintable()).to.be.false;

    await contract.connect(owner).setMintable(true);

    expect(await contract.connect(personF).isMintable()).to.be.true;

    await contract.connect(personF).batchMint(personF.address, 2, {
      value: mintPrice.mul(2),
    });

    expect(await contract.connect(personF).balanceOf(personF.address)).to.equal(
      2,
    );

    expect(await contract.connect(personF).tokensOfOwner(personF.address)).to
      .have.deep.members([12, 13].map((value) => BigNumber.from(value)));

    expect(await contract.connect(personF).tokens()).to
      .have.deep.members(
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((value) =>
          BigNumber.from(value)
        ),
      );

    await expect(
      contract.connect(personG).batchMint(personG.address, 1, {
        value: mintPrice,
      }),
    ).eventually.to.rejectedWith("All NFTs are already minted!");

    expect(await contract.connect(owner).totalSupply()).to.equal(14);

    expect(await contract.connect(personE).exists(maxCollectibleSupply)).to.be
      .false;

    for (const tokenId of [...Array(maxCollectibleSupply).keys()]) {
      expect(await contract.connect(owner).exists(tokenId));
    }

    await contract.connect(owner).setName("NAME_B");
    await contract.connect(owner).setSymbol("B");
    await contract.connect(owner).setContractURI("contractURI_B/");
    await contract.connect(owner).setBaseURI("baseURI_B/");

    await contract.connect(owner).lockMetadata();

    expect(await contract.connect(personA).metadataLock()).to.be.true;

    expect(await contract.connect(personA).name()).to.equal("NAME_B");
    expect(await contract.connect(personA).symbol()).to.equal("B");
    expect(await contract.connect(personA).contractURI()).to.equal(
      "contractURI_B/",
    );
    expect(await contract.connect(personA).baseURI()).to.equal(
      "baseURI_B/",
    );

    for (const tokenId of [...Array(maxCollectibleSupply).keys()]) {
      expect(await contract.connect(personA).tokenURI(tokenId)).to.equal(
        `baseURI_B/${tokenId}.json`,
      );
    }
  });
});
