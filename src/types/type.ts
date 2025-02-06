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
    startTime: number,
    minDurationSell: number,
    maxDurationSell: number,
    metadata: string,
    numberBatch: number,
    maxAmountETH: number,
    referrer: Address,
}



