import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import { execSync } from 'child_process';
import chalk from 'chalk';

const DEVNET_RPC = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

/**
 * Check whether the Anchor CLI is available on the system PATH.
 */
function isAnchorInstalled(): boolean {
  try {
    execSync('anchor --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check whether the Solana CLI is available on the system PATH.
 */
function isSolanaCliInstalled(): boolean {
  try {
    execSync('solana --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Deploy a Solana program using `anchor build` followed by `anchor deploy`.
 *
 * The function attempts a real deployment when the Anchor CLI is installed and
 * an Anchor project structure is detected in the current working directory.
 * It parses the deploy output to extract the program ID.
 *
 * When Anchor is not available or the project has no Anchor.toml the function
 * falls back gracefully, returning the facilitator keypair's public key as a
 * placeholder program ID.
 */
export async function deploySolanaProgram(
  facilitatorKeypair: Keypair,
  network: string = 'devnet',
): Promise<string> {
  // --- Gate: Anchor CLI must be installed ---
  if (!isAnchorInstalled()) {
    console.log(chalk.yellow('Warning: Anchor CLI not found. Falling back to placeholder program ID.'));
    console.log(chalk.yellow('  Install Anchor: https://www.anchor-lang.com/docs/installation'));
    return facilitatorKeypair.publicKey.toBase58();
  }

  // --- Gate: Anchor.toml must exist (we need something to build) ---
  try {
    execSync('test -f Anchor.toml', { stdio: 'ignore' });
  } catch {
    console.log(chalk.yellow('Warning: No Anchor.toml found in the current directory.'));
    console.log(chalk.yellow('  Skipping on-chain deployment; using placeholder program ID.'));
    return facilitatorKeypair.publicKey.toBase58();
  }

  // --- Step 1: Build ---
  console.log(chalk.blue('Building program with `anchor build`...'));
  try {
    const buildOutput = execSync('anchor build 2>&1', { encoding: 'utf-8' });
    console.log(chalk.gray(buildOutput.trim()));
    console.log(chalk.green('Build succeeded.'));
  } catch (error: any) {
    const msg = error.stdout ?? error.stderr ?? error.message ?? '';
    console.error(chalk.red('Build failed:'));
    console.error(chalk.red(msg));
    throw new Error('`anchor build` failed. Please check your program source.');
  }

  // --- Step 2: Deploy ---
  const providerFlag = `--provider.cluster ${network}`;
  console.log(chalk.blue(`Deploying program to ${network} with \`anchor deploy\`...`));
  try {
    const deployOutput = execSync(`anchor deploy ${providerFlag} 2>&1`, {
      encoding: 'utf-8',
    });
    console.log(chalk.gray(deployOutput.trim()));

    // Anchor prints a line like: "Program Id: <base58 pubkey>"
    const programIdMatch = deployOutput.match(/Program\s+Id:\s+([1-9A-HJ-NP-Za-km-z]{32,44})/);
    if (programIdMatch) {
      const programId = programIdMatch[1];
      console.log(chalk.green(`Deploy succeeded. Program ID: ${programId}`));
      return programId;
    }

    // If we could not parse the program ID, fall back
    console.log(chalk.yellow('Warning: Could not parse program ID from deploy output.'));
    console.log(chalk.yellow('  Using facilitator public key as fallback program ID.'));
    return facilitatorKeypair.publicKey.toBase58();
  } catch (error: any) {
    const msg: string = error.stdout ?? error.stderr ?? error.message ?? '';

    if (msg.includes('insufficient funds') || msg.includes('Insufficient funds')) {
      throw new Error(
        'Deployment failed: insufficient SOL in the deployer wallet. ' +
        'Please run `xc-setup fund` or airdrop more SOL before deploying.',
      );
    }

    if (msg.includes('program file not found') || msg.includes('No such file')) {
      throw new Error(
        'Deployment failed: compiled program binary not found. ' +
        'Make sure `anchor build` completed successfully.',
      );
    }

    console.error(chalk.red('Deployment failed:'));
    console.error(chalk.red(msg));
    throw new Error('`anchor deploy` failed. See output above for details.');
  }
}

/**
 * Legacy wrapper kept for backward compatibility.
 * Delegates to deploySolanaProgram().
 */
export async function deployFacilitator(
  facilitatorKeypair: Keypair,
  network: string = 'devnet',
): Promise<string> {
  return deploySolanaProgram(facilitatorKeypair, network);
}

