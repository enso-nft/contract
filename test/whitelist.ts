import { ethers } from "hardhat";

import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

import { ContractFactory } from "../lib";

chai.use(chaiAsPromised);

const mintPrice = ethers.utils.parseEther("0.1");
const whitelistMintPrice = ethers.utils.parseEther("0.01");

describe("Whitelist", function () {
  it("Only the owner may set the whitelist and the free mint whitelist, but anybody may retrieve that data.", async function () {
    const [owner, personA, personB, personC, personD, personE, personF] =
      await ethers
        .getSigners();

    const contract = await ContractFactory({
      owner,
      mintable: false,
      whitelistMintable: false,
    });

    await expect(
      contract.connect(personA).setWhitelist(personA.address, 5),
    ).eventually.to.rejectedWith(
      "Ownable: caller is not the owner",
    );

    await expect(
      contract.connect(personB).setWhitelistFree(personB.address, 10),
    ).eventually.to.rejectedWith(
      "Ownable: caller is not the owner",
    );

    await expect(
      contract.connect(personC).batchSetWhitelist([
        personC.address,
        personD.address,
      ], [15, 20]),
    ).eventually.to.rejectedWith(
      "Ownable: caller is not the owner",
    );

    await expect(
      contract.connect(personE).batchSetWhitelistFree([
        personE.address,
        personF.address,
      ], [25, 25]),
    ).eventually.to.rejectedWith(
      "Ownable: caller is not the owner",
    );

    await contract.connect(owner).setWhitelist(personA.address, 5);
    await contract.connect(owner).setWhitelistFree(personB.address, 10);

    await contract.connect(owner).batchSetWhitelist([
      personC.address,
      personD.address,
    ], [15, 20]);

    await contract.connect(owner).batchSetWhitelistFree([
      personE.address,
      personF.address,
    ], [25, 30]);

    expect(
      await contract.connect(personA).whitelist(personA.address),
    ).to.equal(5);

    expect(
      await contract.connect(personB).whitelistFree(personB.address),
    ).to.equal(10);

    expect(
      await contract.connect(personC).whitelist(personC.address),
    ).to.equal(15);

    expect(
      await contract.connect(personD).whitelist(personD.address),
    ).to.equal(20);

    expect(
      await contract.connect(personE).whitelistFree(personE.address),
    ).to.equal(25);

    expect(
      await contract.connect(personF).whitelistFree(personF.address),
    ).to.equal(30);
  });

  it("Only the whitelist and free mint whitelist members can mint after the whitelist launch.", async function () {
    const [owner, personA, personB, personC, personD, personE] = await ethers
      .getSigners();

    const contract = await ContractFactory({
      owner,
      mintable: false,
      whitelistMintable: true,
      whitelistMintPrice,
    });

    await contract.connect(owner).batchSetWhitelist([
      personB.address,
      personC.address,
    ], [1, 2]);

    await contract.connect(owner).batchSetWhitelistFree([
      personD.address,
      personE.address,
    ], [3, 4]);

    expect(await contract.connect(personA).isMintable()).to.eql(false);
    expect(await contract.connect(personA).isWhitelistMintable()).to.eql(true);

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

    await contract.connect(personB).batchWhitelistMint(
      personB.address,
      1,
      {
        value: whitelistMintPrice,
      },
    );

    await contract.connect(personC).batchWhitelistMint(
      personC.address,
      2,
      {
        value: whitelistMintPrice.mul(2),
      },
    );

    await contract.connect(personD).batchWhitelistFreeMint(
      personD.address,
      3,
    );

    await contract.connect(personE).batchWhitelistFreeMint(
      personE.address,
      4,
    );

    expect(await contract.connect(personA).totalSupply()).to.equal(10);

    expect(await contract.connect(personB).balanceOf(personB.address)).to.equal(
      1,
    );
    expect(await contract.connect(personC).balanceOf(personC.address)).to.equal(
      2,
    );
    expect(await contract.connect(personD).balanceOf(personD.address)).to.equal(
      3,
    );
    expect(await contract.connect(personE).balanceOf(personE.address)).to.equal(
      4,
    );
  });

  it("Nobody can mint more than they have whitelist or free mint whitelist spots.", async function () {
    const [owner, personA, personB, personC, personD] = await ethers
      .getSigners();

    const contract = await ContractFactory({
      owner,
      mintable: false,
      whitelistMintable: true,
      whitelistMintPrice,
    });

    await contract.connect(owner).batchSetWhitelist([
      personA.address,
      personB.address,
    ], [1, 2]);

    await contract.connect(owner).batchSetWhitelistFree([
      personC.address,
      personD.address,
    ], [3, 4]);

    await expect(
      contract.connect(personA).batchWhitelistMint(
        personA.address,
        2,
        {
          value: whitelistMintPrice.mul(2),
        },
      ),
    ).eventually.to.rejectedWith(
      "Not enough whitelist spots!",
    );

    await contract.connect(personB).batchWhitelistMint(
      personB.address,
      1,
      {
        value: whitelistMintPrice,
      },
    );

    expect(await contract.connect(personB).whitelist(personB.address)).to.equal(
      1,
    );

    await expect(
      contract.connect(personC).batchWhitelistFreeMint(
        personC.address,
        4,
        {
          value: whitelistMintPrice.mul(4),
        },
      ),
    ).eventually.to.rejectedWith(
      "Not enough free mint whitelist spots!",
    );

    await contract.connect(personD).batchWhitelistFreeMint(
      personB.address,
      3,
      {
        value: whitelistMintPrice.mul(3),
      },
    );

    expect(await contract.connect(personD).whitelistFree(personD.address)).to
      .equal(
        1,
      );

    await expect(
      contract.connect(personD).batchWhitelistFreeMint(
        personD.address,
        2,
        {
          value: whitelistMintPrice.mul(2),
        },
      ),
    ).eventually.to.rejectedWith(
      "Not enough free mint whitelist spots!",
    );
  });

  it("Nobody can pay too much or too little via the whitelist.", async function () {
    const [owner, anybody] = await ethers
      .getSigners();

    const contract = await ContractFactory({
      owner,
      mintable: false,
      whitelistMintable: true,
      whitelistMintPrice,
    });

    await contract.connect(owner).setWhitelist(anybody.address, 1);

    await expect(
      contract.connect(anybody).batchWhitelistMint(
        anybody.address,
        1,
        {
          value: whitelistMintPrice.mul(2),
        },
      ),
    ).eventually.to.rejectedWith(
      "Incorrect transaction value!",
    );

    await expect(
      contract.connect(anybody).batchWhitelistMint(
        anybody.address,
        1,
      ),
    ).eventually.to.rejectedWith(
      "Incorrect transaction value!",
    );
  });
});
