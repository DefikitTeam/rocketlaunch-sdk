import { createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { berachainTestnetbArtio } from 'viem/chains';

export function createViemWalletClient(privateKey: string) {
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  return createWalletClient({
    account,
    chain: berachainTestnetbArtio,
    transport: http(),
  }).extend(publicActions);
}
