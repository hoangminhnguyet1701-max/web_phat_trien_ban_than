# Mỗi Ngày Một Chút

Ứng dụng tiếng Việt giúp chia mục tiêu thành nhiệm vụ nhỏ hằng ngày. Next.js 15 App Router, TypeScript, Prisma/PostgreSQL và NextAuth (email/mật khẩu). Giao diện CSS responsive, không cần dịch vụ trả phí hoặc API AI.

## Chạy cục bộ

Yêu cầu Node.js 24 và Docker Desktop đang chạy.

```powershell
npm install
npm run db:up
npm run setup
npm run dev
```

Mở http://localhost:3000. Đăng ký tài khoản mới để bắt đầu. Không có tài khoản/mật khẩu mặc định. Khi chưa có `.env`, script khởi tạo tạo mật khẩu PostgreSQL và secret ngẫu nhiên. File `.env` không được đưa lên GitHub.

PostgreSQL 17 chạy trong Docker, chỉ mở cổng `127.0.0.1:55432`. Database ứng dụng là `phin`, database kiểm thử là `phin_test`. Dữ liệu lưu trong Docker volume `postgres_data`, được giữ khi khởi động lại container. `npm run db:stop` dừng database; `npm run db:up` mở lại.

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

Ứng dụng đã dùng PostgreSQL ở cả môi trường phát triển và kiểm thử. Khi dùng PostgreSQL được hosting cung cấp, đặt `DATABASE_URL` theo thông tin của máy chủ đó, cùng `NEXTAUTH_URL` và `NEXTAUTH_SECRET` của môi trường triển khai. Build bằng `npm run build`; `npm start` tự áp dụng migration trước khi chạy Next.js trên `0.0.0.0` và cổng `PORT` (mặc định 3000). `POSTGRES_PASSWORD` chỉ phục vụ Docker cục bộ. Dùng HTTPS; cookie bảo mật được NextAuth bật khi URL dùng HTTPS.

Xem [hướng dẫn triển khai VibeHost của Mắt Bão](DEPLOY-VIBEHOST.md) để cấu hình PostgreSQL production, biến môi trường, Node.js 24 và lệnh chạy.

Google OAuth, xác minh email, đặt lại mật khẩu và gửi thông báo chưa thuộc bản này. Google cần thông tin OAuth riêng. Font Be Vietnam Pro tải từ Google Fonts, có Arial dự phòng khi offline.

Đăng nhập giới hạn 8 lần thử trong cửa sổ 15 phút cho mỗi email đã chuẩn hóa. Đăng nhập thành công xóa bộ đếm; cửa sổ hết hạn tự đặt lại. Bộ đếm lưu bằng khóa băm trong PostgreSQL nên không mất khi khởi động lại. Đây là giới hạn theo tài khoản; khi công khai dịch vụ, giới hạn lưu lượng theo IP nên được cấu hình tại reverse proxy/hosting. Mật khẩu dùng scrypt bất đồng bộ với salt ngẫu nhiên.

`npm run setup` tạo `.env` với secret ngẫu nhiên nếu chưa có rồi áp dụng migration. Khi tự cấu hình `.env`, dùng `.env.example` làm mẫu.

`npm test` kiểm tra điều chỉnh độ khó, sinh nhiệm vụ, ranh giới ngày Việt Nam, streak, mật khẩu, chuyển dữ liệu SQLite và cấu hình database kiểm thử. Sau `npm run build`, chạy `npx playwright install chromium` rồi `npm run test:e2e` để kiểm thử trình duyệt. Trình kiểm thử áp dụng migration vào `TEST_DATABASE_URL`, tự mở server cổng 3100 và sử dụng database PostgreSQL riêng. Tên database kiểm thử phải kết thúc bằng `_test` và không được trùng database ứng dụng. Cả Prisma trong bài kiểm thử lẫn server kiểm thử dùng cùng URL này.

Kiểm thử trình duyệt bao gồm luồng sử dụng đầy đủ, phân quyền giữa tài khoản, thử thách hết hạn, form qua ngày, giữ dữ liệu khi đăng ký trùng và giới hạn đăng nhập. Có thể chọn kiểm thử bằng `npm run test:e2e -- --grep "expired"`. Dừng server đang chạy trước khi build/generate Prisma trên Windows để tránh DLL bị khóa.

## Chuyển dữ liệu từ bản SQLite cũ

Dừng ứng dụng trước khi sao chép dữ liệu. Giữ nguyên `prisma/dev.db`, sao lưu `.env` cũ rồi cấu hình các biến PostgreSQL theo `.env.example`. Mật khẩu trong `DATABASE_URL` và `TEST_DATABASE_URL` phải khớp `POSTGRES_PASSWORD` khi dùng Docker.

```powershell
npm run db:up
npm run setup
npm run db:import-sqlite -- prisma/dev.db
```

Lệnh import mở SQLite ở chế độ chỉ đọc, giữ nguyên ID, mật khẩu đã băm, mốc thời gian và ghi chú. Toàn bộ dữ liệu được nhập trong một transaction, đúng thứ tự khóa ngoại. Lệnh từ chối nhập nếu bất kỳ bảng ứng dụng nào ở đích đã có dữ liệu; không xóa dữ liệu đích và không ghi lại file nguồn. Chỉ chạy một lần vào database PostgreSQL trống đã được áp dụng migration.

Migration PostgreSQL mới nằm trong `prisma/migrations`. Các migration SQLite cũ được lưu ở `prisma/sqlite-migrations` để tham chiếu và kiểm thử chuyển dữ liệu; Prisma không chạy chúng trên PostgreSQL. Tham khảo [Prisma Migrate](https://www.prisma.io/docs/orm/v6/prisma-migrate/getting-started) về lịch sử migration và migration khởi tạo.
