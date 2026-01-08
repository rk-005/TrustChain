// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EKYCRegistry
 * @dev A registry contract for approved eKYC providers
 */
contract EKYCRegistry is Ownable {
    // Struct to store provider information
    struct Provider {
        string name;
        string metadataURI; // URI pointing to provider details
        bool isActive;
        uint256 registrationTime;
    }

    // Mapping of provider address to their information
    mapping(address => Provider) public providers;
    // Array to keep track of all provider addresses
    address[] public providerAddresses;

    // Events
    event ProviderRegistered(address indexed provider, string name);
    event ProviderStatusChanged(address indexed provider, bool isActive);
    event ProviderMetadataUpdated(address indexed provider, string metadataURI);

    /**
     * @dev Constructor sets the owner as the initial admin
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Registers a new eKYC provider
     * @param provider Address of the provider
     * @param name Name of the provider
     * @param metadataURI URI pointing to provider details
     */
    function registerProvider(address provider, string calldata name, string calldata metadataURI) external onlyOwner {
        require(provider != address(0), "Invalid provider address");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(providers[provider].registrationTime == 0, "Provider already registered");

        providers[provider] = Provider({
            name: name,
            metadataURI: metadataURI,
            isActive: true,
            registrationTime: block.timestamp
        });

        providerAddresses.push(provider);
        emit ProviderRegistered(provider, name);
    }

    /**
     * @dev Sets the active status of a provider
     * @param provider Address of the provider
     * @param isActive New active status
     */
    function setProviderStatus(address provider, bool isActive) external onlyOwner {
        require(providers[provider].registrationTime > 0, "Provider not registered");
        providers[provider].isActive = isActive;
        emit ProviderStatusChanged(provider, isActive);
    }

    /**
     * @dev Updates a provider's metadata URI
     * @param provider Address of the provider
     * @param metadataURI New metadata URI
     */
    function updateProviderMetadata(address provider, string calldata metadataURI) external {
        require(msg.sender == provider || msg.sender == owner(), "Unauthorized");
        require(providers[provider].registrationTime > 0, "Provider not registered");
        
        providers[provider].metadataURI = metadataURI;
        emit ProviderMetadataUpdated(provider, metadataURI);
    }

    /**
     * @dev Checks if a provider is active
     * @param provider Address of the provider
     * @return bool True if the provider is registered and active
     */
    function isProviderActive(address provider) external view returns (bool) {
        return providers[provider].isActive;
    }

    /**
     * @dev Gets the total number of registered providers
     * @return uint256 Number of providers
     */
    function getProviderCount() external view returns (uint256) {
        return providerAddresses.length;
    }

    /**
     * @dev Gets a list of all provider addresses
     * @return address[] Array of provider addresses
     */
    function getAllProviders() external view returns (address[] memory) {
        return providerAddresses;
    }

    /**
     * @dev Gets a provider's details
     * @param provider Address of the provider
     * @return name Provider name
     * @return metadataURI Provider metadata URI
     * @return isActive Provider active status
     * @return registrationTime Provider registration timestamp
     */
    function getProviderDetails(address provider) external view returns (
        string memory name,
        string memory metadataURI,
        bool isActive,
        uint256 registrationTime
    ) {
        Provider storage p = providers[provider];
        return (p.name, p.metadataURI, p.isActive, p.registrationTime);
    }
}
