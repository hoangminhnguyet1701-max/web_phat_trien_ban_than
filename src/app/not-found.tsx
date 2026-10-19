import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty">
      <h1>Chưa tìm thấy hành trình này.</h1>
      <p>Có thể đường dẫn chưa đúng hoặc thử thách thuộc tài khoản khác.</p>
      <Link className="button" href="/dashboard">
        Về tổng quan
      </Link>
    </div>
  );
}
