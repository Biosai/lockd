/**
 * Computes SHA-256 hash of a file using the Web Crypto API
 * The file is processed entirely in the browser - never uploaded anywhere
 * @param file The file to hash
 * @returns The hash as a hex string (with 0x prefix, suitable for bytes32)
 */
export async function computeFileHash(file: File): Promise<`0x${string}`> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `0x${hashHex}` as `0x${string}`;
}

/**
 * Validates that a string is a valid bytes32 hash
 * @param hash The hash string to validate
 * @returns True if valid bytes32 format
 */
export function isValidBytes32(hash: string): hash is `0x${string}` {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Formats a bytes32 hash for display (truncated)
 * @param hash The full hash
 * @returns Truncated format like 0x1234...abcd
 */
export function formatHash(hash: string): string {
  if (hash.length < 18) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}
