import { Chain, createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { ChainId, SupportedChains } from '../constants/constants';

export function createViemWalletClient(privateKey: string,chainId:ChainId) {
  const chain: Chain = SupportedChains[chainId];
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  return createWalletClient({
    account,
    chain: chain,
    transport: http(),
  }).extend(publicActions);
}
