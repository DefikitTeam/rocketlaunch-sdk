import { AddressLookupTableAccount, ComputeBudgetProgram, Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { convertNumber, deserializeInstruction, getAddressLookupTableAccounts, MICRO_LAMPORTS_PER_LAMPORTS, MINIMUM_TRANSACTION_FEE_IN_SOL, MINIMUM_WALLET_RENT_EXEMPT, SOL } from "../utils";
import { BN } from "bn.js";
import { getMint } from "@solana/spl-token";

export class JupiterSwapClient {
  rpc: string = 'https://api.mainnet-beta.solana.com';
  connection: Connection;

  constructor(rpc: string = 'https://api.mainnet-beta.solana.com') {
    this.rpc = rpc;
    this.connection = new Connection(this.rpc);
  }

  public async swapExactIn(
    from: PublicKey,
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    slippage: string = "50", // 0.5%
    priorityFee: string | null = null,
    feePercent: string,
    feeRecipient: PublicKey,
    ownerFeedPercent: string,
    ownerFeed: PublicKey | null = null,
  ) {

    const amountInFloats = convertNumber(amountIn);
    const mint = tokenIn === SOL ? new PublicKey(tokenOut) : new PublicKey(tokenIn);
    const mintInfo = await getMint(this.connection, mint);
    const amountLamports = tokenIn === SOL ? new BN(amountInFloats * LAMPORTS_PER_SOL) : new BN(amountInFloats * 10 ** mintInfo.decimals);

    const quoteApi = `https://quote-api.jup.ag/v6/quote?inputMint=${tokenIn}&outputMint=${tokenOut}&amount=${amountLamports.toString()}&slippageBps=${slippage}`;

    const quoteResponse = await (await fetch(quoteApi)).json() as any;
    const instructions = await (
      await fetch("https://quote-api.jup.ag/v6/swap-instructions", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: from.toBase58(),
        })
      })
    ).json() as any;
    if (instructions.error) {
      throw new Error("Failed to get swap instructions: " + instructions.error);
    }

    const {
      setupInstructions,
      swapInstruction,
      addressLookupTableAddresses,
      cleanupInstruction,
    } = instructions;

    const addressLookupTableAccounts: AddressLookupTableAccount[] = [];
    addressLookupTableAccounts.push(
      ...(await getAddressLookupTableAccounts(this.connection, addressLookupTableAddresses))
    );

    let feeAmount = parseFloat("0");
    let feeAmountInLamports = 0;
    let feeInstructions: { programId: string, accounts: { pubkey: string, isSigner: boolean, isWritable: boolean }[], data: string }[] = [];
    if (feePercent && parseFloat(feePercent) > 0) {
      if (tokenOut !== SOL) {
        feeAmount = parseFloat(amountIn) * parseFloat(feePercent);
        feeAmountInLamports = Math.floor(feeAmount * LAMPORTS_PER_SOL);
      } else {
        feeAmountInLamports = Math.floor(parseFloat(quoteResponse.outAmount) * parseFloat(feePercent));
      }

      if (feeAmountInLamports > 0) {
        let ownerFeedAmountInLamports = 0;

        if (ownerFeedPercent && parseFloat(ownerFeedPercent) > 0 && ownerFeed) {
          const ownerFeedBalance = await this.connection.getBalance(ownerFeed);
          if (ownerFeedBalance > MINIMUM_WALLET_RENT_EXEMPT) {
            ownerFeedAmountInLamports = Math.floor(feeAmountInLamports * parseFloat(ownerFeedPercent));
            feeInstructions.push(this.createTransferInstruction(from, ownerFeed, ownerFeedAmountInLamports));
          }
          feeInstructions.push(this.createTransferInstruction(from, feeRecipient, feeAmountInLamports - ownerFeedAmountInLamports));
        } else {
          feeInstructions.push(this.createTransferInstruction(from, feeRecipient, feeAmountInLamports));
        }
      }
    }

    const blockhash = (await this.connection.getLatestBlockhash()).blockhash;
    let messageInstructions = [
      ...setupInstructions.map(deserializeInstruction),
      deserializeInstruction(swapInstruction),
      deserializeInstruction(cleanupInstruction),
      ...feeInstructions.map(deserializeInstruction),
    ];
    let swapFee = MINIMUM_TRANSACTION_FEE_IN_SOL;
    let computeUnitPrice = 0;
    let units = 1_400_000;
    if (priorityFee) {
      swapFee = convertNumber(priorityFee);
      if (swapFee > MINIMUM_TRANSACTION_FEE_IN_SOL) {
        const diffFee = swapFee - MINIMUM_TRANSACTION_FEE_IN_SOL;
        computeUnitPrice = Math.floor((diffFee * LAMPORTS_PER_SOL / units) * MICRO_LAMPORTS_PER_LAMPORTS);
      } else {
        throw Error("Fee must be greater than 5000 lamports (0.000005 SOL)");
      }
    }
    if (computeUnitPrice > 0) {
      messageInstructions.unshift(ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: computeUnitPrice
      }))

      messageInstructions.unshift(ComputeBudgetProgram.setComputeUnitLimit({
        units
      }))
    }
    const messageV0 = new TransactionMessage({
      payerKey: from,
      recentBlockhash: blockhash,
      instructions: messageInstructions,
    }).compileToV0Message(addressLookupTableAccounts);
    const transaction = new VersionedTransaction(messageV0);
    return transaction;
  }

  public async swapExactOut(
    from: PublicKey,
    tokenIn: string,
    tokenOut: string,
    amountOut: string,
    slippage: string = "50", // 0.5%
    priorityFee: string | null = null,
    feePercent: string,
    feeRecipient: PublicKey,
    ownerFeedPercent: string,
    ownerFeed: PublicKey | null = null,
  ) {

    const amountOutFloats = convertNumber(amountOut);
    const mint = tokenIn === SOL ? new PublicKey(tokenOut) : new PublicKey(tokenIn);
    const mintInfo = await getMint(this.connection, mint);
    const amountLamports = tokenIn === SOL ? new BN(amountOutFloats * 10 ** mintInfo.decimals) : new BN(amountOutFloats * LAMPORTS_PER_SOL);

    const quoteApi = `https://quote-api.jup.ag/v6/quote?inputMint=${tokenIn}&outputMint=${tokenOut}&amount=${amountLamports.toString()}&slippageBps=${slippage}&swapMode=ExactOut`;

    const quoteResponse = await (await fetch(quoteApi)).json() as any;
    const instructions = await (
      await fetch("https://quote-api.jup.ag/v6/swap-instructions", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: from.toBase58(),
        })
      })
    ).json() as any;
    if (instructions.error) {
      throw new Error("Failed to get swap instructions: " + instructions.error);
    }

    const {
      setupInstructions,
      swapInstruction,
      addressLookupTableAddresses,
      cleanupInstruction,
    } = instructions;

    const addressLookupTableAccounts: AddressLookupTableAccount[] = [];
    addressLookupTableAccounts.push(
      ...(await getAddressLookupTableAccounts(this.connection, addressLookupTableAddresses))
    );

    let feeAmount = parseFloat("0");
    let feeAmountInLamports = 0;
    let feeInstructions: { programId: string, accounts: { pubkey: string, isSigner: boolean, isWritable: boolean }[], data: string }[] = [];
    if (feePercent && parseFloat(feePercent) > 0) {
      if (tokenOut !== SOL) {
        feeAmountInLamports = Math.floor(parseFloat(quoteResponse.inAmount) * parseFloat(feePercent));
      } else {
        feeAmount = parseFloat(amountOut) * parseFloat(feePercent);
        feeAmountInLamports = Math.floor(feeAmount * LAMPORTS_PER_SOL);
      }

      if (feeAmountInLamports > 0) {
        let ownerFeedAmountInLamports = 0;

        if (ownerFeedPercent && parseFloat(ownerFeedPercent) > 0 && ownerFeed) {
          const ownerFeedBalance = await this.connection.getBalance(ownerFeed);
          if (ownerFeedBalance > MINIMUM_WALLET_RENT_EXEMPT) {
            ownerFeedAmountInLamports = Math.floor(feeAmountInLamports * parseFloat(ownerFeedPercent));
            feeInstructions.push(this.createTransferInstruction(from, ownerFeed, ownerFeedAmountInLamports));
          }
          feeInstructions.push(this.createTransferInstruction(from, feeRecipient, feeAmountInLamports - ownerFeedAmountInLamports));
        } else {
          feeInstructions.push(this.createTransferInstruction(from, feeRecipient, feeAmountInLamports));
        }
      }
    }

    const blockhash = (await this.connection.getLatestBlockhash()).blockhash;
    let messageInstructions = [
      ...setupInstructions.map(deserializeInstruction),
      deserializeInstruction(swapInstruction),
      deserializeInstruction(cleanupInstruction),
      ...feeInstructions.map(deserializeInstruction),
    ];
    let swapFee = MINIMUM_TRANSACTION_FEE_IN_SOL;
    let computeUnitPrice = 0;
    let units = 1_400_000;
    if (priorityFee) {
      swapFee = convertNumber(priorityFee);
      if (swapFee > MINIMUM_TRANSACTION_FEE_IN_SOL) {
        const diffFee = swapFee - MINIMUM_TRANSACTION_FEE_IN_SOL;
        computeUnitPrice = Math.floor((diffFee * LAMPORTS_PER_SOL / units) * MICRO_LAMPORTS_PER_LAMPORTS);
      } else {
        throw Error("Fee must be greater than 5000 lamports (0.000005 SOL)");
      }
    }
    if (computeUnitPrice > 0) {
      messageInstructions.unshift(ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: computeUnitPrice
      }))

      messageInstructions.unshift(ComputeBudgetProgram.setComputeUnitLimit({
        units
      }))
    }
    const messageV0 = new TransactionMessage({
      payerKey: from,
      recentBlockhash: blockhash,
      instructions: messageInstructions,
    }).compileToV0Message(addressLookupTableAccounts);
    const transaction = new VersionedTransaction(messageV0);
    return transaction;
  }

  public async calcAmountOut(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    slippage: string = "50", // 0.5%
  ) {
    const amountInFloats = convertNumber(amountIn);
    const mint = tokenIn === SOL ? new PublicKey(tokenOut) : new PublicKey(tokenIn);
    const mintInfo = await getMint(this.connection, mint);
    const amountLamports = tokenIn === SOL ? new BN(amountInFloats * LAMPORTS_PER_SOL) : new BN(amountInFloats * 10 ** mintInfo.decimals);

    const quoteApi = `https://quote-api.jup.ag/v6/quote?inputMint=${tokenIn}&outputMint=${tokenOut}&amount=${amountLamports.toString()}&slippageBps=${slippage}`;

    const quoteResponse = await (await fetch(quoteApi)).json() as any;

    return { amountOut: quoteResponse.outAmount, minAmountOut: quoteResponse.otherAmountThreshold };
  }

  public async calcAmountIn(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    slippage: string = "50", // 0.5%
  ) {
    const amountInFloats = convertNumber(amountIn);
    const mint = tokenIn === SOL ? new PublicKey(tokenOut) : new PublicKey(tokenIn);
    const mintInfo = await getMint(this.connection, mint);
    const amountLamports = tokenIn === SOL ? new BN(amountInFloats * LAMPORTS_PER_SOL) : new BN(amountInFloats * 10 ** mintInfo.decimals);

    const quoteApi = `https://quote-api.jup.ag/v6/quote?inputMint=${tokenIn}&outputMint=${tokenOut}&amount=${amountLamports.toString()}&slippageBps=${slippage}&swapMode=ExactOut`;

    const quoteResponse = await (await fetch(quoteApi)).json() as any;

    return { amountIn: quoteResponse.inAmount };
  }

  createTransferInstruction(from: PublicKey, to: PublicKey, amount: number) {
    const solanaInstruction = SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: to,
      lamports: amount,
    });
    return {
      programId: solanaInstruction.programId.toBase58(),
      accounts: solanaInstruction.keys.map((key) => ({
        pubkey: key.pubkey.toBase58(),
        isSigner: key.isSigner,
        isWritable: key.isWritable,
      })),
      data: solanaInstruction.data.toString("base64"),
    };
  }
}