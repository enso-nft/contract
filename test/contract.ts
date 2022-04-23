import { expect } from "chai";
import { ethers } from "hardhat";

import { ContractFactory, InterfaceTesterFactory } from "../lib";

describe("Contract", function () {
  it("The metadata is as defined in the constructor and can be checked by anybody.", async function () {
    const [owner, anybody] = await ethers.getSigners();
    const contract = await ContractFactory({
      owner,
      name: "NAME_A",
      symbol: "A",
      contractURI: "contractURI_A",
      baseURI: "baseURI_A",
    });

    expect(await contract.connect(anybody).name()).to.equal("NAME_A");
    expect(await contract.connect(anybody).symbol()).to.equal("A");
    expect(await contract.connect(anybody).contractURI()).to.equal(
      "contractURI_A"
    );
    expect(await contract.connect(anybody).baseURI()).to.equal("baseURI_A");
  });

  it("Only by the owner may change the name.", async function () {
    const [owner, anybody] = await ethers.getSigners();
    const contract = await ContractFactory({
      owner,
      name: "Bambini Project",
    });

    await expect(
      contract.connect(anybody).setName("Not a Bambini Project")
    ).eventually.to.rejectedWith("Ownable: caller is not the owner");

    await contract.connect(owner).setName("Bambini Project V2");

    expect(await contract.connect(anybody).name()).to.equal(
      "Bambini Project V2"
    );
  });

  it("Only by the owner may change the symbol.", async function () {
    const [owner, anybody] = await ethers.getSigners();
    const contract = await ContractFactory({
      owner,
      symbol: "ABC",
    });

    await expect(
      contract.connect(anybody).setSymbol("EFG")
    ).eventually.to.rejectedWith("Ownable: caller is not the owner");

    await contract.connect(owner).setSymbol("XYZ");

    expect(await contract.connect(anybody).symbol()).to.equal("XYZ");
  });

  it("Only by the owner may change contractURI.", async function () {
    const [owner, anybody] = await ethers.getSigners();
    const contract = await ContractFactory({
      owner,
      contractURI: "URI_A/",
    });

    await expect(
      contract.connect(anybody).setContractURI("URI_B/")
    ).eventually.to.rejectedWith("Ownable: caller is not the owner");

    await contract.connect(owner).setContractURI("URI_C/");

    expect(await contract.connect(anybody).contractURI()).to.equal("URI_C/");
  });

  it("Only by the owner may change baseURI.", async function () {
    const [owner, anybody] = await ethers.getSigners();
    const contract = await ContractFactory({
      owner,
      baseURI: "URI_A",
    });

    await expect(
      contract.connect(anybody).setBaseURI("URI_B/")
    ).eventually.to.rejectedWith("Ownable: caller is not the owner");

    await contract.connect(owner).setBaseURI("URI_C/");

    expect(await contract.connect(anybody).baseURI()).to.equal("URI_C/");
  });

  it("Only the owner may change the royalty.", async function () {
    const mintPrice = ethers.utils.parseEther("0.1");
    const [owner, somebody, anybody] = await ethers.getSigners();
    const contract = await ContractFactory({
      owner,
      royalty: {
        receiver: owner.address,
        basisPoints: 100,
      },
    });

    await expect(
      contract.connect(anybody).setDefaultRoyalty(anybody.address, 100)
    ).eventually.to.rejectedWith("Ownable: caller is not the owner");

    await contract.connect(anybody).batchMint(anybody.address, 1, {
      value: mintPrice,
    });

    expect(
      await contract
        .connect(anybody)
        .royaltyInfo(0, ethers.utils.parseEther("10"))
    ).to.eql([owner.address, ethers.utils.parseEther("0.1")]);

    await contract.connect(owner).setDefaultRoyalty(somebody.address, 500);

    expect(
      await contract
        .connect(anybody)
        .royaltyInfo(0, ethers.utils.parseEther("10"))
    ).to.eql([somebody.address, ethers.utils.parseEther("0.5")]);
  });

  it("The contract can receive currency from anybody.", async function () {
    const [owner, anybody] = await ethers.getSigners();
    const contract = await ContractFactory({
      owner,
    });

    await anybody.sendTransaction({
      from: anybody.address,
      to: contract.address,
      value: ethers.utils.parseEther("1"),
    });

    expect(await ethers.provider.getBalance(contract.address)).to.equal(
      ethers.utils.parseEther("1")
    );
  });

  it("Only the owner can lock the metadata and the lock works.", async function () {
    const [owner, anybody] = await ethers.getSigners();
    const contract = await ContractFactory({
      owner,
      name: "NAME_A",
      symbol: "A",
      contractURI: "contractURI_A",
      baseURI: "baseURI_A",
    });

    expect(await contract.connect(anybody).metadataLock()).to.be.false;

    await expect(
      contract.connect(anybody).lockMetadata()
    ).eventually.to.rejectedWith("Ownable: caller is not the owner");

    await contract.connect(owner).lockMetadata();

    expect(await contract.connect(anybody).metadataLock()).to.be.true;

    await expect(
      contract.connect(owner).setName("NAME_B")
    ).eventually.to.rejectedWith("Metadata is locked!");
    await expect(
      contract.connect(owner).setSymbol("B")
    ).eventually.to.rejectedWith("Metadata is locked!");
    await expect(
      contract.connect(owner).setContractURI("contractURI_B")
    ).eventually.to.rejectedWith("Metadata is locked!");
    await expect(
      contract.connect(owner).setBaseURI("baseURI_B")
    ).eventually.to.rejectedWith("Metadata is locked!");
  });

  it("The supported interfaces match.", async function () {
    const [owner] = await ethers.getSigners();

    const contract = await ContractFactory({ owner });
    const interfaceTester = await InterfaceTesterFactory({
      owner,
      deployedContract: contract.address,
    });

    expect(await interfaceTester.testIERC721()).to.be.true;
    expect(await interfaceTester.testIERC721Enumerable()).to.be.true;
    expect(await interfaceTester.testIERC2981()).to.be.true;
  });

  it("The total max collectible supply can be lowered by the owner.", async function () {
    const [owner, anybody] = await ethers.getSigners();

    const contract = await ContractFactory({ owner, maxCollectibleSupply: 10 });

    expect(await contract.connect(anybody).maxCollectibleSupply()).to.equal(10);

    await expect(
      contract.connect(anybody).lowerMaxCollectibleSupply(5)
    ).eventually.to.rejectedWith("Ownable: caller is not the owner");

    await contract.connect(owner).lowerMaxCollectibleSupply(5);

    expect(await contract.connect(anybody).maxCollectibleSupply()).to.equal(5);

    await contract.connect(owner).airdropBatchMint(anybody.address, 5);

    await expect(
      contract.connect(owner).lowerMaxCollectibleSupply(4)
    ).eventually.to.rejectedWith(
      "Cannot set max collectible supply lower than actual supply!"
    );
  });
});
