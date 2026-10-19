# Review và cải thiện · 18/10/2026

Đã review tài liệu yêu cầu, logic lịch/ngày, các Server Actions, xác thực, truy vấn dữ liệu, giao diện và kiểm thử. Có thêm một lượt review độc lập để đối chiếu hai lỗi ngày tháng.

## Phát hiện và xử lý

| Mức độ | Vấn đề trước khi sửa | Kết quả sau khi sửa |
| --- | --- | --- |
| P1 | Form dùng sự kiện JavaScript nhưng thiếu phương thức POST, có thể gửi mật khẩu lên URL nếu JavaScript không chạy. | Khai báo POST cho mọi form; thêm kiểm thử với JavaScript bị tắt để xác nhận thông tin không nằm trong query string. |
| P2 | Thử thách 7 ngày có thể giữ streak 7 mãi về sau vì giới hạn ngày tính toán ở ngày 8. | Tính streak theo ngày hiện tại thực tế; giữ riêng streak dài nhất. |
| P2 | Mở check-in trước nửa đêm rồi gửi sau nửa đêm có thể hoàn thành nhầm nhiệm vụ mới. | Đối chiếu ID nhiệm vụ hiển thị với nhiệm vụ đúng ngày; từ chối form cũ mà không ghi dữ liệu. |
| P2 | Chưa giới hạn thử mật khẩu; scrypt đồng bộ chặn luồng xử lý máy chủ. | Giới hạn theo email bằng bộ đếm bền vững trong SQLite và chuyển scrypt sang bất đồng bộ. |
| P2 | Đăng ký trùng email hoặc lỗi lưu có thể làm mất nội dung đã nhập. | Giữ bản nháp khi Server Action trả lỗi; không cho gửi lại trong lúc đang chuyển trang. |
| P2 | Nhận diện lỗi an toàn bằng cách dò chữ “prisma” trong thông báo có thể để lộ lỗi nội bộ. | Chỉ trả thông báo cụ thể cho lỗi nghiệp vụ đã định nghĩa; lỗi hệ thống trả thông báo chung. |
| P3 | Xem một thử thách vẫn tải toàn bộ lịch sử và ghi chú của tài khoản. | Truy vấn trực tiếp theo ID và chủ sở hữu; dùng chung cách tính tiến độ. |
| P3 | Menu luôn tô sáng Tổng quan; nhiều chữ chỉ 7–10px và quá nhạt. | Đánh dấu trang hiện tại, tăng chữ nhỏ lên ít nhất 12px và tăng tương phản các nội dung chính. |

## Kiểm chứng

- Các kiểm thử hồi quy đã thất bại trên bản trước khi sửa cho lỗi streak, check-in qua ngày, đăng ký trùng và giới hạn mật khẩu.
- `npm test`: 5/5 đạt, gồm logic sinh nhiệm vụ, độ khó, lịch Việt Nam, streak và mật khẩu.
- `npm run test:e2e`: 6/6 đạt, gồm luồng đầy đủ, các trường hợp hồi quy trên SQLite riêng và form khi JavaScript bị tắt.
- `npm run build` và `npx tsc --noEmit`: đạt.
- `npm audit`: 0 lỗ hổng được báo cáo.
- Kiểm tra ảnh dashboard desktop/mobile và trang giới thiệu; kiểm tra không tràn chiều ngang trên điện thoại.

## Phạm vi còn lại

Google OAuth, xác minh email, khôi phục mật khẩu và thông báo chưa được bổ sung trong đợt review này. SQLite hiện phục vụ chạy cục bộ hoặc máy chủ có ổ đĩa bền vững; triển khai Vercel cần PostgreSQL như README mô tả. Chưa đánh giá tải lớn hoặc kiểm thử bảo mật chuyên sâu.
