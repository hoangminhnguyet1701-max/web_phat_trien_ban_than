const fs = require("node:fs");
if (fs.existsSync(".env")) process.loadEnvFile(".env");

/** @param {{ DATABASE_URL?: string, TEST_DATABASE_URL?: string }} [env] */
function testDatabaseUrl(env = process.env) {
  if (!env.TEST_DATABASE_URL)
    throw new Error("Set TEST_DATABASE_URL to a separate PostgreSQL database ending in _test.");
  const target = new URL(env.TEST_DATABASE_URL);
  const name = decodeURIComponent(target.pathname);
  if (!["postgresql:", "postgres:"].includes(target.protocol) || !name.endsWith("_test"))
    throw new Error("TEST_DATABASE_URL must use PostgreSQL and a database name ending in _test.");
  if (env.DATABASE_URL) {
    const application = new URL(env.DATABASE_URL);
    if (name === decodeURIComponent(application.pathname))
      throw new Error("Test and application databases must have different names.");
  }
  return env.TEST_DATABASE_URL;
}

module.exports = { testDatabaseUrl };
