import { test } from "node:test";
import assert from "node:assert/strict";
import {
  categories,
  dayIndex,
  dayKey,
  nextLevel,
  streaks,
  taskTitle,
} from "../src/lib/challenges";
import { hashPassword, verifyPassword } from "../src/lib/password";
test("difficulty adjusts and stays within bounds", () => {
  assert.equal(nextLevel("easy", "hard"), "easy");
  assert.equal(nextLevel("hard", "easy"), "hard");
  assert.equal(nextLevel("easy", "easy"), "medium");
  assert.equal(nextLevel("hard", "hard"), "medium");
  assert.equal(nextLevel("medium", "medium"), "medium");
});
test("every category produces a complete 30-day roadmap at each level", () => {
  for (const category of Object.keys(categories))
    for (const level of ["easy", "medium", "hard"])
      for (let day = 1; day <= 30; day++) {
        const title = taskTitle(category, level, day);
        assert.ok(title.length > 15);
        assert.ok(!title.includes("undefined"));
      }
});
test("calendar switches at Vietnam midnight, independent of UTC and elapsed hours", () => {
  assert.equal(dayKey(new Date("2026-10-18T17:00:00Z")), "2026-10-19");
  assert.equal(
    dayIndex(
      new Date("2026-10-18T16:59:00Z"),
      new Date("2026-10-18T17:01:00Z"),
    ),
    2,
  );
  assert.equal(
    dayIndex(
      new Date("2026-10-18T00:00:00Z"),
      new Date("2026-10-18T16:59:00Z"),
    ),
    1,
  );
});
test("streak survives pending today, resets after missed day, preserves longest", () => {
  const tasks = [
    "completed",
    "completed",
    "missed",
    "completed",
    "pending",
  ].map((status, i) => ({ dayNumber: i + 1, status }));
  assert.deepEqual(streaks(tasks, 5), { current: 1, longest: 2 });
  assert.deepEqual(streaks(tasks, 6), { current: 0, longest: 2 });
  assert.deepEqual(streaks([{ dayNumber: 1, status: "completed" }], 1), {
    current: 1,
    longest: 1,
  });
  assert.deepEqual(
    streaks(
      [
        { dayNumber: 1, status: "completed" },
        { dayNumber: 2, status: "skipped" },
      ],
      2,
    ),
    { current: 0, longest: 1 },
  );
});
test("password hash is salted and rejects an incorrect password", async () => {
  const hash = await hashPassword("a-long-password");
  assert.ok(await verifyPassword("a-long-password", hash));
  assert.ok(!(await verifyPassword("wrong-password", hash)));
  assert.notEqual(hash, await hashPassword("a-long-password"));
  assert.equal(await verifyPassword("password", "corrupt-hash"), false);
});
