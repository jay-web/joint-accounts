import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("JointAccounts", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployJointAccount() {
    // Contracts are deployed using the first signer/account by default
    const [ownerAddress, addr1, addr2, addr3, addr4] =
      await ethers.getSigners();

    const JointAccount = await ethers.getContractFactory("JointAccounts");
    const jointAccount = await JointAccount.deploy();

    return { jointAccount, ownerAddress, addr1, addr2, addr3, addr4 };
  }

  describe("Deployment", function () {
    it("Should be deploy without error", async () => {
      await loadFixture(deployJointAccount);
    });
  });

  describe("Creating an account", () => {
    it("Should allow creating a single user account", async () => {
      const { jointAccount, ownerAddress } = await loadFixture(
        deployJointAccount
      );
      await jointAccount.connect(ownerAddress).createAccount([]);
      const accounts = await jointAccount.connect(ownerAddress).getAccounts();
      expect(accounts.length).to.equal(1);
    });

    it("Should allow to create double user account", async () => {
      const { jointAccount, ownerAddress, addr1 } = await loadFixture(
        deployJointAccount
      );
      await jointAccount.connect(ownerAddress).createAccount([addr1.address]);

      const account1 = await jointAccount.connect(ownerAddress).getAccounts();
      expect(account1.length).to.equal(1);

      const account2 = await jointAccount.connect(addr1).getAccounts();
      expect(account2.length).to.equal(1);
    });

    it("Should allow to create triple user account", async () => {
      const { jointAccount, ownerAddress, addr1, addr2 } = await loadFixture(
        deployJointAccount
      );
      await jointAccount
        .connect(ownerAddress)
        .createAccount([addr1.address, addr2.address]);

      const account1 = await jointAccount.connect(ownerAddress).getAccounts();
      expect(account1.length).to.equal(1);

      const account2 = await jointAccount.connect(addr1).getAccounts();
      expect(account2.length).to.equal(1);

      const account3 = await jointAccount.connect(addr2).getAccounts();
      expect(account3.length).to.equal(1);
    });

    it("Should allow to create quad user account", async () => {
      const { jointAccount, ownerAddress, addr1, addr2, addr3 } =
        await loadFixture(deployJointAccount);

      await jointAccount
        .connect(ownerAddress)
        .createAccount([addr1.address, addr2.address, addr3.address]);

      const account1 = await jointAccount.connect(ownerAddress).getAccounts();
      expect(account1.length).to.equal(1);

      const account2 = await jointAccount.connect(addr1).getAccounts();
      expect(account2.length).to.equal(1);

      const account3 = await jointAccount.connect(addr2).getAccounts();
      expect(account3.length).to.equal(1);

      const account4 = await jointAccount.connect(addr3).getAccounts();
      expect(account4.length).to.equal(1);
    });

    it("Should not allow creating a duplicate user account", async () => {
      const { jointAccount, ownerAddress } = await loadFixture(
        deployJointAccount
      );
      await expect(
        jointAccount.connect(ownerAddress).createAccount([ownerAddress.address])
      ).to.be.reverted;
    });

    it("Should not allow to create account which already have 4 owners", async () => {
      const { jointAccount, ownerAddress, addr1, addr2, addr3, addr4 } =
        await loadFixture(deployJointAccount);
      await expect(jointAccount
        .connect(ownerAddress)
        .createAccount([
          ownerAddress.address,
          addr1.address,
          addr2.address,
          addr3.address,
          addr4.address,
        ])).to.be.reverted;
    });

    it("Should not allow to create account more than 3", async () => {
      const { jointAccount, ownerAddress, addr1 } = await loadFixture(deployJointAccount);
        for (let index = 0; index < 3; index++) {
          await jointAccount
                    .connect(addr1)
                    .createAccount([]);
        }

        await expect(jointAccount.connect(addr1).createAccount([])).to.be.reverted;
      
    });


  });
});
