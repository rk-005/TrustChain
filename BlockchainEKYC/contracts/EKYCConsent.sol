// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title EKYCConsent
 * @dev A contract for managing user consent for KYC data sharing
 */
contract EKYCConsent {
    using ECDSA for bytes32;

    // Consent record structure
    struct Consent {
        address requester;
        address user;
        bytes32 dataHash;
        uint256 expiryTimestamp;
        bool isRevoked;
    }

    // Mapping from consent ID to consent details
    mapping(bytes32 => Consent) public consents;
    // Mapping from user address to their consent IDs
    mapping(address => bytes32[]) public userConsents;

    // Events
    event ConsentGranted(bytes32 indexed consentId, address indexed user, address indexed requester);
    event ConsentRevoked(bytes32 indexed consentId, address indexed user);

    /**
     * @dev Grants consent for a requester to access user's KYC data
     * @param requester Address of the data requester
     * @param dataHash Hash of the specific data being shared
     * @param validityPeriod Duration in seconds for which the consent is valid
     * @return consentId Unique identifier for this consent
     */
    function grantConsent(address requester, bytes32 dataHash, uint256 validityPeriod) external returns (bytes32) {
        require(requester != address(0), "Invalid requester address");
        
        bytes32 consentId = keccak256(abi.encodePacked(msg.sender, requester, dataHash, block.timestamp));
        
        consents[consentId] = Consent({
            requester: requester,
            user: msg.sender,
            dataHash: dataHash,
            expiryTimestamp: block.timestamp + validityPeriod,
            isRevoked: false
        });
        
        userConsents[msg.sender].push(consentId);
        
        emit ConsentGranted(consentId, msg.sender, requester);
        
        return consentId;
    }

    /**
     * @dev Revokes a previously granted consent
     * @param consentId ID of the consent to revoke
     */
    function revokeConsent(bytes32 consentId) external {
        Consent storage consent = consents[consentId];
        require(consent.user == msg.sender, "Not the consent owner");
        require(!consent.isRevoked, "Consent already revoked");
        
        consent.isRevoked = true;
        
        emit ConsentRevoked(consentId, msg.sender);
    }

    /**
     * @dev Verifies if a consent is valid
     * @param consentId ID of the consent to verify
     * @return bool True if the consent is valid (not expired and not revoked)
     */
    function isConsentValid(bytes32 consentId) external view returns (bool) {
        Consent storage consent = consents[consentId];
        return (
            consent.user != address(0) &&
            !consent.isRevoked &&
            consent.expiryTimestamp > block.timestamp
        );
    }

    /**
     * @dev Gets all consent IDs for a user
     * @param user Address of the user
     * @return bytes32[] Array of consent IDs
     */
    function getUserConsents(address user) external view returns (bytes32[] memory) {
        return userConsents[user];
    }

    /**
     * @dev Gets consent details
     * @param consentId ID of the consent
     * @return requester Address of the requester
     * @return user Address of the user
     * @return dataHash Hash of the shared data
     * @return expiryTimestamp Expiry timestamp
     * @return isRevoked Revocation status
     */
    function getConsentDetails(bytes32 consentId) external view returns (
        address requester,
        address user,
        bytes32 dataHash,
        uint256 expiryTimestamp,
        bool isRevoked
    ) {
        Consent storage consent = consents[consentId];
        return (
            consent.requester,
            consent.user,
            consent.dataHash,
            consent.expiryTimestamp,
            consent.isRevoked
        );
    }
}
