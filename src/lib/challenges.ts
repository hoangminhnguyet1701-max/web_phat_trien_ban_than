export const categories = {
  phone: {
    label: "Bớt dùng điện thoại",
    icon: "phone",
    unit: "phút",
    amounts: [15, 25, 45],
    tasks: [
      "Đặt điện thoại sang một bên trước khi ngủ trong",
      "Dành thời gian không mở mạng xã hội trong",
      "Bật chế độ tập trung và tận hưởng khoảng nghỉ trong",
      "Thay việc lướt điện thoại bằng đi dạo hoặc nghe nhạc trong",
      "Để điện thoại xa tầm tay khi bắt đầu buổi sáng trong",
    ],
  },
  reading: {
    label: "Đọc sách mỗi ngày",
    icon: "book",
    unit: "phút",
    amounts: [5, 15, 30],
    tasks: [
      "Chọn một cuốn sách và đọc trong",
      "Tìm một góc yên tĩnh và đọc sách trong",
      "Đọc tiếp cuốn sách yêu thích trong",
      "Dành thời gian đọc và ghi lại một ý hay trong",
      "Thử đọc một chương mới trong",
    ],
  },
  exercise: {
    label: "Vận động nhẹ nhàng",
    icon: "activity",
    unit: "phút",
    amounts: [5, 15, 30],
    tasks: [
      "Đi bộ nhẹ nhàng trong",
      "Giãn cơ và hít thở chậm trong",
      "Vận động theo cách bạn thích trong",
      "Bước ra ngoài và đi dạo trong",
      "Tập một bài vận động phù hợp trong",
    ],
  },
  saving: {
    label: "Tiết kiệm một chút",
    icon: "wallet",
    unit: "đồng",
    amounts: [10000, 30000, 50000],
    tasks: [
      "Bỏ vào quỹ tiết kiệm của bạn",
      "Chọn một khoản chi có thể bỏ qua và để dành",
      "Tự chuẩn bị đồ uống và tiết kiệm",
      "Ghi lại chi tiêu rồi chuyển vào quỹ",
      "Dành một khoản cho mục tiêu tương lai:",
    ],
  },
  other: {
    label: "Mục tiêu của riêng bạn",
    icon: "sparkles",
    unit: "phút",
    amounts: [5, 15, 25],
    tasks: [
      "Thực hiện một bước nhỏ cho mục tiêu trong",
      "Tập trung vào mục tiêu của bạn trong",
      "Dành một khoảng thời gian không bị gián đoạn trong",
      "Tiếp tục điều bạn đã bắt đầu trong",
      "Thực hành và ghi lại điều bạn học được trong",
    ],
  },
} as const;
export type Category = keyof typeof categories;
export const levels = ["easy", "medium", "hard"] as const;
export type Level = (typeof levels)[number];
export const levelLabels: Record<string, string> = {
  easy: "Dễ",
  medium: "Vừa sức",
  hard: "Khó",
};
export function nextLevel(level: string, feeling: string): Level {
  const index = Math.max(0, levels.indexOf(level as Level));
  return levels[
    Math.min(
      2,
      Math.max(
        0,
        index + (feeling === "easy" ? 1 : feeling === "hard" ? -1 : 0),
      ),
    )
  ];
}
export function taskTitle(category: string, level: string, day: number) {
  const group = categories[category as Category] ?? categories.other;
  const amount = group.amounts[Math.max(0, levels.indexOf(level as Level))];
  return `${group.tasks[(day - 1) % group.tasks.length]} ${amount.toLocaleString("vi-VN")} ${group.unit}.`;
}
// Calendar days follow Vietnam time, independent of the server's timezone.
export function dayKey(date: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export function dayIndex(startDate: Date, now: Date = new Date()) {
  return (
    Math.round(
      (Date.parse(dayKey(now)) - Date.parse(dayKey(startDate))) / 86400000,
    ) + 1
  );
}
export function streaks(
  tasks: { dayNumber: number; status: string }[],
  today: number,
) {
  let longest = 0,
    run = 0;
  for (const task of tasks) {
    run = task.status === "completed" ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  const todayTask = tasks.find((t) => t.dayNumber === today);
  let cursor = !todayTask || todayTask.status === "pending" ? today - 1 : today;
  let current = 0;
  while (
    cursor > 0 &&
    tasks.find((t) => t.dayNumber === cursor)?.status === "completed"
  ) {
    current++;
    cursor--;
  }
  return { current, longest };
}
