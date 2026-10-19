import { db } from "./db";
import type { Prisma } from "@prisma/client";
import { dayIndex, streaks } from "./challenges";
const include = {
  goal: true,
  tasks: { orderBy: { dayNumber: "asc" }, include: { checkIn: true } },
} satisfies Prisma.ChallengeInclude;

function withProgress(
  challenge: Prisma.ChallengeGetPayload<{ include: typeof include }>,
) {
  const today = dayIndex(challenge.startDate);
  const tasks = challenge.tasks.map((t) => ({
    ...t,
    status: t.status === "pending" && t.dayNumber < today ? "missed" : t.status,
  }));
  const finished =
    today > challenge.goal.duration ||
    (today === challenge.goal.duration && Boolean(tasks[today - 1]?.checkIn));
  const streak = streaks(tasks, today);
  return {
    ...challenge,
    tasks,
    today,
    status: finished ? "completed" : challenge.status,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    completed: tasks.filter((t) => t.status === "completed").length,
  };
}

export async function getChallenge(userId: string, id: string) {
  const challenge = await db.challenge.findFirst({
    where: { id, userId },
    include,
  });
  return challenge ? withProgress(challenge) : null;
}

export async function getChallenges(userId: string) {
  const challenges = await db.challenge.findMany({
    where: { userId },
    include,
    orderBy: { createdAt: "desc" },
  });
  return challenges.map(withProgress);
}
