import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
const deriveKey = promisify(scrypt);
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await deriveKey(password, salt, 64)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}
export async function verifyPassword(password: string, hash: string) {
  if (!/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(hash)) return false;
  const [salt, key] = hash.split(":");
  const stored = Buffer.from(key, "hex");
  const candidate = (await deriveKey(password, salt, 64)) as Buffer;
  return (
    stored.length === candidate.length && timingSafeEqual(stored, candidate)
  );
}
