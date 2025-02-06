import { Chain, createPublicClient, http } from 'viem';
import { ChainId, SupportedChains } from '../constants/constants';

export function createViemPublicClient(chainId: ChainId) {
  const chain: Chain = SupportedChains[chainId];
  return createPublicClient({
    chain: chain,
    transport: http(),
  });
}
