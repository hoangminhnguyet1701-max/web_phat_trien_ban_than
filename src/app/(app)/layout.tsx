import Link from "next/link";
import { Plus, Leaf } from "lucide-react";
import { Logo } from "@/components/ui";
import { Logout } from "@/components/forms";
import { requireUser } from "@/lib/auth";
import { SidebarNav } from "@/components/sidebar-nav";
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo />
        <span className="nav-caption">KHÔNG GIAN CỦA BẠN</span>
        <SidebarNav />
        <Link href="/goals/new" className="button">
          <Plus size={18} /> Tạo mục tiêu mới
        </Link>
        <div className="sidebar-quote">
          <Leaf size={27} />
          <p>
            “Chỉ cần tốt hơn
            <br />
            chính mình hôm qua
            <br />
            một chút thôi.”
          </p>
          <span>CỨ TỪ TỪ, BẠN NHÉ.</span>
        </div>
        <div className="sidebar-user">
          <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
          <div>
            <strong>{user.name}</strong>
            <small>Đang lớn lên mỗi ngày</small>
          </div>
        </div>
        <Logout />
      </aside>
      <div className="app-body">
        <header className="app-topbar">
          <span>Một ngày mới, một cơ hội nhỏ 🌿</span>
          <div>
            <span className="today-label">
              {new Intl.DateTimeFormat("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(new Date())}
            </span>
            <Link className="avatar" href="/profile" aria-label="Hồ sơ cá nhân">
              {user.name.charAt(0).toUpperCase()}
            </Link>
          </div>
        </header>
        <main className="app-main">{children}</main>
        <footer className="app-footer">
          Mỗi Ngày Một Chút <span>Tiến bộ theo nhịp của riêng bạn.</span>
        </footer>
      </div>
    </div>
  );
}
