const { DatabaseSync } = require("node:sqlite");
const { PrismaClient } = require("@prisma/client");
const tables = ["User", "Goal", "Challenge", "DailyTask", "CheckIn", "LoginAttempt"];

function readSqlite(filename) {
  const sqlite = new DatabaseSync(filename, { readOnly: true });
  try {
    sqlite.exec("BEGIN");
    /** @type {Record<string, any[]>} */
    const data = {};
    for (const table of tables) {
      const model = table[0].toLowerCase() + table.slice(1);
      data[model] = sqlite.prepare(`SELECT * FROM "${table}"`).all().map((row) => {
        for (const field of ["createdAt", "startDate", "endDate", "resetAt"]) {
          const value = row[field];
          if (value == null) continue;
          // SQLite CURRENT_TIMESTAMP is UTC even though it has no timezone suffix.
          const timestamp = typeof value === "string" &&
            /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(value)
            ? value.replace(" ", "T") + "Z"
            : value;
          row[field] = new Date(timestamp);
        }
        if (table === "CheckIn") row.completed = Boolean(row.completed);
        return row;
      });
    }
    sqlite.exec("COMMIT");
    return data;
  } finally {
    sqlite.close();
  }
}

async function importSqlite(db, filename) {
  const data = readSqlite(filename);
  await db.$transaction(async (tx) => {
    for (const model of Object.keys(data))
      if (await tx[model].count())
        throw new Error("Destination is not empty. Import stopped without changing data.");
    for (const [model, rows] of Object.entries(data))
      if (rows.length) await tx[model].createMany({ data: rows });
  }, { timeout: 30000 });
  return Object.fromEntries(Object.entries(data).map(([model, rows]) => [model, rows.length]));
}

if (require.main === module) {
  const db = new PrismaClient();
  importSqlite(db, process.argv[2] || "prisma/dev.db")
    .then((counts) => console.log("Imported rows:", counts))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    })
    .finally(() => db.$disconnect());
}

module.exports = { readSqlite, importSqlite };
