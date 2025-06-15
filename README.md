

# Tên dự án: Ứng dụng Quản lý Tour Du lịch

Đây là hướng dẫn thiết lập và chạy dự án này.

## Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt các công cụ sau:

* Node.js (phiên bản 18 trở lên được khuyến nghị)
* npm (thường đi kèm với Node.js)
* Microsoft SQL Server (bao gồm SQL Server Management Studio hoặc công cụ quản lý cơ sở dữ liệu khác)

## Cài đặt dự án

Thực hiện theo các bước dưới đây để thiết lập và chạy dự án.

### 1. Cài đặt các Dependencies

Mở terminal/command prompt và điều hướng đến thư mục gốc của dự án, sau đó chạy các lệnh sau:

npm install

Tiếp theo, điều hướng vào thư mục backend và cài đặt các dependencies riêng cho phần backend:

cd backend
npm install

2. Cấu hình Cơ sở dữ liệu (Microsoft SQL Server)
Dự án này sử dụng Microsoft SQL Server làm cơ sở dữ liệu.

Chuẩn bị Database:

Mở SQL Server Management Studio (SSMS) hoặc công cụ quản lý cơ sở dữ liệu MS SQL khác.
Kết nối đến instance SQL Server của bạn.
Tạo một cơ sở dữ liệu mới cho dự án này (ví dụ: TourBookingDB).
Tạo bảng và dữ liệu mẫu:

Chạy file sql_createTable.sql (nằm ở thư mục gốc của dự án) trên cơ sở dữ liệu bạn vừa tạo. File này sẽ tạo cấu trúc bảng cần thiết.
Sau khi tạo bảng, chạy file sql_dataEx.sql (nằm ở thư mục gốc của dự án) để điền dữ liệu mẫu vào các bảng.
Cấu hình kết nối Database:

Điều hướng đến thư mục backend/.

Tạo một file .env nếu nó chưa tồn tại (hoặc sao chép từ .env.example nếu có).

Mở file .env và cập nhật các biến môi trường sau để kết nối với cơ sở dữ liệu MS SQL của bạn:

DB_SERVER=your_sql_server_address  # Ví dụ: localhost, 127.0.0.1, hoặc tên server/instance
DB_DATABASE=TourBookingDB         # Tên cơ sở dữ liệu bạn đã tạo (ví dụ: TourBookingDB)
DB_USER=your_db_username          # Tên người dùng SQL Server của bạn
DB_PASSWORD=your_db_password      # Mật khẩu người dùng SQL Server của bạn

Lưu ý: Thay thế your_sql_server_address, TourBookingDB, your_db_username, và your_db_password bằng thông tin cấu hình SQL Server của bạn.

3. Chạy ứng dụng
Sau khi đã cài đặt dependencies và cấu hình cơ sở dữ liệu, bạn có thể khởi động ứng dụng:

Mở terminal/command prompt, điều hướng đến thư mục gốc của dự án và chạy: npm run dev

Thao tác này sẽ khởi động cả phần backend và frontend của ứng dụng.

Thông tin đăng nhập Test
Sử dụng các tài khoản sau để kiểm tra các giao diện và chức năng khác nhau:

1. Giao diện Khách hàng
Tài khoản: nguyenvanan01@gmail.com

Mật khẩu: 111111B@

Để test chức năng thanh toán (VNPAY):
Chọn phương thức thanh toán vnpay và chọn thanh toán bằng thẻ nội địa. Sử dụng thông tin thẻ mẫu sau:

Ngân hàng: NCB
Số thẻ: 9704198526191432198
Tên chủ phát hành: NGUYEN VAN A
Ngày phát hành: 07/15
Mật khẩu OTP: 123456
2. Giao diện Admin
Có các tài khoản admin mẫu sau:

Tài khoản 1: nguyenvana@example.com

Mật khẩu 1: 111111B@

Tài khoản 2: thi.b@example.com

Mật khẩu 2: 111111B@

Tài khoản 3: van.c@example.com

Mật khẩu 3: 111111B@
