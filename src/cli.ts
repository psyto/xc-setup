#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init';
import { fundCommand } from './commands/fund';
import { testCommand } from './commands/test';
import chalk from 'chalk';

// ---------------------------------------------------------------------------
// RPC endpoint map keyed by network name
// ---------------------------------------------------------------------------
const RPC_URLS: Record<string, string> = {
  devnet: 'https://api.devnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
};

const VALID_NETWORKS = Object.keys(RPC_URLS);

const program = new Command();

program
  .name('xc-setup')
  .description('CLI tool for zero-friction x402 project setup on Solana')
  .version('1.0.0')
  .option(
    '-n, --network <network>',
    `Solana network to use (${VALID_NETWORKS.join(', ')})`,
    'devnet',
  )
  .option('-V, --verbose', 'Enable verbose / debug output', false);

// ---------------------------------------------------------------------------
// Helper: apply global options before every sub-command runs
// ---------------------------------------------------------------------------
function applyGlobalOptions(): { network: string; verbose: boolean } {
  const opts = program.opts<{ network: string; verbose: boolean }>();

  // Validate network value
  if (!VALID_NETWORKS.includes(opts.network)) {
    console.error(
      chalk.red(
        `Error: Invalid network "${opts.network}". ` +
        `Choose one of: ${VALID_NETWORKS.join(', ')}`,
      ),
    );
    process.exit(1);
  }

  // Expose the chosen RPC URL via an env-var so that every module in the
  // process can pick it up without extra plumbing.
  process.env.SOLANA_RPC_URL = RPC_URLS[opts.network];
  process.env.XC_NETWORK = opts.network;

  if (opts.verbose) {
    process.env.XC_VERBOSE = '1';
    console.log(chalk.gray(`[debug] Network : ${opts.network}`));
    console.log(chalk.gray(`[debug] RPC URL : ${process.env.SOLANA_RPC_URL}`));
  }

  return opts;
}

program
  .command('init')
  .description('Initialize a new x402 project')
  .argument('[project-name]', 'Name of the project to create')
  .action(async (projectName?: string) => {
    try {
      const opts = applyGlobalOptions();
      if (opts.verbose) {
        console.log(chalk.gray(`[debug] Initializing project: ${projectName || 'my-x402-project'}`));
      }
      await initCommand(projectName || 'my-x402-project');
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('fund')
  .description('Fund test wallets with SOL and test tokens')
  .action(async () => {
    try {
      const opts = applyGlobalOptions();
      if (opts.verbose) {
        console.log(chalk.gray('[debug] Starting wallet funding'));
      }
      await fundCommand();
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('test')
  .description('Execute a test payment to verify setup')
  .action(async () => {
    try {
      const opts = applyGlobalOptions();
      if (opts.verbose) {
        console.log(chalk.gray('[debug] Starting test payment flow'));
      }
      await testCommand();
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

program.parse();

