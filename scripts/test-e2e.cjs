const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
// Create the SQLite file before invoking Prisma on Windows.
fs.closeSync(fs.openSync("prisma/e2e.db", "a"));
const env = { ...process.env, DATABASE_URL: "file:./e2e.db" };
for (const args of [
  [require.resolve("prisma/build/index.js"), "migrate", "deploy"],
  [require.resolve("@playwright/test/cli"), "test", ...process.argv.slice(2)],
]) {
  const result = spawnSync(process.execPath, args, { env, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
