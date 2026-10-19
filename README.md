# Mỗi Ngày Một Chút

Ứng dụng tiếng Việt giúp chia mục tiêu thành nhiệm vụ nhỏ hằng ngày. Next.js 15 App Router, TypeScript, Prisma/SQLite và NextAuth (email/mật khẩu). Giao diện CSS responsive, không cần dịch vụ trả phí hoặc API AI.

## Chạy cục bộ

Yêu cầu Node.js 22 trở lên.

```powershell
npm install
npm run setup
npm run dev
```

Mở http://localhost:3000. Đăng ký tài khoản mới để bắt đầu. Không có tài khoản/mật khẩu mặc định. File `.env` hiện tại đã được tạo với secret ngẫu nhiên để chạy trên máy này.

```powershell
npm test
npm run build
npm start
```

## Các màn hình

- `/`: giới thiệu, cách hoạt động, lợi ích.
- `/register`, `/login`: đăng ký và đăng nhập email/mật khẩu.
- `/dashboard`: nhiệm vụ hôm nay, streak, tiến độ và các thử thách.
- `/goals/new`: tạo mục tiêu với 5 nhóm, 7/14/21/30 ngày và 3 cấp độ.
- `/challenges/[id]`: lộ trình, trạng thái, ghi chú từng ngày.
- `/challenges/[id]/check-in`: hoàn thành/chưa hoàn thành, cảm nhận, ghi chú.
- `/challenges/[id]/summary`: tổng kết khi thử thách kết thúc.
- `/profile`: thông tin tài khoản và lịch sử thử thách.

## Quy tắc

Ngày tính theo múi giờ Việt Nam (Asia/Ho_Chi_Minh), bắt đầu ngay khi tạo mục tiêu. Mỗi nhiệm vụ được check-in một lần, đúng ngày; không cho check-in trước hoặc bù ngày. Ngày bỏ lỡ được nhận diện khi đọc dữ liệu và lưu khi check-in tiếp theo. Chưa check-in hôm nay vẫn giữ streak đến hôm qua; bỏ lỡ một ngày sẽ ngắt streak. Ngày không hoàn thành vẫn được ghi nhận nhưng không cộng streak.

Form check-in gắn với đúng nhiệm vụ đang hiển thị. Nếu ngày đã đổi khi gửi, ứng dụng yêu cầu tải lại nhiệm vụ mới và giữ ghi chú để bạn có thể sao chép trước khi tải lại. Streak hiện tại hết hiệu lực khi không còn ngày hoàn thành liền kề; streak dài nhất luôn được giữ trong tổng kết.

Cảm nhận Dễ tăng một cấp, Khó giảm một cấp, Vừa sức giữ nguyên. Mức mới áp dụng cho các nhiệm vụ chưa đến của thử thách, có giới hạn Dễ/Trung bình/Khó. Nội dung mẫu luân phiên theo nhóm mục tiêu. Với mục tiêu tùy chỉnh, nhiệm vụ là các khoảng tập trung vào mục tiêu.

Thử thách kết thúc sau ngày cuối hoặc ngay khi đã check-in ngày cuối. Tổng kết tính số ngày hoàn thành, streak dài nhất và cảm nhận trung bình (quy đổi Dễ=0, Vừa sức=1, Khó=2).

## Triển khai

SQLite phù hợp chạy cục bộ hoặc máy chủ có ổ đĩa bền vững. Không đưa file SQLite vào filesystem tạm của Vercel. Để chạy production trên Vercel, chuyển datasource Prisma sang PostgreSQL, tạo migration tương ứng và đặt DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET theo môi trường. Dùng HTTPS; cookie bảo mật được NextAuth bật khi URL dùng HTTPS.

Google OAuth, xác minh email, đặt lại mật khẩu và gửi thông báo chưa thuộc bản này. Google cần thông tin OAuth riêng. Font Be Vietnam Pro tải từ Google Fonts, có Arial dự phòng khi offline.

Đăng nhập giới hạn 8 lần thử trong cửa sổ 15 phút cho mỗi email đã chuẩn hóa. Đăng nhập thành công xóa bộ đếm; cửa sổ hết hạn tự đặt lại. Bộ đếm lưu bằng khóa băm trong SQLite nên không mất khi khởi động lại. Đây là giới hạn theo tài khoản; khi công khai dịch vụ, giới hạn lưu lượng theo IP nên được cấu hình tại reverse proxy/hosting. Mật khẩu dùng scrypt bất đồng bộ với salt ngẫu nhiên.

`npm run setup` tạo `.env` với secret ngẫu nhiên nếu chưa có rồi áp dụng migration. Khi tự cấu hình `.env`, dùng `.env.example` làm mẫu.

`npm test` kiểm tra điều chỉnh độ khó, sinh nhiệm vụ, ranh giới ngày Việt Nam, streak và mật khẩu. Sau `npm run build`, chạy `npx playwright install chromium` rồi `npm run test:e2e` để kiểm thử trình duyệt. Trình kiểm thử tự mở server cổng 3100 và dùng SQLite `prisma/e2e.db` riêng, không thay đổi dữ liệu người dùng trong `dev.db`.

Kiểm thử trình duyệt bao gồm luồng sử dụng đầy đủ, phân quyền giữa tài khoản, thử thách hết hạn, form qua ngày, giữ dữ liệu khi đăng ký trùng và giới hạn đăng nhập. Có thể chọn kiểm thử bằng `npm run test:e2e -- --grep "expired"`. Dừng server đang chạy trước khi build/generate Prisma trên Windows để tránh DLL bị khóa.
