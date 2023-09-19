// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <=0.8.19;

contract JointAccounts {
    // ! Events
    event AccountCreated(
        address[] owners,
        uint256 indexed id,
        uint256 timestamp
    );
    event Deposit(
        address indexed user,
        uint256 indexed accountId,
        uint256 value,
        uint256 timestamp
    );
    event WithdrawRequestCreated(
        address indexed user,
        uint256 indexed accountId,
        uint256 indexed withdrawId,
        uint256 value,
        uint256 timestamp
    );
    event Withdraw(uint256 withdrawId, uint256 timestamp);

    // ! Structs
    struct WithdrawRequest {
        address user;
        uint256 amount;
        uint256 approvals;
        mapping(address => bool) ownerApproved;
        bool approved;
    }

    struct Account {
        address[] owners;
        uint balance;
        mapping(uint => WithdrawRequest) withdrawRequest;
    }

    // ! Other states
    mapping(uint => Account) accounts;
    mapping(address => uint[]) userAccounts;        // It will save account id created by any address ( Specially owner ) 
    uint256 nextAccountId;
    uint256 nextWithdrawId;                         // It will get increment on every generation (unique id)


    // ! Functions

    function createAccount(address[] calldata otherOwners) external {

    }

    function deposit(uint256 accountId) external payable {

    }

    function requestOfWithdrawal(uint256 accountId, uint256 amount)  external {

    }

    function approvalOfWithdrawal(uint256 accountId, uint256 withdrawId) external {

    }

    function withdraw(uint256 accountId, uint256 withdrawId) external {

    }

    function getBalance(uint accountId) public view returns(uint){

    }

    function getOwner(uint accountId) public view returns(address[] memory) {

    }

    function getApprovals(uint256 accountId, uint withdrawId ) public view returns (uint) {
        // * return number of approvals;
    }

    function getAccounts() public view returns(uint[] memory) {
        // * return all accounts related to calleer address
    }
}
