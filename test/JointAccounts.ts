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
    const [addr, addr1, addr2, addr3, addr4] =
      await ethers.getSigners();

    const JointAccount = await ethers.getContractFactory("JointAccounts");
    const jointAccount = await JointAccount.deploy();

    return { jointAccount, addr, addr1, addr2, addr3, addr4 };
  }


  async function deployJointAccountWithAccounts(owners = 1, deposit = 0, withdrawAmounts:any[] = []){
    const { jointAccount, addr, addr1,addr2, addr3, addr4} = await loadFixture(deployJointAccount);
    // ! Note - addr is the creator of the account , depositor and withdraw requestor here
    // ! This is pre defined account for testing purpose
    
    let addresses:string[] = [];

    if(owners == 2) { addresses = [addr1.address]}
    else if(owners == 3) { addresses = [addr1.address, addr2.address]}
    else if(owners == 4) { addresses = [ addr1.address,addr2.address, addr3.address]}

    await jointAccount.connect(addr).createAccount(addresses);

    if(deposit > 0){
      await jointAccount.connect(addr).deposit(0, { value: deposit.toString()})
    }

    for(let amount of withdrawAmounts){
      await jointAccount.connect(addr).requestOfWithdrawal(0, amount)
    }

    return { jointAccount, addr, addr1, addr2, addr3, addr4}
  }

  describe("Deployment", function () {
    it("Should be deploy without error", async () => {
      await loadFixture(deployJointAccount);
    });
  });

  describe("Creating an account", () => {
    it("Should allow creating a single user account", async () => {
      const { jointAccount, addr } = await loadFixture(
        deployJointAccount
      );
      await jointAccount.connect(addr).createAccount([]);
      const accounts = await jointAccount.connect(addr).getAccounts();
      expect(accounts.length).to.equal(1);
    });

    it("Should allow to create double user account", async () => {
      const { jointAccount, addr, addr1 } = await loadFixture(
        deployJointAccount
      );
      await jointAccount.connect(addr).createAccount([addr1.address]);

      const account1 = await jointAccount.connect(addr).getAccounts();
      expect(account1.length).to.equal(1);

      const account2 = await jointAccount.connect(addr1).getAccounts();
      expect(account2.length).to.equal(1);
    });

    it("Should allow to create triple user account", async () => {
      const { jointAccount, addr, addr1, addr2 } = await loadFixture(
        deployJointAccount
      );
      await jointAccount
        .connect(addr)
        .createAccount([addr1.address, addr2.address]);

      const account1 = await jointAccount.connect(addr).getAccounts();
      expect(account1.length).to.equal(1);

      const account2 = await jointAccount.connect(addr1).getAccounts();
      expect(account2.length).to.equal(1);

      const account3 = await jointAccount.connect(addr2).getAccounts();
      expect(account3.length).to.equal(1);
    });

    it("Should allow to create quad user account", async () => {
      const { jointAccount, addr, addr1, addr2, addr3 } =
        await loadFixture(deployJointAccount);

      await jointAccount
        .connect(addr)
        .createAccount([addr1.address, addr2.address, addr3.address]);

      const account1 = await jointAccount.connect(addr).getAccounts();
      expect(account1.length).to.equal(1);

      const account2 = await jointAccount.connect(addr1).getAccounts();
      expect(account2.length).to.equal(1);

      const account3 = await jointAccount.connect(addr2).getAccounts();
      expect(account3.length).to.equal(1);

      const account4 = await jointAccount.connect(addr3).getAccounts();
      expect(account4.length).to.equal(1);
    });

    it("Should not allow creating a duplicate user account", async () => {
      const { jointAccount, addr } = await loadFixture(
        deployJointAccount
      );
      await expect(
        jointAccount.connect(addr).createAccount([addr.address])
      ).to.be.reverted;
    });

    it("Should not allow to create account which already have 4 owners", async () => {
      const { jointAccount, addr, addr1, addr2, addr3, addr4 } =
        await loadFixture(deployJointAccount);
      await expect(jointAccount
        .connect(addr)
        .createAccount([
          addr.address,
          addr1.address,
          addr2.address,
          addr3.address,
          addr4.address,
        ])).to.be.reverted;
    });

    it("Should not allow to create account more than 3", async () => {
      const { jointAccount, addr, addr1 } = await loadFixture(deployJointAccount);
        for (let index = 0; index < 3; index++) {
          await jointAccount
                    .connect(addr1)
                    .createAccount([]);
        }

        await expect(jointAccount.connect(addr1).createAccount([])).to.be.reverted;
      
    });

  });

  describe("Depositing", async () => {
    
    it("Shuuld allowed deposit from the account owner", async () => {
      const {jointAccount, addr} = await deployJointAccountWithAccounts(1);
      await expect(jointAccount.connect(addr).deposit(0, { value: "100"})).to.changeEtherBalances([jointAccount, addr], ["100", "-100"])
      
    });

    it("Shuuld not allowed deposit from the non=owner account", async () => {
      const {jointAccount ,addr1} = await deployJointAccountWithAccounts(1);
      await expect(jointAccount.connect(addr1).deposit(0, { value: "100"})).to.be.reverted;
    })
   
  });


  // ! Test cases for withdraw

  describe("Withdraw", () => {
    
    describe("request withdraw", () => {
      it("Should be able to create with request by owner", async () => {
        const { jointAccount, addr } = await deployJointAccountWithAccounts(0, 100);
        await jointAccount.connect(addr).requestOfWithdrawal(0, 100);

      });

      it("Should not be able to create withdraw request with invalid amount", async () => {
        const { jointAccount, addr } = await deployJointAccountWithAccounts(0, 100);

        await expect(jointAccount.connect(addr).requestOfWithdrawal(0, 102)).to.be.reverted;
      });

      it("Should not be able to create withdraw request with invalid account", async () => {
        const { jointAccount, addr1 } = await deployJointAccountWithAccounts(0, 100);

        await expect(jointAccount.connect(addr1).requestOfWithdrawal(0, 10)).to.be.reverted;
      });

      it("Should be able to create mulitple withdraw request", async () => {
        const { jointAccount, addr } = await deployJointAccountWithAccounts(0, 100);

        await jointAccount.connect(addr).requestOfWithdrawal(0, 10);
        await jointAccount.connect(addr).requestOfWithdrawal(0, 50);
        await jointAccount.connect(addr).requestOfWithdrawal(0, 40);
      })


    });

    describe("approve withdraw request", () => {
      it("Shuuld allow account owner to approve withdraw", async () => {
        const { jointAccount, addr1} = await deployJointAccountWithAccounts(2, 100, [100]);

        await jointAccount.connect(addr1).approvalOfWithdrawal(0, 0);

        expect(await jointAccount.getApprovals(0, 0)).to.equal(1);
      });

      it("Shuuld not allow non-account owner to approve withdraw", async () => {
        const { jointAccount, addr2} = await deployJointAccountWithAccounts(2, 100, [100]);

        await expect(jointAccount.connect(addr2).approvalOfWithdrawal(0, 0)).to.be.rejected;
      });

      it("Shuuld not allow  owner to approve withdraw mulitple times", async () => {
        const { jointAccount, addr1} = await deployJointAccountWithAccounts(2, 100, [100]);

        await jointAccount.connect(addr1).approvalOfWithdrawal(0, 0);
        await expect(jointAccount.connect(addr1).approvalOfWithdrawal(0, 0)).to.be.rejected;
      });

      it("Shuuld not allow creator of withdraw request to approve withdraw", async () => {
        const { jointAccount, addr} = await deployJointAccountWithAccounts(2, 100, [100]);

        
        await expect(jointAccount.connect(addr).approvalOfWithdrawal(0, 0)).to.be.rejected;
      });

    });

    describe("make a withdraw", ()=> {
      it("Shuuld allow creator of withdraw request to withdraw approved request", async () => {
        const { jointAccount, addr, addr1} = await deployJointAccountWithAccounts(2, 100, [100]);

        await jointAccount.connect(addr1).approvalOfWithdrawal(0, 0);
        await expect(jointAccount.connect(addr).withdraw(0, 0)).to.changeEtherBalances([jointAccount, addr], ["-100", "+100"])
      });

      it("Shuuld not allow creator of withdraw request to withdraw twice to the approved request", async () => {
        const { jointAccount, addr, addr1} = await deployJointAccountWithAccounts(2, 200, [100]);

        await jointAccount.connect(addr1).approvalOfWithdrawal(0, 0);
        await expect(jointAccount.connect(addr).withdraw(0, 0)).to.changeEtherBalances([jointAccount, addr], ["-100", "+100"]);
        await expect(jointAccount.connect(addr).withdraw(0, 0)).to.be.reverted;
      });

      it("Shuuld not allow not-creator of withdraw request to withdraw the approved request", async () => {
        const { jointAccount, addr, addr1} = await deployJointAccountWithAccounts(2, 200, [100]);

        await jointAccount.connect(addr1).approvalOfWithdrawal(0, 0);
        await expect(jointAccount.connect(addr1).withdraw(0, 0)).to.be.reverted;
      });

      it("Shuuld not allow non-approved withdraw request to withdraw ", async () => {
        const { jointAccount, addr, addr1} = await deployJointAccountWithAccounts(2, 200, [100]);

        await expect(jointAccount.connect(addr).withdraw(0, 0)).to.be.reverted;
      });
    });
  })



});
