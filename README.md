# 🚀 x402 CLI Setup & Sandbox Tool (xC-Setup)

## 🏆 Solana X402 Hackathon Submission: Best x402 Dev Tool

**Category:** Best x402 Dev Tool  
**Developer:** \[Your Name / Team Name]  
**Solana Address:** \[Your Devnet/Mainnet Wallet Address]

---

## 📋 Table of Contents

-   [Project Overview](#-project-overview)
-   [Key Contribution](#-key-contribution-to-the-solana-ecosystem)
-   [Commands and Features](#-commands-and-features)
-   [Quick Start Guide](#-quick-start-guide)
-   [Environment Variables](#-environment-variables)
-   [Project Structure](#-project-structure)
-   [Troubleshooting](#-troubleshooting)
-   [Demo Video](#-demo-video)
-   [Future Scope](#-future-scope)

---

## 💡 Project Overview

**xC-Setup** is a Command Line Interface (CLI) tool designed to achieve **zero friction** when starting a new x402-integrated project on Solana.

It tackles the unique complexities of Solana development—keypair management, Devnet funding, and program deployment—by automating them into **single, simple commands**. This allows developers to bypass hours of initial setup and focus immediately on implementing the core x402 logic for their agents or applications.

**Key Benefits:**

-   ⚡ **90-second setup time** from zero to working x402 project
-   🔐 **Automatic keypair management** with secure storage
-   💰 **One-command funding** for Devnet SOL and test tokens
-   ✅ **Built-in validation** to verify your setup works
-   📦 **Ready-to-use templates** with x402 integration boilerplate

---

## ✨ Key Contribution to the Solana Ecosystem

xC-Setup directly addresses the barrier to entry often faced by developers new to Solana's architecture:

1. **Automated Environment Setup:** It eliminates the need for manual Devnet SOL airdrops, test token acquisition, and complex program deployment steps.
2. **Configuration Integrity:** It prevents common errors by automatically generating and configuring the necessary `.env` files with correct Program IDs and keypair addresses.
3. **Rapid Prototyping:** Provides a fully functional sandbox environment, drastically reducing the time-to-first-transaction and accelerating the adoption of x402 on Solana.

---

## ⚙️ Commands and Features

xC-Setup offers three primary, high-impact commands: `init`, `fund`, and `test`.

### 1. `xc-setup init [project-name]`

Initializes and configures a new x402 project.

**What it does:**

-   **Project Initialization:** Creates a new directory with a **starter template** (Node.js) featuring boilerplate code for x402 integration
-   **Keypair Generation:** Automatically generates and saves two necessary test keypairs (`Agent/Payer` and `Facilitator/Receiver`) to a dedicated `keys/` folder
-   **Facilitator Deployment:** Sets up facilitator program configuration (note: actual program deployment requires Solana CLI and x402 program source)
-   **Config Generation (Crucial):** Creates a ready-to-use **`.env` file** populated with all necessary Program IDs, Facilitator addresses, and test wallet Public Keys

**Usage:**

```bash
xc-setup init my-x402-agent
# Creates: my-x402-agent/ directory with all necessary files
```

**Output Structure:**

```
my-x402-agent/
├── keys/
│   ├── payer.json          # Payer/Agent keypair (private key)
│   └── facilitator.json    # Facilitator/Receiver keypair (private key)
├── src/
│   └── index.js            # Starter template with x402 boilerplate
├── .env                    # Environment configuration
├── .gitignore             # Git ignore rules
├── package.json           # Node.js project configuration
└── README.md              # Project-specific README
```

### 2. `xc-setup fund`

Provides the necessary currency for testing on Solana Devnet.

**What it does:**

-   **SOL Airdrop:** Automatically airdrops **2 SOL** to both the Payer and Facilitator wallets to cover transaction fees
-   **Token Airdrop:** Creates a test token mint and airdrops **1000 test tokens** to the Agent/Payer wallet, making it ready for immediate spending
-   **Configuration Update:** Automatically updates `.env` with the test token mint address

**Usage:**

```bash
cd my-x402-agent
xc-setup fund
```

**Requirements:**

-   Must be run from within an initialized project directory (contains `.env` file)
-   Requires internet connection to interact with Solana Devnet

**Output:**

```
💰 Funding test wallets...

💸 Airdropping 2 SOL to Payer...
✅ Payer funded: <address>
   Tx: <transaction-signature>

💸 Airdropping 2 SOL to Facilitator...
✅ Facilitator funded: <address>
   Tx: <transaction-signature>

🪙 Creating test token...
✅ Test token mint created: <mint-address>

💸 Minting 1000 test tokens to Payer...
✅ Test tokens minted to Payer

🎉 All wallets funded successfully!
```

### 3. `xc-setup test`

A validation command to confirm the setup is working end-to-end.

**What it does:**

-   **Balance Verification:** Checks SOL balances for both wallets
-   **Simulated Payment Execution:** Executes a **test SOL transfer** on the Devnet using the generated keypairs (simulating an x402 payment)
-   **Token Balance Check:** Verifies test token balance if tokens were created
-   **Success Verification:** Provides clear console output confirming the payment success or failure, including the final **Solana Transaction Signature** for debugging

**Usage:**

```bash
xc-setup test
```

**Requirements:**

-   Must be run from within an initialized and funded project directory
-   Requires wallets to have sufficient SOL (run `xc-setup fund` first)

**Output:**

```
🧪 Testing x402 payment flow...

Checking wallet balances...
Payer balance: 2.0 SOL
Facilitator balance: 2.0 SOL

💳 Executing test payment...
✅ Payment successful!
   Tx: <transaction-signature>

✅ Token balance verified: 1000 tokens

🎉 All tests passed! Your x402 setup is ready to use.
```

---

## 🚀 Quick Start Guide

### Prerequisites

-   **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
-   **Solana CLI** (optional, for advanced program deployment) - [Install Guide](https://docs.solana.com/cli/install-solana-cli-tools)
-   Internet connection for Devnet interactions

### 1. Installation

**Global Installation (Recommended):**

```bash
npm install -g xc-setup
```

**Local Development:**

```bash
# Clone the repository
git clone <repository-url>
cd xc-setup

# Install dependencies
npm install

# Build the project
npm run build

# Link globally for testing
npm link

# Verify installation
xc-setup --help
```

### 2. Initialize and Fund Your Project

Navigate to your desired workspace and run the following commands:

```bash
# Initialize a project named "my-x402-agent"
xc-setup init my-x402-agent

# Change directory
cd my-x402-agent

# Install project dependencies
npm install

# Fund your test wallets
xc-setup fund
```

### 3. Verify Functionality

Confirm that the entire x402 pipeline is functional by running the test command:

```bash
# Execute a test payment transaction
xc-setup test
```

A successful test will output: `✅ Payment successful! Tx: [Solana Transaction Signature]`

### 4. Start Building

You're now ready to implement your x402 logic! The starter template in `src/index.js` includes:

-   Pre-configured Solana connection
-   Keypair loading from environment variables
-   Basic project structure

Edit `src/index.js` to add your x402 payment logic.

---

## 🔧 Environment Variables

The `.env` file is automatically generated and contains all necessary configuration:

### Network Configuration

```env
NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
```

### Keypair Paths

```env
PAYER_KEYPAIR_PATH=keys/payer.json
FACILITATOR_KEYPAIR_PATH=keys/facilitator.json
```

### Public Keys

```env
PAYER_PUBLIC_KEY=<your-payer-public-key>
FACILITATOR_PUBLIC_KEY=<your-facilitator-public-key>
```

### Program IDs

```env
FACILITATOR_PROGRAM_ID=<facilitator-program-id>
```

### Test Token (added after `xc-setup fund`)

```env
TEST_TOKEN_MINT=<test-token-mint-address>
```

### Using Environment Variables in Your Code

```javascript
require("dotenv").config();

const payerPublicKey = process.env.PAYER_PUBLIC_KEY;
const facilitatorProgramId = process.env.FACILITATOR_PROGRAM_ID;
const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");
```

---

## 📁 Project Structure

After running `xc-setup init`, your project will have the following structure:

```
my-x402-agent/
├── keys/                      # Keypair storage (DO NOT COMMIT)
│   ├── payer.json            # Payer/Agent private key
│   └── facilitator.json      # Facilitator/Receiver private key
├── src/                       # Source code directory
│   └── index.js              # Main entry point with x402 boilerplate
├── .env                       # Environment variables (DO NOT COMMIT)
├── .gitignore                 # Git ignore rules
├── package.json              # Node.js dependencies and scripts
└── README.md                 # Project documentation
```

**Important Security Notes:**

-   ⚠️ Never commit `keys/` directory or `.env` file to version control
-   ⚠️ These files contain private keys and should be kept secure
-   ✅ `.gitignore` is automatically configured to exclude sensitive files

---

## 🔍 Troubleshooting

### Common Issues

**Issue: "No .env file found"**

```
Error: No .env file found. Please run `xc-setup init` first.
```

**Solution:** Make sure you're in the project directory created by `xc-setup init`, or run `xc-setup init` first.

**Issue: "Keypair files not found"**

```
Error: Keypair files not found. Please run `xc-setup init` first.
```

**Solution:** Ensure you've run `xc-setup init` and the `keys/` directory exists with the keypair files.

**Issue: "Insufficient SOL"**

```
Error: Payer wallet has insufficient SOL. Please run `xc-setup fund` first.
```

**Solution:** Run `xc-setup fund` to airdrop SOL to your test wallets.

**Issue: Airdrop fails**

```
Error: Airdrop request failed
```

**Solution:**

-   Check your internet connection
-   Devnet airdrops may be rate-limited; wait a few minutes and try again
-   Verify Solana Devnet is accessible

**Issue: Transaction confirmation timeout**

```
Error: Transaction confirmation timeout
```

**Solution:**

-   Check network connectivity
-   Devnet may be experiencing high load; try again later
-   Verify your RPC endpoint is accessible

### Getting Help

-   Check the [Solana Documentation](https://docs.solana.com/)
-   Review [x402 Protocol Documentation](https://x402.dev/)
-   Open an issue on the project repository

---

## 📺 Demo Video

\[Link to your 3-Minute Demo Video on YouTube/Vimeo]

_The video will clearly demonstrate the execution of the `init` and `fund` commands, emphasizing how **setup time is reduced to less than 90 seconds**, followed by the successful completion of the `test` command._

---

## 🌟 Future Scope

-   **Local Validator Support:** Integration with Anchor/Local Validator to allow testing without Devnet dependency
-   **Multi-Network Support:** Automated deployment to Solana **Testnet** or **Mainnet**
-   **Additional Templates:** More starter templates (e.g., Rust/Anchor program template, Next.js frontend template)
-   **Diagnostic Mode:** Built-in diagnostic mode for debugging common x402 and Solana configuration issues
-   **Program Deployment:** Full integration with actual x402 facilitator program deployment
-   **Token Management:** Enhanced token management features (multi-token support, custom token creation)

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ for the Solana x402 Hackathon**
