import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";
import { createHash } from "node:crypto";
import { testDatabaseUrl } from "../scripts/test-database.cjs";
const db = new PrismaClient({ datasources: { db: { url: testDatabaseUrl() } } });
test("real account, goal, adaptive check-in, ownership, summary and mobile", async ({
  page,
  browser,
}) => {
  const email = `test-${Date.now()}@example.com`;
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/login/);
  await page.goto("/register");
  await page.getByLabel("Tên của bạn").fill("Bạn Thử Nghiệm");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill("Test-password-123");
  await page
    .getByRole("button", { name: "Tạo tài khoản", exact: true })
    .click();
  await expect(page).toHaveURL(/login\?registered=1/);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.locator(".error-text")).toContainText("chưa đúng");
  await page.getByLabel("Mật khẩu", { exact: true }).fill("Test-password-123");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.goto("/goals/new");
  await page
    .getByLabel("Bạn muốn thay đổi điều gì?")
    .fill("Đọc sách trước khi ngủ");
  await page.locator('input[name="duration"][value="7"]').locator("..").click();
  await page
    .locator('input[name="startLevel"][value="medium"]')
    .locator("..")
    .click();
  await page.getByRole("button", { name: "Bắt đầu hành trình" }).click();
  await expect(page).toHaveURL(/challenges\//);
  const id = page.url().split("/").at(-1)!;
  await expect(page.locator(".timeline-row")).toHaveCount(7);
  await page.getByRole("link", { name: "Check-in hôm nay" }).click();
  await page
    .locator('input[name="feeling"][value="hard"]')
    .locator("..")
    .click();
  await page
    .getByLabel("Một vài dòng cho hôm nay")
    .fill("Một bước nhỏ thật vui.");
  await page.getByRole("button", { name: "Lưu check-in hôm nay" }).click();
  await expect(page.getByRole("status")).toContainText("Đã lưu");
  const challenge = await db.challenge.findUniqueOrThrow({
    where: { id },
    include: {
      tasks: { orderBy: { dayNumber: "asc" }, include: { checkIn: true } },
    },
  });
  expect(challenge.currentStreak).toBe(1);
  expect(challenge.tasks[0].difficulty).toBe("medium");
  expect(challenge.tasks[0].checkIn?.note).toBe("Một bước nhỏ thật vui.");
  expect(challenge.tasks[1].difficulty).toBe("easy");
  await page.goto(`/challenges/${id}/check-in`);
  await expect(
    page.getByRole("heading", { name: "Hôm nay đã được ghi nhận." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Lưu check-in hôm nay" }),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Hôm nay đã được ghi nhận." }),
  ).toBeVisible();
  // A second logged-in account cannot inspect or check in someone else's challenge.
  const other = await browser.newContext();
  const otherPage = await other.newPage();
  await otherPage.goto("http://localhost:3100/register");
  await otherPage.getByLabel("Tên của bạn").fill("Tài khoản khác");
  await otherPage.getByLabel("Email", { exact: true }).fill(`other-${email}`);
  await otherPage
    .getByLabel("Mật khẩu", { exact: true })
    .fill("Test-password-123");
  await otherPage
    .getByRole("button", { name: "Tạo tài khoản", exact: true })
    .click();
  await expect(otherPage).toHaveURL(/login/);
  await otherPage.getByLabel("Email", { exact: true }).fill(`other-${email}`);
  await otherPage
    .getByLabel("Mật khẩu", { exact: true })
    .fill("Test-password-123");
  await otherPage
    .getByRole("button", { name: "Đăng nhập", exact: true })
    .click();
  await expect(otherPage).toHaveURL(/dashboard/);
  await otherPage.goto(`http://localhost:3100/challenges/${id}`);
  await expect(
    otherPage.getByRole("heading", { name: "Chưa tìm thấy hành trình này." }),
  ).toBeVisible();
  await otherPage.goto(`http://localhost:3100/challenges/${id}/check-in`);
  await expect(
    otherPage.getByRole("heading", { name: "Chưa tìm thấy hành trình này." }),
  ).toBeVisible();
  await other.close();
  // Advance the isolated fixture to its last day; missed days must reset the streak.
  await db.challenge.update({
    where: { id },
    data: {
      startDate: new Date(Date.now() - 6 * 86400000),
      endDate: new Date(),
    },
  });
  await page.goto(`/challenges/${id}/check-in`);
  await page
    .locator('input[name="feeling"][value="easy"]')
    .locator("..")
    .click();
  await page.getByRole("button", { name: "Lưu check-in hôm nay" }).click();
  await expect(page.getByRole("link", { name: "Xem tổng kết" })).toBeVisible();
  await page.getByRole("link", { name: "Xem tổng kết" }).click();
  await expect(
    page.getByRole("heading", { name: "Bạn đã đi được một hành trình." }),
  ).toBeVisible();
  await expect(page.locator(".mini-stat").first()).toContainText("2/7");
  const final = await db.challenge.findUniqueOrThrow({
    where: { id },
    include: { tasks: true },
  });
  expect(final.currentStreak).toBe(1);
  expect(final.longestStreak).toBe(1);
  expect(final.tasks.filter((t) => t.status === "missed")).toHaveLength(5);
  await page.goto("/dashboard");
  await page.locator(".journey-card").filter({ hasText: "Xem tổng kết" }).click();
  await expect(page).toHaveURL(new RegExp(`/challenges/${id}/summary$`));
  await expect(
    page.getByRole("heading", { name: "Bạn đã đi được một hành trình." }),
  ).toBeVisible();
  await page.goto("/profile");
  await expect(
    page.getByRole("heading", { name: "Bạn Thử Nghiệm" }),
  ).toBeVisible();
  await expect(page.locator('.sidebar nav a[aria-current="page"]')).toHaveText(
    "Hồ sơ cá nhân",
  );
  await page.goto("/goals/new");
  await page
    .getByLabel("Bạn muốn thay đổi điều gì?")
    .fill("Dành thời gian cho những trang sách");
  await page.getByRole("button", { name: "Bắt đầu hành trình" }).click();
  await expect(
    page.getByRole("link", { name: "Check-in hôm nay" }),
  ).toBeVisible();
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: /Chào/ })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Check-in hôm nay" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "test-results/dashboard-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "test-results/dashboard-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Đăng xuất" }).click();
  await expect(page).toHaveURL("http://localhost:3100/");
  await page.screenshot({
    path: "test-results/landing-desktop.png",
    fullPage: true,
  });
});
test.afterAll(async () => {
  await db.$disconnect();
});

