"use server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import {
  categories,
  levels,
  taskTitle,
  dayIndex,
  nextLevel,
  streaks,
  type Level,
} from "@/lib/challenges";
export type FormState = {
  error?: string;
  success?: boolean;
  destination?: string;
};
class CheckInError extends Error {}
export async function register(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") ?? "");
  if (
    !name ||
    name.length > 80 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    password.length < 8 ||
    password.length > 128
  )
    return {
      error: "Vui lòng nhập tên, email hợp lệ và mật khẩu từ 8 đến 128 ký tự.",
    };
  try {
    await db.user.create({
      data: { name, email, passwordHash: await hashPassword(password) },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return { error: "Email này đã có tài khoản. Bạn có thể đăng nhập." };
    return { error: "Chưa thể tạo tài khoản. Vui lòng thử lại." };
  }
  return { success: true };
}
export async function createGoal(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const title = String(form.get("title") ?? "").trim();
  const category = String(form.get("category") ?? "");
  const duration = Number(form.get("duration"));
  const startLevel = String(form.get("startLevel") ?? "");
  const reason = String(form.get("reason") ?? "").trim();
  if (
    !title ||
    title.length > 160 ||
    !Object.hasOwn(categories, category) ||
    ![7, 14, 21, 30].includes(duration) ||
    !levels.includes(startLevel as Level) ||
    reason.length > 1000
  )
    return { error: "Bạn hãy kiểm tra lại mục tiêu và các lựa chọn nhé." };
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + (duration - 1) * 86400000);
  let goal;
  try {
    goal = await db.goal.create({
      data: {
        title,
        category,
        duration,
        startLevel,
        reason,
        userId: user.id,
        challenge: {
          create: {
            userId: user.id,
            startDate,
            endDate,
            tasks: {
              create: Array.from({ length: duration }, (_, i) => ({
                dayNumber: i + 1,
                title: taskTitle(category, startLevel, i + 1),
                difficulty: startLevel,
              })),
            },
          },
        },
      },
      include: { challenge: true },
    });
  } catch {
    return {
      error:
        "Chưa thể tạo mục tiêu. Nội dung vẫn được giữ lại, bạn thử lại nhé.",
    };
  }
  return { destination: `/challenges/${goal.challenge!.id}` };
}
export async function checkIn(
  id: string,
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const feeling = String(form.get("feeling") ?? "");
  const completed = form.get("completed") === "yes";
  const note = String(form.get("note") ?? "").trim();
  if (
    !levels.includes(feeling as Level) ||
    !["yes", "no"].includes(String(form.get("completed"))) ||
    note.length > 2000
  )
    return {
      error:
        "Hãy chọn trạng thái và cảm nhận của bạn. Ghi chú tối đa 2.000 ký tự.",
    };
  try {
    await db.$transaction(async (tx) => {
      const challenge = await tx.challenge.findFirst({
        where: { id, userId: user.id },
        include: { goal: true, tasks: { orderBy: { dayNumber: "asc" } } },
      });
      if (!challenge) throw new CheckInError("Không tìm thấy thử thách.");
      const today = dayIndex(challenge.startDate);
      const task = challenge.tasks.find((t) => t.dayNumber === today);
      if (task && task.id !== form.get("taskId"))
        throw new CheckInError(
          "Mốc ngày đã thay đổi. Hãy tải lại nhiệm vụ hôm nay trước khi check-in nhé.",
        );
      if (challenge.status !== "active" || !task || task.status !== "pending")
        throw new CheckInError(
          "Nhiệm vụ hôm nay đã được ghi nhận hoặc thử thách đã kết thúc.",
        );
      await tx.dailyTask.updateMany({
        where: { challengeId: id, dayNumber: { lt: today }, status: "pending" },
        data: { status: "missed" },
      });
      await tx.dailyTask.update({
        where: { id: task.id },
        data: {
          status: completed ? "completed" : "skipped",
          checkIn: { create: { completed, feeling, note } },
        },
      });
      const level = nextLevel(task.difficulty, feeling);
      for (const future of challenge.tasks.filter(
        (t) => t.dayNumber > today && t.status === "pending",
      ))
        await tx.dailyTask.update({
          where: { id: future.id },
          data: {
            difficulty: level,
            title: taskTitle(challenge.goal.category, level, future.dayNumber),
          },
        });
      const updated = challenge.tasks.map((t) => ({
        ...t,
        status:
          t.id === task.id ? (completed ? "completed" : "skipped") : t.status,
      }));
      const streak = streaks(updated, today);
      await tx.challenge.update({
        where: { id },
        data: {
          currentStreak: streak.current,
          longestStreak: streak.longest,
          status: today === challenge.goal.duration ? "completed" : "active",
        },
      });
    });
  } catch (error) {
    return {
      error:
        error instanceof CheckInError
          ? error.message
          : "Chưa thể lưu check-in. Hãy tải lại trang và thử lại.",
    };
  }
  return { destination: `/challenges/${id}?checked=1` };
}
