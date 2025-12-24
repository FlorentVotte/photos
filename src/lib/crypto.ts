import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// Get encryption key from environment or generate a warning
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    console.warn(
      "ENCRYPTION_KEY not set. Using derived key from ADMIN_PASSWORD. " +
      "Set ENCRYPTION_KEY in production for better security."
    );
    // Fallback: derive key from admin password (not ideal but better than nothing)
    const fallback = process.env.ADMIN_PASSWORD || "default-key-change-me";
    return crypto.scryptSync(fallback, "salt", 32);
  }

  // If key is provided, ensure it's 32 bytes (256 bits)
  if (key.length === 64) {
    // Hex-encoded 32-byte key
    return Buffer.from(key, "hex");
  } else if (key.length === 32) {
    // Raw 32-byte key
    return Buffer.from(key);
  } else {
    // Derive 32-byte key from provided string
    return crypto.scryptSync(key, "salt", 32);
  }
}

/**
 * Encrypt a string value
 * Returns: iv:tag:ciphertext (all hex-encoded)
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  // Format: iv:tag:ciphertext
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt a string value
 * Input format: iv:tag:ciphertext (all hex-encoded)
 */
export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();

  const parts = ciphertext.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted format");
  }

  const [ivHex, tagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Check if a value is encrypted (has the expected format)
 */
export function isEncrypted(value: string): boolean {
  const parts = value.split(":");
  if (parts.length !== 3) return false;

  const [iv, tag, data] = parts;
  // Check if all parts are valid hex
  return (
    iv.length === IV_LENGTH * 2 &&
    tag.length === TAG_LENGTH * 2 &&
    /^[a-f0-9]+$/i.test(iv) &&
    /^[a-f0-9]+$/i.test(tag) &&
    /^[a-f0-9]+$/i.test(data)
  );
}
