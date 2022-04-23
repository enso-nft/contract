import { ethers } from "hardhat";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

import { ContractFactory } from "../lib";

chai.use(chaiAsPromised);

describe("Withdraw", function () {
  const tests = ["0.1", "1", "10", "100"].map((value) => {
    return {
      eth: value,
    };
  });

  tests.forEach(function ({ eth }) {
    it(`Only the owner may withdraw ${eth} eth to anybody.`, async function () {
      const [owner, anybody] = await ethers.getSigners();
      const contract = await ContractFactory({
        owner,
      });

      await owner.sendTransaction({
        from: owner.address,
        to: contract.address,
        value: ethers.utils.parseEther(eth),
      });

      await expect(contract.connect(anybody).withdraw(anybody.address))
        .eventually.to
        .rejectedWith(
          "Ownable: caller is not the owner",
        );

      const anybodyBalance = await ethers.provider.getBalance(
        anybody.address,
      );

      await contract.connect(owner).withdraw(anybody.address);

      expect(await ethers.provider.getBalance(contract.address)).to.equal(0);

      expect(await ethers.provider.getBalance(anybody.address)).to.equal(
        anybodyBalance.add(ethers.utils.parseEther(eth)),
      );
    });
  });
});
