import * as fs from "fs-extra";
import * as path from "path";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
} from "@solana/spl-token";
import chalk from "chalk";
import { loadKeypair } from "../utils/keypair";

const DEVNET_RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const AIRDROP_AMOUNT_SOL = 0.5; // 0.5 SOL for fees (reduced to avoid rate limits)
const TEST_TOKEN_AMOUNT = 100; // 100 test tokens (reduced for testing)

export async function fundCommand(): Promise<void> {
    console.log(chalk.blue("💰 Funding test wallets...\n"));

    // Check if we're in a project directory
    const envPath = path.join(process.cwd(), ".env");
    if (!(await fs.pathExists(envPath))) {
        throw new Error(
            "No .env file found. Please run `xc-setup init` first."
        );
    }

    // Load environment variables
    const env = await fs.readFile(envPath, "utf-8");
    const envVars: Record<string, string> = {};
    env.split("\n").forEach((line) => {
        const match = line.match(/^([^=]+)=(.+)$/);
        if (match) {
            envVars[match[1].trim()] = match[2].trim();
        }
    });

    const payerKeypairPath =
        envVars.PAYER_KEYPAIR_PATH || path.join("keys", "payer.json");
    const facilitatorKeypairPath =
        envVars.FACILITATOR_KEYPAIR_PATH ||
        path.join("keys", "facilitator.json");

    if (
        !(await fs.pathExists(payerKeypairPath)) ||
        !(await fs.pathExists(facilitatorKeypairPath))
    ) {
        throw new Error(
            "Keypair files not found. Please run `xc-setup init` first."
        );
    }

    const payerKeypair = loadKeypair(payerKeypairPath);
    const facilitatorKeypair = loadKeypair(facilitatorKeypairPath);

    const connection = new Connection(DEVNET_RPC, "confirmed");

    // Airdrop SOL to payer
    console.log(
        chalk.blue(`💸 Airdropping ${AIRDROP_AMOUNT_SOL} SOL to Payer...`)
    );
    const payerSignature = await connection.requestAirdrop(
        payerKeypair.publicKey,
        AIRDROP_AMOUNT_SOL * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(payerSignature, "confirmed");
    console.log(
        chalk.green(`✅ Payer funded: ${payerKeypair.publicKey.toBase58()}`)
    );
    console.log(chalk.gray(`   Tx: ${payerSignature}`));

    // Airdrop SOL to facilitator
    console.log(
        chalk.blue(`💸 Airdropping ${AIRDROP_AMOUNT_SOL} SOL to Facilitator...`)
    );
    const facilitatorSignature = await connection.requestAirdrop(
        facilitatorKeypair.publicKey,
        AIRDROP_AMOUNT_SOL * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(facilitatorSignature, "confirmed");
    console.log(
        chalk.green(
            `✅ Facilitator funded: ${facilitatorKeypair.publicKey.toBase58()}`
        )
    );
    console.log(chalk.gray(`   Tx: ${facilitatorSignature}`));

    // Create and airdrop test token
    console.log(chalk.blue(`\n🪙 Creating test token...`));
    const mint = await createMint(
        connection,
        payerKeypair,
        payerKeypair.publicKey,
        null,
        9 // 9 decimals
    );
    console.log(chalk.green(`✅ Test token mint created: ${mint.toBase58()}`));

    // Get or create token account for payer
    console.log(
        chalk.blue(`💸 Minting ${TEST_TOKEN_AMOUNT} test tokens to Payer...`)
    );
    const payerTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payerKeypair,
        mint,
        payerKeypair.publicKey
    );

    await mintTo(
        connection,
        payerKeypair,
        mint,
        payerTokenAccount.address,
        payerKeypair,
        TEST_TOKEN_AMOUNT * 10 ** 9 // Convert to token units
    );
    console.log(chalk.green(`✅ Test tokens minted to Payer`));

    // Update .env with token mint address
    const updatedEnv = env + `\nTEST_TOKEN_MINT=${mint.toBase58()}\n`;
    await fs.writeFile(envPath, updatedEnv);

    console.log(chalk.green(`\n🎉 All wallets funded successfully!`));
    console.log(chalk.cyan(`\nTest Token Mint: ${mint.toBase58()}`));
}
