import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { Keypair } from '@solana/web3.js';
import { generateKeypair, saveKeypair } from '../utils/keypair';
import { createEnvFile } from '../utils/env';
import { deployFacilitator } from '../utils/deploy';

export async function initCommand(projectName: string): Promise<void> {
  console.log(chalk.blue(`🚀 Initializing x402 project: ${projectName}...\n`));

  const projectPath = path.resolve(process.cwd(), projectName);

  // Check if directory already exists
  if (await fs.pathExists(projectPath)) {
    throw new Error(`Directory ${projectName} already exists!`);
  }

  // Create project directory
  await fs.ensureDir(projectPath);
  console.log(chalk.green(`✅ Created project directory: ${projectName}`));

  // Create keys directory
  const keysDir = path.join(projectPath, 'keys');
  await fs.ensureDir(keysDir);
  console.log(chalk.green(`✅ Created keys directory`));

  // Generate keypairs
  console.log(chalk.blue('\n🔑 Generating keypairs...'));
  const payerKeypair = generateKeypair();
  const facilitatorKeypair = generateKeypair();

  await saveKeypair(payerKeypair, path.join(keysDir, 'payer.json'));
  await saveKeypair(facilitatorKeypair, path.join(keysDir, 'facilitator.json'));
  
  console.log(chalk.green(`✅ Generated Agent/Payer keypair: ${payerKeypair.publicKey.toBase58()}`));
  console.log(chalk.green(`✅ Generated Facilitator/Receiver keypair: ${facilitatorKeypair.publicKey.toBase58()}`));

  // Create project template
  console.log(chalk.blue('\n📦 Creating project template...'));
  await createProjectTemplate(projectPath);
  console.log(chalk.green(`✅ Project template created`));

  // Deploy facilitator (simplified - in real implementation, this would deploy actual x402 program)
  console.log(chalk.blue('\n🚀 Deploying facilitator program...'));
  const facilitatorProgramId = await deployFacilitator(facilitatorKeypair);
  console.log(chalk.green(`✅ Facilitator deployed: ${facilitatorProgramId}`));

  // Create .env file
  console.log(chalk.blue('\n⚙️  Generating configuration...'));
  await createEnvFile(projectPath, {
    payerPublicKey: payerKeypair.publicKey.toBase58(),
    payerKeypairPath: path.join('keys', 'payer.json'),
    facilitatorPublicKey: facilitatorKeypair.publicKey.toBase58(),
    facilitatorKeypairPath: path.join('keys', 'facilitator.json'),
    facilitatorProgramId: facilitatorProgramId,
    network: 'devnet',
  });
  console.log(chalk.green(`✅ Configuration file (.env) created`));

  console.log(chalk.green(`\n🎉 Project initialized successfully!`));
  console.log(chalk.cyan(`\nNext steps:`));
  console.log(chalk.cyan(`  1. cd ${projectName}`));
  console.log(chalk.cyan(`  2. xc-setup fund`));
  console.log(chalk.cyan(`  3. xc-setup test`));
}

async function createProjectTemplate(projectPath: string): Promise<void> {
  // Create package.json
  const packageJson = {
    name: path.basename(projectPath),
    version: '1.0.0',
    description: 'x402-integrated Solana project',
    main: 'src/index.js',
    scripts: {
      start: 'node src/index.js',
      dev: 'node --watch src/index.js',
    },
    dependencies: {
      '@solana/web3.js': '^1.87.6',
      '@solana/spl-token': '^0.3.9',
      'dotenv': '^16.3.1',
    },
  };

  await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });

  // Create src directory and index.js
  await fs.ensureDir(path.join(projectPath, 'src'));
  
  const indexJs = `const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const fs = require('fs');
require('dotenv').config();

const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com', 'confirmed');

async function main() {
  console.log('🚀 x402 Project Ready!');
  console.log('Payer Public Key:', process.env.PAYER_PUBLIC_KEY);
  console.log('Facilitator Public Key:', process.env.FACILITATOR_PUBLIC_KEY);
  console.log('Facilitator Program ID:', process.env.FACILITATOR_PROGRAM_ID);
  
  // Load keypairs
  const payerKeypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(process.env.PAYER_KEYPAIR_PATH, 'utf-8')))
  );
  
  const facilitatorKeypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(process.env.FACILITATOR_KEYPAIR_PATH, 'utf-8')))
  );
  
  // Your x402 integration code here
  console.log('✅ Keypairs loaded successfully');
}

main().catch(console.error);
`;

  await fs.writeFile(path.join(projectPath, 'src', 'index.js'), indexJs);

  // Create README
  const readme = `# ${path.basename(projectPath)}

This project was initialized with xc-setup.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Fund your wallets:
   \`\`\`bash
   xc-setup fund
   \`\`\`

3. Run the project:
   \`\`\`bash
   npm start
   \`\`\`

## Environment Variables

All configuration is stored in \`.env\`. Key variables:
- \`PAYER_PUBLIC_KEY\`: Your agent/payer wallet address
- \`FACILITATOR_PUBLIC_KEY\`: Facilitator wallet address
- \`FACILITATOR_PROGRAM_ID\`: Deployed facilitator program ID
`;

  await fs.writeFile(path.join(projectPath, 'README.md'), readme);

  // Create .gitignore
  const gitignore = `node_modules/
.env
keys/*.json
dist/
.DS_Store
`;

  await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);
}

