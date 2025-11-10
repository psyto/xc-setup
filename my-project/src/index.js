const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
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
