import Link from "next/link";
import {
  Sprout,
  Smartphone,
  BookOpen,
  Activity,
  Wallet,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
export function Logo() {
  return (
    <Link href="/" className="logo">
      <span className="logo-icon">
        <Sprout size={25} />
      </span>
      <span>
        Mỗi Ngày
        <br />
        <b>Một Chút.</b>
      </span>
    </Link>
  );
}
export function CategoryIcon({
  category,
  size = 22,
}: {
  category: string;
  size?: number;
}) {
  const Icon =
    {
      phone: Smartphone,
      reading: BookOpen,
      exercise: Activity,
      saving: Wallet,
      other: Sparkles,
    }[category] ?? Sparkles;
  return <Icon size={size} />;
}
export function Progress({ value }: { value: number }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Tiến độ thử thách"
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
export function Empty() {
  return (
    <div className="empty panel">
      <span className="icon-box">
        <Sprout size={32} />
      </span>
      <h2>Một khởi đầu nhỏ, dành riêng cho bạn.</h2>
      <p>
        Chọn điều bạn muốn cải thiện. Chúng mình sẽ chia thành từng bước vừa
        sức.
      </p>
      <Link className="button" href="/goals/new">
        Tạo mục tiêu đầu tiên <ArrowUpRight size={18} />
      </Link>
    </div>
  );
}
