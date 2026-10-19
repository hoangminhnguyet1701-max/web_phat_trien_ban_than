import { AuthForm } from "@/components/forms";
export default function Register() {
  return (
    <div className="auth-card">
      <span className="section-label">MỘT KHỞI ĐẦU DÀNH CHO BẠN</span>
      <h1>Bắt đầu từ một chút.</h1>
      <p className="muted">Tạo tài khoản để lưu hành trình của riêng bạn.</p>
      <AuthForm mode="register" />
    </div>
  );
}
