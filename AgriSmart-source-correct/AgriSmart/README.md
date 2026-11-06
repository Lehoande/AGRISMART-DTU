# AgriSmart — source đã sắp xếp lại

## Cấu trúc

- `frontend/`: giao diện Next.js (đã đưa ra đúng cấp, không còn nằm trong `agrismart-ai-source (1)`).
- `backend/`: Express API kết nối MySQL.
- `database/`: schema và migration SQL.
- `ai-service/`: dịch vụ gợi ý Python/FastAPI.

Không đưa `node_modules`, `.next`, file `.env` chứa bí mật vào source bàn giao. Cấu hình mẫu được cung cấp bằng `.env.example` và `.env.local.example`.

## 1. Chuẩn bị database

Mở MySQL và chạy từ thư mục gốc dự án:

```bash
mysql --default-character-set=utf8mb4 -u root -p < database/schema.sql
```

Nếu bạn đã có database chứa dữ liệu cần giữ, hãy sao lưu trước; không chạy lệnh reset/drop database.

## 2. Chạy backend

```bash
cd backend
npm install
```

Sao chép `backend/.env.example` thành `backend/.env`, sau đó nhập đúng thông tin MySQL và thay `JWT_SECRET` bằng chuỗi ngẫu nhiên dài.

```bash
npm run migrate
npm run seed
npm run dev
```

API mặc định chạy ở `http://localhost:4000`. Kiểm tra:

- `http://localhost:4000/api/health`
- `http://localhost:4000/api/categories`
- `http://localhost:4000/api/products`

Không chạy seed nếu bạn không muốn thêm dữ liệu demo vào database hiện có.

## 3. Chạy frontend

Sao chép `frontend/.env.local.example` thành `frontend/.env.local`. Giữ cấu hình:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Sau đó:

```bash
cd frontend
npm install
npm run dev
```

Mở `http://localhost:3000`.

Frontend dùng `src/lib/api-client.ts` để gọi Express API. Những dữ liệu mẫu còn ở các trang demo không được xem là số liệu vận hành; các màn hình kết nối API sẽ báo lỗi khi backend không sẵn sàng.

## 4. Chạy AI service (tùy chọn)

```bash
cd ai-service
python -m venv .venv
```

Kích hoạt môi trường ảo, sau đó:

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

Backend gọi AI service tại `http://localhost:8001` (đặt trong `backend/.env`). Dịch vụ cung cấp xếp hạng gợi ý theo quy tắc và lịch sử tương tác, cùng công cụ rà soát dữ liệu sản phẩm. Đây chưa phải mô hình học máy; hệ thống không phân tích ảnh, xác minh chứng nhận hoặc chất lượng nông sản. Nếu dịch vụ dừng, API gợi ý dùng phương án dự phòng theo danh mục và tồn kho.

## Lưu ý

- Chạy backend và frontend trong hai terminal riêng biệt.
- Không đặt mật khẩu MySQL hoặc `JWT_SECRET` trong `frontend/.env.local`.
- Nếu cổng 3000 hoặc 4000 đang bị dùng, hãy dừng tiến trình cũ trước khi chạy lại.
- Hình ảnh sản phẩm đang có thể là ảnh minh họa; trường `image_url` trong database quyết định ảnh API trả về.


## Cập nhật tích hợp AgriSmart (bản chỉnh sửa)
- Đăng nhập người mua gọi API `/api/auth/login`, lưu JWT trong `localStorage` với key `agrismart_token` và hiển thị lỗi khi xác thực thất bại.
- Trang danh sách sản phẩm ưu tiên tải dữ liệu từ MySQL qua `/api/products`; nếu API chưa sẵn sàng thì giữ dữ liệu dự phòng để giao diện không bị trắng.
- Checkout yêu cầu đăng nhập, đồng bộ các sản phẩm có ID cơ sở dữ liệu vào `/api/cart`, sau đó gọi `/api/orders/checkout`. Mã đơn thành công là ID đơn thật do backend trả về.
- Checkout hỗ trợ COD và chuyển khoản trực tiếp vào tài khoản ngân hàng cấu hình bằng `BANK_NAME`, `BANK_BIN`, `BANK_ACCOUNT_NO`, `BANK_ACCOUNT_NAME`, `BANK_BRANCH` trong `backend/.env`. Sau khi tạo đơn, khách nhận QR VietQR kèm số tiền và nội dung chuyển khoản theo mã đơn. Chuyển khoản trực tiếp chưa có webhook ngân hàng; quản trị viên cần đối soát sao kê rồi xác nhận đã nhận tiền trong trang Đơn hàng & giao vận trước khi đơn được xử lý. VNPay/MoMo hiện không hiển thị trong checkout.
- Đăng ký người mua/người bán, hồ sơ người bán, quản lý sản phẩm, đơn hàng, mã `WELCOME10`, đánh giá sau đơn hoàn tất và khiếu nại đã nối backend. Chạy `npm run migrate` để thêm bảng/cột trước khi sử dụng các luồng này.
- QR trace public trả thêm mô tả, giá, tồn kho và danh mục sản phẩm bên cạnh thông tin lô, ngày thu hoạch, tiêu chuẩn chất lượng và nhà sản xuất.

### Cần cấu hình / hoàn thiện trước khi nghiệm thu
1. Tạo DB theo `database/schema.sql`, cấu hình `backend/.env` từ `.env.example`, sau đó chạy `npm run migrate` và seed dữ liệu phù hợp.
2. Cấu hình `NEXT_PUBLIC_API_URL` ở frontend nếu backend không chạy tại `http://localhost:4000/api`.
3. Để thử VNPay/MoMo, dùng credentials sandbox do nhà cung cấp cấp và URL callback công khai trỏ tới backend đang chạy. Thanh toán online chưa thể kiểm tra đầu-cuối chỉ bằng localhost.
4. Sổ địa chỉ đã lưu, phí vận chuyển theo khu vực/khối lượng, và quy trình hợp đồng điện tử chưa được kết nối.
5. Dịch vụ `ai-service` hiện là thuật toán gợi ý dựa trên luật (rule-based), không phải mô hình AI đã huấn luyện. Không dùng số liệu hoạt động giả lập trong trang AI Center làm số liệu thực tế.
6. Cần cấu hình MySQL và credentials sandbox để kiểm tra tích hợp đầu-cuối với dữ liệu thật.