test("expired challenges do not keep a current streak forever", async ({
  page,
}) => {
  const email = `expired-${Date.now()}@example.com`;
  const user = await db.user.create({
    data: {
      name: "Kiểm Tra",
      email,
      passwordHash: await hashPassword("Test-password-123"),
    },
  });
  await db.goal.create({
    data: {
      userId: user.id,
      title: "Đã kết thúc từ tuần trước",
      category: "reading",
      startLevel: "easy",
      duration: 7,
      challenge: {
        create: {
          userId: user.id,
          startDate: new Date(Date.now() - 10 * 86400000),
          endDate: new Date(Date.now() - 4 * 86400000),
          status: "completed",
          tasks: {
            create: Array.from({ length: 7 }, (_, i) => ({
              dayNumber: i + 1,
              title: "Đọc sách",
              difficulty: "easy",
              status: "completed",
            })),
          },
        },
      },
    },
  });
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill("Test-password-123");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.locator(".stat strong").first()).toHaveText("0 ngày");
});

test("a check-in form from a previous day cannot complete today by mistake", async ({
  page,
}) => {
  const email = `stale-${Date.now()}@example.com`;
  const user = await db.user.create({
    data: {
      name: "Kiểm Tra",
      email,
      passwordHash: await hashPassword("Test-password-123"),
    },
  });
  const goal = await db.goal.create({
    data: {
      userId: user.id,
      title: "Thử đổi ngày",
      category: "reading",
      startLevel: "easy",
      duration: 7,
      challenge: {
        create: {
          userId: user.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 6 * 86400000),
          tasks: {
            create: Array.from({ length: 7 }, (_, i) => ({
              dayNumber: i + 1,
              title: "Đọc sách",
              difficulty: "easy",
            })),
          },
        },
      },
    },
    include: { challenge: true },
  });
  const id = goal.challenge!.id;
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill("Test-password-123");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.goto(`/challenges/${id}/check-in`);
  await page
    .locator('input[name="feeling"][value="medium"]')
    .locator("..")
    .click();
  await page
    .getByLabel("Một vài dòng cho hôm nay")
    .fill("Ghi chú hôm trước cần được giữ lại.");
  await db.challenge.update({
    where: { id },
    data: { startDate: new Date(Date.now() - 86400000) },
  });
  await page.getByRole("button", { name: "Lưu check-in hôm nay" }).click();
  await expect(page.locator(".error-text")).toContainText("ngày đã thay đổi");
  await expect(page.getByLabel("Một vài dòng cho hôm nay")).toHaveValue(
    "Ghi chú hôm trước cần được giữ lại.",
  );
  expect(await db.checkIn.count({ where: { task: { challengeId: id } } })).toBe(
    0,
  );
});

