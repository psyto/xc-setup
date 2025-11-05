import * as fs from 'fs-extra';
import { readFileSync } from 'fs';
import { Keypair } from '@solana/web3.js';

export function generateKeypair(): Keypair {
  return Keypair.generate();
}

export async function saveKeypair(keypair: Keypair, filePath: string): Promise<void> {
  const secretKey = Array.from(keypair.secretKey);
  await fs.writeJson(filePath, secretKey, { spaces: 2 });
}

export function loadKeypair(filePath: string): Keypair {
  const secretKey = JSON.parse(readFileSync(filePath, 'utf-8'));
  return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

