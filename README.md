# 🚀 x402 CLI Setup & Sandbox Tool (xC-Setup)

## 🏆 Solana X402 Hackathon Submission: Best x402 Dev Tool

**Category:** Best x402 Dev Tool
**Developer:** \[Your Name / Team Name]
**Solana Address:** \[Your Devnet/Mainnet Wallet Address]

-----

## 💡 Project Overview

**xC-Setup** is a Command Line Interface (CLI) tool designed to achieve **zero friction** when starting a new x402-integrated project on Solana.

It tackles the unique complexities of Solana development—keypair management, Devnet funding, and program deployment—by automating them into **single, simple commands**. This allows developers to bypass hours of initial setup and focus immediately on implementing the core x402 logic for their agents or applications.

## ✨ Key Contribution to the Solana Ecosystem

xC-Setup directly addresses the barrier to entry often faced by developers new to Solana's architecture:

1.  **Automated Environment Setup:** It eliminates the need for manual Devnet SOL airdrops, test token acquisition, and complex program deployment steps.
2.  **Configuration Integrity:** It prevents common errors by automatically generating and configuring the necessary `.env` files with correct Program IDs and keypair addresses.
3.  **Rapid Prototyping:** Provides a fully functional sandbox environment, drastically reducing the time-to-first-transaction and accelerating the adoption of x402 on Solana.

## ⚙️ Commands and Features

xC-Setup offers three primary, high-impact commands: `init`, `fund`, and `test`.

### 1\. `xc-setup init [project-name]`

Initializes and configures a new x402 project.

  * **Project Initialization:** Creates a new directory with a **starter template** (e.g., Next.js or Node.js) featuring boilerplate code for x402 integration.
  * **Keypair Generation:** Automatically generates and saves two necessary test keypairs (`Agent/Payer` and `Facilitator/Receiver`) to a dedicated `keys/` folder.
  * **Facilitator Deployment:** Compiles and deploys the necessary Solana programs and the **x402 Facilitator program** to Solana Devnet.
  * **Config Generation (Crucial):** Creates a ready-to-use **`.env` file** populated with all newly deployed Program IDs, Facilitator addresses, and test wallet Public Keys.

### 2\. `xc-setup fund`

Provides the necessary currency for testing on Solana Devnet.

  * **SOL Airdrop:** Automatically airdrops sufficient **Devnet SOL** to both the Payer and Facilitator wallets to cover transaction fees.
  * **Token Airdrop:** Airdrops a generous amount of **test x402-compatible tokens (e.g., test USDC)** to the Agent/Payer wallet, making it ready for immediate spending.

### 3\. `xc-setup test`

A validation command to confirm the setup is working end-to-end.

  * **Simulated Payment Execution:** Executes a **single, full-cycle x402 payment** on the Devnet using the generated keypairs and deployed Facilitator.
  * **Success Verification:** Provides clear console output confirming the payment success or failure, including the final **Solana Transaction Signature** for debugging.

## 🚀 Quick Start Guide

### Prerequisites

  * Node.js (v18+)
  * Solana CLI must be installed globally.

### 1\. Installation

```bash
npm install -g xc-setup
```

### 2\. Initialize and Fund Your Project

Navigate to your desired workspace and run the following commands:

```bash
# Initialize a project named "my-x402-agent"
xc-setup init my-x402-agent 

# Change directory
cd my-x402-agent

# Fund your test wallets
xc-setup fund
```

### 3\. Verify Functionality

Confirm that the entire x402 pipeline is functional by running the test command:

```bash
# Execute a test payment transaction
xc-setup test
```

A successful test will output: "✅ Payment successful\! Tx: \[Solana Transaction Signature]".

## 📺 Demo Video

\[Link to your 3-Minute Demo Video on YouTube/Vimeo]

*The video will clearly demonstrate the execution of the `init` and `fund` commands, emphasizing how **setup time is reduced to less than 90 seconds**, followed by the successful completion of the `test` command.*

## 🌟 Future Scope

  * Integration with Anchor/Local Validator to allow testing without Devnet dependency.
  * Support for automated deployment to the Solana **Testnet** or **Mainnet**.
  * Inclusion of more starter templates (e.g., Rust/Anchor program template).
  * A built-in diagnostic mode for debugging common x402 and Solana configuration issues.
