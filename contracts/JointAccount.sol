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
    event WithdrawRequest(
        address indexed user,
        uint256 indexed accountId,
        uint256 indexed withdrawId,
        uint256 value,
        uint256 timestamp
    );
    event Withdraw(uint256 withdrawId, uint256 timestamp);
}
