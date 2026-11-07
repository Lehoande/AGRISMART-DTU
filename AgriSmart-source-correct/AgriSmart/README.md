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
mysql -u root -p < database/schema.sql
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

Frontend dùng `src/lib/api-client.ts` để gọi health, categories và products của Express API. Các trang giao diện còn sử dụng một số dữ liệu minh họa trong `src/lib/agri-data.ts`; vì vậy việc sắp xếp source và thêm API client **chưa có nghĩa là toàn bộ giao diện đã đồng bộ MySQL**. Cần tiếp tục thay các trang đang đọc dữ liệu mẫu bằng dữ liệu trả về từ API, đặc biệt trang chủ, danh sách sản phẩm, chi tiết sản phẩm, giỏ hàng và đơn hàng.

## 4. Chạy AI service (tùy chọn)

```bash
cd ai-service
python -m venv .venv
```

Kích hoạt môi trường ảo, sau đó:

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend mặc định gọi AI tại `http://localhost:8000`; nếu không chạy AI service, endpoint gợi ý sẽ dùng phương án dự phòng được định nghĩa trong backend.

## Lưu ý

- Chạy backend và frontend trong hai terminal riêng biệt.
- Không đặt mật khẩu MySQL hoặc `JWT_SECRET` trong `frontend/.env.local`.
- Nếu cổng 3000 hoặc 4000 đang bị dùng, hãy dừng tiến trình cũ trước khi chạy lại.
- Hình ảnh sản phẩm đang có thể là ảnh minh họa; trường `image_url` trong database quyết định ảnh API trả về.


## Cập nhật tích hợp AgriSmart (bản chỉnh sửa)
- Đăng nhập người mua gọi API `/api/auth/login`, lưu JWT trong `localStorage` với key `agrismart_token` và hiển thị lỗi khi xác thực thất bại.
- Trang danh sách sản phẩm ưu tiên tải dữ liệu từ MySQL qua `/api/products`; nếu API chưa sẵn sàng thì giữ dữ liệu dự phòng để giao diện không bị trắng.
- Checkout yêu cầu đăng nhập, đồng bộ các sản phẩm có ID cơ sở dữ liệu vào `/api/cart`, sau đó gọi `/api/orders/checkout`. Mã đơn thành công là ID đơn thật do backend trả về.
- Checkout hiện chỉ cho phép COD. MoMo/VNPay/Banking chưa được kết nối cổng thanh toán thật; không được xem lựa chọn giao diện hoặc mock payment là giao dịch thật.
- QR trace public trả thêm mô tả, giá, tồn kho và danh mục sản phẩm bên cạnh thông tin lô, ngày thu hoạch, tiêu chuẩn chất lượng và nhà sản xuất.

### Cần cấu hình / hoàn thiện trước khi nghiệm thu
1. Tạo DB theo `database/schema.sql`, cấu hình `backend/.env` từ `.env.example`, sau đó chạy `npm run migrate` và seed dữ liệu phù hợp.
2. Cấu hình `NEXT_PUBLIC_API_URL` ở frontend nếu backend không chạy tại `http://localhost:4000/api`.
3. Đăng ký merchant MoMo/VNPay và triển khai callback/webhook có kiểm tra chữ ký trước khi bật thanh toán online.
4. Hoàn thiện luồng đăng ký tài khoản (hiện form đăng ký giao diện vẫn chưa gửi API), sổ địa chỉ đã lưu, phí vận chuyển theo khu vực/khối lượng, và quy trình hợp đồng điện tử.
5. Dịch vụ `ai-service` hiện là thuật toán gợi ý dựa trên luật (rule-based), không phải mô hình AI đã huấn luyện. Cần mô tả đúng trong báo cáo/demo; không dùng số liệu hoạt động giả lập trong trang AI Center làm số liệu thực tế.
6. Cần chạy kiểm thử tích hợp với MySQL có dữ liệu và kiểm thử giao diện trong trình duyệt trước khi nghiệm thu.
