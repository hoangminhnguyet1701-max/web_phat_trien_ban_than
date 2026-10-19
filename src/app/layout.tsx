import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Mỗi Ngày Một Chút · Thay đổi từ những điều nhỏ",
    template: "%s | Mỗi Ngày Một Chút",
  },
  description:
    "Biến mục tiêu lớn thành những bước nhỏ mỗi ngày. Xây dựng thói quen theo nhịp của riêng bạn.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
