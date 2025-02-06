import { berachainTestnetbArtio, base, baseSepolia, polygonAmoy, artelaTestnet, unichainSepolia, iota } from "viem/chains";

export const ROCKET_LAUNCH_CONTRACT_ADDRESS = '0x20830f96Cff2eD62dc61257BF692a13AcC9755B3';


export enum ChainId {
    BARTIO = 80084,
    BASE = 8453,
    BASE_SEPOLIA = 84532,
    POLYGON_AMOY = 80002,
    ARTELA = 11822,
    UNICHAIN_SEPOLIA = 1301,
    IOTA = 8822
}
export const PLATFORM_FEE = {
    [ChainId.BASE]: 0.005,
    [ChainId.POLYGON_AMOY]: 0.005,
    [ChainId.ARTELA]: 0.005,
    [ChainId.BASE_SEPOLIA]: 0.005,
    [ChainId.BARTIO]: 0.0001,
    [ChainId.UNICHAIN_SEPOLIA]: 0.005,
    [ChainId.IOTA]: 0.05
};


export const SupportedChains = {
    [ChainId.BARTIO]: berachainTestnetbArtio,
    [ChainId.BASE]: base,
    [ChainId.BASE_SEPOLIA]: baseSepolia,
    [ChainId.POLYGON_AMOY]: polygonAmoy,
    [ChainId.ARTELA]: artelaTestnet,
    [ChainId.UNICHAIN_SEPOLIA]: unichainSepolia,
    [ChainId.IOTA]: iota
}


