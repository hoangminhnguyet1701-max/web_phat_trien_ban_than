import { Logo } from "@/components/ui";
import { Sprout } from "lucide-react";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      <aside className="auth-aside">
        <Logo />
        <div>
          <Sprout size={100} strokeWidth={1} />
          <h2>
            Mỗi bước nhỏ
            <br />
            đều có ý nghĩa.
          </h2>
          <p>
            Không cần vội. Chúng mình sẽ đồng hành
            <br />
            cùng bạn, mỗi ngày một chút.
          </p>
        </div>
        <small>MỖI NGÀY MỘT CHÚT · HÀNH TRÌNH CỦA BẠN</small>
      </aside>
      <main className="auth-main">{children}</main>
    </div>
  );
}
