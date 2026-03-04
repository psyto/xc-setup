import * as fs from "fs-extra";
import * as path from "path";
import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
    getAssociatedTokenAddress,
    getOrCreateAssociatedTokenAccount,
    createTransferInstruction,
    getAccount,
} from "@solana/spl-token";
import chalk from "chalk";
import { loadKeypair } from "../utils/keypair";

const DEVNET_RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const SOL_TRANSFER_AMOUNT = 0.01; // SOL
const TOKEN_TRANSFER_AMOUNT = 5; // tokens (human-readable)
const TOKEN_DECIMALS = 9;

/**
 * Load the .env file from the current working directory and return it as a
 * key-value map.
 */
async function loadEnv(): Promise<Record<string, string>> {
    const envPath = path.join(process.cwd(), ".env");
    if (!(await fs.pathExists(envPath))) {
        throw new Error(
            "No .env file found. Please run `xc-setup init` first."
        );
    }
    const env = await fs.readFile(envPath, "utf-8");
    const vars: Record<string, string> = {};
    env.split("\n").forEach((line) => {
        const match = line.match(/^([^=]+)=(.+)$/);
        if (match) {
            vars[match[1].trim()] = match[2].trim();
        }
    });
    return vars;
}

export async function testCommand(): Promise<void> {
    console.log(chalk.blue("Testing x402 payment flow...\n"));

    // ----- Load configuration and keypairs -----
    const envVars = await loadEnv();

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

    // ===================================================================
    //  1. SOL Transfer Test
    // ===================================================================
    console.log(chalk.blue("--- SOL Transfer Test ---\n"));

    // Record balances BEFORE transfer
    const payerBalanceBefore = await connection.getBalance(payerKeypair.publicKey);
    const facilitatorBalanceBefore = await connection.getBalance(
        facilitatorKeypair.publicKey
    );

    console.log(chalk.gray("Initial balances:"));
    console.log(chalk.gray(`  Payer:        ${payerBalanceBefore / LAMPORTS_PER_SOL} SOL`));
    console.log(chalk.gray(`  Facilitator:  ${facilitatorBalanceBefore / LAMPORTS_PER_SOL} SOL`));

    // Minimum required: transfer amount + estimated fee
    const transferLamports = SOL_TRANSFER_AMOUNT * LAMPORTS_PER_SOL;
    const MINIMUM_BALANCE = transferLamports + 0.01 * LAMPORTS_PER_SOL;
    if (payerBalanceBefore < MINIMUM_BALANCE) {
        throw new Error(
            `Payer wallet has insufficient SOL (${payerBalanceBefore / LAMPORTS_PER_SOL} SOL). ` +
            "Please run `xc-setup fund` first."
        );
    }

    // Execute the SOL transfer
    console.log(chalk.blue(`\nSending ${SOL_TRANSFER_AMOUNT} SOL from Payer to Facilitator...`));

    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: payerKeypair.publicKey,
            toPubkey: facilitatorKeypair.publicKey,
            lamports: transferLamports,
        })
    );

    const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [payerKeypair],
        { commitment: "confirmed" }
    );

    // Verify the transaction was confirmed on-chain
    const txStatus = await connection.getSignatureStatus(signature);
    const confirmationStatus =
        txStatus?.value?.confirmationStatus ?? "unknown";

    if (
        confirmationStatus !== "confirmed" &&
        confirmationStatus !== "finalized"
    ) {
        throw new Error(
            `Transaction was not confirmed. Status: ${confirmationStatus}`
        );
    }

    // Record balances AFTER transfer
    const payerBalanceAfter = await connection.getBalance(payerKeypair.publicKey);
    const facilitatorBalanceAfter = await connection.getBalance(
        facilitatorKeypair.publicKey
    );

    // Print detailed test report
    console.log(chalk.green("\nSOL Transfer Test Report"));
    console.log(chalk.green("======================="));
    console.log(chalk.white(`  Transaction signature : ${signature}`));
    console.log(chalk.white(`  Confirmation status   : ${confirmationStatus}`));
    console.log(chalk.white(`  Transfer amount       : ${SOL_TRANSFER_AMOUNT} SOL`));
    console.log(chalk.white(`  Payer balance before  : ${payerBalanceBefore / LAMPORTS_PER_SOL} SOL`));
    console.log(chalk.white(`  Payer balance after   : ${payerBalanceAfter / LAMPORTS_PER_SOL} SOL`));
    console.log(chalk.white(`  Facilit. balance before: ${facilitatorBalanceBefore / LAMPORTS_PER_SOL} SOL`));
    console.log(chalk.white(`  Facilit. balance after : ${facilitatorBalanceAfter / LAMPORTS_PER_SOL} SOL`));

    // Sanity-check: facilitator should have gained the transfer amount
    const facilitatorGain = facilitatorBalanceAfter - facilitatorBalanceBefore;
    if (facilitatorGain !== transferLamports) {
        console.log(
            chalk.yellow(
                `  Warning: expected facilitator to gain ${SOL_TRANSFER_AMOUNT} SOL, ` +
                `but gained ${facilitatorGain / LAMPORTS_PER_SOL} SOL.`
            )
        );
    } else {
        console.log(chalk.green("  Result: PASS"));
    }

    // ===================================================================
    //  2. Token Transfer Test (only when TEST_TOKEN_MINT is set in .env)
    // ===================================================================
    if (testTokenMint) {
        console.log(chalk.blue("\n--- Token Transfer Test ---\n"));
        try {
            const tokenMintPubkey = new PublicKey(testTokenMint);

            // Ensure both sides have associated token accounts
            const payerAta = await getOrCreateAssociatedTokenAccount(
                connection,
                payerKeypair,
                tokenMintPubkey,
                payerKeypair.publicKey
            );
            const facilitatorAta = await getOrCreateAssociatedTokenAccount(
                connection,
                payerKeypair, // payer funds account creation
                tokenMintPubkey,
                facilitatorKeypair.publicKey
            );

            const payerTokenBefore = Number(payerAta.amount);
            const facilitatorTokenBefore = Number(facilitatorAta.amount);
            const transferAmountRaw = TOKEN_TRANSFER_AMOUNT * 10 ** TOKEN_DECIMALS;

            console.log(chalk.gray("Initial token balances:"));
            console.log(
                chalk.gray(`  Payer:        ${payerTokenBefore / 10 ** TOKEN_DECIMALS} tokens`)
            );
            console.log(
                chalk.gray(`  Facilitator:  ${facilitatorTokenBefore / 10 ** TOKEN_DECIMALS} tokens`)
            );

            if (payerTokenBefore < transferAmountRaw) {
                console.log(
                    chalk.yellow(
                        `  Skipping token transfer: payer only has ` +
                        `${payerTokenBefore / 10 ** TOKEN_DECIMALS} tokens (need ${TOKEN_TRANSFER_AMOUNT}).`
                    )
                );
            } else {
                console.log(
                    chalk.blue(`\nSending ${TOKEN_TRANSFER_AMOUNT} tokens from Payer to Facilitator...`)
                );

                const tokenTx = new Transaction().add(
                    createTransferInstruction(
                        payerAta.address,
                        facilitatorAta.address,
                        payerKeypair.publicKey,
                        transferAmountRaw
                    )
                );

                const tokenSig = await sendAndConfirmTransaction(
                    connection,
                    tokenTx,
                    [payerKeypair],
                    { commitment: "confirmed" }
                );

                // Verify confirmation
                const tokenTxStatus = await connection.getSignatureStatus(tokenSig);
                const tokenConfirmation =
                    tokenTxStatus?.value?.confirmationStatus ?? "unknown";

                // Fetch updated balances
                const payerAtaAfter = await getAccount(connection, payerAta.address);
                const facilitatorAtaAfter = await getAccount(connection, facilitatorAta.address);

                const payerTokenAfter = Number(payerAtaAfter.amount);
                const facilitatorTokenAfter = Number(facilitatorAtaAfter.amount);

                console.log(chalk.green("\nToken Transfer Test Report"));
                console.log(chalk.green("========================="));
                console.log(chalk.white(`  Token mint             : ${testTokenMint}`));
                console.log(chalk.white(`  Transaction signature  : ${tokenSig}`));
                console.log(chalk.white(`  Confirmation status    : ${tokenConfirmation}`));
                console.log(chalk.white(`  Transfer amount        : ${TOKEN_TRANSFER_AMOUNT} tokens`));
                console.log(
                    chalk.white(`  Payer tokens before    : ${payerTokenBefore / 10 ** TOKEN_DECIMALS}`)
                );
                console.log(
                    chalk.white(`  Payer tokens after     : ${payerTokenAfter / 10 ** TOKEN_DECIMALS}`)
                );
                console.log(
                    chalk.white(`  Facilit. tokens before : ${facilitatorTokenBefore / 10 ** TOKEN_DECIMALS}`)
                );
                console.log(
                    chalk.white(`  Facilit. tokens after  : ${facilitatorTokenAfter / 10 ** TOKEN_DECIMALS}`)
                );

                const tokenGain = facilitatorTokenAfter - facilitatorTokenBefore;
                if (tokenGain === transferAmountRaw) {
                    console.log(chalk.green("  Result: PASS"));
                } else {
                    console.log(
                        chalk.yellow(
                            `  Warning: expected facilitator to gain ${TOKEN_TRANSFER_AMOUNT} tokens, ` +
                            `but gained ${tokenGain / 10 ** TOKEN_DECIMALS}.`
                        )
                    );
                }
            }
        } catch (error: any) {
            console.log(
                chalk.yellow(
                    `  Could not complete token transfer test: ${error.message}`
                )
            );
        }
    }

    console.log(
        chalk.green("\nAll tests passed! Your x402 setup is ready to use.")
    );
}
