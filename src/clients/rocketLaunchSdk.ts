import { Address, getContract, PublicClient, WalletClient } from "viem";
import { createViemWalletClient, createViemPublicClient, log } from "../utils";
import { rocketLaunchABI } from "../ABIs";
import { ROCKET_LAUNCH_CONTRACT_ADDRESS } from "../constants/constants";
import { LaunchPoolInputData } from "../types";
export class RocketLaunchSdk {
    private walletClient: WalletClient;
    private publicClient: PublicClient;
    private contract: any;

    constructor(privateKey: string) {
        this.walletClient = createViemWalletClient(privateKey);
        this.publicClient = createViemPublicClient();
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
        } catch (error) {
            log.error('[ERROR] Error creating token:', error);
            throw error;
        }
    }

    async launchPool(launchPoolInputData: LaunchPoolInputData) {
        try {
            log.info('[INFO] Launching pool...', launchPoolInputData);
            const transaction = await this.contract.write.launchPool([
                launchPoolInputData
            ]);
            log.info('[INFO] Transaction sent, waiting for receipt...', { transactionHash: transaction });
            const receipt = await this.publicClient.waitForTransactionReceipt({ hash: transaction });
            log.info('[INFO] Transaction receipt received.', { receipt });

            return receipt;
        } catch (error) {
            log.error('[ERROR] Error launching pool:', error);
            throw error;
        }
    }

    async claimToken(address:Address) {
        try {
            log.info('[INFO] Claiming...', {});
            const transaction = await this.contract.write.claimToken([address]);
            log.info('[INFO] Transaction sent, waiting for receipt...', { transactionHash: transaction });
            const receipt = await this.publicClient.waitForTransactionReceipt({ hash: transaction });
            log.info('[INFO] Transaction receipt received.', { receipt });

            return receipt;
        } catch (error) {
            log.error('[ERROR] Error claiming:', error);
            throw error;
        }
    }

    async buyToken(poolAddress: Address, numberBatch: number, maxAmountETH: bigint, referrer: Address) {
        try {
            log.info('[INFO] Buying...', {});
            const transaction = await this.contract.write.buyToken([poolAddress, numberBatch, maxAmountETH, referrer]);
            log.info('[INFO] Transaction sent, waiting for receipt...', { transactionHash: transaction });
            const receipt = await this.publicClient.waitForTransactionReceipt({ hash: transaction });
            log.info('[INFO] Transaction receipt received.', { receipt });
            return receipt;
        } catch (error) {
            log.error('[ERROR] Error buying:', error);
            throw error;
        }
    }

    async sellToken(poolAddress: Address, amount: bigint) {
        try {
            log.info('[INFO] Selling...', {});
            const transaction = await this.contract.write.sellToken([poolAddress,amount]);
            log.info('[INFO] Transaction sent, waiting for receipt...', { transactionHash: transaction });
            const receipt = await this.publicClient.waitForTransactionReceipt({ hash: transaction });
            log.info('[INFO] Transaction receipt received.', { receipt });
            return receipt;
        } catch (error) {
            log.error('[ERROR] Error selling:', error);
            throw error;
        }
    }
}