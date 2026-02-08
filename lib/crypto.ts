import crypto from "crypto";

const SALT = process.env.HASH_SALT!;

export function hashPhone(phone: string) {
  return crypto
    .createHash("sha256")
    .update(phone + SALT)
    .digest("hex");
}

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateShortCode(length = 6) {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
}
