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
        mapping(uint => WithdrawRequest) withdrawRequests;
    }

    // ! Other states
    mapping(uint => Account) accounts;
    mapping(address => uint[]) userAccounts;        // It will save account id created by any address ( Specially owner ) 
    uint256 nextAccountId;
    uint256 nextWithdrawId;                         // It will get increment on every generation (unique id)

    // ! Modifiers

    modifier isOwner(uint accountId) {
        bool accountOwner;
        for (uint256 index; index < accounts[accountId].owners.length; index++) {
            if(accounts[accountId].owners[index] == msg.sender){
                accountOwner = true;
                break;
            }
        }
        require(accountOwner, "You are not the account owner of the mentioned id");
        _;
    }

    modifier validOwners(address[] calldata owners) {
        require(owners.length <= 4, "Max for accounts allowed");
        for (uint256 index = 0; index < owners.length; index++) {
            if(owners[index] == msg.sender){
                 revert("Duplicate account not allowed");
            }
            for (uint256 j = index + 1; j < owners.length; j++) {
                if(owners[index] == owners[j]){
                    revert("Duplicate account not allowed");
                }
            }
        }
        _;
    }

    modifier sufficientBalance(uint256 accountId, uint256 amount) {
        require(accounts[accountId].balance >= amount, "Insufficient amount to withdraw");
        _;
    }

    modifier canApproved(uint256 accountId, uint256 withdrawId) {
        WithdrawRequest storage request = accounts[accountId].withdrawRequests[withdrawId];
        require(request.user != msg.sender, "You can't approved your own withdraw request");
        require(request.approved != true, "Withdraw request is already approved");
        require(request.user != address(0), "Request doesn't exist");
        require(request.ownerApproved[msg.sender] == false, "You have already approved this request");
        _;

    }

    modifier canWithdraw(uint256 accountId, uint256 withdrawId){
        require(accounts[accountId].withdrawRequests[withdrawId].user == msg.sender, "You have not created this withdraw request");
        require(accounts[accountId].withdrawRequests[withdrawId].approved, "This request has not yet approved");
        _;
    }

    // ! Functions

    function createAccount(address[] calldata otherOwners) external validOwners(otherOwners) {
        address[] memory owners = new address[](otherOwners.length + 1);
        owners[otherOwners.length] = msg.sender;            // * Added caller address at the last of array

        uint256 id = nextAccountId;

        for (uint256 i = 0; i < owners.length; i++) {
            if(i < owners.length - 1){
                owners[i] = otherOwners[i];
            }

            if(userAccounts[owners[i]].length > 2){
                revert("Each user can have maximum of 3 accounts");
            }
            userAccounts[owners[i]].push(id);
        }

        accounts[id].owners = owners;
        nextAccountId++;
        emit AccountCreated(owners, id, block.timestamp);
    }

    function deposit(uint256 accountId) external  payable isOwner(accountId) {
        accounts[accountId].balance += msg.value;
    }

    function requestOfWithdrawal(uint256 accountId, uint256 amount)  external isOwner(accountId ) sufficientBalance(accountId, amount){
        uint id = nextWithdrawId;
        WithdrawRequest storage request = accounts[accountId].withdrawRequests[id];         // * referencing the next withdraw request
        request.amount = amount;
        request.user = msg.sender;
        nextWithdrawId++;
        emit WithdrawRequestCreated(msg.sender, accountId, id, amount, block.timestamp);
    }

    function approvalOfWithdrawal(uint256 accountId, uint256 withdrawId) external isOwner(accountId) canApproved(accountId, withdrawId) {
        WithdrawRequest storage request = accounts[accountId].withdrawRequests[withdrawId];
        request.approvals++;
        request.ownerApproved[msg.sender] = true;

        if(request.approvals == accounts[accountId].owners.length - 1){     // * -1, because withdraw requester also included in the owners list- from with we dont' required approval
            request.approved = true;
        }
    }

    function withdraw(uint256 accountId, uint256 withdrawId) external canWithdraw(accountId, withdrawId) {
        uint amount = accounts[accountId].withdrawRequests[withdrawId].amount;

        require(amount <= accounts[accountId].balance, "Insufficient amount");  // * Second check require ( due to other withdraw before this);

        accounts[accountId].balance -= amount;
        delete accounts[accountId].withdrawRequests[withdrawId];

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent);

        emit Withdraw(withdrawId, block.timestamp);
    }

    function getBalance(uint accountId) public view returns(uint){
        return accounts[accountId].balance;
    }

    function getOwner(uint accountId) public view returns(address[] memory) {
        return accounts[accountId].owners;
    }

    function getApprovals(uint256 accountId, uint withdrawId ) public view returns (uint) {
        // * return number of approvals;
        return accounts[accountId].withdrawRequests[withdrawId].approvals;
    }

    function getAccounts() public view returns(uint[] memory) {
        // * return all accounts related to calleer address
        return userAccounts[msg.sender];
    }
}
