# Hướng dẫn xây dựng Web App: Mỗi Ngày Một Chút

> File này dùng để đưa cho **Codex / Cursor / Claude / GPT / v0** để xây dựng sản phẩm.
> Copy toàn bộ nội dung bên dưới và paste vào AI coding tool.

---

## 1. Tổng quan sản phẩm

**Tên sản phẩm:** Mỗi Ngày Một Chút

**Mô tả ngắn:**  
Ứng dụng giúp người dùng biến một mục tiêu cá nhân lớn thành các thử thách nhỏ theo từng ngày (7 / 14 / 21 / 30 ngày). Hệ thống tạo lộ trình cá nhân hóa, người dùng check-in mỗi ngày và đánh giá mức độ khó. Dựa trên phản hồi, hệ thống tự động điều chỉnh độ khó của các ngày tiếp theo.

**Triết lý:**  
“Mỗi ngày không cần thay đổi thật nhiều, chỉ cần tiến bộ một chút.”

**Đối tượng người dùng:**  
Người muốn cải thiện thói quen (giảm dùng điện thoại, đọc sách, tập luyện, tiết kiệm tiền…) nhưng thường bỏ cuộc vì mục tiêu quá lớn hoặc không có lộ trình cụ thể.

---

## 2. Các chức năng chính (MVP)

1. Người dùng đăng ký / đăng nhập.
2. Tạo mục tiêu mới:
   - Nhập nội dung mục tiêu
   - Chọn nhóm mục tiêu
   - Chọn thời gian (7 / 14 / 21 / 30 ngày)
   - Chọn mức độ bắt đầu (Dễ / Trung bình / Khó)
3. Hệ thống sinh ra danh sách nhiệm vụ từng ngày.
4. Mỗi ngày người dùng xem nhiệm vụ và check-in:
   - Đã hoàn thành / Chưa hoàn thành
   - Đánh giá: Dễ / Vừa sức / Khó
   - Ghi chú (tùy chọn)
5. Hệ thống ghi nhận streak và điều chỉnh độ khó các ngày sau dựa trên phản hồi.
6. Khi kết thúc thử thách → trang tổng kết + gợi ý thử thách tiếp theo.
7. Dashboard theo dõi tiến độ hiện tại.

---

## 3. Các trang cần xây dựng

### 3.1. Public
- **Landing Page** (`/`)
  - Hero section rõ ràng
  - Giải thích cách hoạt động (3 bước)
  - Lợi ích chính
  - Nút “Bắt đầu ngay”
  - Footer đơn giản

### 3.2. Authentication
- Đăng ký (`/register`)
- Đăng nhập (`/login`)
- (Ưu tiên hỗ trợ Email + Google nếu dùng Supabase/Clerk)

### 3.3. App (cần đăng nhập)
- **Dashboard** (`/dashboard`)
  - Thử thách đang chạy
  - Nhiệm vụ hôm nay + nút check-in
  - Streak hiện tại
  - Progress bar tổng thể
  - Nút “Tạo mục tiêu mới”

- **Tạo mục tiêu** (`/goals/new`)
  - Form: nội dung mục tiêu, nhóm, thời gian, mức độ bắt đầu, lý do (optional)

- **Chi tiết thử thách** (`/challenges/[id]`)
  - Danh sách tất cả các ngày
  - Trạng thái từng ngày (chưa đến / đang làm / đã xong / bỏ lỡ)
  - Nút xem nhiệm vụ ngày hôm nay

- **Check-in ngày** (`/challenges/[id]/check-in`)
  - Hiển thị nhiệm vụ hôm nay
  - Form check-in (hoàn thành + đánh giá độ khó + ghi chú)

- **Tổng kết** (`/challenges/[id]/summary`)
  - Thống kê: số ngày hoàn thành, streak dài nhất, cảm nhận trung bình
  - Gợi ý thử thách tiếp theo

- **Hồ sơ** (`/profile`)
  - Thông tin cơ bản + lịch sử các thử thách đã làm

---

## 4. Data Model (Prisma schema gợi ý)

```prisma
model User {
  id            String     @id @default(cuid())
  name          String?
  email         String     @unique
  image         String?
  createdAt     DateTime   @default(now())
  goals         Goal[]
  challenges    Challenge[]
}

model Goal {
  id            String     @id @default(cuid())
  userId        String
  user          User       @relation(fields: [userId], references: [id])
  title         String     // "Tôi muốn dùng điện thoại ít hơn"
  category      String     // "phone" | "reading" | "exercise" | "saving" | "other"
  reason        String?
  startLevel    String     // "easy" | "medium" | "hard"
  duration      Int        // 7 | 14 | 21 | 30
  createdAt     DateTime   @default(now())
  challenge     Challenge?
}

model Challenge {
  id            String     @id @default(cuid())
  userId        String
  user          User       @relation(fields: [userId], references: [id])
  goalId        String     @unique
  goal          Goal       @relation(fields: [goalId], references: [id])
  startDate     DateTime
  endDate       DateTime
  status        String     // "active" | "completed" | "abandoned"
  currentStreak Int        @default(0)
  longestStreak Int        @default(0)
  tasks         DailyTask[]
  createdAt     DateTime   @default(now())
}

model DailyTask {
  id            String     @id @default(cuid())
  challengeId   String
  challenge     Challenge  @relation(fields: [challengeId], references: [id])
  dayNumber     Int        // 1, 2, 3...
  title         String     // Nội dung nhiệm vụ
  difficulty    String     // "easy" | "medium" | "hard"
  status        String     // "pending" | "completed" | "skipped" | "missed"
  checkIn       CheckIn?
}

model CheckIn {
  id            String     @id @default(cuid())
  taskId        String     @unique
  task          DailyTask  @relation(fields: [taskId], references: [id])
  completed     Boolean
  feeling       String?    // "easy" | "medium" | "hard"
  note          String?
  createdAt     DateTime   @default(now())
}
```

