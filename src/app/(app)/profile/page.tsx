import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getChallenges } from "@/lib/data";
import { CategoryIcon, Empty, Progress } from "@/components/ui";
export default async function Profile() {
  const user = await requireUser();
  const challenges = await getChallenges(user.id);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="section-label">GÓC NHỎ CỦA BẠN</span>
          <h1>Một phiên bản đang lớn lên.</h1>
          <p>Tất cả những bước nhỏ của bạn đều được giữ ở đây.</p>
        </div>
      </div>
      <div className="panel profile-card">
        <span className="avatar big">{user.name.charAt(0).toUpperCase()}</span>
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <small>
            <CalendarDays size={15} /> Đồng hành từ{" "}
            {user.createdAt.toLocaleDateString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
            })}
          </small>
        </div>
        <div className="profile-total">
          <strong>{challenges.reduce((s, c) => s + c.completed, 0)}</strong>
          <span>bước nhỏ đã thực hiện</span>
        </div>
      </div>
      <div className="block-heading">
        <h2>Lịch sử hành trình</h2>
        <span className="muted">{challenges.length} thử thách</span>
      </div>
      {!challenges.length ? (
        <Empty />
      ) : (
        <div className="journey-grid">
          {challenges.map((c) => (
            <Link
              className="panel journey-card"
              key={c.id}
              href={`/challenges/${c.id}${c.status === "completed" ? "/summary" : ""}`}
            >
              <div className="task-top">
                <span className="icon-box">
                  <CategoryIcon category={c.goal.category} />
                </span>
                <span className="badge">
                  {c.status === "completed" ? "Đã kết thúc" : "Đang tiếp tục"}
                </span>
                <ArrowUpRight size={18} />
              </div>
              <h3>{c.goal.title}</h3>
              <p>
                {c.completed}/{c.goal.duration} ngày hoàn thành · Chuỗi dài
                nhất: {c.longestStreak}
              </p>
              <Progress
                value={Math.round((c.completed / c.goal.duration) * 100)}
              />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
