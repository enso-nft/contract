import { ethers } from "hardhat";

import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

import { ContractFactory } from "../lib";

chai.use(chaiAsPromised);

describe("Launch", function () {
  it("Only the owner may set the launch and whitelist launch, but anybody may check it.", async function () {
    const [owner, anybody] = await ethers.getSigners();
    const contract = await ContractFactory({
      owner,
      mintable: false,
      whitelistMintable: false,
    });

    await expect(
      contract.connect(anybody).setMintable(true)
    ).eventually.to.rejectedWith("Ownable: caller is not the owner");

    await expect(
      contract.connect(anybody).setWhitelistMintable(true)
    ).eventually.to.rejectedWith("Ownable: caller is not the owner");

    expect(await contract.connect(anybody).isWhitelistMintable()).to.eql(false);

    await contract.connect(owner).setWhitelistMintable(true);

    expect(await contract.connect(anybody).isWhitelistMintable()).to.eql(true);

    expect(await contract.connect(anybody).isWhitelistFreeMintable()).to.eql(
      true
    );

    expect(await contract.connect(anybody).isMintable()).to.eql(false);

    // Note that after enabling public minting, the whitelist minting is disabled. However,
    // the free minting stays active.
    await contract.connect(owner).setMintable(true);

    expect(await contract.connect(anybody).isMintable()).to.eql(true);

    expect(await contract.connect(anybody).isWhitelistMintable()).to.eql(false);

    expect(await contract.connect(anybody).isWhitelistFreeMintable()).to.eql(
      true
    );
  });

  it("After enabling public minting, the free mints continue to work, but the whitelist does not.", async function () {
    const [owner, anybody] = await ethers.getSigners();
    const contract = await ContractFactory({
      owner,
      mintable: false,
      whitelistMintable: false,
    });

    await contract.connect(owner).setWhitelistMintable(true);

    expect(await contract.connect(anybody).isMintable()).to.eql(false);

    expect(await contract.connect(anybody).isWhitelistMintable()).to.eql(true);

    expect(await contract.connect(anybody).isWhitelistFreeMintable()).to.eql(
      true
    );

    await contract.connect(owner).setMintable(true);

    expect(await contract.connect(anybody).isMintable()).to.eql(true);

    expect(await contract.connect(anybody).isWhitelistMintable()).to.eql(false);

    expect(await contract.connect(anybody).isWhitelistFreeMintable()).to.eql(
      true
    );
  });
});
