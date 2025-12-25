import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// Scrypt cost parameters for key derivation (OWASP recommended)
const SCRYPT_OPTIONS = {
  N: 32768,  // CPU/memory cost parameter (2^15)
  r: 8,      // Block size
  p: 1,      // Parallelization parameter
  maxmem: 64 * 1024 * 1024, // 64MB max memory
};

// Constant salt for key derivation (unique to this application)
// Using a constant salt is acceptable here since scrypt provides the computational hardness
const KEY_DERIVATION_SALT = Buffer.from("photobook-encryption-key-salt-v1", "utf8");

/**
 * Get encryption key from environment
 * Security: Requires ENCRYPTION_KEY to be set in production
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    // In production, require ENCRYPTION_KEY
    if (process.env.NODE_ENV === "production") {
      console.error(
        "CRITICAL: ENCRYPTION_KEY not set in production. " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
      );
    }
    // Fallback for development only - derive key from admin password
    const fallback = process.env.ADMIN_PASSWORD || "default-key-change-me";
    return crypto.scryptSync(fallback, KEY_DERIVATION_SALT, 32, SCRYPT_OPTIONS);
  }

  // If key is provided, ensure it's 32 bytes (256 bits)
  if (key.length === 64 && /^[a-f0-9]+$/i.test(key)) {
    // Hex-encoded 32-byte key
    return Buffer.from(key, "hex");
  } else if (key.length >= 32) {
    // Use first 32 bytes or derive from longer string
    if (key.length === 32) {
      return Buffer.from(key);
    }
    // Derive 32-byte key from provided string
    return crypto.scryptSync(key, KEY_DERIVATION_SALT, 32, SCRYPT_OPTIONS);
  } else {
    // Key too short, derive with scrypt
    return crypto.scryptSync(key, KEY_DERIVATION_SALT, 32, SCRYPT_OPTIONS);
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
