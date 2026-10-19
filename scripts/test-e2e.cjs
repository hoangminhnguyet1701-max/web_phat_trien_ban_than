const { spawnSync } = require("node:child_process");
const { testDatabaseUrl } = require("./test-database.cjs");
const databaseUrl = testDatabaseUrl();
const migration = spawnSync(process.execPath,
  [require.resolve("prisma/build/index.js"), "migrate", "deploy"],
  { env: { ...process.env, DATABASE_URL: databaseUrl }, stdio: "inherit" },
);
if (migration.status !== 0) process.exit(migration.status ?? 1);
const result = spawnSync(process.execPath,
  [require.resolve("@playwright/test/cli"), "test", ...process.argv.slice(2)],
  { env: process.env, stdio: "inherit" },
);
process.exit(result.status ?? 1);
