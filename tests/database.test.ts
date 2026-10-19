import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { testDatabaseUrl } from "../scripts/test-database.cjs";
import { readSqlite } from "../scripts/import-sqlite.cjs";

test("browser tests require a PostgreSQL database separate from application data", () => {
  const application = "postgresql://app:password@localhost:5432/phin";
  const isolated = "postgresql://app:password@localhost:5432/phin_test";
  assert.equal(
    testDatabaseUrl({ DATABASE_URL: application, TEST_DATABASE_URL: isolated }),
    isolated,
  );
  for (const unsafe of [undefined, "file:./dev.db", application, "not-a-url"])
    assert.throws(() =>
      testDatabaseUrl({ DATABASE_URL: application, TEST_DATABASE_URL: unsafe }),
    );
  assert.throws(() =>
    testDatabaseUrl({
      DATABASE_URL: isolated,
      TEST_DATABASE_URL:
        "postgresql://other:password@localhost:5432/phin_test?schema=another",
    }),
  );
  assert.throws(() =>
    testDatabaseUrl({
      DATABASE_URL: isolated,
      TEST_DATABASE_URL: isolated.replace("localhost", "127.0.0.1"),
    }),
  );
});

test("SQLite import preserves IDs and hashes while converting dates and booleans", () => {
  const directory = mkdtempSync(join(tmpdir(), "phin-sqlite-import-"));
  const source = join(directory, "source.db");
  const timezone = process.env.TZ;
  process.env.TZ = "Asia/Ho_Chi_Minh";
  try {
    const sqlite = new DatabaseSync(source);
    sqlite.exec(readFileSync("prisma/sqlite-migrations/20261018000000_init/migration.sql", "utf8"));
    sqlite.exec(readFileSync("prisma/sqlite-migrations/20261018010000_login_limits/migration.sql", "utf8"));
    sqlite.exec(`
      INSERT INTO User VALUES ('user-1', 'Test User', 'test@example.com', 'original-hash', 1792342800000);
      INSERT INTO Goal VALUES ('goal-1', 'user-1', 'Read', 'reading', NULL, 'easy', 7, '2026-10-19 12:00:00');
      INSERT INTO Challenge VALUES ('challenge-1', 'user-1', 'goal-1', 1792342800000, 1792861200000, 'active', 1, 1, 1792342800000);
      INSERT INTO DailyTask VALUES ('task-1', 'challenge-1', 1, 'Read a little', 'easy', 'completed');
      INSERT INTO CheckIn VALUES ('check-in-1', 'task-1', 1, 'medium', 'Original note', 1792342800000);
      INSERT INTO LoginAttempt VALUES ('original-key', 3, 1792343700000);
    `);
    sqlite.close();
    const original = readFileSync(source);
    const data = readSqlite(source);
    assert.equal(data.user[0].id, "user-1");
    assert.equal(data.user[0].passwordHash, "original-hash");
    assert.equal(data.user[0].createdAt.getTime(), 1792342800000);
    assert.equal(data.goal[0].createdAt.toISOString(), "2026-10-19T12:00:00.000Z");
    assert.equal(data.challenge[0].startDate.getTime(), 1792342800000);
    assert.equal(data.checkIn[0].completed, true);
    assert.equal(data.checkIn[0].note, "Original note");
    assert.equal(data.loginAttempt[0].resetAt.getTime(), 1792343700000);
    assert.deepEqual(readFileSync(source), original);
  } finally {
    if (timezone === undefined) delete process.env.TZ;
    else process.env.TZ = timezone;
    assert.ok(directory.startsWith(join(tmpdir(), "phin-sqlite-import-")));
    rmSync(directory, { recursive: true, force: true });
  }
});
