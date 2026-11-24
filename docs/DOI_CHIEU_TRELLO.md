# Đối chiếu bảng Trello với source AgriSmart

Đối chiếu từ file CSV Trello được cung cấp với source hiện tại. Trong 76 thẻ, file đánh dấu 34 hoàn tất và 42 chưa hoàn tất. Những thẻ đang để chưa hoàn tất nhưng chức năng đã tồn tại được ghi là “đã có trước đợt này”; các phần thiếu đã được triển khai trong source.

## Các thẻ chưa hoàn tất trong CSV

| Nhóm | Thẻ trong CSV | Kết quả sau đối chiếu |
|---|---|---|
| Quản lý sản phẩm | Xóa sản phẩm | Đã có thao tác ẩn/xóa mềm cho người bán; admin có bật/tắt hiển thị. |
| Quản lý sản phẩm | Tìm kiếm sản phẩm | Đã có tìm kiếm không phân biệt dấu theo tên, mô tả, gian hàng, danh mục và vùng. |
| Quản lý sản phẩm | Lọc theo danh mục | Đã có lọc danh mục dùng slug và lựa chọn danh mục trong danh sách. |
| Phân tích yêu cầu | 7 thẻ: mục tiêu, đối tượng, yêu cầu chức năng/phi chức năng, Use Case, ERD, quy trình | Đã viết tài liệu phân tích, use case, ERD Mermaid và quy trình trong `PHAN_TICH_YEU_CAU.md`. |
| Quản lý người dùng | Xem thông tin cá nhân | Đã có hồ sơ dùng dữ liệu tài khoản. |
| Quản lý người dùng | Cập nhật thông tin cá nhân | Đã có cập nhật hồ sơ và ảnh đại diện. |
| Quản lý người dùng | Đổi mật khẩu | Đã có API và form bảo mật; kiểm tra mật khẩu hiện tại. |
| Quản lý danh mục | Thêm/sửa/xóa/xem danh sách/xem sản phẩm theo danh mục | Đã thêm API và màn hình admin tạo/sửa/xóa; từ chối xóa danh mục đang được sản phẩm dùng. Danh sách và lọc sản phẩm theo danh mục dùng chung ở web bán. |
| Giỏ hàng | Tính tổng tiền giỏ hàng | Đã có tạm tính, giảm giá, phí giao hàng và tổng tiền; API tính lại giá/tồn khi checkout. |
| Đặt hàng | Nhập thông tin giao hàng | Đã có form checkout và lưu hồ sơ nhận hàng gần nhất. |
| Đặt hàng | Chọn phương thức thanh toán | Đã có COD/chuyển khoản và các cổng cũ có cấu hình; thanh toán chuyển khoản có luồng đối soát. |
| Đặt hàng | Xem chi tiết đơn | Đã có dữ liệu chi tiết đơn, sản phẩm và lịch sử trạng thái ở luồng theo dõi. |
| Đặt hàng | Hủy đơn | Đã có nút hủy khi đơn còn chờ xác nhận; API kiểm quyền, hoàn tồn và gửi thông báo. |
| Quản lý kho | Xuất kho | Đã có màn hình nhập/xuất theo số lượng tăng/giảm và lý do. |
| Quản lý kho | Hàng sắp hết | Đã có lọc theo ngưỡng và thông báo cho admin/manager/staff. |
| Quản lý kho | Lịch sử nhập/xuất | API nhật ký đã có; mọi điều chỉnh/checkout/hủy ghi log. |
| Truy xuất QR | Quét mã QR | Đã thêm trang camera scan trên trình duyệt hỗ trợ `BarcodeDetector`, có nhập mã/dán URL làm dự phòng. |
| Truy xuất QR | Thông tin nguồn gốc | Trang tra QR hiện nơi thu hoạch, vùng, ngày thu hoạch, gian hàng và bảo quản từ dữ liệu sản phẩm/lô. |
| Truy xuất QR | Nhà sản xuất | Hiển thị tên gian hàng/người sản xuất trong kết quả tra cứu. |
| Truy xuất QR | Kiểm tra mã hợp lệ | API tra cứu trả lỗi nếu mã/lô không tồn tại; trang quét hiển thị lỗi đó. |
| Quản lý thông báo | Đặt đơn, cập nhật trạng thái, hủy đơn, hàng sắp hết, xem danh sách, đánh dấu đã đọc | Đã có tạo thông báo theo nghiệp vụ; buyer có danh sách, số chưa đọc, đánh dấu một/tất cả đã đọc. Thông báo hủy được gửi cho gian hàng liên quan. |
| Đánh giá | Tạo đánh giá, điểm sao, bình luận, xem, trung bình, sửa/xóa | Gửi đánh giá sau đơn hoàn tất; API chỉ cho người mua có giao dịch; form hỗ trợ cập nhật/xóa đánh giá của chính họ; truy vấn sản phẩm tính trung bình và số đánh giá; admin xem/xóa kiểm duyệt. |

## Các màn hình admin được bổ sung

- Danh mục: thêm, sửa, xóa an toàn.
- Người dùng: xem danh sách; admin đổi vai trò, không thể tự đổi quyền tài khoản đang đăng nhập.
- Sản phẩm: xem toàn bộ; admin ẩn/mở bán.
- Kho: tìm kiếm, lọc sắp hết, nhập/xuất và ghi lịch sử.
- Đánh giá: xem và admin xóa kiểm duyệt.
- Quyền ghi dữ liệu được kiểm tra ở backend; ẩn nút ở frontend chỉ là hỗ trợ giao diện.

## Lưu ý khi cập nhật Trello

CSV là bản xuất tĩnh, nên trạng thái trên Trello online chưa tự thay đổi. Có thể đánh dấu hoàn tất 42 thẻ chưa hoàn thành trong bản xuất sau khi nhóm review giao diện và xác nhận luồng với cấu hình database của nhóm. Trình đọc QR trực tiếp cần camera và trình duyệt hỗ trợ Barcode Detection; luồng nhập mã vẫn dùng được khi không có hỗ trợ camera.

Các bước kiểm tra mã đã chạy: `npx tsc --noEmit` trong `frontend`, `node --check` cho `server.js`, `routes/admin.js`, `orderService.js` và `notificationService.js` — đều không có lỗi cú pháp/kiểu.