test("duplicate registration preserves the entered name and email", async ({
  page,
}) => {
  const email = `duplicate-${Date.now()}@example.com`;
  await db.user.create({
    data: {
      name: "Tên Ban Đầu",
      email,
      passwordHash: await hashPassword("Test-password-123"),
    },
  });
  await page.goto("/register");
  await page.getByLabel("Tên của bạn").fill("Tên Vừa Nhập");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill("Test-password-123");
  await page
    .getByRole("button", { name: "Tạo tài khoản", exact: true })
    .click();
  await expect(page.locator(".error-text")).toContainText("đã có tài khoản");
  await expect(page.getByLabel("Tên của bạn")).toHaveValue("Tên Vừa Nhập");
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue(email);
});

test("repeated incorrect passwords temporarily limit login attempts", async ({
  page,
}) => {
  const email = `limited-${Date.now()}@example.com`;
  await db.user.create({
    data: {
      name: "Kiểm Tra",
      email,
      passwordHash: await hashPassword("Test-password-123"),
    },
  });
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  for (let i = 0; i < 8; i++) {
    await page.getByLabel("Mật khẩu", { exact: true }).fill("wrong-password");
    await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Đăng nhập", exact: true }),
    ).toBeEnabled();
    await expect(page.locator(".error-text")).toContainText("chưa đúng");
  }
  await page.getByLabel("Mật khẩu", { exact: true }).fill("Test-password-123");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.locator(".error-text")).toContainText("tạm nghỉ");
  await expect(page).toHaveURL(/login/);
  const key = createHash("sha256").update(email).digest("hex");
  await db.loginAttempt.update({
    where: { key },
    data: { resetAt: new Date(Date.now() - 1) },
  });
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page).toHaveURL(/dashboard/);
  expect(await db.loginAttempt.count({ where: { key } })).toBe(0);
});

test("a form without JavaScript never sends credentials in the URL", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://localhost:3100/register");
  await page.getByLabel("Tên của bạn").fill("Kiểm Tra");
  await page.getByLabel("Email", { exact: true }).fill("no-script@example.com");
  await page.getByLabel("Mật khẩu", { exact: true }).fill("Test-password-123");
  const [request] = await Promise.all([
    page.waitForRequest((request) => request.isNavigationRequest()),
    page.getByRole("button", { name: "Tạo tài khoản", exact: true }).click(),
  ]);
  expect(request.method()).toBe("POST");
  expect(new URL(request.url()).search).toBe("");
  await context.close();
});
