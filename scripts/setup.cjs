const fs = require("node:fs");
const crypto = require("node:crypto");
if (!fs.existsSync(".env")) {
  const password = crypto.randomBytes(24).toString("hex");
  fs.writeFileSync(
    ".env",
    `POSTGRES_PASSWORD="${password}"\nDATABASE_URL="postgresql://phin:${password}@127.0.0.1:55432/phin?schema=public"\nTEST_DATABASE_URL="postgresql://phin:${password}@127.0.0.1:55432/phin_test?schema=public"\nNEXTAUTH_URL="http://localhost:3000"\nNEXTAUTH_SECRET="${crypto.randomBytes(48).toString("hex")}"\n`,
  );
  console.log("Local environment configured.");
}
