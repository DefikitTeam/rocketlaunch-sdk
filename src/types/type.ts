import { Address } from "viem";

export interface LaunchPoolInputData {
    name: string,
    symbol: string,
    decimals: number,
    totalSupply: bigint,
    fixedCapETH: bigint,
    tokenForAirdrop: bigint,
    tokenForFarm: bigint,
    tokenForSale: bigint,
    tokenForAddLP: bigint,
    tokenPerPurchase: bigint,
    maxRepeatPurchase: bigint,
    startTime: bigint,
    minDurationSell: bigint,
    maxDurationSell: bigint,
    metadata: string,
    numberBatch: bigint,
    maxAmountETH: bigint,
    referrer: Address,
}