import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getChallenge } from "@/lib/data";
import { levelLabels } from "@/lib/challenges";
import { CategoryIcon } from "@/components/ui";
import { CheckInForm } from "@/components/forms";
export default async function CheckIn({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const c = await getChallenge(user.id, id);
  if (!c) notFound();
  const task = c.tasks.find((t) => t.dayNumber === c.today);
  return (
    <div className="narrow">
      <Link className="back-link" href={`/challenges/${id}`}>
        <ArrowLeft size={16} /> Về hành trình
      </Link>
      <div className="page-heading">
        <div>
          <span className="section-label">
            NGÀY {Math.min(c.today, c.goal.duration)} / {c.goal.duration}
          </span>
          <h1>Một chút hôm nay của bạn.</h1>
          <p>Dù hôm nay thế nào, cảm ơn bạn vì đã có mặt.</p>
        </div>
      </div>
      {c.status !== "active" || !task || task.checkIn ? (
        <div className="panel empty">
          <h2>
            {c.status === "completed"
              ? "Hành trình này đã kết thúc."
              : "Hôm nay đã được ghi nhận."}
          </h2>
          <p>Trở lại hành trình để xem những bước tiếp theo nhé.</p>
          <Link className="button" href={`/challenges/${id}`}>
            Xem hành trình
          </Link>
        </div>
      ) : (
        <>
          <div className="checkin-task">
            <span className="icon-box">
              <CategoryIcon category={c.goal.category} />
            </span>
            <div>
              <span className="muted fine">
                {c.goal.title} · {levelLabels[task.difficulty]}
              </span>
              <h2>{task.title}</h2>
            </div>
          </div>
          <div className="panel form-panel">
            <CheckInForm id={id} taskId={task.id} />
          </div>
        </>
      )}
    </div>
  );
}
