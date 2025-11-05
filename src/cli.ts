#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init';
import { fundCommand } from './commands/fund';
import { testCommand } from './commands/test';
import chalk from 'chalk';

const program = new Command();

program
  .name('xc-setup')
  .description('CLI tool for zero-friction x402 project setup on Solana')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new x402 project')
  .argument('[project-name]', 'Name of the project to create')
  .action(async (projectName?: string) => {
    try {
      await initCommand(projectName || 'my-x402-project');
    } catch (error: any) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('fund')
  .description('Fund test wallets with SOL and test tokens')
  .action(async () => {
    try {
      await fundCommand();
    } catch (error: any) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('test')
  .description('Execute a test payment to verify setup')
  .action(async () => {
    try {
      await testCommand();
    } catch (error: any) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  });

program.parse();

