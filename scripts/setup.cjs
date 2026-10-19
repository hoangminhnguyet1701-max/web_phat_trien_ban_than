const fs = require("node:fs");
const crypto = require("node:crypto");
fs.closeSync(fs.openSync("prisma/dev.db", "a"));
if (!fs.existsSync(".env")) {
  fs.writeFileSync(
    ".env",
    `DATABASE_URL="file:./dev.db"\nNEXTAUTH_URL="http://localhost:3000"\nNEXTAUTH_SECRET="${crypto.randomBytes(48).toString("hex")}"\n`,
  );
  console.log("Local environment configured.");
}
