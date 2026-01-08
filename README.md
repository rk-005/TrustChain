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

1)Solidity

2)Hardhat

3)Ethers.js

4)TypeScript

5)Frontend

6)React

7)Vite

8)Ethers.js

9)MetaMask


📁 Project Structure

<img width="300" height="300" alt="image" src="https://github.com/user-attachments/assets/6bd4b73d-5c66-4803-8c6d-733027dee4b9" />



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



🔹 Hardhat Local Blockchain Running

<img width="500" height="500" alt="B1" src="https://github.com/user-attachments/assets/b85c7e58-c978-434c-b60f-cf01210b107a" />



🔹 Smart Contract Deployment

<img width="500" height="500" alt="B2" src="https://github.com/user-attachments/assets/e030f9a0-c55b-439f-837c-6623203e6d0f" />



🔹 Frontend Running (Vite)

<img width="500" height="500" alt="B3" src="https://github.com/user-attachments/assets/dd1db246-58c0-434d-b485-024a42868e49" />


🔹 Main Application Dashboard

<img width="500" height="500" alt="f1" src="https://github.com/user-attachments/assets/1bffaa42-47cf-4fd6-8465-601376fa4747" />


🔹 MetaMask Transaction Popup

<img width="500" height="500" alt="f2" src="https://github.com/user-attachments/assets/03f75dfc-e695-4034-9cbf-4d382c464d96" />


🔹 KYC Registered (Pending Verification)

<img width="500" height="500" alt="f3" src="https://github.com/user-attachments/assets/4f0c781b-af4c-4dcd-a9b1-d47b74cb81d9" />


🔹 Verifier Added Successfully

<img width="500" height="500" alt="f4" src="https://github.com/user-attachments/assets/f1634388-5efb-423f-988c-55820ac74f13" />


🔹 Verification Attempt (Failed Case)

<img width="500" height="500" alt="f5" src="https://github.com/user-attachments/assets/1ca527bc-6162-42a1-a961-d5dc332c4790" />






