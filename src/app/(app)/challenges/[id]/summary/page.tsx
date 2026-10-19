import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Trophy, ArrowRight, Flame, Check, Heart } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getChallenge } from "@/lib/data";
import { levelLabels } from "@/lib/challenges";
export default async function Summary({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const c = await getChallenge(user.id, id);
  if (!c) notFound();
  if (c.status !== "completed") redirect(`/challenges/${id}`);
  const feelings = c.tasks.flatMap((t) =>
    t.checkIn ? [t.checkIn.feeling] : [],
  );
  const average = feelings.length
    ? levelLabels[
        ["easy", "medium", "hard"][
          Math.round(
            feelings.reduce(
              (s, f) => s + ["easy", "medium", "hard"].indexOf(f),
              0,
            ) / feelings.length,
          )
        ]
      ]
    : "Chưa có";
  return (
    <div className="summary">
      <span className="trophy-circle">
        <Trophy size={50} strokeWidth={1.3} />
      </span>
      <span className="section-label">MỖI BƯỚC NHỎ ĐỀU ĐÁNG TỰ HÀO</span>
      <h1>Bạn đã đi được một hành trình.</h1>
      <p>{c.goal.title}</p>
      <div className="stats-grid">
        <div className="panel mini-stat">
          <Check />
          <strong>
            {c.completed}/{c.goal.duration}
          </strong>
          <span>ngày hoàn thành</span>
        </div>
        <div className="panel mini-stat">
          <Flame />
          <strong>{c.longestStreak} ngày</strong>
          <span>chuỗi dài nhất</span>
        </div>
        <div className="panel mini-stat">
          <Heart />
          <strong>{average}</strong>
          <span>cảm nhận trung bình</span>
        </div>
      </div>
      <div className="panel summary-message">
        <h2>
          {c.completed > 0
            ? "Những cố gắng nhỏ của bạn đã được ghi nhớ."
            : "Một khởi đầu mới vẫn luôn chờ bạn."}
        </h2>
        <p>
          {c.completed > 0
            ? `Bạn đã dành ${c.completed} ngày để chăm sóc mục tiêu của mình. Điều đó có ý nghĩa, dù hành trình có trọn vẹn hay không.`
            : "Đôi khi chúng mình cần một nhịp khác. Hãy thử một hành trình 7 ngày với mức độ nhẹ nhàng hơn nhé."}
        </p>
        <h3>Một gợi ý cho hành trình tiếp theo</h3>
        <p>
          {c.completed / c.goal.duration >= 0.7
            ? "Bạn đang có một nền tảng tốt. Thử tiếp tục với hành trình 21 hoặc 30 ngày và giữ mức độ vừa sức."
            : "Thử hành trình 7 ngày ở mức nhẹ nhàng để tìm lại nhịp phù hợp với mình."}
        </p>
        <Link href="/goals/new" className="button">
          Gieo một mục tiêu mới <ArrowRight size={18} />
        </Link>
      </div>
      <Link className="text-link" href="/dashboard">
        Về tổng quan <ArrowRight size={17} />
      </Link>
    </div>
  );
}
