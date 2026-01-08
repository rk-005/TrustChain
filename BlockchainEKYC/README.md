# BlockchainEKYC

A blockchain-based Electronic Know Your Customer (eKYC) system that enables secure, privacy-preserving identity verification and management on the blockchain.

## Overview

BlockchainEKYC is a decentralized solution for managing KYC processes with the following components:

1. **EKYC Contract**: Core contract for managing user verification status and KYC data hashes
2. **EKYCRegistry**: Registry of approved KYC service providers
3. **EKYCConsent**: Manages user consent for data sharing between parties

## Features

- Secure storage of KYC data hashes on-chain (actual data stored off-chain)
- Role-based access control for KYC verifiers
- Time-bound verification with expiry management
- Registry of trusted KYC providers
- User-controlled consent management for data sharing
- Comprehensive event logging for audit trails

## Smart Contracts

### EKYC.sol

The core contract that manages user verification status:

- User registration with KYC data hashes
- Verification status management (Pending, Verified, Rejected)
- Role-based access control for verifiers
- Expiry-based verification validity

### EKYCRegistry.sol

Registry of approved KYC service providers:

- Provider registration and management
- Provider status tracking (active/inactive)
- Provider metadata management

### EKYCConsent.sol

Manages user consent for data sharing:

- Consent granting with expiry
- Consent revocation
- Consent validity checking
- User consent history

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Hardhat

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/BlockchainEKYC.git
cd BlockchainEKYC

# Install dependencies
npm install
```

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

### Deploy Contracts

```bash
npx hardhat run scripts/deploy.ts --network <network-name>
```

## Usage Flow

1. **Admin Setup**:
   - Deploy contracts
   - Add verifiers to the EKYC contract
   - Register trusted KYC providers in the registry

2. **User Registration**:
   - User submits KYC information off-chain
   - Hash of the KYC data is stored on-chain

3. **Verification Process**:
   - Authorized verifiers validate user information
   - Update verification status on-chain

4. **Data Sharing**:
   - Users grant consent to specific requesters
   - Requesters can verify consent validity
   - Users can revoke consent at any time

## Security Considerations

- No personal data is stored on-chain, only hashes
- Role-based access control for sensitive operations
- Time-bound verifications and consents
- User-controlled data sharing

## License

This project is licensed under the MIT License.
