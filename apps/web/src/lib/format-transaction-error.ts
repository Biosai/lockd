/**
 * Sanitizes raw blockchain error messages into user-friendly strings.
 * Handles common wallet, Ledger, and contract revert errors.
 */
export function formatTransactionError(error: Error | null): string {
  if (!error) return "Transaction failed. Please try again.";

  const message = error.message?.toLowerCase() || "";

  if (message.includes("user rejected") || message.includes("user denied")) {
    return "Transaction was rejected by user";
  }

  if (message.includes("insufficient")) {
    return "Insufficient balance for this transaction";
  }

  // Ledger-specific errors
  if (message.includes("0x6b0c") || message.includes("0x6700") || message.includes("no app") || message.includes("device is locked") || message.includes("locked device")) {
    return "Ledger: Please unlock your device and open the Ethereum app";
  }
  if (message.includes("disconnected") || message.includes("transport") || message.includes("hid") || message.includes("cannot open")) {
    return "Ledger: Device disconnected. Please reconnect your Ledger and open the Ethereum app";
  }
  if (message.includes("0x6985") || message.includes("condition not satisfied")) {
    return "Ledger: Transaction rejected on device";
  }
  if (message.includes("blind signing") || message.includes("enable contract data") || message.includes("contract data")) {
    return "Ledger: Please enable 'Blind signing' in the Ethereum app settings";
  }

  // Contract-specific revert errors
  if (message.includes("deadline") || message.includes("DeadlineNotReached")) {
    return "Cannot refund yet - deadline has not been reached";
  }
  if (message.includes("claimed") || message.includes("AlreadyClaimed")) {
    return "This deposit has already been claimed or refunded";
  }
  if (message.includes("NotDepositor") || message.includes("not depositor")) {
    return "Only the original depositor can request a refund";
  }
  if (message.includes("NotClaimant") || message.includes("not claimant")) {
    return "Only the designated recipient can claim this deposit";
  }

  if (message.includes("gas") || message.includes("fee") || message.includes("exceeds") || message.includes("intrinsic")) {
    return "Transaction would fail. Please check that the deadline has passed and the deposit hasn't been claimed.";
  }
  if (message.includes("execution reverted") || message.includes("revert")) {
    return "Transaction failed. Please verify the deadline has passed and the deposit is still available.";
  }

  return "Transaction failed. Please try again.";
}
