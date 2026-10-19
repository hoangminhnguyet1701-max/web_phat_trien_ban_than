import { AuthForm } from "@/components/forms";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const { registered } = await searchParams;
  return (
    <div className="auth-card">
      <span className="section-label">CHÀO MỪNG BẠN TRỞ LẠI</span>
      <h1>Tiếp tục một chút nhé.</h1>
      <p className="muted">Hành trình của bạn vẫn đang chờ ở đây.</p>
      {registered && (
        <p className="success" role="status">
          Tài khoản đã sẵn sàng. Hãy đăng nhập để bắt đầu nhé!
        </p>
      )}
      <AuthForm mode="login" />
    </div>
  );
}
