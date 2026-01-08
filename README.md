🛡️ TrustChain

Decentralized eKYC Verification Platform using Blockchain

TrustChain is a decentralized electronic Know Your Customer (eKYC) platform built on Ethereum using Hardhat, Solidity, React (Vite), and MetaMask.
It allows users to register their KYC data on-chain and enables authorized verifiers to verify or reject KYC requests in a transparent and tamper-proof way.

🚀 Features

🔐 Decentralized KYC registration

🧾 On-chain KYC status tracking

👮 Verifier-based approval/rejection

🦊 MetaMask wallet integration

⚡ Local blockchain using Hardhat

🌐 Modern React UI (Vite)

🏗️ Tech Stack
Backend / Blockchain

Solidity

Hardhat

Ethers.js

TypeScript

Frontend

React

Vite

Ethers.js

MetaMask

📁 Project Structure
TrustChain/
├── BlockchainEKYC/        # Smart contracts & Hardhat backend
│   ├── contracts/
│   ├── scripts/
│   ├── test/
│   └── hardhat.config.ts
│
├── BlockchainEKYC-UI/     # React frontend
│   ├── src/
│   ├── public/
│   └── vite.config.js

⚙️ Setup & Run Locally
1️⃣ Clone the repository
git clone https://github.com/rk-005/TrustChain.git
cd TrustChain

2️⃣ Start local Hardhat blockchain
cd BlockchainEKYC
npx hardhat node


📌 This starts a local blockchain at:

http://127.0.0.1:8545

3️⃣ Deploy smart contracts

Open a new terminal:

cd BlockchainEKYC
npx hardhat run scripts/deploy.ts --network localhost


✅ Contract addresses will be displayed in the terminal.

4️⃣ Start the frontend

Open another terminal:

cd BlockchainEKYC-UI
npm install
npm run dev


🌐 App runs at:

http://localhost:5173

5️⃣ MetaMask Configuration

Network: Hardhat Local

RPC URL: http://127.0.0.1:8545

Chain ID: 31337

Import any private key shown by Hardhat node

🖼️ Application Screenshots

📌 Place all images inside a folder called screenshots/ in the root of the repo.

🔹 Hardhat Local Blockchain Running

🔹 Smart Contract Deployment

🔹 Frontend Running (Vite)

🔹 Main Application Dashboard

🔹 MetaMask Transaction Popup

🔹 KYC Registered (Pending Verification)

🔹 Verifier Added Successfully

🔹 Verification Attempt (Failed Case)

🔄 Application Flow

User connects MetaMask wallet

User registers KYC hash on blockchain

KYC status is set to Pending

Admin adds verifier

Verifier verifies or rejects user

Status is updated immutably on-chain

🔐 Security Notes

Private keys shown are Hardhat test accounts only

Never use these keys on mainnet

Contracts are deployed locally for development

📌 Future Improvements

IPFS integration for document storage

Role-based access control

Multiple verifier consensus

Deployment to testnet (Sepolia / Holesky)

UI improvements & error handling