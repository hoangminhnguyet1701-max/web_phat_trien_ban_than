# Triển khai lên VibeHost của Mắt Bão

Ứng dụng dùng Next.js 15, Node.js 24, Prisma 6 và PostgreSQL. PostgreSQL production được tạo trên hosting; Docker trong repository phục vụ phát triển cục bộ.

## 1. Tạo PostgreSQL

Trong trang quản lý VibeHost, tạo database loại PostgreSQL. Lấy hostname, port, tên database, username và password do hệ thống cấp. Ưu tiên URL kết nối được hosting cung cấp; nếu phải ghép URL, dùng dạng:

```dotenv
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

Thay các giá trị viết hoa bằng thông tin thực tế. Các ký tự đặc biệt trong username/password phải được URL-encode. Nếu hosting yêu cầu TLS, thêm tham số `sslmode` đúng theo thông tin kết nối của họ. Dùng hostname PostgreSQL có thể truy cập từ container website.

## 2. Cấu hình biến môi trường website

| Biến | Giá trị |
| --- | --- |
| `DATABASE_URL` | URL PostgreSQL production ở bước 1 |
| `NEXTAUTH_URL` | URL HTTPS thực tế của website, ví dụ `https://ten-mien-cua-ban.vn` |
| `NEXTAUTH_SECRET` | Chuỗi ngẫu nhiên riêng cho production |
| `NODE_ENV` | `production` |

Tạo secret bằng `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"` rồi lưu vào biến môi trường của website. Giữ nguyên secret giữa các lần redeploy để phiên đăng nhập không bị vô hiệu hóa. Khi đổi tên miền, cập nhật `NEXTAUTH_URL`.

`PORT` được ứng dụng đọc từ môi trường; mặc định là 3000 nếu hosting không đặt. `npm start` lắng nghe trên `0.0.0.0`, phù hợp truy cập qua proxy/container. Thông tin kết nối local trong `.env.example` dành cho máy phát triển; điền thông tin production trong bảng biến môi trường của VibeHost.

`TEST_DATABASE_URL` và `POSTGRES_PASSWORD` trong hướng dẫn Docker cục bộ không phải biến bắt buộc để website production chạy. Giữ mật khẩu database và secret ở mục biến môi trường của hosting.

## 3. Chọn mã nguồn và lệnh chạy

Kết nối GitHub với repository `hoangminhnguyet1701-max/web_phat_trien_ban_than`, chọn nhánh `main` và thư mục gốc dự án. Chọn Node.js 24 nếu nền tảng có lựa chọn phiên bản.

Các lệnh của dự án:

| Bước | Lệnh |
| --- | --- |
| Cài dependency trong bước build | `npm ci --include=dev` |
| Build | `npm run build` |
| Start | `npm start` |

Nếu VibeHost cho phép cấu hình các lệnh này, sử dụng giá trị trong bảng. Nếu dùng tự nhận diện Next.js, kiểm tra log để xác nhận lệnh khởi động là `npm start`, vì lệnh này áp dụng `prisma migrate deploy` trước khi chạy Next.js. Nếu nền tảng gọi trực tiếp `next start` hoặc chạy standalone server, cần chạy `npx prisma migrate deploy` bằng bước release/start do hosting hỗ trợ trước khi nhận người dùng.

Migration mới khởi tạo các bảng trên PostgreSQL trống. Các lần start/redeploy sau chỉ áp dụng migration chưa chạy; không reset database. Prisma CLI đã nằm trong dependency runtime để migration vẫn có khi hosting bỏ devDependencies sau build.

## 4. Chuyển dữ liệu hiện có nếu cần

Source GitHub chứa schema và migration. Dữ liệu PostgreSQL Docker trên máy này và file SQLite cũ được lưu riêng ở máy phát triển.

Để đưa dữ liệu SQLite cũ lên PostgreSQL của hosting: dừng ghi vào nguồn, cấu hình URL PostgreSQL đích trong môi trường local riêng, chạy `npx prisma migrate deploy`, rồi chạy `npm run db:import-sqlite -- prisma/dev.db`. Đích phải truy cập được từ máy chạy lệnh và chưa có dữ liệu ứng dụng. Script giữ nguyên ID, mật khẩu đã băm, ngày giờ và ghi chú; từ chối nhập vào đích đã có dữ liệu. Sau khi đối chiếu dữ liệu, cấu hình website dùng chính database đó.

## 5. Kiểm tra sau deploy

Mở trang chủ và đăng ký/đăng nhập. Tạo mục tiêu, check-in, xem hồ sơ, rồi redeploy để kiểm tra tài khoản và lịch sử vẫn được giữ. Xem log nếu migration không kết nối được database hoặc hostname/port của PostgreSQL chưa đúng.

Nếu đăng ký báo lỗi chung, xem **log server/runtime của website** ngay sau lần gửi form. Dòng `[register] Account creation failed` ghi loại lỗi, mã Prisma và việc `DATABASE_URL` có được cấu hình hay chưa; không ghi email, mật khẩu hay URL kết nối. Lỗi `401` tại `/api/auth/callback/credentials` trong trình duyệt là lỗi đăng nhập, không phải log nguyên nhân đăng ký.

Trong terminal của môi trường website, chạy `npm run db:check` để kiểm tra kết nối và trạng thái migration. Nếu báo còn migration chưa áp dụng, chạy `npx prisma migrate deploy` rồi kiểm tra lại. Nếu không kết nối được, đối chiếu hostname/port, thông tin xác thực và yêu cầu TLS với thông tin PostgreSQL do hosting cấp. Chạy các lệnh này trong môi trường production để dùng đúng `DATABASE_URL` của website.

Hướng dẫn về tạo website, kết nối GitHub và PostgreSQL: [Trung tâm hỗ trợ Mắt Bão](https://wiki.matbao.net/huong-dan-su-dung-trien-khai-website-nhanh-de-dang-nen-tang-deploy-website-tu-dong-tren-nen-tang-tinhgon/).
