import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LockKeyhole,
  Circle,
  Flame,
  Trophy,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getChallenge } from "@/lib/data";
import { levelLabels } from "@/lib/challenges";
import { CategoryIcon, Progress } from "@/components/ui";
export default async function Challenge({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checked?: string }>;
}) {
  const { id } = await params;
  const { checked } = await searchParams;
  const user = await requireUser();
  const c = await getChallenge(user.id, id);
  if (!c) notFound();
  const percent = Math.round((c.completed / c.goal.duration) * 100);
  const todayTask = c.tasks.find((t) => t.dayNumber === c.today);
  return (
    <div className="detail">
      <Link href="/dashboard" className="back-link">
        <ArrowLeft size={16} /> Về tổng quan
      </Link>
      {checked && (
        <div className="success celebration" role="status">
          <Check size={20} /> Đã lưu check-in. Cảm ơn bạn đã dành một chút thời
          gian cho chính mình!
        </div>
      )}
      <div className="page-heading">
        <div>
          <span className="section-label">
            HÀNH TRÌNH CỦA BẠN · {c.goal.duration} NGÀY
          </span>
          <h1>{c.goal.title}</h1>
          <p>
            {c.goal.reason ||
              "Một mục tiêu nhỏ hôm nay, một thay đổi đẹp ngày mai."}
          </p>
        </div>
        <span className="icon-box large">
          <CategoryIcon category={c.goal.category} size={34} />
        </span>
      </div>
      <div className="panel challenge-overview">
        <div>
          <span className="muted">Bạn đã hoàn thành</span>
          <h2>
            {c.completed}
            <small> / {c.goal.duration} ngày</small>
          </h2>
          <Progress value={percent} />
          <div className="progress-label">
            <span>Mỗi bước đều có ý nghĩa.</span>
            <b>{percent}%</b>
          </div>
        </div>
        <div className="mini-stat">
          <Flame />
          <strong>{c.currentStreak}</strong>
          <span>ngày liên tiếp</span>
        </div>
        <div className="mini-stat">
          <Trophy />
          <strong>{c.longestStreak}</strong>
          <span>chuỗi dài nhất</span>
        </div>
      </div>
      {c.status === "completed" ? (
        <div className="next-action">
          <div>
            <h3>Một hành trình đã khép lại.</h3>
            <p>Cùng nhìn lại những bước nhỏ bạn đã đi qua nhé.</p>
          </div>
          <Link className="button" href={`/challenges/${id}/summary`}>
            Xem tổng kết <ArrowRight size={18} />
          </Link>
        </div>
      ) : todayTask && !todayTask.checkIn ? (
        <div className="next-action">
          <div>
            <span className="section-label">HÔM NAY · NGÀY {c.today}</span>
            <h3>{todayTask.title}</h3>
          </div>
          <Link className="button" href={`/challenges/${id}/check-in`}>
            Check-in hôm nay <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <p className="success">
          Hôm nay đã được ghi nhận. Hẹn bạn vào ngày mai nhé!
        </p>
      )}
      <div className="block-heading">
        <h2>Từng bước trong hành trình</h2>
        <span className="muted">{c.goal.duration} ngày</span>
      </div>
      <div className="timeline">
        {c.tasks.map((t) => {
          const isToday = t.dayNumber === c.today && c.status === "active";
          const future = t.dayNumber > c.today;
          return (
            <div
              className={`timeline-row panel ${isToday ? "is-today" : ""} ${future ? "future" : ""}`}
              key={t.id}
            >
              <span className={`day-status ${t.status}`}>
                {t.status === "completed" ? (
                  <Check size={21} />
                ) : future ? (
                  <LockKeyhole size={17} />
                ) : (
                  <Circle size={19} />
                )}
              </span>
              <div className="timeline-content">
                <div>
                  <b>Ngày {t.dayNumber}</b>
                  {isToday && <span className="badge">Hôm nay</span>}
                  <span className="muted fine">
                    {levelLabels[t.difficulty]}
                  </span>
                </div>
                <p>{t.title}</p>
                {t.checkIn?.note && (
                  <p className="journal-note">“{t.checkIn.note}”</p>
                )}
              </div>
              <span className="timeline-state">
                {{
                  completed: "Đã hoàn thành",
                  skipped: "Đã ghi nhận",
                  missed: "Đã bỏ lỡ",
                }[t.status] || (future ? "Chưa đến ngày" : "Đang thực hiện")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
