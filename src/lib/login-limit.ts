import { createHash } from "node:crypto";
import { db } from "./db";

function keyFor(email: string) {
  return createHash("sha256").update(email).digest("hex");
}

export async function allowLoginAttempt(email: string) {
  const now = new Date();
  const key = keyFor(email);
  const attempt = await db.$transaction(async (tx) => {
    await tx.loginAttempt.deleteMany({ where: { resetAt: { lte: now } } });
    return tx.loginAttempt.upsert({
      where: { key },
      create: { key, resetAt: new Date(now.getTime() + 15 * 60000) },
      update: { count: { increment: 1 } },
    });
  });
  return attempt.count <= 8;
}

export async function clearLoginAttempts(email: string) {
  await db.loginAttempt.deleteMany({ where: { key: keyFor(email) } });
}
