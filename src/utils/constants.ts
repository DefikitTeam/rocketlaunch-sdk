export const MICRO_LAMPORTS_PER_LAMPORTS = 1000000;
export const MINIMUM_TRANSACTION_FEE_IN_SOL = 0.000005; // Only 1 signature, and fee per signature is 5000 lamports
export const MINIMUM_WALLET_RENT_EXEMPT = 100224;
export const SOL = "So11111111111111111111111111111111111111112";

export const convertNumber = (number: string): number => {
  if (isNaN(Number(number))) {
    throw new Error("Invalid number");
  }
  return Number(number);
};