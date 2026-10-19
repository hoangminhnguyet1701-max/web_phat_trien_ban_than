import { GoalForm } from "@/components/forms";
import { Sprout, ArrowLeft } from "lucide-react";
import Link from "next/link";
export default function NewGoal() {
  return (
    <div className="narrow">
      <Link href="/dashboard" className="back-link">
        <ArrowLeft size={16} /> Về tổng quan
      </Link>
      <div className="page-heading">
        <div>
          <span className="section-label">GIEO MỘT HẠT GIỐNG MỚI</span>
          <h1>Bạn muốn bắt đầu điều gì?</h1>
          <p>
            Chúng mình sẽ chia mục tiêu của bạn thành những bước nhỏ mỗi ngày.
          </p>
        </div>
        <Sprout size={46} strokeWidth={1} />
      </div>
      <div className="panel form-panel">
        <GoalForm />
      </div>
    </div>
  );
}
