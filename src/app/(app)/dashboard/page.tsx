import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Flame,
  Check,
  Target,
  Plus,
  Sprout,
  CalendarDays,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getChallenges } from "@/lib/data";
import { categories, levelLabels, type Category } from "@/lib/challenges";
import { CategoryIcon, Empty, Progress } from "@/components/ui";
export default async function Dashboard() {
  const user = await requireUser();
  const challenges = await getChallenges(user.id);
  const active = challenges.filter((c) => c.status === "active");
  const completed = challenges.reduce((sum, c) => sum + c.completed, 0);
  const streak = Math.max(0, ...challenges.map((c) => c.currentStreak));
  const tasks = active
    .map((c) => ({
      challenge: c,
      task: c.tasks.find((t) => t.dayNumber === c.today),
    }))
    .filter((c) => c.task);
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">HÀNH TRÌNH NHỎ, THAY ĐỔI LỚN</div>
          <h1>
            Chào {user.name.split(" ").at(-1)},
            <span className="wave"> một ngày thật nhẹ nhé.</span>
          </h1>
          <p>Hôm nay không cần làm thật nhiều. Chỉ cần tiến thêm một chút.</p>
        </div>
        <Link
          href="/goals/new"
          className="button"
          aria-label="Tạo mục tiêu mới"
        >
          <Plus size={18} /> Mục tiêu mới
        </Link>
      </div>
      <div className="welcome-banner">
        <div>
          <span className="badge">MỖI NGÀY LÀ MỘT KHỞI ĐẦU</span>
          <h2>
            Bạn đang gieo những
            <br />
            thói quen tốt cho chính mình.
          </h2>
          <p>Mỗi bước nhỏ hôm nay đều đang tạo nên một bạn tốt hơn.</p>
          <a href="#hom-nay" className="text-link">
            Cùng làm một chút hôm nay <ArrowRight size={17} />
          </a>
        </div>
        <div className="banner-plant">
          <Sprout size={145} strokeWidth={0.9} />
          <span />
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat panel">
          <span className="stat-icon warm">
            <Flame />
          </span>
          <div>
            <span>Chuỗi ngày liên tiếp</span>
            <strong>
              {streak} <small>ngày</small>
            </strong>
            <p>Tiếp tục giữ nhịp của bạn nhé</p>
          </div>
        </div>
        <div className="stat panel">
          <span className="stat-icon">
            <Check />
          </span>
          <div>
            <span>Những bước đã hoàn thành</span>
            <strong>
              {completed} <small>nhiệm vụ</small>
            </strong>
            <p>Mỗi bước đều đáng tự hào</p>
          </div>
        </div>
        <div className="stat panel">
          <span className="stat-icon lavender">
            <Target />
          </span>
          <div>
            <span>Hành trình đang tiếp tục</span>
            <strong>
              {active.length} <small>thử thách</small>
            </strong>
            <p>Dành thời gian cho điều bạn muốn</p>
          </div>
        </div>
      </div>
      <div className="dashboard-grid">
        <section id="hom-nay">
          <div className="block-heading">
            <h2>
              Một chút cho hôm nay <span className="count">{tasks.length}</span>
            </h2>
            <CalendarDays size={20} />
          </div>
          {tasks.length ? (
            <div className="task-list">
              {tasks.map(
                ({ challenge: c, task: t }) =>
                  t && (
                    <article
                      className={`panel today-task ${t.checkIn ? "done" : ""}`}
                      key={c.id}
                    >
                      <div className="task-top">
                        <span className={`icon-box ${c.goal.category}`}>
                          <CategoryIcon category={c.goal.category} />
                        </span>
                        <span className="muted">
                          {categories[c.goal.category as Category]?.label}
                        </span>
                        <span className="badge">
                          Ngày {c.today}/{c.goal.duration}
                        </span>
                      </div>
                      <h3>{t.title}</h3>
                      <div className="task-meta">
                        <span>{levelLabels[t.difficulty]}</span>
                        <span>•</span>
                        <span>Một bước nhỏ cho “{c.goal.title}”</span>
                      </div>
                      <div className="task-bottom">
                        {t.checkIn ? (
                          <>
                            <span className="completed-label">
                              <Check size={17} />{" "}
                              {t.checkIn.completed
                                ? "Bạn đã làm rất tốt hôm nay"
                                : "Đã ghi nhận. Ngày mai mình tiếp tục nhé"}
                            </span>
                            <Link
                              href={`/challenges/${c.id}`}
                              className="text-link"
                            >
                              Xem hành trình <ArrowRight size={17} />
                            </Link>
                          </>
                        ) : (
                          <>
                            <span className="muted fine">
                              Dành một chút thời gian cho mình nhé
                            </span>
                            <Link
                              href={`/challenges/${c.id}/check-in`}
                              className="button small"
                            >
                              Check-in hôm nay <ArrowRight size={17} />
                            </Link>
                          </>
                        )}
                      </div>
                    </article>
                  ),
              )}
            </div>
          ) : (
            <div className="panel quiet-empty">
              <Sprout size={33} />
              <h3>Hôm nay là một khởi đầu mới.</h3>
              <p>Tạo một mục tiêu nhỏ để nhận nhiệm vụ đầu tiên.</p>
              <Link className="text-link" href="/goals/new">
                Bắt đầu thôi <ArrowRight size={17} />
              </Link>
            </div>
          )}
        </section>
        <aside className="encouragement panel">
          <span className="section-label">MỘT LỜI NHẮN NHỎ</span>
          <span className="quote-mark">“</span>
          <h3>
            Bạn không cần nhìn thấy
            <br />
            cả cầu thang.
            <br />
            Chỉ cần bước lên
            <br />
            bậc đầu tiên.
          </h3>
          <p>
            Mỗi ngày, một chút kiên trì.
            <br />
            Mỗi chút, một thay đổi.
          </p>
          <LeafDecoration />
        </aside>
      </div>
      <section id="hanh-trinh" className="journeys">
        <div className="block-heading">
          <h2>Hành trình của bạn</h2>
          <span className="muted">{challenges.length} thử thách</span>
        </div>
        {challenges.length === 0 ? (
          <Empty />
        ) : (
          <div className="journey-grid">
            {challenges.map((c) => (
              <Link
                href={`/challenges/${c.id}${c.status === "completed" ? "/summary" : ""}`}
                className="panel journey-card"
                key={c.id}
              >
                <div className="task-top">
                  <span className={`icon-box ${c.goal.category}`}>
                    <CategoryIcon category={c.goal.category} />
                  </span>
                  <span
                    className={`badge ${c.status === "completed" ? "finished" : ""}`}
                  >
                    {c.status === "completed" ? "Đã kết thúc" : "Đang lớn lên"}
                  </span>
                  <ArrowUpRight size={19} />
                </div>
                <h3>{c.goal.title}</h3>
                <p>{c.goal.duration} ngày dành cho phiên bản tốt hơn của bạn</p>
                <div className="progress-label">
                  <span>
                    {c.completed}/{c.goal.duration} ngày hoàn thành
                  </span>
                  <b>{Math.round((c.completed / c.goal.duration) * 100)}%</b>
                </div>
                <Progress
                  value={Math.round((c.completed / c.goal.duration) * 100)}
                />
                <div className="journey-bottom">
                  <span>
                    <Flame size={16} /> {c.currentStreak} ngày liên tiếp
                  </span>
                  <span>
                    {c.status === "completed"
                      ? "Xem tổng kết"
                      : `Ngày ${c.today}`}{" "}
                    <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
function LeafDecoration() {
  return <Sprout className="quote-leaf" size={85} strokeWidth={0.8} />;
}
