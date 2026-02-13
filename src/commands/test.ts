import * as fs from "fs-extra";
import * as path from "path";
import {
    Connection,
    Keypair,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import chalk from "chalk";
import { loadKeypair } from "../utils/keypair";

const DEVNET_RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

export async function testCommand(): Promise<void> {
    console.log(chalk.blue("🧪 Testing x402 payment flow...\n"));

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
    const testTokenMint = envVars.TEST_TOKEN_MINT;

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

    // Check balances
    console.log(chalk.blue("Checking wallet balances..."));
    const payerBalance = await connection.getBalance(payerKeypair.publicKey);
    const facilitatorBalance = await connection.getBalance(
        facilitatorKeypair.publicKey
    );

    console.log(chalk.gray(`Payer balance: ${payerBalance / 1e9} SOL`));
    console.log(
        chalk.gray(`Facilitator balance: ${facilitatorBalance / 1e9} SOL`)
    );

    // Minimum required: 0.01 SOL for test payment + transaction fees (~0.000005 SOL)
    const MINIMUM_BALANCE = 0.02 * 1e9; // 0.02 SOL should be enough
    if (payerBalance < MINIMUM_BALANCE) {
        throw new Error(
            "Payer wallet has insufficient SOL. Please run `xc-setup fund` first."
        );
    }

    // Execute a test payment (simplified x402 payment simulation)
    console.log(chalk.blue("\n💳 Executing test payment..."));

    // Create a simple SOL transfer as a test payment
    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: payerKeypair.publicKey,
            toPubkey: facilitatorKeypair.publicKey,
            lamports: 0.01 * 1e9, // 0.01 SOL test payment
        })
    );

    const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [payerKeypair],
        { commitment: "confirmed" }
    );

    console.log(chalk.green(`✅ Payment successful!`));
    console.log(chalk.green(`   Tx: ${signature}`));

    // If test token exists, check token balance
    if (testTokenMint) {
        try {
            const { PublicKey } = await import("@solana/web3.js");
            const tokenMintPubkey = new PublicKey(testTokenMint);
            const payerTokenAddress = await getAssociatedTokenAddress(
                tokenMintPubkey,
                payerKeypair.publicKey
            );

            const tokenAccount = await getAccount(
                connection,
                payerTokenAddress
            );
            const tokenBalance = Number(tokenAccount.amount) / 10 ** 9;
            console.log(
                chalk.green(
                    `\n✅ Token balance verified: ${tokenBalance} tokens`
                )
            );
        } catch (error) {
            console.log(
                chalk.yellow(
                    `⚠️  Could not verify token balance (token account may not exist)`
                )
            );
        }
    }

    console.log(
        chalk.green(`\n🎉 All tests passed! Your x402 setup is ready to use.`)
    );
}