---

## 5. Logic điều chỉnh độ khó

Khi người dùng check-in:

- Nếu đánh giá **Khó** → ngày tiếp theo giảm 1 cấp độ khó (hard → medium → easy).
- Nếu đánh giá **Dễ** → ngày tiếp theo tăng 1 cấp độ khó.
- Nếu đánh giá **Vừa sức** → giữ nguyên.
- Có thể quy định: sau 2 lần “Khó” liên tiếp thì giảm mạnh hơn, hoặc sau 3 lần “Dễ” thì tăng.

Ví dụ nhiệm vụ mẫu (nhóm “phone”):

| Ngày | Mức độ   | Nội dung nhiệm vụ                                      |
|------|----------|--------------------------------------------------------|
| 1    | easy     | Không dùng điện thoại 15 phút trước khi ngủ            |
| 2    | easy     | Không mở mạng xã hội 20 phút trước khi ngủ             |
| 3    | medium   | Đặt điện thoại xa giường khi ngủ                       |
| 4    | medium   | Thay 20 phút lướt điện thoại bằng đọc sách / nghe nhạc |
| 5    | hard     | Không dùng điện thoại 45 phút trước khi ngủ            |

(Có thể hard-code 5–10 mẫu nhiệm vụ cho mỗi nhóm ở giai đoạn MVP).

---

## 6. Yêu cầu kỹ thuật

### Tech Stack đề xuất (ưu tiên)
- **Framework:** Next.js 14/15 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Prisma + SQLite (dev) hoặc PostgreSQL (prod)
- **Auth:** NextAuth.js hoặc Clerk hoặc Supabase Auth
- **State:** React Server Components + Server Actions (ưu tiên)
- **Deploy:** Vercel

### Yêu cầu khác
- Responsive tốt trên mobile (ưu tiên mobile-first).
- Giao diện sạch, nhẹ nhàng, tông màu: xanh lá nhạt / be / trắng / xám nhẹ.
- Font chữ dễ đọc (Inter hoặc Geist).
- Có loading state và empty state rõ ràng.
- Animation nhẹ khi hoàn thành nhiệm vụ (framer-motion hoặc CSS).
- Toàn bộ nội dung giao diện bằng **tiếng Việt**.

---

## 7. Thứ tự triển khai đề xuất (cho AI)

Làm theo thứ tự sau:

1. Khởi tạo project Next.js + Tailwind + shadcn/ui + Prisma.
2. Tạo schema Prisma và migrate.
3. Xây dựng Landing Page.
4. Xây dựng Auth (đăng ký / đăng nhập).
5. Tạo trang Dashboard (mock data trước).
6. Tạo form “Tạo mục tiêu mới”.
7. Logic sinh nhiệm vụ hàng ngày (hard-code mẫu theo category).
8. Màn hình Check-in + lưu CheckIn.
9. Logic cập nhật streak + điều chỉnh difficulty.
10. Trang chi tiết thử thách + trang tổng kết.
11. Trang Profile.
12. Polish UI + responsive + empty states.

---

## 8. Phong cách viết & UX

- Giọng văn **động viên, gần gũi, không áp lực**.
- Tránh dùng từ ngữ quá nghiêm khắc (“Bạn phải…”, “Thất bại…”).
- Dùng câu kiểu: “Hôm nay chỉ cần làm một chút thôi”, “Bạn đang tiến bộ rất tốt”.
- Khi người dùng bỏ lỡ ngày → khuyến khích nhẹ nhàng, không phạt nặng.
- Progress bar và streak phải nổi bật.

---

## 9. Acceptance Criteria (MVP hoàn thành khi)

- [ ] Người dùng có thể đăng ký / đăng nhập.
- [ ] Tạo được mục tiêu và sinh ra danh sách nhiệm vụ.
- [ ] Check-in được nhiệm vụ hôm nay và lưu cảm nhận.
- [ ] Streak được cập nhật đúng.
- [ ] Dashboard hiển thị đúng trạng thái hiện tại.
- [ ] Có trang tổng kết khi kết thúc thử thách.
- [ ] Giao diện tiếng Việt, responsive trên mobile.
- [ ] Code sạch, có TypeScript, dễ mở rộng.

---

## 10. Ghi chú cho AI

- Ưu tiên **UI đẹp và rõ ràng** trước, logic phức tạp để sau.
- Dùng mock data ở giai đoạn đầu nếu cần.
- Viết comment rõ ràng bằng tiếng Anh hoặc tiếng Việt.
- Tách component hợp lý (Button, Card, Progress, TaskItem…).
- Không cần làm tính năng AI generate nhiệm vụ ở giai đoạn MVP (hard-code là đủ).
- Nếu dùng shadcn/ui thì tận dụng các component có sẵn.

---

**Bắt đầu xây dựng từ bước 1.**  
Nếu cần làm rõ bất kỳ phần nào, hãy hỏi trước khi code.