// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title EKYC
 * @dev A contract for managing electronic Know Your Customer (eKYC) data on the blockchain
 */
contract EKYC is AccessControl {
    using ECDSA for bytes32;

    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // User verification status
    enum VerificationStatus { NotVerified, Pending, Verified, Rejected }

    // User KYC data structure
    struct UserData {
        address userAddress;
        bytes32 dataHash; // Hash of off-chain KYC data
        VerificationStatus status;
        address verifiedBy;
        uint256 verificationTimestamp;
        uint256 expiryTimestamp;
    }

    // Mapping from user address to their KYC data
    mapping(address => UserData) public users;

    // Events
    event UserRegistered(address indexed user, bytes32 dataHash);
    event VerificationStatusChanged(address indexed user, VerificationStatus status, address verifier);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);

    /**
     * @dev Constructor sets up admin role for the deployer
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Registers a user's KYC data hash
     * @param dataHash Hash of the user's KYC data stored off-chain
     */
    function registerUser(bytes32 dataHash) external {
        require(users[msg.sender].userAddress == address(0), "User already registered");
        
        users[msg.sender] = UserData({
            userAddress: msg.sender,
            dataHash: dataHash,
            status: VerificationStatus.Pending,
            verifiedBy: address(0),
            verificationTimestamp: 0,
            expiryTimestamp: 0
        });
        
        emit UserRegistered(msg.sender, dataHash);
    }

    /**
     * @dev Updates a user's KYC data hash
     * @param dataHash New hash of the user's KYC data
     */
    function updateUserData(bytes32 dataHash) external {
        require(users[msg.sender].userAddress != address(0), "User not registered");
        
        users[msg.sender].dataHash = dataHash;
        users[msg.sender].status = VerificationStatus.Pending;
        users[msg.sender].verificationTimestamp = 0;
        users[msg.sender].expiryTimestamp = 0;
        
        emit UserRegistered(msg.sender, dataHash);
    }

    /**
     * @dev Verifies a user's KYC data
     * @param user Address of the user to verify
     * @param status New verification status
     * @param expiryDuration Duration in seconds until verification expires
     */
    function verifyUser(address user, VerificationStatus status, uint256 expiryDuration) external onlyRole(VERIFIER_ROLE) {
        require(users[user].userAddress != address(0), "User not registered");
        require(status != VerificationStatus.NotVerified, "Invalid status");
        
        users[user].status = status;
        users[user].verifiedBy = msg.sender;
        users[user].verificationTimestamp = block.timestamp;
        
        if (status == VerificationStatus.Verified) {
            users[user].expiryTimestamp = block.timestamp + expiryDuration;
        } else {
            users[user].expiryTimestamp = 0;
        }
        
        emit VerificationStatusChanged(user, status, msg.sender);
    }

    /**
     * @dev Adds a verifier
     * @param verifier Address of the verifier to add
     */
    function addVerifier(address verifier) external onlyRole(ADMIN_ROLE) {
        grantRole(VERIFIER_ROLE, verifier);
        emit VerifierAdded(verifier);
    }

    /**
     * @dev Removes a verifier
     * @param verifier Address of the verifier to remove
     */
    function removeVerifier(address verifier) external onlyRole(ADMIN_ROLE) {
        revokeRole(VERIFIER_ROLE, verifier);
        emit VerifierRemoved(verifier);
    }

    /**
     * @dev Checks if a user's verification is valid
     * @param user Address of the user to check
     * @return bool True if the user is verified and not expired
     */
    function isVerified(address user) external view returns (bool) {
        UserData storage userData = users[user];
        return (
            userData.status == VerificationStatus.Verified &&
            (userData.expiryTimestamp == 0 || userData.expiryTimestamp > block.timestamp)
        );
    }

    /**
     * @dev Gets a user's verification details
     * @param user Address of the user
     * @return status Verification status
     * @return verifiedBy Address of the verifier
     * @return verificationTimestamp Timestamp of verification
     * @return expiryTimestamp Timestamp of expiry
     */
    function getUserVerificationDetails(address user) external view returns (
        VerificationStatus status,
        address verifiedBy,
        uint256 verificationTimestamp,
        uint256 expiryTimestamp
    ) {
        UserData storage userData = users[user];
        return (
            userData.status,
            userData.verifiedBy,
            userData.verificationTimestamp,
            userData.expiryTimestamp
        );
    }
}
