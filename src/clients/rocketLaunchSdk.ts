import { Address, getContract, PublicClient, WalletClient, WriteContractErrorType } from "viem";
import { createViemWalletClient, createViemPublicClient, log } from "../utils";
import { rocketLaunchABI } from "../ABIs";
import { ChainId, PLATFORM_FEE, ROCKET_LAUNCH_CONTRACT_ADDRESS } from "../constants";
import { LaunchPoolInputData } from "../types";
import BigNumber from "bignumber.js";
export class RocketLaunchSdk {
    private walletClient: WalletClient;
    private publicClient: PublicClient;
    private contract: any;

    constructor(privateKey: string, chainId: ChainId = ChainId.BERACHAIN) {
        this.walletClient = createViemWalletClient(privateKey, chainId);
        this.publicClient = createViemPublicClient(chainId);
        this.contract = getContract({
            abi: rocketLaunchABI,
            address: ROCKET_LAUNCH_CONTRACT_ADDRESS,
            client: { public: this.publicClient, wallet: this.walletClient }
        });
    }

    async createToken(name: string, symbol: string, decimals: number, totalSupply: bigint) {
        try {
            log.info('[INFO] Creating new token...', { name, symbol, decimals, totalSupply });
            const transaction = await this.contract.write.createRocketToken([
                name,
                symbol,
                decimals,
                totalSupply.toString()
            ]);
            log.info('[INFO] Transaction sent, waiting for receipt...', { transactionHash: transaction });
            const receipt = await this.publicClient.waitForTransactionReceipt({ hash: transaction });
            log.info('[INFO] Transaction receipt received.', { receipt });

            return receipt;
        } catch (e) {
            throw e;
        }
    }

    async launchPool(launchPoolInputData: LaunchPoolInputData) {
        try {
            log.info('[INFO] Launching pool...', launchPoolInputData);
            if (!this.walletClient || !this.walletClient.account) {
                throw new Error('Wallet client is not provided');
            }
            const chainId = await this.publicClient.getChainId();

            const fee = PLATFORM_FEE[chainId as keyof typeof PLATFORM_FEE] ?? 0;
            const value = BigInt(
                new BigNumber(launchPoolInputData.maxAmountETH!)
                    .plus(
                        new BigNumber(
                            fee
                        ).times(1e18)
                    )
                    .toFixed(0)
            )

            const transaction = await this.walletClient.writeContract({
                address: ROCKET_LAUNCH_CONTRACT_ADDRESS,
                abi: rocketLaunchABI,
                functionName: 'launchPool',
                args: [launchPoolInputData],
                value: value,
                chain: this.publicClient.chain,
                account: this.walletClient.account
            })
            log.info('[INFO] Transaction sent, waiting for receipt...', { transactionHash: transaction });
            const receipt = await this.publicClient.waitForTransactionReceipt({ hash: transaction });
            log.info('[INFO] Transaction receipt received.', { receipt });

            return receipt;
        } catch (e) {
            throw e;
        }
    }

    async claimToken(address: Address) {
        try {
            log.info('[INFO] Claiming...', {});
            const transaction = await this.contract.write.claimToken([address]);
            log.info('[INFO] Transaction sent, waiting for receipt...', { transactionHash: transaction });
            const receipt = await this.publicClient.waitForTransactionReceipt({ hash: transaction });
            log.info('[INFO] Transaction receipt received.', { receipt });

            return receipt;
        } catch (e) {
            throw e;
        }
    }

    async buyToken(poolAddress: Address, numberBatch: number, maxAmountETH: bigint, referrer: Address) {
        try {
            log.info('[INFO] Buying...', {});
            const transaction = await this.contract.write.buy([poolAddress, numberBatch, maxAmountETH, referrer]);
            log.info('[INFO] Transaction sent, waiting for receipt...', { transactionHash: transaction });
            const receipt = await this.publicClient.waitForTransactionReceipt({ hash: transaction });
            log.info('[INFO] Transaction receipt received.', { receipt });
            return receipt;
        } catch (e) {
            throw e;
        }
    }

    async sellToken(poolAddress: Address, amount: bigint) {
        try {
            log.info('[INFO] Selling...', {});
            const transaction = await this.contract.write.sell([poolAddress, amount]);
            log.info('[INFO] Transaction sent, waiting for receipt...', { transactionHash: transaction });
            const receipt = await this.publicClient.waitForTransactionReceipt({ hash: transaction });
            log.info('[INFO] Transaction receipt received.', { receipt });
            return receipt;
        } catch (e) {
            throw e;
        }
    }
}