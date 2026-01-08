import { useState } from "react";
import { ethers } from "ethers";
import EKYC_ABI from "./abi/EKYC.json";

const EKYC_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [kycHash, setKycHash] = useState("");
  const [status, setStatus] = useState("");
  const [userToVerify, setUserToVerify] = useState("");

  /* ---------------- NETWORK SETUP ---------------- */

  const forceHardhatNetwork = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x7A69" }], // 31337
      });
    } catch (err) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x7A69",
              chainName: "Hardhat Local",
              rpcUrls: ["http://127.0.0.1:8545"],
              nativeCurrency: {
                name: "Ethereum",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ],
        });
      } else {
        throw err;
      }
    }
  };

  /* ---------------- WALLET CONNECT ---------------- */

  const connectWallet = async () => {
    try {
      await forceHardhatNetwork();

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const address = await signer.getAddress();

      setAccount(address);
      setContract(new ethers.Contract(EKYC_ADDRESS, EKYC_ABI, signer));
      setStatus("✅ Wallet connected");
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to connect wallet");
    }
  };

  /* ---------------- USER ACTIONS ---------------- */

  const registerKYC = async () => {
    if (!contract) {
      setStatus("❌ Wallet not connected");
      return;
    }

    if (!kycHash) {
      setStatus("❌ KYC input required");
      return;
    }

    try {
      setStatus("⏳ Sending transaction...");

      const hash = ethers.keccak256(
        ethers.toUtf8Bytes(kycHash)
      );

      const tx = await contract.registerUser(hash);
      console.log("TX sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("TX mined:", receipt);

      if (receipt.status === 1) {
        setStatus("✅ KYC registered successfully (awaiting verification)");
      } else {
        setStatus("❌ Transaction reverted");
      }
    } catch (err) {
      console.error(err);

      const reason =
        err?.reason ||
        err?.data?.message ||
        err?.message ||
        "Unknown error";

      setStatus(`❌ Registration failed: ${reason}`);
    }
  };

  const checkStatus = async () => {
    if (!contract) {
      setStatus("❌ Wallet not connected");
      return;
    }

    try {
      const address = userToVerify || account;
      const verified = await contract.isVerified(address);

      setStatus(
        verified
          ? "✅ User is verified"
          : "⏳ KYC registered, waiting for verification"
      );
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to fetch status");
    }
  };

  /* ---------------- ADMIN / VERIFIER ---------------- */

  const addVerifier = async () => {
    if (!contract) {
      alert("Wallet not connected");
      return;
    }

    const verifierAddress = prompt("Enter verifier address");
    if (!verifierAddress) return;

    try {
      const tx = await contract.addVerifier(verifierAddress);
      await tx.wait();
      alert("✅ Verifier added successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add verifier");
    }
  };

  const verifyUser = async (approved) => {
    if (!contract) {
      alert("Wallet not connected");
      return;
    }

    if (!userToVerify) {
      alert("Enter user address");
      return;
    }

    try {
      const statusCode = approved ? 1 : 2;
      const expiry = 30 * 24 * 60 * 60;

      const tx = await contract.verifyUser(
        userToVerify,
        statusCode,
        expiry
      );
      await tx.wait();

      alert(approved ? "✅ User verified" : "❌ User rejected");
    } catch (err) {
      console.error(err);
      alert("❌ Verification failed");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>TrustChain</h2>
      <p className="status-text">Decentralized eKYC Verification Platform</p>

      {!account && (
        <button onClick={connectWallet}>Connect MetaMask</button>
      )}

      {account && (
        <>
          <p><b>Connected:</b> {account}</p>

          <input
            placeholder="Enter KYC hash"
            value={kycHash}
            onChange={(e) => setKycHash(e.target.value)}
          />

          <br /><br />

          <button onClick={registerKYC}>Register KYC</button>
          <button onClick={checkStatus} style={{ marginLeft: "1rem" }}>
            Check Status
          </button>
          <button onClick={addVerifier} style={{ marginLeft: "1rem" }}>
            Add Verifier
          </button>

          <p>{status}</p>

          <hr />

          <h3>Verifier Panel</h3>

          <input
            placeholder="User address to verify"
            value={userToVerify}
            onChange={(e) => setUserToVerify(e.target.value)}
          />

          <br /><br />

          <button onClick={() => verifyUser(true)}>Verify User</button>
          <button
            onClick={() => verifyUser(false)}
            style={{ marginLeft: "1rem" }}
          >
            Reject User
          </button>
        </>
      )}
    </div>
  );
}

export default App;
