CREATE DATABASE TourDB;
GO

USE TourDB;
GO

/*********** BẢNG Employee_Role ***********/
CREATE TABLE Employee_Role
(
    role_id     INT          IDENTITY(1,1) PRIMARY KEY,
    role_name   VARCHAR(50)  NOT NULL,
    description VARCHAR(200)
);

/*********** BẢNG Branch ***********/
CREATE TABLE Branch
(
    branch_id   INT          IDENTITY(1,1) PRIMARY KEY,
    branch_name NVARCHAR(100) NOT NULL,
    address     NVARCHAR(200),
    status      NVARCHAR(20) DEFAULT('active') NOT NULL,
    phone       VARCHAR(20)
);

/*********** BẢNG Customer (đã chỉnh) ***********/
-- Modified: cus_id thành VARCHAR(10), password thành NVARCHAR(60)
CREATE TABLE Customer
(
    cus_id      VARCHAR(20)    PRIMARY KEY,
    fullname    NVARCHAR(100)  NOT NULL,
    email       NVARCHAR(100)  NOT NULL UNIQUE,
    password    VARBINARY(MAX)   NOT NULL,    -- lưu bcrypt hash (~60 ký tự)
    birthday    DATE,
    phone       NVARCHAR(20),
    address     NVARCHAR(200),
    pi_url      NVARCHAR(500),
    cus_status  NVARCHAR(25)
);

/*********** BẢNG Employee (đã chỉnh) ***********/
-- Modified: emp_id thành VARCHAR(10), password thành NVARCHAR(60)
CREATE TABLE Employee
(
    emp_id      VARCHAR(20)     PRIMARY KEY,
    branch_id   INT             NOT NULL,
    fullname   NVARCHAR(100)   NOT NULL,
    email       NVARCHAR(100)   NOT NULL UNIQUE,
    password    VARBINARY(MAX)    NOT NULL,    -- lưu bcrypt hash
    phone       NVARCHAR(20),
    address     NVARCHAR(200),
    role_id     INT             NOT NULL,
    hire_day    DATE            NOT NULL,
    pi_url      NVARCHAR(500),
    em_status   NVARCHAR(25),
    CONSTRAINT FK_Employee_Branch FOREIGN KEY (branch_id) REFERENCES Branch(branch_id),
    CONSTRAINT FK_Employee_Role   FOREIGN KEY (role_id)   REFERENCES Employee_Role(role_id)
);

/*********** BẢNG Tour ***********/
CREATE TABLE Tour
(
    tour_id             VARCHAR(20) PRIMARY KEY,
    branch_id           INT          NOT NULL,
    name                NVARCHAR(150) NOT NULL,
    duration            INT          NOT NULL,
    destination         NVARCHAR(200) NOT NULL,
    departure_location  NVARCHAR(200),
    start_date          DATE,
    end_date            DATE,
    description         NVARCHAR(MAX),
    max_guests          INT,
    transport           NVARCHAR(100),
    created_at          DATETIME     DEFAULT GETDATE(),
    status              NVARCHAR(20)    NOT NULL,
    CONSTRAINT FK_Tour_Branch FOREIGN KEY (branch_id) REFERENCES Branch(branch_id)
);

/*********** BẢNG Tour_image ***********/
CREATE TABLE Tour_image
(
    image_id   VARCHAR(20)         PRIMARY KEY,
    tour_id    VARCHAR(20)  NOT NULL,
    image_url  VARCHAR(500) NOT NULL,
    CONSTRAINT FK_Tour_image_Tour FOREIGN KEY (tour_id) REFERENCES Tour(tour_id)
);

/*********** BẢNG Tour_price ***********/
CREATE TABLE Tour_price
(
    tour_id    VARCHAR(20)          NOT NULL,
    age_group  VARCHAR(20)  NOT NULL,
    price      DECIMAL(15,2) DEFAULT 0.0,
    CONSTRAINT PK_Tour_price PRIMARY KEY (tour_id, age_group),
    CONSTRAINT FK_Tour_price_Tour FOREIGN KEY (tour_id) REFERENCES Tour(tour_id)
);

/*********** BẢNG Booking ***********/
CREATE TABLE Booking
(
    booking_id   VARCHAR(20)  PRIMARY KEY,
    cus_id       VARCHAR(20)  NOT NULL,
    tour_id      VARCHAR(20)  NOT NULL,
    booking_date DATETIME     DEFAULT GETDATE(),
    total_price  DECIMAL(15,2) DEFAULT 0.0,
    status       VARCHAR(50)  DEFAULT 'pending',
    CONSTRAINT FK_Booking_Customer FOREIGN KEY (cus_id) REFERENCES Customer(cus_id),
    CONSTRAINT FK_Booking_Tour     FOREIGN KEY (tour_id) REFERENCES Tour(tour_id)
);

/*********** BẢNG Booking_Detail ***********/
CREATE TABLE Booking_Detail
(
    book_detail_id   VARCHAR(20)   PRIMARY KEY,
    booking_id       VARCHAR(20)   NOT NULL,
    tour_id          VARCHAR(20)   NOT NULL,
    age_group        VARCHAR(20)   NOT NULL,
    quantity         INT           NOT NULL,
    price_per_person DECIMAL(15,2) NOT NULL,
    CONSTRAINT FK_BookingDetail_Booking FOREIGN KEY (booking_id) REFERENCES Booking(booking_id),
    CONSTRAINT FK_BookingDetail_Tour     FOREIGN KEY (tour_id)    REFERENCES Tour(tour_id)
);

/*********** BẢNG Promotion ***********/
CREATE TABLE Promotion
(
    promo_id            VARCHAR(20)  PRIMARY KEY,
    code                VARCHAR(50)  NOT NULL,
    promo_name         NVARCHAR(200) NOT NULL,
    discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    start_date          DATE,
    end_date            DATE,
    max_use             INT          DEFAULT 0,
    status              VARCHAR(50)  
);

/*********** BẢNG Booking_Promotion ***********/
CREATE TABLE Booking_Promotion
(
    id          VARCHAR(20) PRIMARY KEY,
    booking_id  VARCHAR(20) NOT NULL,
    promo_id    VARCHAR(20) NOT NULL,
    CONSTRAINT FK_BookingPromo_Booking   FOREIGN KEY (booking_id) REFERENCES Booking(booking_id),
    CONSTRAINT FK_BookingPromo_Promotion FOREIGN KEY (promo_id)   REFERENCES Promotion(promo_id)
);

/*********** BẢNG Payment ***********/
CREATE TABLE Payments (
    payment_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    booking_id VARCHAR(20) NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    payment_method NVARCHAR(20) NOT NULL,
    payment_status NVARCHAR(20) NOT NULL DEFAULT 'PENDING',
    order_id NVARCHAR(100) UNIQUE,
    transaction_no NVARCHAR(100),
    response NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    -- Foreign key constraint (nếu bảng Bookings đã tồn tại)
    CONSTRAINT FK_Payments_Booking FOREIGN KEY (booking_id) REFERENCES Booking(booking_id) ON DELETE CASCADE,
    CONSTRAINT  CK_Payments_Amount CHECK (amount > 0),
    CONSTRAINT  CK_Payments_Status CHECK (payment_status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED')) ,
    CONSTRAINT CK_Payments_Method CHECK (
    payment_method IN ('VNPAY', 'MOMO', 'BANK_TRANSFER')
    ),
    -- Indexes để tối ưu performance
    INDEX IX_Payments_BookingId (booking_id),
    INDEX IX_Payments_VNPayOrderId (order_id),
    INDEX IX_Payments_Status (payment_status),
    INDEX IX_Payments_CreatedAt (created_at)
);

/*********** BẢNG Review ***********/
CREATE TABLE Review
(
    review_id   VARCHAR(20)  PRIMARY KEY,
    cus_id      VARCHAR(20)  NOT NULL,
    tour_id     VARCHAR(20)  NOT NULL,
    rating      INT          NOT NULL,
    comment     NVARCHAR(MAX),
    review_date DATETIME     DEFAULT GETDATE(),
    CONSTRAINT FK_Review_Customer FOREIGN KEY (cus_id)  REFERENCES Customer(cus_id),
    CONSTRAINT FK_Review_Tour     FOREIGN KEY (tour_id) REFERENCES Tour(tour_id)
);

/*********** BẢNG Customer_Support_Request ***********/
CREATE TABLE Customer_Support_Request
(
    request_id VARCHAR(20)  PRIMARY KEY,
    cus_id     VARCHAR(20)  NOT NULL,
    subject    NVARCHAR(200),
    message    NVARCHAR(MAX),
    created_at DATETIME     DEFAULT GETDATE(),
    status     VARCHAR(50)  DEFAULT 'open',
    CONSTRAINT FK_SupportRequest_Customer FOREIGN KEY (cus_id) REFERENCES Customer(cus_id)
);

/*********** BẢNG Customer_Support_Response ***********/
CREATE TABLE Customer_Support_Response
(
    response_id VARCHAR(20) PRIMARY KEY,
    request_id  VARCHAR(20)  NOT NULL,
    emp_id      VARCHAR(20)  NOT NULL,
    re_message  NVARCHAR(MAX),
    day         DATETIME     DEFAULT GETDATE(),
    CONSTRAINT FK_SupportResponse_Request  FOREIGN KEY (request_id) REFERENCES Customer_Support_Request(request_id),
    CONSTRAINT FK_SupportResponse_Employee FOREIGN KEY (emp_id)     REFERENCES Employee(emp_id)
);

/*********** BẢNG Tour_Schedule ***********/
CREATE TABLE Tour_Schedule
(
    schedule_id VARCHAR(20)   PRIMARY KEY,
    tour_id     VARCHAR(20)   NOT NULL,
    day_number  INT           NOT NULL,
    tour_route  NVARCHAR(200),
    detail      NVARCHAR(MAX),
    CONSTRAINT FK_TourSchedule_Tour FOREIGN KEY (tour_id) REFERENCES Tour(tour_id)
);
/*********** BẢNG Favorite_Tour ***********/
CREATE TABLE Favorite_Tour (
    fav_id      VARCHAR(20) PRIMARY KEY,
    cus_id      VARCHAR(20) NOT NULL,
    tour_id     VARCHAR(20) NOT NULL,
    created_at  DATETIME2   DEFAULT GETDATE(),

    -- Ràng buộc khóa ngoại
    CONSTRAINT FK_FavoriteTour_Customer FOREIGN KEY (cus_id) 
        REFERENCES Customer(cus_id) ON DELETE CASCADE,

    CONSTRAINT FK_FavoriteTour_Tour FOREIGN KEY (tour_id) 
        REFERENCES Tour(tour_id) ON DELETE CASCADE,

    -- Một tour chỉ được yêu thích 1 lần duy nhất bởi 1 khách hàng
    CONSTRAINT UQ_Customer_Tour UNIQUE (cus_id, tour_id)

);

CREATE TABLE OTP (
    email VARCHAR(255) NULL,
    opt varbinary(MAX) NULL,
    createdAt datetime NULL,
    expiredAt datetime NOT NULL
);

PRINT 'Tạo bảng thành công!';

-- Kiểm tra nếu trigger đã tồn tại thì xóa
IF OBJECT_ID('TR_Payments_UpdatedAt', 'TR') IS NOT NULL
    DROP TRIGGER TR_Payments_UpdatedAt;
GO

-- Tạo trigger (PHẢI để riêng biệt, bắt đầu bằng CREATE TRIGGER)
CREATE TRIGGER TR_Payments_UpdatedAt
ON Payments
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Payments
    SET updated_at = GETDATE()
    FROM Payments p
    INNER JOIN inserted i ON p.payment_id = i.payment_id;
END;
GO


INSERT INTO Employee_Role (role_name, description) VALUES
  ('Admin',   'Administrator role with full permissions'),
  ('Sales',   'Sales representative role'),
  ('Support', 'Customer support role');


INSERT INTO Customer (cus_id, fullname, email, password, birthday, phone, address, pi_url, cus_status)
VALUES 
('CUS0001', N'Nguyễn Văn An', 'nguyenvanan01@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '1995-03-15', '0912345678', N'123 Đường Láng, Hà Nội', NULL, 'active'),
('CUS0002', N'Trần Thị Bích', 'tranthibich02@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '1998-07-22', '0987654321', N'45 Nguyễn Huệ, TP.HCM', NULL, 'active'),
('CUS0003', N'Lê Minh Châu', 'leminhchau03@yahoo.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '2000-11-30', '0901234567', NULL, NULL, 'inactive'),
('CUS0004', N'Phạm Quốc Đạt', 'phamquocdat04@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '1993-05-10', '0932145876', N'78 Lê Lợi, Đà Nẵng', NULL, 'active'),
('CUS0005', N'Hoàng Thị Mai', 'hoangthimai05@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '1997-09-18', '0978456123', N'56 Trần Phú, Nha Trang', NULL, 'active'),
('CUS0006', N'Vũ Đức Hùng', 'vuduchung06@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '1994-12-25', '0945678901', NULL, NULL, 'suspended'),
('CUS0007', N'Đặng Thị Hồng', 'dangthihong07@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '2002-02-14', '0961234789', N'12 Nguyễn Trãi, Hà Nội', NULL, 'active'),
('CUS0008', N'Bùi Văn Khánh', 'buivankhanh08@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '1996-06-05', '0923456789', N'89 Phạm Văn Đồng, Cần Thơ', NULL, 'active'),
('CUS0009', N'Ngô Thị Lan', 'ngothilan09@yahoo.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '1999-08-20', '0956781234', NULL, NULL, 'inactive'),
('CUS0010', N'Tô Minh Nhật', 'tominhnhat10@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '2001-04-12', '0919876543', N'34 Lê Duẩn, Huế', NULL, 'active'),
('CUS0011', N'Phan Văn Phú', 'phanvanphu11@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '1992-10-28', '0981234567', N'67 Nguyễn Văn Cừ, Vinh', NULL, 'active'),
('CUS0012', N'Lý Thị Quyên', 'lythiquyen12@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '2000-01-17', '0908765432', NULL, NULL, 'suspended'),
('CUS0013', N'Mai Văn Sơn', 'maivanson13@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '1995-11-03', '0934567890', N'23 Hoàng Diệu, Hải Phòng', NULL, 'active'),
('CUS0014', N'Nguyễn Thị Thanh', 'nguyenthithanh14@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '1998-03-09', '0967891234', N'45 Lý Thường Kiệt, Đà Lạt', NULL, 'active'),
('CUS0015', N'Trần Văn Thắng', 'tranvanthang15@yahoo.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '1997-07-25', '0941234567', NULL, NULL, 'inactive'),
('CUS0016', N'Võ Thị Thùy', 'vothithuy16@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '2003-05-30', '0976543210', N'78 Nguyễn Thị Minh Khai, Vũng Tàu', NULL, 'active'),
('CUS0017', N'Đỗ Quang Vinh', 'doquangvinh17@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '1994-09-12', '0926781234', N'90 Bạch Đằng, Quảng Ninh', NULL, 'active'),
('CUS0018', N'Huỳnh Thị Ngọc', 'huynhthingoc18@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '1996-12-08', '0951234567', NULL, NULL, 'inactive'),
('CUS0019', N'Lương Văn Tâm', 'luongvantam19@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '2001-06-15', '0913456789', N'15 Hùng Vương, Buôn Ma Thuột', NULL, 'active'),
('CUS0020', N'Đinh Thị Yến', 'dinhthiyen20@yahoo.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '1999-02-20', '0984567890', N'27 Trần Hưng Đạo, Quy Nhơn', NULL, 'active');

INSERT INTO Branch (branch_name, address, status, phone)
VALUES 
(N'Hà Nội', N'123 Đường Láng, Quận Đống Đa, Hà Nội', 'active', '02438561234'),
(N'TP Hồ Chí Minh', N'45 Nguyễn Huệ, Quận 1, TP.HCM', 'active', '02838234567'),
(N'Đà Nẵng', N'78 Lê Lợi, Quận Hải Châu, Đà Nẵng', 'active', '02363890123'),
(N'Hải Phòng', N'56 Trần Phú, Quận Ngô Quyền, Hải Phòng', 'active', '02253845678'),
(N'Cần Thơ', N'89 Ninh Kiều, Quận Ninh Kiều, Cần Thơ', 'active', '02923812345'),
(N'Nghệ An', N'12 Nguyễn Trãi, TP. Vinh, Nghệ An', 'active', '02383856789'),
(N'Khánh Hòa', N'34 Lê Duẩn, TP. Nha Trang, Khánh Hòa', 'active', '02583823456'),
(N'Đồng Nai', N'67 Võ Thị Sáu, TP. Biên Hòa, Đồng Nai', 'active', '02513867890'),
(N'Bình Dương', N'23 Thủ Dầu Một, TP. Thủ Dầu Một, Bình Dương', 'active', '02743890123'),
(N'Quảng Ninh', N'90 Bạch Đằng, TP. Hạ Long, Quảng Ninh', 'active', '02033845678'),
(N'Huế', N'45 Lê Lợi, TP. Huế, Thừa Thiên Huế', 'active', '02343812345'),
(N'Quảng Nam', N'78 Trần Hưng Đạo, TP. Tam Kỳ, Quảng Nam', 'active', '02353856789'),
(N'Bà Rịa - Vũng Tàu', N'56 Nguyễn Thị Minh Khai, TP. Vũng Tàu', 'active', '02543823456'),
(N'Lâm Đồng', N'12 Trần Phú, TP. Đà Lạt, Lâm Đồng', 'active', '02633867890'),
(N'Đắk Lắk', N'89 Hùng Vương, TP. Buôn Ma Thuột, Đắk Lắk', 'active', '02623890123'),
(N'Bình Định', N'34 Nguyễn Huệ, TP. Quy Nhơn, Bình Định', 'active', '02563845678'),
(N'Thanh Hóa', N'67 Lê Lợi, TP. Thanh Hóa, Thanh Hóa', 'active', '02373812345'),
(N'Kiên Giang', N'23 Trần Phú, TP. Rạch Giá, Kiên Giang', 'active', '02973856789'),
(N'Long An', N'90 Nguyễn Văn Cừ, TP. Tân An, Long An', 'active', '02723823456'),
(N'Tiền Giang', N'45 Ấp Bắc, TP. Mỹ Tho, Tiền Giang', 'active', '02733867890'),
(N'An Giang', N'78 Nguyễn Thị Minh Khai, TP. Long Xuyên, An Giang', 'active', '02963890123'),
(N'Vĩnh Phúc', N'56 Mê Linh, TP. Vĩnh Yên, Vĩnh Phúc', 'active', '02113845678'),
(N'Nam Định', N'12 Trần Hưng Đạo, TP. Nam Định, Nam Định', 'active', '02283812345'),
(N'Bắc Ninh', N'89 Nguyễn Trãi, TP. Bắc Ninh, Bắc Ninh', 'inactive', '02223856789'),
(N'Hưng Yên', N'34 Văn Giang, TP. Hưng Yên, Hưng Yên', 'active', '02213823456');

INSERT INTO Employee (
    emp_id, branch_id, fullname,     email,                password,                phone,       address,                                                     role_id, hire_day,   em_status
) VALUES
  ('EMP021304', 3,         N'Nguyễn Văn A','nguyenvana@example.com', 0x243262243130244C61776A5669704A2F6E54652F514C7257757778452E6A6D41366454454B437A793941355A6D487434694C4C49706B45352F464657,     '0901234567',N'123 Đường Nguyễn Huệ, Quận 1, TP HCM',             1,      '2025-04-18','active'),
  ('EMP0013122', 4,         N'Trần Thị B',  'thi.b@example.com', 0x243262243130244C61776A5669704A2F6E54652F514C7257757778452E6A6D41366454454B437A793941355A6D487434694C4C49706B45352F464657,     '0912345678',N'456 Đường Lê Duẩn, Hai Bà Trưng, Hà Nội',               2,      '2025-04-18','active'),
  ('EMP0013233', 3,         N'Lê Văn C',    'van.c@example.com', 0x243262243130244C61776A5669704A2F6E54652F514C7257757778452E6A6D41366454454B437A793941355A6D487434694C4C49706B45352F464657,     '0923456789',N'789 Đường Phạm Ngũ Lão, Quận 1, TP HCM',                 3,      '2025-04-18','active');

INSERT INTO Promotion (promo_id, code, promo_name, discount_percentage, start_date, end_date, max_use, status)
VALUES 
-- 10 bản ghi đã hết hạn sử dụng (kết thúc trước 04/06/2025)
('PROMO0001', 'SALEJAN23', N'Khuyến mãi Tết 2023', 15.00, '2023-01-01', '2023-02-01', 100, 'inactive'),
('PROMO0002', 'SUMMER23', N'Khuyến mãi Hè 2023', 20.00, '2023-06-01', '2023-08-31', 200, 'inactive'),
('PROMO0003', 'BACK2SCHOOL23', N'Khuyến mãi Mùa tựu trường 2023', 10.00, '2023-08-01', '2023-09-15', 150, 'inactive'),
('PROMO0004', 'MIDYEAR23', N'Khuyến mãi giữa năm 2023', 25.00, '2023-07-01', '2023-07-31', 50, 'inactive'),
('PROMO0005', 'NATIONAL23', N'Khuyến mãi Quốc khánh 2023', 30.00, '2023-08-25', '2023-09-02', 300, 'inactive'),
('PROMO0006', 'BLACKFRIDAY23', N'Black Friday 2023', 40.00, '2023-11-20', '2023-11-30', 500, 'inactive'),
('PROMO0007', 'YEAREND23', N'Khuyến mãi cuối năm 2023', 15.00, '2023-12-01', '2023-12-31', 200, 'inactive'),
('PROMO0008', 'TET24', N'Khuyến mãi Tết 2024', 20.00, '2024-01-15', '2024-02-15', 250, 'inactive'),
('PROMO0009', 'SUMMER24', N'Khuyến mãi Hè 2024', 25.00, '2024-06-01', '2024-08-31', 300, 'inactive'),
('PROMO0010', 'MIDYEAR24', N'Khuyến mãi giữa năm 2024', 10.00, '2024-07-01', '2024-07-31', 100, 'inactive'),

-- 20 bản ghi đang trong hạn sử dụng (01/06/2025 - 10/06/2025)
('PROMO0011', 'JUNE25WELCOME', N'Chào đón tháng 6/2025', 10.00, '2025-06-01', '2025-06-10', 200, 'active'),
('PROMO0012', 'SUMMER25A', N'Khuyến mãi Hè 2025 A', 15.00, '2025-06-01', '2025-06-10', 150, 'active'),
('PROMO0013', 'SUMMER25B', N'Khuyến mãi Hè 2025 B', 20.00, '2025-06-01', '2025-06-10', 300, 'active'),
('PROMO0014', 'JUNE25SALE1', N'Khuyến mãi tháng 6/2025 1', 25.00, '2025-06-01', '2025-06-10', 100, 'active'),
('PROMO0015', 'JUNE25SALE2', N'Khuyến mãi tháng 6/2025 2', 30.00, '2025-06-01', '2025-06-10', 250, 'active'),
('PROMO0016', 'JUNE25VIP', N'Khuyến mãi VIP tháng 6/2025', 35.00, '2025-06-01', '2025-06-10', 50, 'active'),
('PROMO0017', 'JUNE25NEW', N'Khuyến mãi khách mới tháng 6/2025', 12.00, '2025-06-01', '2025-06-10', 200, 'active'),
('PROMO0018', 'JUNE25HOT', N'Khuyến mãi hot tháng 6/2025', 18.00, '2025-06-01', '2025-06-10', 300, 'active'),
('PROMO0019', 'SUMMER25C', N'Khuyến mãi Hè 2025 C', 22.00, '2025-06-01', '2025-06-10', 150, 'active'),
('PROMO0020', 'JUNE25EXTRA', N'Khuyến mãi thêm tháng 6/2025', 28.00, '2025-06-01', '2025-06-10', 100, 'active'),
('PROMO0021', 'JUNE25DEAL1', N'Ưu đãi tháng 6/2025 1', 15.00, '2025-06-01', '2025-06-10', 200, 'active'),
('PROMO0022', 'JUNE25DEAL2', N'Ưu đãi tháng 6/2025 2', 20.00, '2025-06-01', '2025-06-10', 250, 'active'),
('PROMO0023', 'SUMMER25D', N'Khuyến mãi Hè 2025 D', 25.00, '2025-06-01', '2025-06-10', 300, 'active'),
('PROMO0024', 'JUNE25SAVE', N'Khuyến mãi tiết kiệm tháng 6/2025', 10.00, '2025-06-01', '2025-06-10', 150, 'active'),
('PROMO0025', 'JUNE25PREMIUM', N'Khuyến mãi cao cấp tháng 6/2025', 30.00, '2025-06-01', '2025-06-10', 50, 'active'),
('PROMO0026', 'JUNE25HOTDEAL', N'Ưu đãi hot tháng 6/2025', 18.00, '2025-06-01', '2025-06-10', 200, 'active'),
('PROMO0027', 'SUMMER25E', N'Khuyến mãi Hè 2025 E', 22.00, '2025-06-01', '2025-06-10', 250, 'active'),
('PROMO0028', 'JUNE25LOYAL', N'Khuyến mãi khách hàng thân thiết 6/2025', 15.00, '2025-06-01', '2025-06-10', 100, 'active'),
('PROMO0029', 'JUNE25FLASH', N'Khuyến mãi chớp nhoáng 6/2025', 20.00, '2025-06-01', '2025-06-10', 300, 'active'),
('PROMO0030', 'JUNE25SUMMER', N'Khuyến mãi mùa hè tháng 6/2025', 25.00, '2025-06-01', '2025-06-10', 200, 'active'),

-- 10 bản ghi chưa đến hạn sử dụng (10/06/2025 - 20/06/2025)
('PROMO0031', 'MIDJUNE25A', N'Khuyến mãi giữa tháng 6/2025 A', 15.00, '2025-06-10', '2025-06-20', 200, 'active'),
('PROMO0032', 'MIDJUNE25B', N'Khuyến mãi giữa tháng 6/2025 B', 20.00, '2025-06-10', '2025-06-20', 150, 'active'),
('PROMO0033', 'MIDJUNE25C', N'Khuyến mãi giữa tháng 6/2025 C', 25.00, '2025-06-10', '2025-06-20', 300, 'active'),
('PROMO0034', 'MIDJUNE25VIP', N'Khuyến mãi VIP giữa tháng 6/2025', 30.00, '2025-06-10', '2025-06-20', 50, 'active'),
('PROMO0035', 'MIDJUNE25NEW', N'Khuyến mãi khách mới giữa 6/2025', 10.00, '2025-06-10', '2025-06-20', 200, 'active'),
('PROMO0036', 'MIDJUNE25HOT', N'Khuyến mãi hot giữa tháng 6/2025', 18.00, '2025-06-10', '2025-06-20', 250, 'active'),
('PROMO0037', 'MIDJUNE25EXTRA', N'Khuyến mãi thêm giữa 6/2025', 22.00, '2025-06-10', '2025-06-20', 100, 'active'),
('PROMO0038', 'MIDJUNE25DEAL', N'Ưu đãi giữa tháng 6/2025', 15.00, '2025-06-10', '2025-06-20', 200, 'active'),
('PROMO0039', 'MIDJUNE25SAVE', N'Khuyến mãi tiết kiệm giữa 6/2025', 20.00, '2025-06-10', '2025-06-20', 150, 'active'),
('PROMO0040', 'MIDJUNE25PREMIUM', N'Khuyến mãi cao cấp giữa 6/2025', 25.00, '2025-06-10', '2025-06-20', 300, 'active');

INSERT INTO Employee (emp_id, branch_id, fullname, email, password, phone, address, role_id, hire_day, pi_url, em_status)
VALUES 
-- Chi nhánh 1: Hà Nội (branch_id = 1)
('EMP0001', 1, N'Nguyễn Văn Hùng', 'nguyenvanhung01@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '0912345678', N'123 Đường Láng, Quận Đống Đa, Hà Nội', 2, '2023-01-15', NULL, 'active'),
('EMP0002', 1, N'Trần Thị Lan', 'tranthilan02@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '0987654321', N'45 Nguyễn Huệ, Quận Ba Đình, Hà Nội', 3, '2023-03-20', NULL, 'active'),

-- Chi nhánh 3: Đà Nẵng (branch_id = 3)
('EMP0003', 3, N'Lê Minh Tuấn', 'leminhtuan03@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '0901234567', N'78 Lê Lợi, Quận Hải Châu, Đà Nẵng', 2, '2023-06-10', NULL, 'active'),
('EMP0004', 3, N'Phạm Thị Mai', 'phamthimai04@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '0932145876', N'56 Trần Phú, Quận Sơn Trà, Đà Nẵng', 3, '2023-08-15', NULL, 'active'),

-- Chi nhánh 5: Cần Thơ (branch_id = 5)
('EMP0005', 5, N'Hoàng Văn Nam', 'hoangvannam05@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '0978456123', N'89 Ninh Kiều, Quận Ninh Kiều, Cần Thơ', 2, '2024-01-10', NULL, 'active'),
('EMP0006', 5, N'Ngô Thị Hồng', 'ngothihong06@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '0945678901', NULL, 3, '2024-03-25', NULL, 'inactive'),

-- Chi nhánh 7: Khánh Hòa (branch_id = 7)
('EMP0007', 7, N'Vũ Đình Khánh', 'vudinhkhanh07@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '0961234789', N'34 Lê Duẩn, TP. Nha Trang, Khánh Hòa', 2, '2023-11-05', NULL, 'active'),
('EMP0008', 7, N'Đặng Thị Thủy', 'dangthithuy08@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '0923456789', N'12 Trần Phú, TP. Nha Trang, Khánh Hòa', 3, '2023-12-20', NULL, 'active'),

-- Chi nhánh 10: Quảng Ninh (branch_id = 10)
('EMP0009', 10, N'Bùi Văn Long', 'buivanlong09@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '0956781234', N'90 Bạch Đằng, TP. Hạ Long, Quảng Ninh', 2, '2024-02-15', NULL, 'active'),
('EMP0010', 10, N'Tô Thị Ngọc', 'tothingoc10@gmail.com', 0x24326224313024363056747071562F4A6956797835585634374A6C304F796333306273672F47792F4C7450576D617A764A347130716335766A333961, '0919876543', NULL, 3, '2024-04-10', NULL, 'suspended');

INSERT INTO Tour (tour_id, branch_id, name, duration, destination, departure_location, start_date, end_date, description, max_guests, transport, status)
VALUES 
-- Đã hoàn thành (end_date trước 04/06/2025)
('TOUR0001', 1, N'Tour khám phá Hà Nội cổ', 2, N'Hà Nội', N'TP.HCM', '2025-05-01', '2025-05-03', N'Khám phá Phố cổ và Hồ Gươm', 10, N'bus', 'completed'),
('TOUR0002', 3, N'Tour TP.HCM lịch sử', 3, N'TP.HCM', N'Đà Nẵng', '2025-04-15', '2025-04-18', N'Ghé thăm Dinh Độc Lập', 8, N'plane', 'completed'),
('TOUR0003', 5, N'Tour Phú Yên biển xanh', 2, N'Phú Yên', N'Cần Thơ', '2025-03-20', '2025-03-22', N'Khám phá Gành Đá Dĩa', 6, N'bus', 'completed'),
('TOUR0004', 7, N'Tour Đà Lạt hoa', 3, N'Đà Lạt', N'Khánh Hòa', '2025-04-10', '2025-04-13', N'Tham quan Thung Lũng Tình Yêu', 10, N'car', 'completed'),
('TOUR0005', 10, N'Tour Bình Định truyền thống', 2, N'Bình Định', N'Quảng Ninh', '2025-05-05', '2025-05-07', N'Khám phá tháp Chăm', 7, N'bus', 'completed'),
('TOUR0006', 2, N'Tour Huế hoàng gia', 3, N'Huế', N'Hà Nội', '2025-03-25', '2025-03-28', N'Ghé Đại Nội Huế', 9, N'train', 'completed'),
('TOUR0007', 4, N'Tour Quảng Trị chiến khu', 2, N'Quảng Trị', N'Hải Phòng', '2025-04-01', '2025-04-03', N'Khám phá Thành Cổ Quảng Trị', 5, N'bus', 'completed'),
('TOUR0008', 6, N'Tour Đà Nẵng biển', 3, N'Đà Nẵng', N'Nghệ An', '2025-05-10', '2025-05-13', N'Ghé Bà Nà Hills', 8, N'plane', 'completed'),

-- Đang khởi hành (bao gồm 04/06/2025)
('TOUR0009', 1, N'Tour Hà Nội mùa hè', 3, N'Hà Nội', N'TP.HCM', '2025-06-02', '2025-06-05', N'Khám phá Văn Miếu', 12, N'bus', 'ongoing'),
('TOUR0010', 3, N'Tour TP.HCM lễ hội', 2, N'TP.HCM', N'Đà Nẵng', '2025-06-03', '2025-06-06', N'Tham quan chợ Bến Thành', 10, N'plane', 'ongoing'),

-- Sắp khởi hành (04/06/2025 - 11/06/2025)
('TOUR0011', 5, N'Tour Phú Yên khám phá', 3, N'Phú Yên', N'Cần Thơ', '2025-06-04', '2025-06-07', N'Ghé Gành Đá Dĩa', 15, N'bus', 'active'),
('TOUR0012', 5, N'Tour Phú Yên biển đẹp', 2, N'Phú Yên', N'Cần Thơ', '2025-06-05', '2025-06-08', N'Khám phá bãi biển Tuy Hòa', 10, N'car', 'active'),
('TOUR0013', 5, N'Tour Phú Yên văn hóa', 3, N'Phú Yên', N'Cần Thơ', '2025-06-06', '2025-06-09', N'Tham quan tháp Nhạn', 12, N'bus', 'active'),
('TOUR0014', 5, N'Tour Phú Yên thiên nhiên', 2, N'Phú Yên', N'Cần Thơ', '2025-06-07', '2025-06-10', N'Khám phá đầm Ô Loan', 8, N'train', 'active'),
('TOUR0015', 5, N'Tour Phú Yên nghỉ dưỡng', 3, N'Phú Yên', N'Cần Thơ', '2025-06-08', '2025-06-11', N'Ghé resort biển', 15, N'plane', 'active'),
('TOUR0016', 7, N'Tour Đà Lạt hoa xuân', 3, N'Đà Lạt', N'Khánh Hòa', '2025-06-04', '2025-06-07', N'Tham quan hồ Xuân Hương', 10, N'bus', 'active'),
('TOUR0017', 7, N'Tour Đà Lạt mùa hè', 2, N'Đà Lạt', N'Khánh Hòa', '2025-06-05', '2025-06-08', N'Khám phá Thung Lũng Tình Yêu', 12, N'car', 'active'),
('TOUR0018', 7, N'Tour Đà Lạt nghỉ dưỡng', 3, N'Đà Lạt', N'Khánh Hòa', '2025-06-06', '2025-06-09', N'Ghé hồ Tuyền Lâm', 8, N'bus', 'active'),
('TOUR0019', 7, N'Tour Đà Lạt văn hóa', 2, N'Đà Lạt', N'Khánh Hòa', '2025-06-07', '2025-06-10', N'Tham quan chợ Đà Lạt', 10, N'train', 'active'),
('TOUR0020', 7, N'Tour Đà Lạt thiên nhiên', 3, N'Đà Lạt', N'Khánh Hòa', '2025-06-08', '2025-06-11', N'Khám phá thác Datanla', 15, N'plane', 'active'),
('TOUR0021', 10, N'Tour Bình Định biển', 3, N'Bình Định', N'Quảng Ninh', '2025-06-04', '2025-06-07', N'Ghé bãi biển Quy Nhơn', 12, N'bus', 'active'),
('TOUR0022', 10, N'Tour Bình Định lịch sử', 2, N'Bình Định', N'Quảng Ninh', '2025-06-05', '2025-06-08', N'Khám phá tháp Chăm', 10, N'car', 'active'),
('TOUR0023', 10, N'Tour Bình Định văn hóa', 3, N'Bình Định', N'Quảng Ninh', '2025-06-06', '2025-06-09', N'Tham quan làng gốm', 8, N'bus', 'active'),
('TOUR0024', 10, N'Tour Bình Định thiên nhiên', 2, N'Bình Định', N'Quảng Ninh', '2025-06-07', '2025-06-10', N'Khám phá đầm Thị Nại', 12, N'train', 'active'),
('TOUR0025', 10, N'Tour Bình Định nghỉ dưỡng', 3, N'Bình Định', N'Quảng Ninh', '2025-06-08', '2025-06-11', N'Ghé resort biển', 10, N'plane', 'active'),
('TOUR0026', 2, N'Tour Huế di sản', 3, N'Huế', N'Hà Nội', '2025-06-04', '2025-06-07', N'Tham quan Đại Nội', 15, N'bus', 'active'),
('TOUR0027', 2, N'Tour Huế ẩm thực', 2, N'Huế', N'Hà Nội', '2025-06-05', '2025-06-08', N'Khám phá món ăn Huế', 10, N'car', 'active'),
('TOUR0028', 2, N'Tour Huế lịch sử', 3, N'Huế', N'Hà Nội', '2025-06-06', '2025-06-09', N'Ghé lăng Tự Đức', 12, N'bus', 'active'),
('TOUR0029', 2, N'Tour Huế thiên nhiên', 2, N'Huế', N'Hà Nội', '2025-06-07', '2025-06-10', N'Khám phá sông Hương', 8, N'train', 'active'),
('TOUR0030', 2, N'Tour Huế nghỉ dưỡng', 3, N'Huế', N'Hà Nội', '2025-06-08', '2025-06-11', N'Ghé resort Huế', 15, N'plane', 'active'),
('TOUR0031', 4, N'Tour Quảng Trị chiến khu', 3, N'Quảng Trị', N'Hải Phòng', '2025-06-04', '2025-06-07', N'Khám phá Thành Cổ', 10, N'bus', 'active'),
('TOUR0032', 4, N'Tour Quảng Trị lịch sử', 2, N'Quảng Trị', N'Hải Phòng', '2025-06-05', '2025-06-08', N'Ghé cầu Hiền Lương', 12, N'car', 'active'),
('TOUR0033', 4, N'Tour Quảng Trị văn hóa', 3, N'Quảng Trị', N'Hải Phòng', '2025-06-06', '2025-06-09', N'Tham quan làng cổ', 8, N'bus', 'active'),
('TOUR0034', 4, N'Tour Quảng Trị thiên nhiên', 2, N'Quảng Trị', N'Hải Phòng', '2025-06-07', '2025-06-10', N'Khám phá đèo Ngang', 10, N'train', 'active'),
('TOUR0035', 4, N'Tour Quảng Trị nghỉ dưỡng', 3, N'Quảng Trị', N'Hải Phòng', '2025-06-08', '2025-06-11', N'Ghé resort biển', 15, N'plane', 'active'),
('TOUR0036', 6, N'Tour Đà Nẵng biển', 3, N'Đà Nẵng', N'Nghệ An', '2025-06-04', '2025-06-07', N'Ghé Mỹ Khê', 12, N'bus', 'active'),
('TOUR0037', 6, N'Tour Đà Nẵng núi', 2, N'Đà Nẵng', N'Nghệ An', '2025-06-05', '2025-06-08', N'Khám phá Ngũ Hành Sơn', 10, N'car', 'active'),
('TOUR0038', 6, N'Tour Đà Nẵng văn hóa', 3, N'Đà Nẵng', N'Nghệ An', '2025-06-06', '2025-06-09', N'Tham quan cầu Rồng', 8, N'bus', 'active'),
('TOUR0039', 6, N'Tour Đà Nẵng thiên nhiên', 2, N'Đà Nẵng', N'Nghệ An', '2025-06-07', '2025-06-10', N'Khám phá Bà Nà', 12, N'train', 'active'),
('TOUR0040', 6, N'Tour Đà Nẵng nghỉ dưỡng', 3, N'Đà Nẵng', N'Nghệ An', '2025-06-08', '2025-06-11', N'Ghé resort Đà Nẵng', 10, N'plane', 'active'),

-- Chưa khởi hành (11/06/2025 trở đi)
('TOUR0041', 1, N'Tour Hà Nội mùa thu', 3, N'Hà Nội', N'TP.HCM', '2025-06-11', '2025-06-14', N'Khám phá mùa thu Hà Nội', 15, N'bus', 'active'),
('TOUR0042', 1, N'Tour Hà Nội lễ hội', 2, N'Hà Nội', N'TP.HCM', '2025-06-12', '2025-06-15', N'Tham quan lễ hội', 10, N'car', 'active'),
('TOUR0043', 1, N'Tour Hà Nội văn hóa', 3, N'Hà Nội', N'TP.HCM', '2025-06-13', '2025-06-16', N'Ghé Văn Miếu', 12, N'bus', 'active'),
('TOUR0044', 1, N'Tour Hà Nội thiên nhiên', 2, N'Hà Nội', N'TP.HCM', '2025-06-14', '2025-06-17', N'Khám phá hồ Tây', 8, N'train', 'active'),
('TOUR0045', 1, N'Tour Hà Nội nghỉ dưỡng', 3, N'Hà Nội', N'TP.HCM', '2025-06-15', '2025-06-18', N'Ghé resort Hà Nội', 15, N'plane', 'active'),
('TOUR0046', 3, N'Tour TP.HCM mùa hè', 3, N'TP.HCM', N'Đà Nẵng', '2025-06-11', '2025-06-14', N'Khám phá mùa hè TP.HCM', 10, N'bus', 'active'),
('TOUR0047', 3, N'Tour TP.HCM lễ hội', 2, N'TP.HCM', N'Đà Nẵng', '2025-06-12', '2025-06-15', N'Tham quan lễ hội TP.HCM', 12, N'car', 'active'),
('TOUR0048', 3, N'Tour TP.HCM văn hóa', 3, N'TP.HCM', N'Đà Nẵng', '2025-06-13', '2025-06-16', N'Ghé Dinh Độc Lập', 8, N'bus', 'active'),
('TOUR0049', 3, N'Tour TP.HCM thiên nhiên', 2, N'TP.HCM', N'Đà Nẵng', '2025-06-14', '2025-06-17', N'Khám phá công viên', 10, N'train', 'active'),
('TOUR0050', 3, N'Tour TP.HCM nghỉ dưỡng', 3, N'TP.HCM', N'Đà Nẵng', '2025-06-15', '2025-06-18', N'Ghé resort TP.HCM', 15, N'plane', 'active'),
('TOUR0051', 5, N'Tour Phú Yên mùa hè', 3, N'Phú Yên', N'Cần Thơ', '2025-06-11', '2025-06-14', N'Khám phá mùa hè Phú Yên', 12, N'bus', 'active'),
('TOUR0052', 5, N'Tour Phú Yên lễ hội', 2, N'Phú Yên', N'Cần Thơ', '2025-06-12', '2025-06-15', N'Tham quan lễ hội Phú Yên', 10, N'car', 'active'),
('TOUR0053', 5, N'Tour Phú Yên văn hóa', 3, N'Phú Yên', N'Cần Thơ', '2025-06-13', '2025-06-16', N'Ghé Gành Đá Dĩa', 8, N'bus', 'active'),
('TOUR0054', 5, N'Tour Phú Yên thiên nhiên', 2, N'Phú Yên', N'Cần Thơ', '2025-06-14', '2025-06-17', N'Khám phá đầm Ô Loan', 12, N'train', 'active'),
('TOUR0055', 5, N'Tour Phú Yên nghỉ dưỡng', 3, N'Phú Yên', N'Cần Thơ', '2025-06-15', '2025-06-18', N'Ghé resort Phú Yên', 10, N'plane', 'active'),
('TOUR0056', 7, N'Tour Đà Lạt mùa hoa', 3, N'Đà Lạt', N'Khánh Hòa', '2025-06-11', '2025-06-14', N'Khám phá mùa hoa Đà Lạt', 15, N'bus', 'active'),
('TOUR0057', 7, N'Tour Đà Lạt lễ hội', 2, N'Đà Lạt', N'Khánh Hòa', '2025-06-12', '2025-06-15', N'Tham quan lễ hội Đà Lạt', 10, N'car', 'active'),
('TOUR0058', 7, N'Tour Đà Lạt văn hóa', 3, N'Đà Lạt', N'Khánh Hòa', '2025-06-13', '2025-06-16', N'Ghé hồ Xuân Hương', 12, N'bus', 'active'),
('TOUR0059', 7, N'Tour Đà Lạt thiên nhiên', 2, N'Đà Lạt', N'Khánh Hòa', '2025-06-14', '2025-06-17', N'Khám phá thác Datanla', 8, N'train', 'active'),
('TOUR0060', 7, N'Tour Đà Lạt nghỉ dưỡng', 3, N'Đà Lạt', N'Khánh Hòa', '2025-06-15', '2025-06-18', N'Ghé resort Đà Lạt', 15, N'plane', 'active'),
('TOUR0061', 10, N'Tour Bình Định mùa hè', 3, N'Bình Định', N'Quảng Ninh', '2025-06-11', '2025-06-14', N'Khám phá mùa hè Bình Định', 12, N'bus', 'active'),
('TOUR0062', 10, N'Tour Bình Định lễ hội', 2, N'Bình Định', N'Quảng Ninh', '2025-06-12', '2025-06-15', N'Tham quan lễ hội Bình Định', 10, N'car', 'active'),
('TOUR0063', 10, N'Tour Bình Định văn hóa', 3, N'Bình Định', N'Quảng Ninh', '2025-06-13', '2025-06-16', N'Ghé tháp Chăm', 8, N'bus', 'active'),
('TOUR0064', 10, N'Tour Bình Định thiên nhiên', 2, N'Bình Định', N'Quảng Ninh', '2025-06-14', '2025-06-17', N'Khám phá đầm Thị Nại', 12, N'train', 'active'),
('TOUR0065', 10, N'Tour Bình Định nghỉ dưỡng', 3, N'Bình Định', N'Quảng Ninh', '2025-06-15', '2025-06-18', N'Ghé resort Bình Định', 10, N'plane', 'active'),
('TOUR0066', 2, N'Tour Huế mùa hè', 3, N'Huế', N'Hà Nội', '2025-06-11', '2025-06-14', N'Khám phá mùa hè Huế', 15, N'bus', 'active'),
('TOUR0067', 2, N'Tour Huế lễ hội', 2, N'Huế', N'Hà Nội', '2025-06-12', '2025-06-15', N'Tham quan lễ hội Huế', 10, N'car', 'active'),
('TOUR0068', 2, N'Tour Huế văn hóa', 3, N'Huế', N'Hà Nội', '2025-06-13', '2025-06-16', N'Ghé Đại Nội', 12, N'bus', 'active'),
('TOUR0069', 2, N'Tour Huế thiên nhiên', 2, N'Huế', N'Hà Nội', '2025-06-14', '2025-06-17', N'Khám phá sông Hương', 8, N'train', 'active'),
('TOUR0070', 2, N'Tour Huế nghỉ dưỡng', 3, N'Huế', N'Hà Nội', '2025-06-15', '2025-06-18', N'Ghé resort Huế', 15, N'plane', 'active'),
('TOUR0071', 4, N'Tour Quảng Trị mùa hè', 3, N'Quảng Trị', N'Hải Phòng', '2025-06-11', '2025-06-14', N'Khám phá mùa hè Quảng Trị', 12, N'bus', 'active'),
('TOUR0072', 4, N'Tour Quảng Trị lễ hội', 2, N'Quảng Trị', N'Hải Phòng', '2025-06-12', '2025-06-15', N'Tham quan lễ hội Quảng Trị', 10, N'car', 'active'),
('TOUR0073', 4, N'Tour Quảng Trị văn hóa', 3, N'Quảng Trị', N'Hải Phòng', '2025-06-13', '2025-06-16', N'Ghé Thành Cổ', 8, N'bus', 'active'),
('TOUR0074', 4, N'Tour Quảng Trị thiên nhiên', 2, N'Quảng Trị', N'Hải Phòng', '2025-06-14', '2025-06-17', N'Khám phá đèo Ngang', 12, N'train', 'active'),
('TOUR0075', 4, N'Tour Quảng Trị nghỉ dưỡng', 3, N'Quảng Trị', N'Hải Phòng', '2025-06-15', '2025-06-18', N'Ghé resort Quảng Trị', 10, N'plane', 'active'),
('TOUR0076', 6, N'Tour Đà Nẵng mùa hè', 3, N'Đà Nẵng', N'Nghệ An', '2025-06-11', '2025-06-14', N'Khám phá mùa hè Đà Nẵng', 15, N'bus', 'active'),
('TOUR0077', 6, N'Tour Đà Nẵng lễ hội', 2, N'Đà Nẵng', N'Nghệ An', '2025-06-12', '2025-06-15', N'Tham quan lễ hội Đà Nẵng', 10, N'car', 'active'),
('TOUR0078', 6, N'Tour Đà Nẵng văn hóa', 3, N'Đà Nẵng', N'Nghệ An', '2025-06-13', '2025-06-16', N'Ghé cầu Rồng', 12, N'bus', 'active'),
('TOUR0079', 6, N'Tour Đà Nẵng thiên nhiên', 2, N'Đà Nẵng', N'Nghệ An', '2025-06-14', '2025-06-17', N'Khám phá Bà Nà', 8, N'train', 'active'),
('TOUR0080', 6, N'Tour Đà Nẵng nghỉ dưỡng', 3, N'Đà Nẵng', N'Nghệ An', '2025-06-15', '2025-06-18', N'Ghé resort Đà Nẵng', 15, N'plane', 'active');



INSERT INTO Tour_Schedule (schedule_id, tour_id, day_number, tour_route, detail)
VALUES 
-- TOUR0011 ()
('SCH0001', 'TOUR0011', 1, N'đi du lịch', N'ghé Gành Đá Dĩa'),
('SCH0002', 'TOUR0011', 2, N'tham quan', N'bãi biển Tuy Hòa'),
('SCH0003', 'TOUR0011', 3, N'nghỉ ngơi', N'thư giãn tại resort'),
-- TOUR0012 (duration 2, sắp khởi hành)
('SCH0004', 'TOUR0012', 1, N'đi du lịch', N'ghé bãi biển Tuy Hòa'),
('SCH0005', 'TOUR0012', 2, N'tham quan', N'khám phá đầm Ô Loan'),
-- TOUR0013 (duration 3, sắp khởi hành)
('SCH0006', 'TOUR0013', 1, N'đi du lịch', N'ghé tháp Nhạn'),
('SCH0007', 'TOUR0013', 2, N'tham quan', N'khám phá Gành Đá Dĩa'),
('SCH0008', 'TOUR0013', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0014 (duration 2, sắp khởi hành)
('SCH0009', 'TOUR0014', 1, N'đi du lịch', N'ghé đầm Ô Loan'),
('SCH0010', 'TOUR0014', 2, N'tham quan', N'nghỉ ngơi tại resort'),
-- TOUR0015 (duration 3, sắp khởi hành)
('SCH0011', 'TOUR0015', 1, N'đi du lịch', N'ghé resort biển'),
('SCH0012', 'TOUR0015', 2, N'tham quan', N'khám phá bãi biển Tuy Hòa'),
('SCH0013', 'TOUR0015', 3, N'nghỉ ngơi', N'thư giãn tại bãi biển'),
-- TOUR0016 (duration 3, sắp khởi hành)
('SCH0014', 'TOUR0016', 1, N'đi du lịch', N'ghé hồ Xuân Hương'),
('SCH0015', 'TOUR0016', 2, N'tham quan', N'khám phá Thung Lũng Tình Yêu'),
('SCH0016', 'TOUR0016', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0017 (duration 2, sắp khởi hành)
('SCH0017', 'TOUR0017', 1, N'đi du lịch', N'ghé Thung Lũng Tình Yêu'),
('SCH0018', 'TOUR0017', 2, N'tham quan', N'khám phá hồ Xuân Hương'),
-- TOUR0018 (duration 3, sắp khởi hành)
('SCH0019', 'TOUR0018', 1, N'đi du lịch', N'ghé hồ Tuyền Lâm'),
('SCH0020', 'TOUR0018', 2, N'tham quan', N'khám phá thác Datanla'),
('SCH0021', 'TOUR0018', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0019 (duration 2, sắp khởi hành)
('SCH0022', 'TOUR0019', 1, N'đi du lịch', N'ghé chợ Đà Lạt'),
('SCH0023', 'TOUR0019', 2, N'tham quan', N'khám phá hồ Xuân Hương'),
-- TOUR0020 (duration 3, sắp khởi hành)
('SCH0024', 'TOUR0020', 1, N'đi du lịch', N'ghé thác Datanla'),
('SCH0025', 'TOUR0020', 2, N'tham quan', N'khám phá hồ Tuyền Lâm'),
('SCH0026', 'TOUR0020', 3, N'nghỉ ngơi', N'thư giãn tại resort'),
-- TOUR0021 (duration 3, sắp khởi hành)
('SCH0027', 'TOUR0021', 1, N'đi du lịch', N'ghé bãi biển Quy Nhơn'),
('SCH0028', 'TOUR0021', 2, N'tham quan', N'khám phá tháp Chăm'),
('SCH0029', 'TOUR0021', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0022 (duration 2, sắp khởi hành)
('SCH0030', 'TOUR0022', 1, N'đi du lịch', N'ghé tháp Chăm'),
('SCH0031', 'TOUR0022', 2, N'tham quan', N'khám phá bãi biển Quy Nhơn'),
-- TOUR0023 (duration 3, sắp khởi hành)
('SCH0032', 'TOUR0023', 1, N'đi du lịch', N'ghé làng gốm'),
('SCH0033', 'TOUR0023', 2, N'tham quan', N'khám phá tháp Chăm'),
('SCH0034', 'TOUR0023', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0024 (duration 2, sắp khởi hành)
('SCH0035', 'TOUR0024', 1, N'đi du lịch', N'ghé đầm Thị Nại'),
('SCH0036', 'TOUR0024', 2, N'tham quan', N'khám phá bãi biển Quy Nhơn'),
-- TOUR0025 (duration 3, sắp khởi hành)
('SCH0037', 'TOUR0025', 1, N'đi du lịch', N'ghé resort biển'),
('SCH0038', 'TOUR0025', 2, N'tham quan', N'khám phá bãi biển Quy Nhơn'),
('SCH0039', 'TOUR0025', 3, N'nghỉ ngơi', N'thư giãn tại resort'),
-- TOUR0026 (duration 3, sắp khởi hành)
('SCH0040', 'TOUR0026', 1, N'đi du lịch', N'ghé Đại Nội'),
('SCH0041', 'TOUR0026', 2, N'tham quan', N'khám phá lăng Tự Đức'),
('SCH0042', 'TOUR0026', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0027 (duration 2, sắp khởi hành)
('SCH0043', 'TOUR0027', 1, N'đi du lịch', N'khám phá món ăn Huế'),
('SCH0044', 'TOUR0027', 2, N'tham quan', N'ghé sông Hương'),
-- TOUR0028 (duration 3, sắp khởi hành)
('SCH0045', 'TOUR0028', 1, N'đi du lịch', N'ghé lăng Tự Đức'),
('SCH0046', 'TOUR0028', 2, N'tham quan', N'khám phá Đại Nội'),
('SCH0047', 'TOUR0028', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0029 (duration 2, sắp khởi hành)
('SCH0048', 'TOUR0029', 1, N'đi du lịch', N'ghé sông Hương'),
('SCH0049', 'TOUR0029', 2, N'tham quan', N'khám phá lăng Khải Định'),
-- TOUR0030 (duration 3, sắp khởi hành)
('SCH0050', 'TOUR0030', 1, N'đi du lịch', N'ghé resort Huế'),
('SCH0051', 'TOUR0030', 2, N'tham quan', N'khám phá Đại Nội'),
('SCH0052', 'TOUR0030', 3, N'nghỉ ngơi', N'thư giãn tại resort'),
-- TOUR0031 (duration 3, sắp khởi hành)
('SCH0053', 'TOUR0031', 1, N'đi du lịch', N'ghé Thành Cổ'),
('SCH0054', 'TOUR0031', 2, N'tham quan', N'khám phá cầu Hiền Lương'),
('SCH0055', 'TOUR0031', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0032 (duration 2, sắp khởi hành)
('SCH0056', 'TOUR0032', 1, N'đi du lịch', N'ghé cầu Hiền Lương'),
('SCH0057', 'TOUR0032', 2, N'tham quan', N'khám phá Thành Cổ'),
-- TOUR0033 (duration 3, sắp khởi hành)
('SCH0058', 'TOUR0033', 1, N'đi du lịch', N'ghé làng cổ'),
('SCH0059', 'TOUR0033', 2, N'tham quan', N'khám phá Thành Cổ'),
('SCH0060', 'TOUR0033', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0034 (duration 2, sắp khởi hành)
('SCH0061', 'TOUR0034', 1, N'đi du lịch', N'ghé đèo Ngang'),
('SCH0062', 'TOUR0034', 2, N'tham quan', N'khám phá cầu Hiền Lương'),
-- TOUR0035 (duration 3, sắp khởi hành)
('SCH0063', 'TOUR0035', 1, N'đi du lịch', N'ghé resort biển'),
('SCH0064', 'TOUR0035', 2, N'tham quan', N'khám phá Thành Cổ'),
('SCH0065', 'TOUR0035', 3, N'nghỉ ngơi', N'thư giãn tại resort'),
-- TOUR0036 (duration 3, sắp khởi hành)
('SCH0066', 'TOUR0036', 1, N'đi du lịch', N'ghé bãi Mỹ Khê'),
('SCH0067', 'TOUR0036', 2, N'tham quan', N'khám phá Ngũ Hành Sơn'),
('SCH0068', 'TOUR0036', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0037 (duration 2, sắp khởi hành)
('SCH0069', 'TOUR0037', 1, N'đi du lịch', N'ghé Ngũ Hành Sơn'),
('SCH0070', 'TOUR0037', 2, N'tham quan', N'khám phá bãi Mỹ Khê'),
-- TOUR0038 (duration 3, sắp khởi hành)
('SCH0071', 'TOUR0038', 1, N'đi du lịch', N'ghé cầu Rồng'),
('SCH0072', 'TOUR0038', 2, N'tham quan', N'khám phá bãi Mỹ Khê'),
('SCH0073', 'TOUR0038', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0039 (duration 2, sắp khởi hành)
('SCH0074', 'TOUR0039', 1, N'đi du lịch', N'ghé Bà Nà Hills'),
('SCH0075', 'TOUR0039', 2, N'tham quan', N'khám phá Ngũ Hành Sơn'),
-- TOUR0040 (duration 3, sắp khởi hành)
('SCH0076', 'TOUR0040', 1, N'đi du lịch', N'ghé resort Đà Nẵng'),
('SCH0077', 'TOUR0040', 2, N'tham quan', N'khám phá cầu Rồng'),
('SCH0078', 'TOUR0040', 3, N'nghỉ ngơi', N'thư giãn tại resort'),
-- TOUR0041 (duration 3, chưa khởi hành)
('SCH0079', 'TOUR0041', 1, N'đi du lịch', N'ghé mùa thu Hà Nội'),
('SCH0080', 'TOUR0041', 2, N'tham quan', N'khám phá Hồ Gươm'),
('SCH0081', 'TOUR0041', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0042 (duration 2, chưa khởi hành)
('SCH0082', 'TOUR0042', 1, N'đi du lịch', N'ghé lễ hội Hà Nội'),
('SCH0083', 'TOUR0042', 2, N'tham quan', N'khám phá Văn Miếu'),
-- TOUR0043 (duration 3, chưa khởi hành)
('SCH0084', 'TOUR0043', 1, N'đi du lịch', N'ghé Văn Miếu'),
('SCH0085', 'TOUR0043', 2, N'tham quan', N'khám phá Hồ Gươm'),
('SCH0086', 'TOUR0043', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0044 (duration 2, chưa khởi hành)
('SCH0087', 'TOUR0044', 1, N'đi du lịch', N'ghé hồ Tây'),
('SCH0088', 'TOUR0044', 2, N'tham quan', N'khám phá Phố cổ'),
-- TOUR0045 (duration 3, chưa khởi hành)
('SCH0089', 'TOUR0045', 1, N'đi du lịch', N'ghé resort Hà Nội'),
('SCH0090', 'TOUR0045', 2, N'tham quan', N'khám phá Văn Miếu'),
('SCH0091', 'TOUR0045', 3, N'nghỉ ngơi', N'thư giãn tại resort'),
-- TOUR0046 (duration 3, chưa khởi hành)
('SCH0092', 'TOUR0046', 1, N'đi du lịch', N'ghé mùa hè TP.HCM'),
('SCH0093', 'TOUR0046', 2, N'tham quan', N'khám phá Dinh Độc Lập'),
('SCH0094', 'TOUR0046', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0047 (duration 2, chưa khởi hành)
('SCH0095', 'TOUR0047', 1, N'đi du lịch', N'ghé lễ hội TP.HCM'),
('SCH0096', 'TOUR0047', 2, N'tham quan', N'khám phá chợ Bến Thành'),
-- TOUR0048 (duration 3, chưa khởi hành)
('SCH0097', 'TOUR0048', 1, N'đi du lịch', N'ghé Dinh Độc Lập'),
('SCH0098', 'TOUR0048', 2, N'tham quan', N'khám phá chợ Bến Thành'),
('SCH0099', 'TOUR0048', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0049 (duration 2, chưa khởi hành)
('SCH0100', 'TOUR0049', 1, N'đi du lịch', N'ghé công viên TP.HCM'),
('SCH0101', 'TOUR0049', 2, N'tham quan', N'khám phá Dinh Độc Lập'),
-- TOUR0050 (duration 3, chưa khởi hành)
('SCH0102', 'TOUR0050', 1, N'đi du lịch', N'ghé resort TP.HCM'),
('SCH0103', 'TOUR0050', 2, N'tham quan', N'khám phá chợ Bến Thành'),
('SCH0104', 'TOUR0050', 3, N'nghỉ ngơi', N'thư giãn tại resort'),
-- TOUR0051 (duration 3, chưa khởi hành)
('SCH0105', 'TOUR0051', 1, N'đi du lịch', N'ghé mùa hè Phú Yên'),
('SCH0106', 'TOUR0051', 2, N'tham quan', N'khám phá Gành Đá Dĩa'),
('SCH0107', 'TOUR0051', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0052 (duration 2, chưa khởi hành)
('SCH0108', 'TOUR0052', 1, N'đi du lịch', N'ghé lễ hội Phú Yên'),
('SCH0109', 'TOUR0052', 2, N'tham quan', N'khám phá bãi biển Tuy Hòa'),
-- TOUR0053 (duration 3, chưa khởi hành)
('SCH0110', 'TOUR0053', 1, N'đi du lịch', N'ghé Gành Đá Dĩa'),
('SCH0111', 'TOUR0053', 2, N'tham quan', N'khám phá tháp Nhạn'),
('SCH0112', 'TOUR0053', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0054 (duration 2, chưa khởi hành)
('SCH0113', 'TOUR0054', 1, N'đi du lịch', N'ghé đầm Ô Loan'),
('SCH0114', 'TOUR0054', 2, N'tham quan', N'khám phá bãi biển Tuy Hòa'),
-- TOUR0055 (duration 3, chưa khởi hành)
('SCH0115', 'TOUR0055', 1, N'đi du lịch', N'ghé resort Phú Yên'),
('SCH0116', 'TOUR0055', 2, N'tham quan', N'khám phá Gành Đá Dĩa'),
('SCH0117', 'TOUR0055', 3, N'nghỉ ngơi', N'thư giãn tại resort'),
-- TOUR0056 (duration 3, chưa khởi hành)
('SCH0118', 'TOUR0056', 1, N'đi du lịch', N'ghé mùa hoa Đà Lạt'),
('SCH0119', 'TOUR0056', 2, N'tham quan', N'khám phá hồ Xuân Hương'),
('SCH0120', 'TOUR0056', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0057 (duration 2, chưa khởi hành)
('SCH0121', 'TOUR0057', 1, N'đi du lịch', N'ghé lễ hội Đà Lạt'),
('SCH0122', 'TOUR0057', 2, N'tham quan', N'khám phá Thung Lũng Tình Yêu'),
-- TOUR0058 (duration 3, chưa khởi hành)
('SCH0123', 'TOUR0058', 1, N'đi du lịch', N'ghé hồ Xuân Hương'),
('SCH0124', 'TOUR0058', 2, N'tham quan', N'khám phá thác Datanla'),
('SCH0125', 'TOUR0058', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0059 (duration 2, chưa khởi hành)
('SCH0126', 'TOUR0059', 1, N'đi du lịch', N'ghé thác Datanla'),
('SCH0127', 'TOUR0059', 2, N'tham quan', N'khám phá hồ Tuyền Lâm'),
-- TOUR0060 (duration 3, chưa khởi hành)
('SCH0128', 'TOUR0060', 1, N'đi du lịch', N'ghé resort Đà Lạt'),
('SCH0129', 'TOUR0060', 2, N'tham quan', N'khám phá hồ Xuân Hương'),
('SCH0130', 'TOUR0060', 3, N'nghỉ ngơi', N'thư giãn tại resort'),
-- TOUR0061 (duration 3, chưa khởi hành)
('SCH0131', 'TOUR0061', 1, N'đi du lịch', N'ghé mùa hè Bình Định'),
('SCH0132', 'TOUR0061', 2, N'tham quan', N'khám phá bãi biển Quy Nhơn'),
('SCH0133', 'TOUR0061', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0062 (duration 2, chưa khởi hành)
('SCH0134', 'TOUR0062', 1, N'đi du lịch', N'ghé lễ hội Bình Định'),
('SCH0135', 'TOUR0062', 2, N'tham quan', N'khám phá tháp Chăm'),
-- TOUR0063 (duration 3, chưa khởi hành)
('SCH0136', 'TOUR0063', 1, N'đi du lịch', N'ghé tháp Chăm'),
('SCH0137', 'TOUR0063', 2, N'tham quan', N'khám phá làng gốm'),
('SCH0138', 'TOUR0063', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0064 (duration 2, chưa khởi hành)
('SCH0139', 'TOUR0064', 1, N'đi du lịch', N'ghé đầm Thị Nại'),
('SCH0140', 'TOUR0064', 2, N'tham quan', N'khám phá bãi biển Quy Nhơn'),
-- TOUR0065 (duration 3, chưa khởi hành)
('SCH0141', 'TOUR0065', 1, N'đi du lịch', N'ghé resort Bình Định'),
('SCH0142', 'TOUR0065', 2, N'tham quan', N'khám phá bãi biển Quy Nhơn'),
('SCH0143', 'TOUR0065', 3, N'nghỉ ngơi', N'thư giãn tại resort'),
-- TOUR0066 (duration 3, chưa khởi hành)
('SCH0144', 'TOUR0066', 1, N'đi du lịch', N'ghé mùa hè Huế'),
('SCH0145', 'TOUR0066', 2, N'tham quan', N'khám phá Đại Nội'),
('SCH0146', 'TOUR0066', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0067 (duration 2, chưa khởi hành)
('SCH0147', 'TOUR0067', 1, N'đi du lịch', N'ghé lễ hội Huế'),
('SCH0148', 'TOUR0067', 2, N'tham quan', N'khám phá sông Hương'),
-- TOUR0068 (duration 3, chưa khởi hành)
('SCH0149', 'TOUR0068', 1, N'đi du lịch', N'ghé Đại Nội'),
('SCH0150', 'TOUR0068', 2, N'tham quan', N'khám phá lăng Tự Đức'),
('SCH0151', 'TOUR0068', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0069 (duration 2, chưa khởi hành)
('SCH0152', 'TOUR0069', 1, N'đi du lịch', N'ghé sông Hương'),
('SCH0153', 'TOUR0069', 2, N'tham quan', N'khám phá lăng Khải Định'),
-- TOUR 갑0 (duration 3, chưa khởi hành)
('SCH0154', 'TOUR0070', 1, N'đi du lịch', N'ghé resort Huế'),
('SCH0155', 'TOUR0070', 2, N'tham quan', N'khám phá Đại Nội'),
('SCH0156', 'TOUR0070', 3, N'nghỉ ngơi', N'thư giãn tại resort'),
-- TOUR0071 (duration 3, chưa khởi hành)
('SCH0157', 'TOUR0071', 1, N'đi du lịch', N'ghé mùa hè Quảng Trị'),
('SCH0158', 'TOUR0071', 2, N'tham quan', N'khám phá Thành Cổ'),
('SCH0159', 'TOUR0071', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0072 (duration 2, chưa khởi hành)
('SCH0160', 'TOUR0072', 1, N'đi du lịch', N'ghé lễ hội Quảng Trị'),
('SCH0161', 'TOUR0072', 2, N'tham quan', N'khám phá cầu Hiền Lương'),
-- TOUR0073 (duration 3, chưa khởi hành)
('SCH0162', 'TOUR0073', 1, N'đi du lịch', N'ghé Thành Cổ'),
('SCH0163', 'TOUR0073', 2, N'tham quan', N'khám phá làng cổ'),
('SCH0164', 'TOUR0073', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0074 (duration 2, chưa khởi hành)
('SCH0165', 'TOUR0074', 1, N'đi du lịch', N'ghé đèo Ngang'),
('SCH0166', 'TOUR0074', 2, N'tham quan', N'khám phá cầu Hiền Lương'),
-- TOUR0075 (duration 3, chưa khởi hành)
('SCH0167', 'TOUR0075', 1, N'đi du lịch', N'ghé resort Quảng Trị'),
('SCH0168', 'TOUR0075', 2, N'tham quan', N'khám phá Thành Cổ'),
('SCH0169', 'TOUR0075', 3, N'nghỉ ngơi', N'thư giãn tại resort'),
-- TOUR0076 (duration 3, chưa khởi hành)
('SCH0170', 'TOUR0076', 1, N'đi du lịch', N'ghé mùa hè Đà Nẵng'),
('SCH0171', 'TOUR0076', 2, N'tham quan', N'khám phá bãi Mỹ Khê'),
('SCH0172', 'TOUR0076', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0077 (duration 2, chưa khởi hành)
('SCH0173', 'TOUR0077', 1, N'đi du lịch', N'ghé lễ hội Đà Nẵng'),
('SCH0174', 'TOUR0077', 2, N'tham quan', N'khám phá cầu Rồng'),
-- TOUR0078 (duration 3, chưa khởi hành)
('SCH0175', 'TOUR0078', 1, N'đi du lịch', N'ghé cầu Rồng'),
('SCH0176', 'TOUR0078', 2, N'tham quan', N'khám phá Ngũ Hành Sơn'),
('SCH0177', 'TOUR0078', 3, N'nghỉ ngơi', N'về lại'),
-- TOUR0079 (duration 2, chưa khởi hành)
('SCH0178', 'TOUR0079', 1, N'đi du lịch', N'ghé Bà Nà Hills'),
('SCH0179', 'TOUR0079', 2, N'tham quan', N'khám phá bãi Mỹ Khê'),
-- TOUR0080 (duration 3, chưa khởi hành)
('SCH0180', 'TOUR0080', 1, N'đi du lịch', N'ghé resort Đà Nẵng'),
('SCH0181', 'TOUR0080', 2, N'tham quan', N'khám phá cầu Rồng'),
('SCH0182', 'TOUR0080', 3, N'nghỉ ngơi', N'thư giãn tại resort');

INSERT INTO Tour_image (image_id, tour_id, image_url)
VALUES 
-- TOUR0001
('IMG0001', 'TOUR0001', 'uploads/1748978720938-433788546.jpeg'),
('IMG0002', 'TOUR0001', 'uploads/1748978720939-169755770.jpg'),
('IMG0003', 'TOUR0001', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0002
('IMG0004', 'TOUR0002', 'uploads/1748978720938-433788546.jpeg'),
('IMG0005', 'TOUR0002', 'uploads/1748978720939-169755770.jpg'),
('IMG0006', 'TOUR0002', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0003
('IMG0007', 'TOUR0003', 'uploads/1748978720938-433788546.jpeg'),
('IMG0008', 'TOUR0003', 'uploads/1748978720939-169755770.jpg'),
('IMG0009', 'TOUR0003', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0004
('IMG0010', 'TOUR0004', 'uploads/1748978720938-433788546.jpeg'),
('IMG0011', 'TOUR0004', 'uploads/1748978720939-169755770.jpg'),
('IMG0012', 'TOUR0004', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0005
('IMG0013', 'TOUR0005', 'uploads/1748978720938-433788546.jpeg'),
('IMG0014', 'TOUR0005', 'uploads/1748978720939-169755770.jpg'),
('IMG0015', 'TOUR0005', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0006
('IMG0016', 'TOUR0006', 'uploads/1748978720938-433788546.jpeg'),
('IMG0017', 'TOUR0006', 'uploads/1748978720939-169755770.jpg'),
('IMG0018', 'TOUR0006', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0007
('IMG0019', 'TOUR0007', 'uploads/1748978720938-433788546.jpeg'),
('IMG0020', 'TOUR0007', 'uploads/1748978720939-169755770.jpg'),
('IMG0021', 'TOUR0007', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0008
('IMG0022', 'TOUR0008', 'uploads/1748978720938-433788546.jpeg'),
('IMG0023', 'TOUR0008', 'uploads/1748978720939-169755770.jpg'),
('IMG0024', 'TOUR0008', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0009
('IMG0025', 'TOUR0009', 'uploads/1748978720938-433788546.jpeg'),
('IMG0026', 'TOUR0009', 'uploads/1748978720939-169755770.jpg'),
('IMG0027', 'TOUR0009', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0010
('IMG0028', 'TOUR0010', 'uploads/1748978720938-433788546.jpeg'),
('IMG0029', 'TOUR0010', 'uploads/1748978720939-169755770.jpg'),
('IMG0030', 'TOUR0010', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0011
('IMG0031', 'TOUR0011', 'uploads/1748978720938-433788546.jpeg'),
('IMG0032', 'TOUR0011', 'uploads/1748978720939-169755770.jpg'),
('IMG0033', 'TOUR0011', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0012
('IMG0034', 'TOUR0012', 'uploads/1748978720938-433788546.jpeg'),
('IMG0035', 'TOUR0012', 'uploads/1748978720939-169755770.jpg'),
('IMG0036', 'TOUR0012', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0013
('IMG0037', 'TOUR0013', 'uploads/1748978720938-433788546.jpeg'),
('IMG0038', 'TOUR0013', 'uploads/1748978720939-169755770.jpg'),
('IMG0039', 'TOUR0013', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0014
('IMG0040', 'TOUR0014', 'uploads/1748978720938-433788546.jpeg'),
('IMG0041', 'TOUR0014', 'uploads/1748978720939-169755770.jpg'),
('IMG0042', 'TOUR0014', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0015
('IMG0043', 'TOUR0015', 'uploads/1748978720938-433788546.jpeg'),
('IMG0044', 'TOUR0015', 'uploads/1748978720939-169755770.jpg'),
('IMG0045', 'TOUR0015', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0016
('IMG0046', 'TOUR0016', 'uploads/1748978720938-433788546.jpeg'),
('IMG0047', 'TOUR0016', 'uploads/1748978720939-169755770.jpg'),
('IMG0048', 'TOUR0016', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0017
('IMG0049', 'TOUR0017', 'uploads/1748978720938-433788546.jpeg'),
('IMG0050', 'TOUR0017', 'uploads/1748978720939-169755770.jpg'),
('IMG0051', 'TOUR0017', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0018
('IMG0052', 'TOUR0018', 'uploads/1748978720938-433788546.jpeg'),
('IMG0053', 'TOUR0018', 'uploads/1748978720939-169755770.jpg'),
('IMG0054', 'TOUR0018', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0019
('IMG0055', 'TOUR0019', 'uploads/1748978720938-433788546.jpeg'),
('IMG0056', 'TOUR0019', 'uploads/1748978720939-169755770.jpg'),
('IMG0057', 'TOUR0019', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0020
('IMG0058', 'TOUR0020', 'uploads/1748978720938-433788546.jpeg'),
('IMG0059', 'TOUR0020', 'uploads/1748978720939-169755770.jpg'),
('IMG0060', 'TOUR0020', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0021
('IMG0061', 'TOUR0021', 'uploads/1748978720938-433788546.jpeg'),
('IMG0062', 'TOUR0021', 'uploads/1748978720939-169755770.jpg'),
('IMG0063', 'TOUR0021', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0022
('IMG0064', 'TOUR0022', 'uploads/1748978720938-433788546.jpeg'),
('IMG0065', 'TOUR0022', 'uploads/1748978720939-169755770.jpg'),
('IMG0066', 'TOUR0022', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0023
('IMG0067', 'TOUR0023', 'uploads/1748978720938-433788546.jpeg'),
('IMG0068', 'TOUR0023', 'uploads/1748978720939-169755770.jpg'),
('IMG0069', 'TOUR0023', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0024
('IMG0070', 'TOUR0024', 'uploads/1748978720938-433788546.jpeg'),
('IMG0071', 'TOUR0024', 'uploads/1748978720939-169755770.jpg'),
('IMG0072', 'TOUR0024', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0025
('IMG0073', 'TOUR0025', 'uploads/1748978720938-433788546.jpeg'),
('IMG0074', 'TOUR0025', 'uploads/1748978720939-169755770.jpg'),
('IMG0075', 'TOUR0025', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0026
('IMG0076', 'TOUR0026', 'uploads/1748978720938-433788546.jpeg'),
('IMG0077', 'TOUR0026', 'uploads/1748978720939-169755770.jpg'),
('IMG0078', 'TOUR0026', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0027
('IMG0079', 'TOUR0027', 'uploads/1748978720938-433788546.jpeg'),
('IMG0080', 'TOUR0027', 'uploads/1748978720939-169755770.jpg'),
('IMG0081', 'TOUR0027', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0028
('IMG0082', 'TOUR0028', 'uploads/1748978720938-433788546.jpeg'),
('IMG0083', 'TOUR0028', 'uploads/1748978720939-169755770.jpg'),
('IMG0084', 'TOUR0028', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0029
('IMG0085', 'TOUR0029', 'uploads/1748978720938-433788546.jpeg'),
('IMG0086', 'TOUR0029', 'uploads/1748978720939-169755770.jpg'),
('IMG0087', 'TOUR0029', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0030
('IMG0088', 'TOUR0030', 'uploads/1748978720938-433788546.jpeg'),
('IMG0089', 'TOUR0030', 'uploads/1748978720939-169755770.jpg'),
('IMG0090', 'TOUR0030', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0031
('IMG0091', 'TOUR0031', 'uploads/1748978720938-433788546.jpeg'),
('IMG0092', 'TOUR0031', 'uploads/1748978720939-169755770.jpg'),
('IMG0093', 'TOUR0031', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0032
('IMG0094', 'TOUR0032', 'uploads/1748978720938-433788546.jpeg'),
('IMG0095', 'TOUR0032', 'uploads/1748978720939-169755770.jpg'),
('IMG0096', 'TOUR0032', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0033
('IMG0097', 'TOUR0033', 'uploads/1748978720938-433788546.jpeg'),
('IMG0098', 'TOUR0033', 'uploads/1748978720939-169755770.jpg'),
('IMG0099', 'TOUR0033', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0034
('IMG0100', 'TOUR0034', 'uploads/1748978720938-433788546.jpeg'),
('IMG0101', 'TOUR0034', 'uploads/1748978720939-169755770.jpg'),
('IMG0102', 'TOUR0034', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0035
('IMG0103', 'TOUR0035', 'uploads/1748978720938-433788546.jpeg'),
('IMG0104', 'TOUR0035', 'uploads/1748978720939-169755770.jpg'),
('IMG0105', 'TOUR0035', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0036
('IMG0106', 'TOUR0036', 'uploads/1748978720938-433788546.jpeg'),
('IMG0107', 'TOUR0036', 'uploads/1748978720939-169755770.jpg'),
('IMG0108', 'TOUR0036', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0037
('IMG0109', 'TOUR0037', 'uploads/1748978720938-433788546.jpeg'),
('IMG0110', 'TOUR0037', 'uploads/1748978720939-169755770.jpg'),
('IMG0111', 'TOUR0037', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0038
('IMG0112', 'TOUR0038', 'uploads/1748978720938-433788546.jpeg'),
('IMG0113', 'TOUR0038', 'uploads/1748978720939-169755770.jpg'),
('IMG0114', 'TOUR0038', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0039
('IMG0115', 'TOUR0039', 'uploads/1748978720938-433788546.jpeg'),
('IMG0116', 'TOUR0039', 'uploads/1748978720939-169755770.jpg'),
('IMG0117', 'TOUR0039', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0040
('IMG0118', 'TOUR0040', 'uploads/1748978720938-433788546.jpeg'),
('IMG0119', 'TOUR0040', 'uploads/1748978720939-169755770.jpg'),
('IMG0120', 'TOUR0040', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0041
('IMG0121', 'TOUR0041', 'uploads/1748978720938-433788546.jpeg'),
('IMG0122', 'TOUR0041', 'uploads/1748978720939-169755770.jpg'),
('IMG0123', 'TOUR0041', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0042
('IMG0124', 'TOUR0042', 'uploads/1748978720938-433788546.jpeg'),
('IMG0125', 'TOUR0042', 'uploads/1748978720939-169755770.jpg'),
('IMG0126', 'TOUR0042', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0043
('IMG0127', 'TOUR0043', 'uploads/1748978720938-433788546.jpeg'),
('IMG0128', 'TOUR0043', 'uploads/1748978720939-169755770.jpg'),
('IMG0129', 'TOUR0043', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0044
('IMG0130', 'TOUR0044', 'uploads/1748978720938-433788546.jpeg'),
('IMG0131', 'TOUR0044', 'uploads/1748978720939-169755770.jpg'),
('IMG0132', 'TOUR0044', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0045
('IMG0133', 'TOUR0045', 'uploads/1748978720938-433788546.jpeg'),
('IMG0134', 'TOUR0045', 'uploads/1748978720939-169755770.jpg'),
('IMG0135', 'TOUR0045', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0046
('IMG0136', 'TOUR0046', 'uploads/1748978720938-433788546.jpeg'),
('IMG0137', 'TOUR0046', 'uploads/1748978720939-169755770.jpg'),
('IMG0138', 'TOUR0046', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0047
('IMG0139', 'TOUR0047', 'uploads/1748978720938-433788546.jpeg'),
('IMG0140', 'TOUR0047', 'uploads/1748978720939-169755770.jpg'),
('IMG0141', 'TOUR0047', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0048
('IMG0142', 'TOUR0048', 'uploads/1748978720938-433788546.jpeg'),
('IMG0143', 'TOUR0048', 'uploads/1748978720939-169755770.jpg'),
('IMG0144', 'TOUR0048', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0049
('IMG0145', 'TOUR0049', 'uploads/1748978720938-433788546.jpeg'),
('IMG0146', 'TOUR0049', 'uploads/1748978720939-169755770.jpg'),
('IMG0147', 'TOUR0049', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0050
('IMG0148', 'TOUR0050', 'uploads/1748978720938-433788546.jpeg'),
('IMG0149', 'TOUR0050', 'uploads/1748978720939-169755770.jpg'),
('IMG0150', 'TOUR0050', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0051
('IMG0151', 'TOUR0051', 'uploads/1748978720938-433788546.jpeg'),
('IMG0152', 'TOUR0051', 'uploads/1748978720939-169755770.jpg'),
('IMG0153', 'TOUR0051', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0052
('IMG0154', 'TOUR0052', 'uploads/1748978720938-433788546.jpeg'),
('IMG0155', 'TOUR0052', 'uploads/1748978720939-169755770.jpg'),
('IMG0156', 'TOUR0052', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0053
('IMG0157', 'TOUR0053', 'uploads/1748978720938-433788546.jpeg'),
('IMG0158', 'TOUR0053', 'uploads/1748978720939-169755770.jpg'),
('IMG0159', 'TOUR0053', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0054
('IMG0160', 'TOUR0054', 'uploads/1748978720938-433788546.jpeg'),
('IMG0161', 'TOUR0054', 'uploads/1748978720939-169755770.jpg'),
('IMG0162', 'TOUR0054', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0055
('IMG0163', 'TOUR0055', 'uploads/1748978720938-433788546.jpeg'),
('IMG0164', 'TOUR0055', 'uploads/1748978720939-169755770.jpg'),
('IMG0165', 'TOUR0055', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0056
('IMG0166', 'TOUR0056', 'uploads/1748978720938-433788546.jpeg'),
('IMG0167', 'TOUR0056', 'uploads/1748978720939-169755770.jpg'),
('IMG0168', 'TOUR0056', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0057
('IMG0169', 'TOUR0057', 'uploads/1748978720938-433788546.jpeg'),
('IMG0170', 'TOUR0057', 'uploads/1748978720939-169755770.jpg'),
('IMG0171', 'TOUR0057', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0058
('IMG0172', 'TOUR0058', 'uploads/1748978720938-433788546.jpeg'),
('IMG0173', 'TOUR0058', 'uploads/1748978720939-169755770.jpg'),
('IMG0174', 'TOUR0058', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0059
('IMG0175', 'TOUR0059', 'uploads/1748978720938-433788546.jpeg'),
('IMG0176', 'TOUR0059', 'uploads/1748978720939-169755770.jpg'),
('IMG0177', 'TOUR0059', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0060
('IMG0178', 'TOUR0060', 'uploads/1748978720938-433788546.jpeg'),
('IMG0179', 'TOUR0060', 'uploads/1748978720939-169755770.jpg'),
('IMG0180', 'TOUR0060', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0061
('IMG0181', 'TOUR0061', 'uploads/1748978720938-433788546.jpeg'),
('IMG0182', 'TOUR0061', 'uploads/1748978720939-169755770.jpg'),
('IMG0183', 'TOUR0061', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0062
('IMG0184', 'TOUR0062', 'uploads/1748978720938-433788546.jpeg'),
('IMG0185', 'TOUR0062', 'uploads/1748978720939-169755770.jpg'),
('IMG0186', 'TOUR0062', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0063
('IMG0187', 'TOUR0063', 'uploads/1748978720938-433788546.jpeg'),
('IMG0188', 'TOUR0063', 'uploads/1748978720939-169755770.jpg'),
('IMG0189', 'TOUR0063', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0064
('IMG0190', 'TOUR0064', 'uploads/1748978720938-433788546.jpeg'),
('IMG0191', 'TOUR0064', 'uploads/1748978720939-169755770.jpg'),
('IMG0192', 'TOUR0064', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0065
('IMG0193', 'TOUR0065', 'uploads/1748978720938-433788546.jpeg'),
('IMG0194', 'TOUR0065', 'uploads/1748978720939-169755770.jpg'),
('IMG0195', 'TOUR0065', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0066
('IMG0196', 'TOUR0066', 'uploads/1748978720938-433788546.jpeg'),
('IMG0197', 'TOUR0066', 'uploads/1748978720939-169755770.jpg'),
('IMG0198', 'TOUR0066', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0067
('IMG0199', 'TOUR0067', 'uploads/1748978720938-433788546.jpeg'),
('IMG0200', 'TOUR0067', 'uploads/1748978720939-169755770.jpg'),
('IMG0201', 'TOUR0067', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0068
('IMG0202', 'TOUR0068', 'uploads/1748978720938-433788546.jpeg'),
('IMG0203', 'TOUR0068', 'uploads/1748978720939-169755770.jpg'),
('IMG0204', 'TOUR0068', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0069
('IMG0205', 'TOUR0069', 'uploads/1748978720938-433788546.jpeg'),
('IMG0206', 'TOUR0069', 'uploads/1748978720939-169755770.jpg'),
('IMG0207', 'TOUR0069', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0070
('IMG0208', 'TOUR0070', 'uploads/1748978720938-433788546.jpeg'),
('IMG0209', 'TOUR0070', 'uploads/1748978720939-169755770.jpg'),
('IMG0210', 'TOUR0070', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0071
('IMG0211', 'TOUR0071', 'uploads/1748978720938-433788546.jpeg'),
('IMG0212', 'TOUR0071', 'uploads/1748978720939-169755770.jpg'),
('IMG0213', 'TOUR0071', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0072
('IMG0214', 'TOUR0072', 'uploads/1748978720938-433788546.jpeg'),
('IMG0215', 'TOUR0072', 'uploads/1748978720939-169755770.jpg'),
('IMG0216', 'TOUR0072', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0073
('IMG0217', 'TOUR0073', 'uploads/1748978720938-433788546.jpeg'),
('IMG0218', 'TOUR0073', 'uploads/1748978720939-169755770.jpg'),
('IMG0219', 'TOUR0073', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0074
('IMG0220', 'TOUR0074', 'uploads/1748978720938-433788546.jpeg'),
('IMG0221', 'TOUR0074', 'uploads/1748978720939-169755770.jpg'),
('IMG0222', 'TOUR0074', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0075
('IMG0223', 'TOUR0075', 'uploads/1748978720938-433788546.jpeg'),
('IMG0224', 'TOUR0075', 'uploads/1748978720939-169755770.jpg'),
('IMG0225', 'TOUR0075', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0076
('IMG0226', 'TOUR0076', 'uploads/1748978720938-433788546.jpeg'),
('IMG0227', 'TOUR0076', 'uploads/1748978720939-169755770.jpg'),
('IMG0228', 'TOUR0076', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0077
('IMG0229', 'TOUR0077', 'uploads/1748978720938-433788546.jpeg'),
('IMG0230', 'TOUR0077', 'uploads/1748978720939-169755770.jpg'),
('IMG0231', 'TOUR0077', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0078
('IMG0232', 'TOUR0078', 'uploads/1748978720938-433788546.jpeg'),
('IMG0233', 'TOUR0078', 'uploads/1748978720939-169755770.jpg'),
('IMG0234', 'TOUR0078', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0079
('IMG0235', 'TOUR0079', 'uploads/1748978720938-433788546.jpeg'),
('IMG0236', 'TOUR0079', 'uploads/1748978720939-169755770.jpg'),
('IMG0237', 'TOUR0079', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0080
('IMG0238', 'TOUR0080', 'uploads/1748978720938-433788546.jpeg'),
('IMG0239', 'TOUR0080', 'uploads/1748978720939-169755770.jpg'),
('IMG0240', 'TOUR0080', 'uploads/1748978720939-846537457.jpeg');

INSERT INTO Customer_Support_Request (request_id, cus_id, subject, message, created_at, status)
VALUES 
-- 5 bản ghi đã trả lời (RESOLVED)
('REQ0001', 'CUS0001', N'Hỏi về tour Đà Lạt', N'Tôi muốn biết chi tiết về tour Đà Lạt TOUR0016?', '2025-06-01 09:00:00', 'RESOLVED'),
('REQ0002', 'CUS0005', N'Yêu cầu hoàn tiền', N'Tôi muốn hoàn tiền cho tour TOUR0011 vì lý do cá nhân.', '2025-06-01 14:30:00', 'RESOLVED'),
('REQ0003', 'CUS0010', N'Thắc mắc về lịch trình', N'Lịch trình TOUR0026 có thay đổi không?', '2025-06-02 10:15:00', 'RESOLVED'),
('REQ0004', 'CUS0015', N'Hỏi về giá tour', N'Giá tour TOUR0036 cho trẻ em là bao nhiêu?', '2025-06-02 16:45:00', 'RESOLVED'),
('REQ0005', 'CUS0020', N'Khiếu nại dịch vụ', N'Dịch vụ xe đưa đón của TOUR0040 không tốt.', '2025-06-03 08:20:00', 'RESOLVED'),
-- 10 bản ghi chưa trả lời (PENDING)
('REQ0006', 'CUS0015', N'Hỏi về tour Phú Yên', N'Tour Phú Yên TOUR0011 có gì đặc biệt?', '2025-06-03 11:00:00', 'PENDING'),
('REQ0007', 'CUS0010', N'Đổi ngày khởi hành', N'Tôi muốn đổi ngày khởi hành tour TOUR0012 sang 15/06/2025.', '2025-06-03 13:30:00', 'PENDING'),
('REQ0008', 'CUS0015', N'Hỏi về chỗ trống', N'Tour TOUR0013 còn chỗ trống không?', '2025-06-03 15:00:00', 'PENDING'),
('REQ0009', 'CUS0010', N'Thắc mắc thanh toán', N'Tôi đã thanh toán tour TOUR0014 nhưng chưa nhận được xác nhận.', '2025-06-03 17:20:00', 'PENDING'),
('REQ0010', 'CUS0015', N'Hỏi về tour Đà Nẵng', N'Tour Đà Nẵng TOUR0036 có bao gồm vé Bà Nà Hills không?', '2025-06-03 19:00:00', 'PENDING'),
('REQ0011', 'CUS0010', N'Hỏi về lịch trình', N'Lịch trình TOUR0021 có đi tháp Chăm không?', '2025-06-04 00:10:00', 'PENDING'),
('REQ0012', 'CUS0015', N'Yêu cầu thêm dịch vụ', N'Tôi muốn thêm dịch vụ hướng dẫn viên riêng cho TOUR0022.', '2025-06-04 00:30:00', 'PENDING'),
('REQ0013', 'CUS0020', N'Hỏi về tour Huế', N'Tour Huế TOUR0026 có đi lăng Tự Đức không?', '2025-06-04 00:45:00', 'PENDING'),
('REQ0014', 'CUS0005', N'Thắc mắc về giá', N'Giá tour TOUR0031 có giảm cho nhóm đông không?', '2025-06-04 01:00:00', 'PENDING'),
('REQ0015', 'CUS0010', N'Hỏi về chính sách hủy', N'Chính sách hủy tour TOUR0040 như thế nào?', '2025-06-04 01:15:00', 'PENDING');

INSERT INTO Customer_Support_Response (response_id, request_id, emp_id, re_message, day)
VALUES 
('RES0001', 'REQ0001', 'EMP0001', N'Chào bạn, tour Đà Lạt TOUR0016 bao gồm tham quan hồ Xuân Hương và Thung Lũng Tình Yêu. Bạn có thể xem chi tiết lịch trình trong email xác nhận.', '2025-06-01 10:00:00'),
('RES0002', 'REQ0002', 'EMP0002', N'Chào bạn, yêu cầu hoàn tiền cho tour TOUR0011 đã được xử lý. Số tiền sẽ được hoàn lại trong 3-5 ngày làm việc.', '2025-06-01 15:30:00'),
('RES0003', 'REQ0003', 'EMP0003', N'Chào bạn, lịch trình TOUR0026 không có thay đổi. Bạn có thể yên tâm tham gia tour.', '2025-06-02 11:00:00'),
('RES0004', 'REQ0004', 'EMP0004', N'Chào bạn, giá tour TOUR0036 cho trẻ em là 7,200,000 VNĐ. Bạn có cần thêm thông tin không?', '2025-06-02 17:00:00'),
('RES0005', 'REQ0005', 'EMP0005', N'Chào bạn, chúng tôi xin lỗi về sự cố xe đưa đón. Chúng tôi sẽ cải thiện dịch vụ và đền bù 10% giá tour cho bạn.', '2025-06-03 09:00:00');

INSERT INTO Booking (booking_id, cus_id, tour_id, booking_date, total_price, status)
VALUES 
-- Năm 2022
('BOOK0001', 'CUS0001', 'TOUR0001', '2022-03-15 10:00:00', 18000000.00, 'pending'),
('BOOK0002', 'CUS0002', 'TOUR0002', '2022-06-20 14:30:00', 19000000.00, 'pending'),
('BOOK0003', 'CUS0003', 'TOUR0003', '2022-09-10 09:15:00', 17600000.00, 'pending'),
('BOOK0004', 'CUS0004', 'TOUR0004', '2022-11-25 16:45:00', 18400000.00, 'pending'),
('BOOK0005', 'CUS0005', 'TOUR0005', '2022-12-01 08:20:00', 18000000.00, 'pending'),
('BOOK0006', 'CUS0006', 'TOUR0006', '2022-01-10 11:00:00', 18600000.00, 'confirmed'),
('BOOK0007', 'CUS0007', 'TOUR0007', '2022-02-15 13:30:00', 19000000.00, 'confirmed'),
('BOOK0008', 'CUS0008', 'TOUR0008', '2022-04-20 15:00:00', 18400000.00, 'confirmed'),
('BOOK0009', 'CUS0009', 'TOUR0009', '2022-05-25 17:20:00', 18200000.00, 'confirmed'),
('BOOK0010', 'CUS0010', 'TOUR0010', '2022-07-10 19:00:00', 18800000.00, 'confirmed'),
('BOOK0011', 'CUS0011', 'TOUR0011', '2022-08-15 09:10:00', 18000000.00, 'confirmed'),
('BOOK0012', 'CUS0012', 'TOUR0012', '2022-09-20 10:30:00', 17600000.00, 'confirmed'),
('BOOK0013', 'CUS0013', 'TOUR0013', '2022-10-25 11:45:00', 18400000.00, 'confirmed'),
('BOOK0014', 'CUS0014', 'TOUR0014', '2022-11-30 13:00:00', 18200000.00, 'confirmed'),
('BOOK0015', 'CUS0015', 'TOUR0015', '2022-12-15 14:15:00', 19000000.00, 'confirmed'),
-- Năm 2023
('BOOK0016', 'CUS0016', 'TOUR0016', '2023-02-10 09:00:00', 18600000.00, 'pending'),
('BOOK0017', 'CUS0017', 'TOUR0017', '2023-04-15 14:30:00', 18000000.00, 'pending'),
('BOOK0018', 'CUS0018', 'TOUR0018', '2023-07-20 10:15:00', 18400000.00, 'pending'),
('BOOK0019', 'CUS0019', 'TOUR0019', '2023-09-25 16:45:00', 18200000.00, 'pending'),
('BOOK0020', 'CUS0020', 'TOUR0020', '2023-11-01 08:20:00', 18800000.00, 'pending'),
('BOOK0021', 'CUS0011', 'TOUR0021', '2023-01-05 11:00:00', 19000000.00, 'confirmed'),
('BOOK0022', 'CUS0012', 'TOUR0022', '2023-03-10 13:30:00', 17600000.00, 'confirmed'),
('BOOK0023', 'CUS0013', 'TOUR0023', '2023-05-15 15:00:00', 18400000.00, 'confirmed'),
('BOOK0024', 'CUS0014', 'TOUR0024', '2023-06-20 17:20:00', 18200000.00, 'confirmed'),
('BOOK0025', 'CUS0015', 'TOUR0025', '2023-08-25 19:00:00', 18600000.00, 'confirmed'),
('BOOK0026', 'CUS0016', 'TOUR0026', '2023-09-30 09:10:00', 18000000.00, 'confirmed'),
('BOOK0027', 'CUS0017', 'TOUR0027', '2023-10-15 10:30:00', 18800000.00, 'confirmed'),
('BOOK0028', 'CUS0018', 'TOUR0028', '2023-11-20 11:45:00', 18400000.00, 'confirmed'),
('BOOK0029', 'CUS0019', 'TOUR0029', '2023-12-05 13:00:00', 18200000.00, 'confirmed'),
('BOOK0030', 'CUS0010', 'TOUR0030', '2023-12-10 14:15:00', 19000000.00, 'confirmed'),
-- Năm 2024
('BOOK0031', 'CUS0011', 'TOUR0031', '2024-03-10 09:00:00', 18000000.00, 'pending'),
('BOOK0032', 'CUS0012', 'TOUR0032', '2024-05-15 14:30:00', 18400000.00, 'pending'),
('BOOK0033', 'CUS0013', 'TOUR0033', '2024-08-20 10:15:00', 18200000.00, 'pending'),
('BOOK0034', 'CUS0014', 'TOUR0034', '2024-10-25 16:45:00', 18800000.00, 'pending'),
('BOOK0035', 'CUS0015', 'TOUR0035', '2024-12-01 08:20:00', 18600000.00, 'pending'),
('BOOK0036', 'CUS0016', 'TOUR0036', '2024-01-15 11:00:00', 19000000.00, 'confirmed'),
('BOOK0037', 'CUS0017', 'TOUR0037', '2024-02-20 13:30:00', 17600000.00, 'confirmed'),
('BOOK0038', 'CUS0018', 'TOUR0038', '2024-04-25 15:00:00', 18400000.00, 'confirmed'),
('BOOK0039', 'CUS0019', 'TOUR0039', '2024-06-10 17:20:00', 18200000.00, 'confirmed'),
('BOOK0040', 'CUS0010', 'TOUR0040', '2024-07-15 19:00:00', 18800000.00, 'confirmed'),
('BOOK0041', 'CUS0011', 'TOUR0041', '2024-08-20 09:10:00', 18000000.00, 'confirmed'),
('BOOK0042', 'CUS0012', 'TOUR0042', '2024-09-25 10:30:00', 18600000.00, 'confirmed'),
('BOOK0043', 'CUS0013', 'TOUR0043', '2024-10-30 11:45:00', 18400000.00, 'confirmed'),
('BOOK0044', 'CUS0014', 'TOUR0044', '2024-11-05 13:00:00', 18200000.00, 'confirmed'),
('BOOK0045', 'CUS0015', 'TOUR0045', '2024-12-10 14:15:00', 19000000.00, 'confirmed'),
-- Năm 2025
('BOOK0046', 'CUS0016', 'TOUR0046', '2025-01-10 09:00:00', 18600000.00, 'pending'),
('BOOK0047', 'CUS0017', 'TOUR0047', '2025-02-15 14:30:00', 18000000.00, 'pending'),
('BOOK0048', 'CUS0018', 'TOUR0048', '2025-03-20 10:15:00', 18400000.00, 'pending'),
('BOOK0049', 'CUS0019', 'TOUR0049', '2025-04-25 16:45:00', 18200000.00, 'pending'),
('BOOK0050', 'CUS0010', 'TOUR0050', '2025-05-01 08:20:00', 18800000.00, 'pending'),
('BOOK0051', 'CUS0001', 'TOUR0051', '2025-01-05 11:00:00', 19000000.00, 'confirmed'),
('BOOK0052', 'CUS0002', 'TOUR0052', '2025-02-10 13:30:00', 17600000.00, 'confirmed'),
('BOOK0053', 'CUS0003', 'TOUR0053', '2025-03-15 15:00:00', 18400000.00, 'confirmed'),
('BOOK0054', 'CUS0004', 'TOUR0054', '2025-04-20 17:20:00', 18200000.00, 'confirmed'),
('BOOK0055', 'CUS0005', 'TOUR0055', '2025-05-25 19:00:00', 18600000.00, 'confirmed'),
('BOOK0056', 'CUS0006', 'TOUR0056', '2025-01-30 09:10:00', 18000000.00, 'confirmed'),
('BOOK0057', 'CUS0007', 'TOUR0057', '2025-02-15 10:30:00', 18800000.00, 'confirmed'),
('BOOK0058', 'CUS0008', 'TOUR0058', '2025-03-20 11:45:00', 18400000.00, 'confirmed'),
('BOOK0059', 'CUS0009', 'TOUR0059', '2025-04-25 13:00:00', 18200000.00, 'confirmed'),
('BOOK0060', 'CUS0010', 'TOUR0060', '2025-05-30 14:15:00', 19000000.00, 'confirmed');

INSERT INTO Payments (booking_id, amount, payment_method, payment_status, order_id, transaction_no, response, created_at, updated_at)
VALUES 
('BOOK0001', 18000000.00, 'MOMO', 'FAILED', 'ORDER_BK0001', 'TXN123456789', N'Giao dịch thất bại do lỗi hệ thống.', '2022-03-15 10:05:00', '2022-03-15 10:10:00'),
('BOOK0002', 19000000.00, 'VNPAY', 'FAILED', 'ORDER_BK0002', 'TXN123456790', N'Giao dịch thất bại do số dư không đủ.', '2022-06-20 14:35:00', '2022-06-20 14:40:00'),
('BOOK0003', 17600000.00, 'MOMO', 'FAILED', 'ORDER_BK0003', 'TXN123456791', N'Giao dịch thất bại do kết nối mạng.', '2022-09-10 09:20:00', '2022-09-10 09:25:00'),
('BOOK0004', 18400000.00, 'VNPAY', 'FAILED', 'ORDER_BK0004', 'TXN123456792', N'Giao dịch thất bại do lỗi hệ thống.', '2022-11-25 16:50:00', '2022-11-25 16:55:00'),
('BOOK0005', 18000000.00, 'MOMO', 'FAILED', 'ORDER_BK0005', 'TXN123456793', N'Giao dịch thất bại do thời gian hết hạn.', '2022-12-01 08:25:00', '2022-12-01 08:30:00'),
('BOOK0006', 18600000.00, 'VNPAY', 'COMPLETED', 'ORDER_BK0006', 'TXN123456794', N'Thanh toán thành công qua VNPAY.', '2022-01-10 11:05:00', '2022-01-10 11:10:00'),
('BOOK0007', 19000000.00, 'MOMO', 'COMPLETED', 'ORDER_BK0007', 'TXN123456795', N'Thanh toán thành công qua MOMO.', '2022-02-15 13:35:00', '2022-02-15 13:40:00'),
('BOOK0008', 18400000.00, 'VNPAY', 'COMPLETED', 'ORDER_BK0008', 'TXN123456796', N'Thanh toán thành công qua VNPAY.', '2022-04-20 15:05:00', '2022-04-20 15:10:00'),
('BOOK0009', 18200000.00, 'MOMO', 'COMPLETED', 'ORDER_BK0009', 'TXN123456797', N'Thanh toán thành công qua MOMO.', '2022-05-25 17:25:00', '2022-05-25 17:30:00'),
('BOOK0010', 18800000.00, 'VNPAY', 'COMPLETED', 'ORDER_BK0010', 'TXN123456798', N'Thanh toán thành công qua VNPAY.', '2022-07-10 19:05:00', '2022-07-10 19:10:00'),
('BOOK0011', 18000000.00, 'MOMO', 'COMPLETED', 'ORDER_BK0011', 'TXN123456799', N'Thanh toán thành công qua MOMO.', '2022-08-15 09:15:00', '2022-08-15 09:20:00'),
('BOOK0012', 17600000.00, 'VNPAY', 'COMPLETED', 'ORDER_BK0012', 'TXN123456800', N'Thanh toán thành công qua VNPAY.', '2022-09-20 10:35:00', '2022-09-20 10:40:00'),
('BOOK0013', 18400000.00, 'MOMO', 'COMPLETED', 'ORDER_BK0013', 'TXN123456801', N'Thanh toán thành công qua MOMO.', '2022-10-25 11:50:00', '2022-10-25 11:55:00'),
('BOOK0014', 18200000.00, 'VNPAY', 'COMPLETED', 'ORDER_BK0014', 'TXN123456802', N'Thanh toán thành công qua VNPAY.', '2022-11-30 13:05:00', '2022-11-30 13:10:00'),
('BOOK0015', 19000000.00, 'MOMO', 'COMPLETED', 'ORDER_BK0015', 'TXN123456803', N'Thanh toán thành công qua MOMO.', '2022-12-15 14:20:00', '2022-12-15 14:25:00'),
('BOOK0016', 18600000.00, 'VNPAY', 'FAILED', 'ORDER_BK0016', 'TXN123456804', N'Giao dịch thất bại do lỗi hệ thống.', '2023-02-10 09:05:00', '2023-02-10 09:10:00'),
('BOOK0017', 18000000.00, 'MOMO', 'FAILED', 'ORDER_BK0017', 'TXN123456805', N'Giao dịch thất bại do số dư không đủ.', '2023-04-15 14:35:00', '2023-04-15 14:40:00'),
('BOOK0018', 18400000.00, 'VNPAY', 'FAILED', 'ORDER_BK0018', 'TXN123456806', N'Giao dịch thất bại do kết nối mạng.', '2023-07-20 10:20:00', '2023-07-20 10:25:00'),
('BOOK0019', 18200000.00, 'MOMO', 'FAILED', 'ORDER_BK0019', 'TXN123456807', N'Giao dịch thất bại do lỗi hệ thống.', '2023-09-25 16:50:00', '2023-09-25 16:55:00'),
('BOOK0020', 18800000.00, 'VNPAY', 'FAILED', 'ORDER_BK0020', 'TXN123456808', N'Giao dịch thất bại do thời gian hết hạn.', '2023-11-01 08:25:00', '2023-11-01 08:30:00'),
('BOOK0021', 19000000.00, 'MOMO', 'COMPLETED', 'ORDER_BK0021', 'TXN123456809', N'Thanh toán thành công qua MOMO.', '2023-01-05 11:05:00', '2023-01-05 11:10:00'),
('BOOK0022', 17600000.00, 'VNPAY', 'COMPLETED', 'ORDER_BK0022', 'TXN123456810', N'Thanh toán thành công qua VNPAY.', '2023-03-10 13:35:00', '2023-03-10 13:40:00'),
('BOOK0023', 18400000.00, 'MOMO', 'COMPLETED', 'ORDER_BK0023', 'TXN123456811', N'Thanh toán thành công qua MOMO.', '2023-05-15 15:05:00', '2023-05-15 15:10:00'),
('BOOK0024', 18200000.00, 'VNPAY', 'COMPLETED', 'ORDER_BK0024', 'TXN123456812', N'Thanh toán thành công qua VNPAY.', '2023-06-20 17:25:00', '2023-06-20 17:30:00'),
('BOOK0025', 18600000.00, 'MOMO', 'COMPLETED', 'ORDER_BK0025', 'TXN123456813', N'Thanh toán thành công qua MOMO.', '2023-08-25 19:05:00', '2023-08-25 19:10:00'),
('BOOK0026', 18000000.00, 'VNPAY', 'COMPLETED', 'ORDER_BK0026', 'TXN123456814', N'Thanh toán thành công qua VNPAY.', '2023-09-30 09:15:00', '2023-09-30 09:20:00'),
('BOOK0027', 18800000.00, 'MOMO', 'COMPLETED', 'ORDER_BK0027', 'TXN123456815', N'Thanh toán thành công qua MOMO.', '2023-10-15 10:35:00', '2023-10-15 10:40:00'),
('BOOK0028', 18400000.00, 'VNPAY', 'COMPLETED', 'ORDER_BK0028', 'TXN123456816', N'Thanh toán thành công qua VNPAY.', '2023-11-20 11:50:00', '2023-11-20 11:55:00'),
('BOOK0029', 18200000.00, 'MOMO', 'COMPLETED', 'ORDER_BK0029', 'TXN123456817', N'Thanh toán thành công qua MOMO.', '2023-12-05 13:05:00', '2023-12-05 13:10:00'),
('BOOK0030', 19000000.00, 'VNPAY', 'COMPLETED', 'ORDER_BK0030', 'TXN123456818', N'Thanh toán thành công qua VNPAY.', '2023-12-10 14:20:00', '2023-12-10 14:25:00'),
('BOOK0031', 18000000.00, 'MOMO', 'FAILED', 'ORDER_BK0031', 'TXN123456819', N'Giao dịch thất bại do lỗi hệ thống.', '2024-03-10 09:05:00', '2024-03-10 09:10:00'),
('BOOK0032', 18400000.00, 'VNPAY', 'FAILED', 'ORDER_BK0032', 'TXN123456820', N'Giao dịch thất bại do số dư không đủ.', '2024-05-15 14:35:00', '2024-05-15 14:40:00'),
('BOOK0033', 18200000.00, 'MOMO', 'FAILED', 'ORDER_BK0033', 'TXN123456821', N'Giao dịch thất bại do kết nối mạng.', '2024-08-20 10:20:00', '2024-08-20 10:25:00'),
('BOOK0034', 18800000.00, 'VNPAY', 'FAILED', 'ORDER_BK0034', 'TXN123456822', N'Giao dịch thất bại do lỗi hệ thống.', '2024-10-25 16:50:00', '2024-10-25 16:55:00'),
('BOOK0035', 18600000.00, 'MOMO', 'FAILED', 'ORDER_BK0035', 'TXN123456823', N'Giao dịch thất bại do thời gian hết hạn.', '2024-12-01 08:25:00', '2024-12-01 08:30:00'),
('BOOK0036', 19000000.00, 'VNPAY', 'COMPLETED', 'ORDER_BK0036', 'TXN123456824', N'Thanh toán thành công qua VNPAY.', '2024-01-15 11:05:00', '2024-01-15 11:10:00'),
('BOOK0037', 17600000.00, 'MOMO', 'COMPLETED', 'ORDER_BK0037', 'TXN123456825', N'Thanh toán thành công qua MOMO.', '2024-02-20 13:35:00', '2024-02-20 13:40:00'),
('BOOK0038', 18400000.00, 'VNPAY', 'COMPLETED', 'ORDER_BK0038', 'TXN123456826', N'Thanh toán thành công qua VNPAY.', '2024-04-25 15:05:00', '2024-04-25 15:10:00'),
('BOOK0039', 18200000.00, 'MOMO', 'COMPLETED', 'ORDER_BK0039', 'TXN123456827', N'Thanh toán thành công qua MOMO.', '2024-06-10 17:25:00', '2024-06-10 17:30:00'),
('BOOK0040', 18800000.00, 'VNPAY', 'COMPLETED', 'ORDER_BK0040', 'TXN123456828', N'Thanh toán thành công qua VNPAY.', '2024-07-15 19:05:00', '2024-07-15 19:10:00'),
('BOOK0041', 18000000.00, 'MOMO', 'COMPLETED', 'ORDER_BK0041', 'TXN123456829', N'Thanh toán thành công qua MOMO.', '2024-08-20 09:15:00', '2024-08-20 09:20:00'),
('BOOK0042', 18600000.00, 'VNPAY', 'COMPLETED', 'ORDER_BK0042', 'TXN123456830', N'Thanh toán thành công qua VNPAY.', '2024-09-25 10:35:00', '2024-09-25 10:40:00'),
('BOOK0043', 18400000.00, 'MOMO', 'COMPLETED', 'ORDER_BK0043', 'TXN123456831', N'Thanh toán thành công qua MOMO.', '2024-10-30 11:50:00', '2024-10-30 11:55:00'),
('BOOK0044', 18200000.00, 'VNPAY', 'COMPLETED', 'ORDER_BK0044', 'TXN123456832', N'Thanh toán thành công qua VNPAY.', '2024-11-05 13:05:00', '2024-11-05 13:10:00'),
('BOOK0045', 19000000.00, 'MOMO', 'COMPLETED', 'ORDER_BK0045', 'TXN123456833', N'Thanh toán thành công qua MOMO.', '2024-12-10 14:20:00', '2024-12-10 14:25:00'),
('BOOK0046', 18600000.00, 'VNPAY', 'FAILED', 'ORDER_BK0046', 'TXN123456834', N'Giao dịch thất bại do lỗi hệ thống.', '2025-01-10 09:05:00', '2025-01-10 09:10:00'),
('BOOK0047', 18000000.00, 'MOMO', 'FAILED', 'ORDER_BK0047', 'TXN123456835', N'Giao dịch thất bại do số dư không đủ.', '2025-02-15 14:35:00', '2025-02-15 14:40:00'),
('BOOK0048', 18400000.00, 'VNPAY', 'FAILED', 'ORDER_BK0048', 'TXN123456836', N'Giao dịch thất bại do kết nối mạng.', '2025-03-20 10:20:00', '2025-03-20 10:25:00'),
('BOOK0049', 18200000.00, 'MOMO', 'FAILED', 'ORDER_BK0049', 'TXN123456837', N'Giao dịch thất bại do lỗi hệ thống.', '2025-04-25 16:50:00', '2025-04-25 16:55:00'),
('BOOK0050', 18800000.00, 'VNPAY', 'FAILED', 'ORDER_BK0050', 'TXN123456838', N'Giao dịch thất bại do thời gian hết hạn.', '2025-05-01 08:25:00', '2025-05-01 08:30:00'),
('BOOK0051', 19000000.00, 'MOMO', 'COMPLETED', 'ORDER_BK0051', 'TXN123456839', N'Thanh toán thành công qua MOMO.', '2025-01-05 11:05:00', '2025-01-05 11:10:00'),
('BOOK0052', 17600000.00, 'VNPAY', 'COMPLETED', 'ORDER_BK0052', 'TXN123456840', N'Thanh toán thành công qua VNPAY.', '2025-02-10 13:35:00', '2025-02-10 13:40:00'),
('BOOK0053', 18400000.00, 'MOMO', 'COMPLETED', 'ORDER_BK0053', 'TXN123456841', N'Thanh toán thành công qua MOMO.', '2025-03-15 15:05:00', '2025-03-15 15:10:00'),
('BOOK0054', 18200000.00, 'VNPAY', 'COMPLETED', 'ORDER_BK0054', 'TXN123456842', N'Thanh toán thành công qua VNPAY.', '2025-04-20 17:25:00', '2025-04-20 17:30:00'),
('BOOK0055', 18600000.00, 'MOMO', 'COMPLETED', 'ORDER_BK0055', 'TXN123456843', N'Thanh toán thành công qua MOMO.', '2025-05-25 19:05:00', '2025-05-25 19:10:00'),
('BOOK0056', 18000000.00, 'VNPAY', 'COMPLETED', 'ORDER_BK0056', 'TXN123456844', N'Thanh toán thành công qua VNPAY.', '2025-01-30 09:15:00', '2025-01-30 09:20:00'),
('BOOK0057', 18800000.00, 'MOMO', 'COMPLETED', 'ORDER_BK0057', 'TXN123456845', N'Thanh toán thành công qua MOMO.', '2025-02-15 10:35:00', '2025-02-15 10:40:00'),
('BOOK0058', 18400000.00, 'VNPAY', 'COMPLETED', 'ORDER_BK0058', 'TXN123456846', N'Thanh toán thành công qua VNPAY.', '2025-03-20 11:50:00', '2025-03-20 11:55:00'),
('BOOK0059', 18200000.00, 'MOMO', 'COMPLETED', 'ORDER_BK0059', 'TXN123456847', N'Thanh toán thành công qua MOMO.', '2025-04-25 13:05:00', '2025-04-25 13:10:00'),
('BOOK0060', 19000000.00, 'VNPAY', 'COMPLETED', 'ORDER_BK0060', 'TXN123456848', N'Thanh toán thành công qua VNPAY.', '2025-05-30 14:20:00', '2025-05-30 14:25:00');

INSERT INTO Tour_price (tour_id, age_group, price)
VALUES 
-- TOUR0001
('TOUR0001', 'adultPrice', 9000000.00),
('TOUR0001', 'childPrice', 7000000.00),
('TOUR0001', 'infantPrice', 4000000.00),
-- TOUR0002
('TOUR0002', 'adultPrice', 9500000.00),
('TOUR0002', 'childPrice', 7200000.00),
('TOUR0002', 'infantPrice', 4200000.00),
-- TOUR0003
('TOUR0003', 'adultPrice', 8800000.00),
('TOUR0003', 'childPrice', 6800000.00),
('TOUR0003', 'infantPrice', 3900000.00),
-- TOUR0004
('TOUR0004', 'adultPrice', 9200000.00),
('TOUR0004', 'childPrice', 7100000.00),
('TOUR0004', 'infantPrice', 4100000.00),
-- TOUR0005
('TOUR0005', 'adultPrice', 9000000.00),
('TOUR0005', 'childPrice', 7000000.00),
('TOUR0005', 'infantPrice', 4000000.00),
-- TOUR0006
('TOUR0006', 'adultPrice', 9300000.00),
('TOUR0006', 'childPrice', 7200000.00),
('TOUR0006', 'infantPrice', 4200000.00),
-- TOUR0007
('TOUR0007', 'adultPrice', 9100000.00),
('TOUR0007', 'childPrice', 7000000.00),
('TOUR0007', 'infantPrice', 4000000.00),
-- TOUR0008
('TOUR0008', 'adultPrice', 9500000.00),
('TOUR0008', 'childPrice', 7300000.00),
('TOUR0008', 'infantPrice', 4300000.00),
-- TOUR0009
('TOUR0009', 'adultPrice', 9200000.00),
('TOUR0009', 'childPrice', 7100000.00),
('TOUR0009', 'infantPrice', 4100000.00),
-- TOUR0010
('TOUR0010', 'adultPrice', 9400000.00),
('TOUR0010', 'childPrice', 7200000.00),
('TOUR0010', 'infantPrice', 4200000.00),
-- TOUR0011
('TOUR0011', 'adultPrice', 9000000.00),
('TOUR0011', 'childPrice', 7000000.00),
('TOUR0011', 'infantPrice', 4000000.00),
-- TOUR0012
('TOUR0012', 'adultPrice', 8800000.00),
('TOUR0012', 'childPrice', 6800000.00),
('TOUR0012', 'infantPrice', 3900000.00),
-- TOUR0013
('TOUR0013', 'adultPrice', 9200000.00),
('TOUR0013', 'childPrice', 7100000.00),
('TOUR0013', 'infantPrice', 4100000.00),
-- TOUR0014
('TOUR0014', 'adultPrice', 9100000.00),
('TOUR0014', 'childPrice', 7000000.00),
('TOUR0014', 'infantPrice', 4000000.00),
-- TOUR0015
('TOUR0015', 'adultPrice', 9500000.00),
('TOUR0015', 'childPrice', 7300000.00),
('TOUR0015', 'infantPrice', 4300000.00),
-- TOUR0016
('TOUR0016', 'adultPrice', 9300000.00),
('TOUR0016', 'childPrice', 7200000.00),
('TOUR0016', 'infantPrice', 4200000.00),
-- TOUR0017
('TOUR0017', 'adultPrice', 9000000.00),
('TOUR0017', 'childPrice', 7000000.00),
('TOUR0017', 'infantPrice', 4000000.00),
-- TOUR0018
('TOUR0018', 'adultPrice', 9200000.00),
('TOUR0018', 'childPrice', 7100000.00),
('TOUR0018', 'infantPrice', 4100000.00),
-- TOUR0019
('TOUR0019', 'adultPrice', 9100000.00),
('TOUR0019', 'childPrice', 7000000.00),
('TOUR0019', 'infantPrice', 4000000.00),
-- TOUR0020
('TOUR0020', 'adultPrice', 9400000.00),
('TOUR0020', 'childPrice', 7200000.00),
('TOUR0020', 'infantPrice', 4200000.00),
-- TOUR0021
('TOUR0021', 'adultPrice', 9000000.00),
('TOUR0021', 'childPrice', 7000000.00),
('TOUR0021', 'infantPrice', 4000000.00),
-- TOUR0022
('TOUR0022', 'adultPrice', 8800000.00),
('TOUR0022', 'childPrice', 6800000.00),
('TOUR0022', 'infantPrice', 3900000.00),
-- TOUR0023
('TOUR0023', 'adultPrice', 9200000.00),
('TOUR0023', 'childPrice', 7100000.00),
('TOUR0023', 'infantPrice', 4100000.00),
-- TOUR0024
('TOUR0024', 'adultPrice', 9100000.00),
('TOUR0024', 'childPrice', 7000000.00),
('TOUR0024', 'infantPrice', 4000000.00),
-- TOUR0025
('TOUR0025', 'adultPrice', 9500000.00),
('TOUR0025', 'childPrice', 7300000.00),
('TOUR0025', 'infantPrice', 4300000.00),
-- TOUR0026
('TOUR0026', 'adultPrice', 9300000.00),
('TOUR0026', 'childPrice', 7200000.00),
('TOUR0026', 'infantPrice', 4200000.00),
-- TOUR0027
('TOUR0027', 'adultPrice', 9000000.00),
('TOUR0027', 'childPrice', 7000000.00),
('TOUR0027', 'infantPrice', 4000000.00),
-- TOUR0028
('TOUR0028', 'adultPrice', 9200000.00),
('TOUR0028', 'childPrice', 7100000.00),
('TOUR0028', 'infantPrice', 4100000.00),
-- TOUR0029
('TOUR0029', 'adultPrice', 9100000.00),
('TOUR0029', 'childPrice', 7000000.00),
('TOUR0029', 'infantPrice', 4000000.00),
-- TOUR0030
('TOUR0030', 'adultPrice', 9400000.00),
('TOUR0030', 'childPrice', 7200000.00),
('TOUR0030', 'infantPrice', 4200000.00),
-- TOUR0031
('TOUR0031', 'adultPrice', 9000000.00),
('TOUR0031', 'childPrice', 7000000.00),
('TOUR0031', 'infantPrice', 4000000.00),
-- TOUR0032
('TOUR0032', 'adultPrice', 8800000.00),
('TOUR0032', 'childPrice', 6800000.00),
('TOUR0032', 'infantPrice', 3900000.00),
-- TOUR0033
('TOUR0033', 'adultPrice', 9200000.00),
('TOUR0033', 'childPrice', 7100000.00),
('TOUR0033', 'infantPrice', 4100000.00),
-- TOUR0034
('TOUR0034', 'adultPrice', 9100000.00),
('TOUR0034', 'childPrice', 7000000.00),
('TOUR0034', 'infantPrice', 4000000.00),
-- TOUR0035
('TOUR0035', 'adultPrice', 9500000.00),
('TOUR0035', 'childPrice', 7300000.00),
('TOUR0035', 'infantPrice', 4300000.00),
-- TOUR0036
('TOUR0036', 'adultPrice', 9300000.00),
('TOUR0036', 'childPrice', 7200000.00),
('TOUR0036', 'infantPrice', 4200000.00),
-- TOUR0037
('TOUR0037', 'adultPrice', 9000000.00),
('TOUR0037', 'childPrice', 7000000.00),
('TOUR0037', 'infantPrice', 4000000.00),
-- TOUR0038
('TOUR0038', 'adultPrice', 9200000.00),
('TOUR0038', 'childPrice', 7100000.00),
('TOUR0038', 'infantPrice', 4100000.00),
-- TOUR0039
('TOUR0039', 'adultPrice', 9100000.00),
('TOUR0039', 'childPrice', 7000000.00),
('TOUR0039', 'infantPrice', 4000000.00),
-- TOUR0040
('TOUR0040', 'adultPrice', 9400000.00),
('TOUR0040', 'childPrice', 7200000.00),
('TOUR0040', 'infantPrice', 4200000.00),
-- TOUR0041
('TOUR0041', 'adultPrice', 9000000.00),
('TOUR0041', 'childPrice', 7000000.00),
('TOUR0041', 'infantPrice', 4000000.00),
-- TOUR0042
('TOUR0042', 'adultPrice', 8800000.00),
('TOUR0042', 'childPrice', 6800000.00),
('TOUR0042', 'infantPrice', 3900000.00),
-- TOUR0043
('TOUR0043', 'adultPrice', 9200000.00),
('TOUR0043', 'childPrice', 7100000.00),
('TOUR0043', 'infantPrice', 4100000.00),
-- TOUR0044
('TOUR0044', 'adultPrice', 9100000.00),
('TOUR0044', 'childPrice', 7000000.00),
('TOUR0044', 'infantPrice', 4000000.00),
-- TOUR0045
('TOUR0045', 'adultPrice', 9500000.00),
('TOUR0045', 'childPrice', 7300000.00),
('TOUR0045', 'infantPrice', 4300000.00),
-- TOUR0046
('TOUR0046', 'adultPrice', 9300000.00),
('TOUR0046', 'childPrice', 7200000.00),
('TOUR0046', 'infantPrice', 4200000.00),
-- TOUR0047
('TOUR0047', 'adultPrice', 9000000.00),
('TOUR0047', 'childPrice', 7000000.00),
('TOUR0047', 'infantPrice', 4000000.00),
-- TOUR0048
('TOUR0048', 'adultPrice', 9200000.00),
('TOUR0048', 'childPrice', 7100000.00),
('TOUR0048', 'infantPrice', 4100000.00),
-- TOUR0049
('TOUR0049', 'adultPrice', 9100000.00),
('TOUR0049', 'childPrice', 7000000.00),
('TOUR0049', 'infantPrice', 4000000.00),
-- TOUR0050
('TOUR0050', 'adultPrice', 9400000.00),
('TOUR0050', 'childPrice', 7200000.00),
('TOUR0050', 'infantPrice', 4200000.00),
-- TOUR0051
('TOUR0051', 'adultPrice', 9000000.00),
('TOUR0051', 'childPrice', 7000000.00),
('TOUR0051', 'infantPrice', 4000000.00),
-- TOUR0052
('TOUR0052', 'adultPrice', 8800000.00),
('TOUR0052', 'childPrice', 6800000.00),
('TOUR0052', 'infantPrice', 3900000.00),
-- TOUR0053
('TOUR0053', 'adultPrice', 9200000.00),
('TOUR0053', 'childPrice', 7100000.00),
('TOUR0053', 'infantPrice', 4100000.00),
-- TOUR0054
('TOUR0054', 'adultPrice', 9100000.00),
('TOUR0054', 'childPrice', 7000000.00),
('TOUR0054', 'infantPrice', 4000000.00),
-- TOUR0055
('TOUR0055', 'adultPrice', 9500000.00),
('TOUR0055', 'childPrice', 7300000.00),
('TOUR0055', 'infantPrice', 4300000.00),
-- TOUR0056
('TOUR0056', 'adultPrice', 9300000.00),
('TOUR0056', 'childPrice', 7200000.00),
('TOUR0056', 'infantPrice', 4200000.00),
-- TOUR0057
('TOUR0057', 'adultPrice', 9000000.00),
('TOUR0057', 'childPrice', 7000000.00),
('TOUR0057', 'infantPrice', 4000000.00),
-- TOUR0058
('TOUR0058', 'adultPrice', 9200000.00),
('TOUR0058', 'childPrice', 7100000.00),
('TOUR0058', 'infantPrice', 4100000.00),
-- TOUR0059
('TOUR0059', 'adultPrice', 9100000.00),
('TOUR0059', 'childPrice', 7000000.00),
('TOUR0059', 'infantPrice', 4000000.00),
-- TOUR0060
('TOUR0060', 'adultPrice', 9400000.00),
('TOUR0060', 'childPrice', 7200000.00),
('TOUR0060', 'infantPrice', 4200000.00),
-- TOUR0061
('TOUR0061', 'adultPrice', 9000000.00),
('TOUR0061', 'childPrice', 7000000.00),
('TOUR0061', 'infantPrice', 4000000.00),
-- TOUR0062
('TOUR0062', 'adultPrice', 8800000.00),
('TOUR0062', 'childPrice', 6800000.00),
('TOUR0062', 'infantPrice', 3900000.00),
-- TOUR0063
('TOUR0063', 'adultPrice', 9200000.00),
('TOUR0063', 'childPrice', 7100000.00),
('TOUR0063', 'infantPrice', 4100000.00),
-- TOUR0064
('TOUR0064', 'adultPrice', 9100000.00),
('TOUR0064', 'childPrice', 7000000.00),
('TOUR0064', 'infantPrice', 4000000.00),
-- TOUR0065
('TOUR0065', 'adultPrice', 9500000.00),
('TOUR0065', 'childPrice', 7300000.00),
('TOUR0065', 'infantPrice', 4300000.00),
-- TOUR0066
('TOUR0066', 'adultPrice', 9300000.00),
('TOUR0066', 'childPrice', 7200000.00),
('TOUR0066', 'infantPrice', 4200000.00),
-- TOUR0067
('TOUR0067', 'adultPrice', 9000000.00),
('TOUR0067', 'childPrice', 7000000.00),
('TOUR0067', 'infantPrice', 4000000.00),
-- TOUR0068
('TOUR0068', 'adultPrice', 9200000.00),
('TOUR0068', 'childPrice', 7100000.00),
('TOUR0068', 'infantPrice', 4100000.00),
-- TOUR0069
('TOUR0069', 'adultPrice', 9100000.00),
('TOUR0069', 'childPrice', 7000000.00),
('TOUR0069', 'infantPrice', 4000000.00),
-- TOUR0070
('TOUR0070', 'adultPrice', 9400000.00),
('TOUR0070', 'childPrice', 7200000.00),
('TOUR0070', 'infantPrice', 4200000.00),
-- TOUR0071
('TOUR0071', 'adultPrice', 9000000.00),
('TOUR0071', 'childPrice', 7000000.00),
('TOUR0071', 'infantPrice', 4000000.00),
-- TOUR0072
('TOUR0072', 'adultPrice', 8800000.00),
('TOUR0072', 'childPrice', 6800000.00),
('TOUR0072', 'infantPrice', 3900000.00),
-- TOUR0073
('TOUR0073', 'adultPrice', 9200000.00),
('TOUR0073', 'childPrice', 7100000.00),
('TOUR0073', 'infantPrice', 4100000.00),
-- TOUR0074
('TOUR0074', 'adultPrice', 9100000.00),
('TOUR0074', 'childPrice', 7000000.00),
('TOUR0074', 'infantPrice', 4000000.00),
-- TOUR0075
('TOUR0075', 'adultPrice', 9500000.00),
('TOUR0075', 'childPrice', 7300000.00),
('TOUR0075', 'infantPrice', 4300000.00),
-- TOUR0076
('TOUR0076', 'adultPrice', 9300000.00),
('TOUR0076', 'childPrice', 7200000.00),
('TOUR0076', 'infantPrice', 4200000.00),
-- TOUR0077
('TOUR0077', 'adultPrice', 9000000.00),
('TOUR0077', 'childPrice', 7000000.00),
('TOUR0077', 'infantPrice', 4000000.00),
-- TOUR0078
('TOUR0078', 'adultPrice', 9200000.00),
('TOUR0078', 'childPrice', 7100000.00),
('TOUR0078', 'infantPrice', 4100000.00),
-- TOUR0079
('TOUR0079', 'adultPrice', 9100000.00),
('TOUR0079', 'childPrice', 7000000.00),
('TOUR0079', 'infantPrice', 4000000.00),
-- TOUR0080
('TOUR0080', 'adultPrice', 9400000.00),
('TOUR0080', 'childPrice', 7200000.00),
('TOUR0080', 'infantPrice', 4200000.00);

INSERT INTO Tour (tour_id, branch_id, name, duration, destination, departure_location, start_date, end_date, description, max_guests, transport, created_at, status)
VALUES 
-- TOUR0081
('TOUR0081', 1, N'Tour Đà Lạt Mộng Mơ', 3, N'Đà Lạt', N'TP.HCM', '2025-06-16', '2025-06-18', N'Khám phá vẻ đẹp thơ mộng của Đà Lạt với hồ Xuân Hương và thung lũng Tình Yêu.', 30, N'Xe du lịch', GETDATE(), 'pending'),
-- TOUR0082
('TOUR0082', 2, N'Phú Quốc Biển Xanh', 4, N'Phú Quốc', N'Hà Nội', '2025-06-20', '2025-06-23', N'Thư giãn tại bãi biển Phú Quốc, tham quan làng chài và thưởng thức hải sản tươi ngon.', 25, N'Máy bay', GETDATE(), 'pending'),
-- TOUR0083
('TOUR0083', 3, N'Hà Giang Hùng Vĩ', 5, N'Hà Giang', N'Hà Nội', '2025-06-25', '2025-06-29', N'Chinh phục đèo Mã Pí Lèng, ngắm ruộng bậc thang và văn hóa dân tộc H''Mông.', 20, N'Xe du lịch', GETDATE(), 'pending'),
-- TOUR0084
('TOUR0084', 4, N'Nha Trang Nắng Vàng', 3, N'Nha Trang', N'TP.HCM', '2025-07-01', '2025-07-03', N'Tắm biển Nha Trang, lặn ngắm san hô và tham quan Vinpearl Land.', 35, N'Máy bay', GETDATE(), 'pending'),
-- TOUR0085
('TOUR0085', 5, N'Sapa Mây Trắng', 4, N'Sapa', N'Hà Nội', '2025-07-05', '2025-07-08', N'Khám phá Sapa với núi Hàm Rồng, bản Cát Cát và ruộng bậc thang tuyệt đẹp.', 28, N'Xe du lịch', GETDATE(), 'pending'),
-- TOUR0086
('TOUR0086', 1, N'Hội An Cổ Kính', 3, N'Hội An', N'Đà Nẵng', '2025-07-10', '2025-07-12', N'Thưởng thức không gian cổ kính Hội An, đèn lồng lung linh và ẩm thực đặc sắc.', 22, N'Xe du lịch', GETDATE(), 'pending'),
-- TOUR0087
('TOUR0087', 2, N'Đà Nẵng - Bà Nà Hills', 4, N'Đà Nẵng', N'TP.HCM', '2025-07-15', '2025-07-18', N'Thăm cầu Vàng, vui chơi tại Bà Nà Hills và tắm biển Mỹ Khê.', 30, N'Máy bay', GETDATE(), 'pending'),
-- TOUR0088
('TOUR0088', 3, N'Côn Đảo Huyền Bí', 5, N'Côn Đảo', N'TP.HCM', '2025-07-20', '2025-07-24', N'Khám phá lịch sử Côn Đảo, bãi biển hoang sơ và hệ sinh thái biển đa dạng.', 18, N'Máy bay', GETDATE(), 'pending'),
-- TOUR0089
('TOUR0089', 4, N'Miền Tây Sông Nước', 3, N'Cần Thơ', N'TP.HCM', '2025-07-25', '2025-07-27', N'Ngắm chợ nổi Cái Răng, tham quan vườn chim và thưởng thức trái cây miệt vườn.', 25, N'Xe du lịch', GETDATE(), 'pending'),
-- TOUR0090
('TOUR0090', 5, N'Huế - Phong Nha', 5, N'Huế', N'Hà Nội', '2025-07-30', '2025-08-03', N'Thăm cố đô Huế, Đại Nội và khám phá hang động Phong Nha - Kẻ Bàng.', 20, N'Máy bay', GETDATE(), 'pending');

INSERT INTO Tour (tour_id, branch_id, name, duration, destination, departure_location, start_date, end_date, description, max_guests, transport, created_at, status)
VALUES 
-- TOUR0091
('TOUR0091', 1, N'Hà Nội - Hạ Long', 3, N'Vịnh Hạ Long', N'Hà Nội', '2025-08-01', '2025-08-03', N'Du thuyền ngắm Vịnh Hạ Long, tham quan hang Sửng Sốt và đảo Ti Tốp.', 30, N'Xe du lịch', GETDATE(), 'pending'),
-- TOUR0092
('TOUR0092', 2, N'Đà Lạt - Thác Datanla', 4, N'Đà Lạt', N'TP.HCM', '2025-08-05', '2025-08-08', N'Khám phá thác Datanla, thung lũng Tình Yêu và thưởng thức cà phê Đà Lạt.', 25, N'Xe du lịch', GETDATE(), 'pending'),
-- TOUR0093
('TOUR0093', 3, N'Phú Quốc - Bãi Sao', 5, N'Phú Quốc', N'Hà Nội', '2025-08-10', '2025-08-14', N'Tắm biển Bãi Sao, tham quan nhà tù Phú Quốc và thưởng thức nước mắm ngon.', 20, N'Máy bay', GETDATE(), 'pending'),
-- TOUR0094
('TOUR0094', 4, N'Nha Trang - Đảo Hòn Mun', 3, N'Nha Trang', N'TP.HCM', '2025-08-15', '2025-08-17', N'Lặn ngắm san hô tại Hòn Mun, tắm biển Dốc Lết và vui chơi tại Vinpearl.', 35, N'Máy bay', GETDATE(), 'pending'),
-- TOUR0095
('TOUR0095', 5, N'Sapa - Fansipan', 4, N'Sapa', N'Hà Nội', '2025-08-20', '2025-08-23', N'Chinh phục đỉnh Fansipan, tham quan bản Tà Van và thác Bạc.', 28, N'Xe du lịch', GETDATE(), 'pending'),
-- TOUR0096
('TOUR0096', 1, N'Hội An - Cù Lao Chàm', 3, N'Hội An', N'Đà Nẵng', '2025-08-25', '2025-08-27', N'Khám phá Cù Lao Chàm, phố cổ Hội An và thưởng thức cao lầu đặc sản.', 22, N'Xe du lịch', GETDATE(), 'pending'),
-- TOUR0097
('TOUR0097', 2, N'Đà Nẵng - Ngũ Hành Sơn', 4, N'Đà Nẵng', N'TP.HCM', '2025-08-30', '2025-09-02', N'Thăm Ngũ Hành Sơn, cầu Rồng và tắm biển Non Nước.', 30, N'Máy bay', GETDATE(), 'pending'),
-- TOUR0098
('TOUR0098', 3, N'Côn Đảo - Bãi Đầm Trầu', 5, N'Côn Đảo', N'TP.HCM', '2025-09-05', '2025-09-09', N'Tắm biển Bãi Đầm Trầu, tham quan nghĩa trang Hàng Dương và bảo tàng Côn Đảo.', 18, N'Máy bay', GETDATE(), 'pending'),
-- TOUR0099
('TOUR0099', 4, N'Miền Tây - Châu Đốc', 3, N'Châu Đốc', N'TP.HCM', '2025-09-10', '2025-09-12', N'Thăm rừng tràm Trà Sư, miếu Bà Chúa Xứ và chợ Châu Đốc.', 25, N'Xe du lịch', GETDATE(), 'pending'),
-- TOUR0100
('TOUR0100', 5, N'Huế - Lăng Tự Đức', 5, N'Huế', N'Hà Nội', '2025-09-15', '2025-09-19', N'Khám phá lăng Tự Đức, sông Hương và thưởng thức ẩm thực cung đình Huế.', 20, N'Máy bay', GETDATE(), 'pending');

INSERT INTO Tour (tour_id, branch_id, name, duration, destination, departure_location, start_date, end_date, description, max_guests, transport, created_at, status)
VALUES 
-- TOUR0101
('TOUR0101', 1, N'Hà Nội - Khám Phá Phố Cổ', 3, N'Hà Nội', N'Hà Nội', '2025-06-13', '2025-06-15', N'Khám phá nét cổ kính của Phố Cổ Hà Nội với 36 phố phường, thưởng thức phở bò đặc sản tại Phở Thìn, ghé thăm Hồ Gươm và cầu Thê Húc, tham quan nhà cổ 87 Mã Mây để hiểu thêm về văn hóa truyền thống.', 25, N'Đi bộ', GETDATE(), 'active'),
-- TOUR0102
('TOUR0102', 1, N'Hà Nội - Văn Miếu Quốc Tử Giám', 2, N'Hà Nội', N'Hà Nội', '2025-06-14', '2025-06-15', N'Tham quan Văn Miếu - Quốc Tử Giám, trường đại học đầu tiên của Việt Nam, chiêm ngưỡng kiến trúc cổ kính, khám phá bia tiến sĩ và tìm hiểu lịch sử khoa cử thời phong kiến qua các hiện vật quý giá.', 20, N'Đi bộ', GETDATE(), 'active'),
-- TOUR0103
('TOUR0103', 1, N'Hà Nội - Làng Gốm Bát Tràng', 4, N'Hà Nội', N'Hà Nội', '2025-06-16', '2025-06-19', N'Ghé thăm làng gốm Bát Tràng, tham gia trải nghiệm tự tay làm gốm, tìm hiểu quy trình sản xuất truyền thống, mua sắm các sản phẩm thủ công mỹ nghệ độc đáo và thưởng thức trà gốm tại chỗ.', 30, N'Xe du lịch', GETDATE(), 'active'),
-- TOUR0104
('TOUR0104', 1, N'Hà Nội - Hoàng Thành Thăng Long', 3, N'Hà Nội', N'Hà Nội', '2025-06-18', '2025-06-20', N'Khám phá di sản Hoàng Thành Thăng Long, tham quan Đoan Môn, điện Kính Thiên, hầm D67, và tìm hiểu lịch sử triều đại phong kiến qua các hiện vật được bảo tồn tại khu di tích.', 25, N'Đi bộ', GETDATE(), 'active'),
-- TOUR0105
('TOUR0105', 1, N'Hà Nội - Chợ Đồng Xuân', 2, N'Hà Nội', N'Hà Nội', '2025-06-20', '2025-06-21', N'Tham quan chợ Đồng Xuân, trung tâm thương mại sầm uất nhất Hà Nội, mua sắm quần áo, đồ thủ công, và thưởng thức ẩm thực đường phố như bún chả, bánh cuốn tại các gian hàng truyền thống.', 30, N'Đi bộ', GETDATE(), 'active'),
-- TOUR0106
('TOUR0106', 1, N'Hà Nội - Làng Lụa Vạn Phúc', 4, N'Hà Nội', N'Hà Nội', '2025-06-22', '2025-06-25', N'Khám phá làng lụa Vạn Phúc, tìm hiểu quy trình dệt lụa truyền thống, trải nghiệm mua sắm các sản phẩm lụa cao cấp, và tham gia lớp học ngắn về kỹ thuật dệt thủ công.', 25, N'Xe du lịch', GETDATE(), 'active'),
-- TOUR0107
('TOUR0107', 1, N'Hà Nội - Hồ Tây Dạo Thuyền', 3, N'Hà Nội', N'Hà Nội', '2025-06-24', '2025-06-26', N'Dạo thuyền trên Hồ Tây, ngắm cảnh hoàng hôn, tham quan chùa Trấn Quốc cổ kính, và thưởng thức các món ăn đặc sản như bún ốc, bánh tôm Hồ Tây tại các quán ven hồ.', 20, N'Đi thuyền', GETDATE(), 'active'),
-- TOUR0108
('TOUR0108', 1, N'Hà Nội - Bảo Tàng Dân Tộc Học', 2, N'Hà Nội', N'Hà Nội', '2025-06-26', '2025-06-27', N'Khám phá Bảo tàng Dân tộc Học, tìm hiểu về 54 dân tộc Việt Nam qua các hiện vật, mô hình nhà truyền thống, và tham gia các hoạt động văn hóa dân gian được tổ chức tại đây.', 25, N'Đi bộ', GETDATE(), 'active'),
-- TOUR0109
('TOUR0109', 1, N'Hà Nội - Làng Nghề Thổ Hà', 4, N'Hà Nội', N'Hà Nội', '2025-06-28', '2025-07-01', N'Ghé thăm làng nghề Thổ Hà, khám phá quy trình làm tương Bần và bánh đậu xanh, tham quan kiến trúc cổ xưa và thưởng thức các món ăn đặc sản của vùng đất này.', 30, N'Xe du lịch', GETDATE(), 'active'),
-- TOUR0110
('TOUR0110', 1, N'Hà Nội - Chùa Hương Tích', 5, N'Hà Nội', N'Hà Nội', '2025-06-30', '2025-07-04', N'Hành hương chùa Hương, leo núi khám phá các hang động thiêng liêng, tham gia lễ hội chùa Hương, và thưởng thức ẩm thực chay đặc trưng tại khu vực này.', 20, N'Xe du lịch', GETDATE(), 'active'),
-- TOUR0111
('TOUR0111', 1, N'Hà Nội - Làng Sản Xuất Đồ Thờ', 3, N'Hà Nội', N'Hà Nội', '2025-07-02', '2025-07-04', N'Khám phá làng nghề sản xuất đồ thờ cúng tại Hà Nội, tìm hiểu nghệ thuật chạm khắc gỗ, và mua sắm các sản phẩm tâm linh như bàn thờ, hoành phi câu đối.', 25, N'Xe du lịch', GETDATE(), 'active'),
-- TOUR0112
('TOUR0112', 1, N'Hà Nội - Đền Ngọc Sơn', 2, N'Hà Nội', N'Hà Nội', '2025-07-04', '2025-07-05', N'Tham quan Đền Ngọc Sơn trên Hồ Gươm, chiêm ngưỡng tháp Bút, cầu Thê Húc, và tìm hiểu về ý nghĩa lịch sử văn hóa của ngôi đền nổi tiếng này.', 20, N'Đi bộ', GETDATE(), 'active'),
-- TOUR0113
('TOUR0113', 1, N'Hà Nội - Làng Gốm Phù Lãng', 4, N'Hà Nội', N'Hà Nội', '2025-07-06', '2025-07-09', N'Khám phá làng gốm Phù Lãng, tham gia làm gốm thủ công, tìm hiểu lịch sử lâu đời của làng nghề, và mua sắm các sản phẩm gốm độc đáo về làm kỷ niệm.', 30, N'Xe du lịch', GETDATE(), 'active'),
-- TOUR0114
('TOUR0114', 1, N'Hà Nội - Phủ Tây Hồ', 3, N'Hà Nội', N'Hà Nội', '2025-07-08', '2025-07-10', N'Hành hương Phủ Tây Hồ, tham gia lễ cầu duyên, khám phá không gian tâm linh yên bình, và thưởng thức các món ăn chay đặc trưng tại khu vực này.', 25, N'Đi bộ', GETDATE(), 'active'),
-- TOUR0115
('TOUR0115', 1, N'Hà Nội - Làng Hoa Tây Tựu', 2, N'Hà Nội', N'Hà Nội', '2025-07-10', '2025-07-11', N'Ghé thăm làng hoa Tây Tựu, ngắm các loại hoa đua nở, học cách trồng và chăm sóc hoa, và mua sắm hoa tươi về trang trí.', 30, N'Xe du lịch', GETDATE(), 'active'),
-- TOUR0116
('TOUR0116', 1, N'Hà Nội - Nhà Hát Lớn', 3, N'Hà Nội', N'Hà Nội', '2025-07-12', '2025-07-14', N'Tham quan Nhà Hát Lớn Hà Nội, chiêm ngưỡng kiến trúc Pháp cổ kính, xem biểu diễn nghệ thuật truyền thống, và tìm hiểu lịch sử của công trình văn hóa này.', 20, N'Đi bộ', GETDATE(), 'active'),
-- TOUR0117
('TOUR0117', 1, N'Hà Nội - Làng Nón Chuông', 4, N'Hà Nội', N'Hà Nội', '2025-07-14', '2025-07-17', N'Khám phá làng nghề nón Chuông, học cách đan nón lá truyền thống, tham quan các gian hàng thủ công, và mua sắm nón làm quà lưu niệm.', 25, N'Xe du lịch', GETDATE(), 'active'),
-- TOUR0118
('TOUR0118', 1, N'Hà Nội - Chợ Nông Sản', 2, N'Hà Nội', N'Hà Nội', '2025-07-16', '2025-07-17', N'Tham quan chợ nông sản Hà Nội, mua sắm rau củ quả tươi ngon, tìm hiểu về quy trình sản xuất sạch, và thưởng thức các món ăn dân dã tại chỗ.', 30, N'Đi bộ', GETDATE(), 'active'),
-- TOUR0119
('TOUR0119', 1, N'Hà Nội - Làng Đúc Đồng', 5, N'Hà Nội', N'Hà Nội', '2025-07-18', '2025-07-22', N'Khám phá làng nghề đúc đồng, tìm hiểu kỹ thuật đúc thủ công, tham quan các sản phẩm như chuông đồng, tượng đồng, và mua sắm đồ trang trí độc đáo.', 20, N'Xe du lịch', GETDATE(), 'active'),
-- TOUR0120
('TOUR0120', 1, N'Hà Nội - Công Viên Thủ Lệ', 3, N'Hà Nội', N'Hà Nội', '2025-07-20', '2025-07-22', N'Ghé thăm Công viên Thủ Lệ, tham quan vườn thú, khu vui chơi ngoài trời, và thư giãn bên hồ nước trong không gian xanh mát giữa lòng Hà Nội.', 25, N'Đi bộ', GETDATE(), 'active');

INSERT INTO Tour_Price (tour_id, age_group, price)
VALUES 
-- TOUR0101 (duration 3)
('TOUR0101', 'adultPrice', 10000000.00),
('TOUR0101', 'childPrice', 7000000.00),
('TOUR0101', 'infantPrice', 4000000.00),
-- TOUR0102 (duration 2)
('TOUR0102', 'adultPrice', 9000000.00),
('TOUR0102', 'childPrice', 6300000.00),
('TOUR0102', 'infantPrice', 3600000.00),
-- TOUR0103 (duration 4)
('TOUR0103', 'adultPrice', 12000000.00),
('TOUR0103', 'childPrice', 8400000.00),
('TOUR0103', 'infantPrice', 4800000.00),
-- TOUR0104 (duration 3)
('TOUR0104', 'adultPrice', 10500000.00),
('TOUR0104', 'childPrice', 7350000.00),
('TOUR0104', 'infantPrice', 4200000.00),
-- TOUR0105 (duration 2)
('TOUR0105', 'adultPrice', 9500000.00),
('TOUR0105', 'childPrice', 6650000.00),
('TOUR0105', 'infantPrice', 3800000.00),
-- TOUR0106 (duration 4)
('TOUR0106', 'adultPrice', 12500000.00),
('TOUR0106', 'childPrice', 8750000.00),
('TOUR0106', 'infantPrice', 5000000.00),
-- TOUR0107 (duration 3)
('TOUR0107', 'adultPrice', 11000000.00),
('TOUR0107', 'childPrice', 7700000.00),
('TOUR0107', 'infantPrice', 4400000.00),
-- TOUR0108 (duration 2)
('TOUR0108', 'adultPrice', 9200000.00),
('TOUR0108', 'childPrice', 6440000.00),
('TOUR0108', 'infantPrice', 3680000.00),
-- TOUR0109 (duration 4)
('TOUR0109', 'adultPrice', 13000000.00),
('TOUR0109', 'childPrice', 9100000.00),
('TOUR0109', 'infantPrice', 5200000.00),
-- TOUR0110 (duration 5)
('TOUR0110', 'adultPrice', 15000000.00),
('TOUR0110', 'childPrice', 10500000.00),
('TOUR0110', 'infantPrice', 6000000.00),
-- TOUR0111 (duration 3)
('TOUR0111', 'adultPrice', 10800000.00),
('TOUR0111', 'childPrice', 7560000.00),
('TOUR0111', 'infantPrice', 4320000.00),
-- TOUR0112 (duration 2)
('TOUR0112', 'adultPrice', 9100000.00),
('TOUR0112', 'childPrice', 6370000.00),
('TOUR0112', 'infantPrice', 3640000.00),
-- TOUR0113 (duration 4)
('TOUR0113', 'adultPrice', 12800000.00),
('TOUR0113', 'childPrice', 8960000.00),
('TOUR0113', 'infantPrice', 5120000.00),
-- TOUR0114 (duration 3)
('TOUR0114', 'adultPrice', 10200000.00),
('TOUR0114', 'childPrice', 7140000.00),
('TOUR0114', 'infantPrice', 4080000.00),
-- TOUR0115 (duration 2)
('TOUR0115', 'adultPrice', 9300000.00),
('TOUR0115', 'childPrice', 6510000.00),
('TOUR0115', 'infantPrice', 3720000.00),
-- TOUR0116 (duration 3)
('TOUR0116', 'adultPrice', 10700000.00),
('TOUR0116', 'childPrice', 7490000.00),
('TOUR0116', 'infantPrice', 4280000.00),
-- TOUR0117 (duration 4)
('TOUR0117', 'adultPrice', 12200000.00),
('TOUR0117', 'childPrice', 8540000.00),
('TOUR0117', 'infantPrice', 4880000.00),
-- TOUR0118 (duration 2)
('TOUR0118', 'adultPrice', 9400000.00),
('TOUR0118', 'childPrice', 6580000.00),
('TOUR0118', 'infantPrice', 3760000.00),
-- TOUR0119 (duration 5)
('TOUR0119', 'adultPrice', 14500000.00),
('TOUR0119', 'childPrice', 10150000.00),
('TOUR0119', 'infantPrice', 5800000.00),
-- TOUR0120 (duration 3)
('TOUR0120', 'adultPrice', 10600000.00),
('TOUR0120', 'childPrice', 7420000.00),
('TOUR0120', 'infantPrice', 4240000.00);

INSERT INTO Tour_image (image_id, tour_id, image_url)
VALUES 
-- TOUR0101
('IMG0301', 'TOUR0101', 'uploads/1748978720938-433788546.jpeg'),
('IMG0302', 'TOUR0101', 'uploads/1748978720939-169755770.jpg'),
('IMG0303', 'TOUR0101', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0102
('IMG0304', 'TOUR0102', 'uploads/1748978720938-433788546.jpeg'),
('IMG0305', 'TOUR0102', 'uploads/1748978720939-169755770.jpg'),
('IMG0306', 'TOUR0102', 'uploads/1748978720939-846537457.jpeg'),
-- TOU0103
('IMG0307', 'TOUR0103', 'uploads/1748978720938-433788546.jpeg'),
('IMG0308', 'TOUR0103', 'uploads/1748978720939-169755770.jpg'),
('IMG0309', 'TOUR0103', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0104
('IMG0310', 'TOUR0104', 'uploads/1748978720938-433788546.jpeg'),
('IMG0311', 'TOUR0104', 'uploads/1748978720939-169755770.jpg'),
('IMG0312', 'TOUR0104', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0105
('IMG0313', 'TOUR0105', 'uploads/1748978720938-433788546.jpeg'),
('IMG0314', 'TOUR0105', 'uploads/1748978720939-169755770.jpg'),
('IMG0315', 'TOUR0105', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0106
('IMG0316', 'TOUR0106', 'uploads/1748978720938-433788546.jpeg'),
('IMG0317', 'TOUR0106', 'uploads/1748978720939-169755770.jpg'),
('IMG0318', 'TOUR0106', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0107
('IMG0319', 'TOUR0107', 'uploads/1748978720938-433788546.jpeg'),
('IMG0320', 'TOUR0107', 'uploads/1748978720939-169755770.jpg'),
('IMG0321', 'TOUR0107', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0108
('IMG0322', 'TOUR0108', 'uploads/1748978720938-433788546.jpeg'),
('IMG0323', 'TOUR0108', 'uploads/1748978720939-169755770.jpg'),
('IMG0324', 'TOUR0108', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0109
('IMG0325', 'TOUR0109', 'uploads/1748978720938-433788546.jpeg'),
('IMG0326', 'TOUR0109', 'uploads/1748978720939-169755770.jpg'),
('IMG0327', 'TOUR0109', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0110
('IMG0328', 'TOUR0110', 'uploads/1748978720938-433788546.jpeg'),
('IMG0329', 'TOUR0110', 'uploads/1748978720939-169755770.jpg'),
('IMG0330', 'TOUR0110', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0111
('IMG0331', 'TOUR0111', 'uploads/1748978720938-433788546.jpeg'),
('IMG0332', 'TOUR0111', 'uploads/1748978720939-169755770.jpg'),
('IMG0333', 'TOUR0111', 'uploads/1748978720939-846537457.jpeg'),
-- TOU0112
('IMG0334', 'TOUR0112', 'uploads/1748978720938-433788546.jpeg'),
('IMG0335', 'TOUR0112', 'uploads/1748978720939-169755770.jpg'),
('IMG0336', 'TOUR0112', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0113
('IMG0337', 'TOUR0113', 'uploads/1748978720938-433788546.jpeg'),
('IMG0338', 'TOUR0113', 'uploads/1748978720939-169755770.jpg'),
('IMG0339', 'TOUR0113', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0114
('IMG0340', 'TOUR0114', 'uploads/1748978720938-433788546.jpeg'),
('IMG0341', 'TOUR0114', 'uploads/1748978720939-169755770.jpg'),
('IMG0342', 'TOUR0114', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0115
('IMG0343', 'TOUR0115', 'uploads/1748978720938-433788546.jpeg'),
('IMG0344', 'TOUR0115', 'uploads/1748978720939-169755770.jpg'),
('IMG0345', 'TOUR0115', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0116
('IMG0346', 'TOUR0116', 'uploads/1748978720938-433788546.jpeg'),
('IMG0347', 'TOUR0116', 'uploads/1748978720939-169755770.jpg'),
('IMG0348', 'TOUR0116', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0117
('IMG0349', 'TOUR0117', 'uploads/1748978720938-433788546.jpeg'),
('IMG0350', 'TOUR0117', 'uploads/1748978720939-169755770.jpg'),
('IMG0351', 'TOUR0117', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0118
('IMG0352', 'TOUR0118', 'uploads/1748978720938-433788546.jpeg'),
('IMG0353', 'TOUR0118', 'uploads/1748978720939-169755770.jpg'),
('IMG0354', 'TOUR0118', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0119
('IMG0355', 'TOUR0119', 'uploads/1748978720938-433788546.jpeg'),
('IMG0356', 'TOUR0119', 'uploads/1748978720939-169755770.jpg'),
('IMG0357', 'TOUR0119', 'uploads/1748978720939-846537457.jpeg'),
-- TOUR0120
('IMG0358', 'TOUR0120', 'uploads/1748978720938-433788546.jpeg'),
('IMG0359', 'TOUR0120', 'uploads/1748978720939-169755770.jpg'),
('IMG0360', 'TOUR0120', 'uploads/1748978720939-846537457.jpeg');

INSERT INTO Tour_Schedule (schedule_id, tour_id, day_number, tour_route, detail)
VALUES 
-- TOUR0101 (3 days)
('SCH0183', 'TOUR0101', 1, N'Khởi hành', N'Khởi hành từ trung tâm Hà Nội, di chuyển đến Phố Cổ, tham quan Hồ Gươm.'),
('SCH0184', 'TOUR0101', 2, N'Tham quan', N'Khám phá 36 phố phường, thưởng thức phở bò tại Phở Thìn.'),
('SCH0185', 'TOUR0101', 3, N'Kết thúc', N'Ghé nhà cổ 87 Mã Mây, mua sắm và trở về điểm xuất phát.'),
-- TOUR0102 (2 days)
('SCH0186', 'TOUR0102', 1, N'Khởi hành', N'Khởi hành đến Văn Miếu, tham quan cổng chính.'),
('SCH0187', 'TOUR0102', 2, N'Tham quan', N'Chiêm ngưỡng bia tiến sĩ, tìm hiểu lịch sử khoa cử.'),
-- TOUR0103 (4 days)
('SCH0188', 'TOUR0103', 1, N'Khởi hành', N'Khởi hành đến Bát Tràng, tham quan làng gốm.'),
('SCH0189', 'TOUR0103', 2, N'Trải nghiệm', N'Tự tay làm gốm, học quy trình sản xuất.'),
('SCH0190', 'TOUR0103', 3, N'Mua sắm', N'Mua sắm sản phẩm gốm, thưởng thức trà gốm.'),
('SCH0191', 'TOUR0103', 4, N'Kết thúc', N'Quay về Hà Nội, nghỉ ngơi.'),
-- TOUR0104 (3 days)
('SCH0192', 'TOUR0104', 1, N'Khởi hành', N'Khởi hành đến Hoàng Thành Thăng Long.'),
('SCH0193', 'TOUR0104', 2, N'Tham quan', N'Khám phá Đoan Môn, điện Kính Thiên.'),
('SCH0194', 'TOUR0104', 3, N'Kết thúc', N'Ghé hầm D67, trở về.'),
-- TOUR0105 (2 days)
('SCH0195', 'TOUR0105', 1, N'Khởi hành', N'Khởi hành đến chợ Đồng Xuân.'),
('SCH0196', 'TOUR0105', 2, N'Mua sắm', N'Mua sắm và thưởng thức bún chả.'),
-- TOUR0106 (4 days)
('SCH0197', 'TOUR0106', 1, N'Khởi hành', N'Khởi hành đến Vạn Phúc.'),
('SCH0198', 'TOUR0106', 2, N'Trải nghiệm', N'Học dệt lụa, tham quan xưởng dệt.'),
('SCH0199', 'TOUR0106', 3, N'Mua sắm', N'Mua sắm lụa, nghỉ ngơi.'),
('SCH0200', 'TOUR0106', 4, N'Kết thúc', N'Quay về Hà Nội.'),
-- TOUR0107 (3 days)
('SCH0201', 'TOUR0107', 1, N'Khởi hành', N'Khởi hành đến Hồ Tây.'),
('SCH0202', 'TOUR0107', 2, N'Dạo thuyền', N'Dạo thuyền ngắm hoàng hôn, ghé chùa Trấn Quốc.'),
('SCH0203', 'TOUR0107', 3, N'Kết thúc', N'Thưởng thức bánh tôm, trở về.'),
-- TOUR0108 (2 days)
('SCH0204', 'TOUR0108', 1, N'Khởi hành', N'Khởi hành đến Bảo tàng Dân tộc Học.'),
('SCH0205', 'TOUR0108', 2, N'Tham quan', N'Khám phá mô hình nhà truyền thống, tham gia hoạt động văn hóa.'),
-- TOUR0109 (4 days)
('SCH0206', 'TOUR0109', 1, N'Khởi hành', N'Khởi hành đến Thổ Hà.'),
('SCH0207', 'TOUR0109', 2, N'Trải nghiệm', N'Tìm hiểu làm tương Bần.'),
('SCH0208', 'TOUR0109', 3, N'Mua sắm', N'Mua bánh đậu xanh, tham quan kiến trúc cổ.'),
('SCH0209', 'TOUR0109', 4, N'Kết thúc', N'Quay về Hà Nội.'),
-- TOUR0110 (5 days)
('SCH0210', 'TOUR0110', 1, N'Khởi hành', N'Khởi hành đến chùa Hương.'),
('SCH0211', 'TOUR0110', 2, N'Hành hương', N'Leo núi, tham quan hang động thiêng liêng.'),
('SCH0212', 'TOUR0110', 3, N'Lễ hội', N'Tham gia lễ hội chùa Hương.'),
('SCH0213', 'TOUR0110', 4, N'Ẩm thực', N'Thưởng thức ẩm thực chay.'),
('SCH0214', 'TOUR0110', 5, N'Kết thúc', N'Quay về Hà Nội.'),
-- TOUR0111 (3 days)
('SCH0215', 'TOUR0111', 1, N'Khởi hành', N'Khởi hành đến làng đồ thờ.'),
('SCH0216', 'TOUR0111', 2, N'Trải nghiệm', N'Học chạm khắc gỗ.'),
('SCH0217', 'TOUR0111', 3, N'Kết thúc', N'Mua sắm bàn thờ, trở về.'),
-- TOUR0112 (2 days)
('SCH0218', 'TOUR0112', 1, N'Khởi hành', N'Khởi hành đến Đền Ngọc Sơn.'),
('SCH0219', 'TOUR0112', 2, N'Tham quan', N'Chiêm ngưỡng tháp Bút, cầu Thê Húc.'),
-- TOUR0113 (4 days)
('SCH0220', 'TOUR0113', 1, N'Khởi hành', N'Khởi hành đến Phù Lãng.'),
('SCH0221', 'TOUR0113', 2, N'Trải nghiệm', N'Làm gốm thủ công.'),
('SCH0222', 'TOUR0113', 3, N'Mua sắm', N'Mua sản phẩm gốm.'),
('SCH0223', 'TOUR0113', 4, N'Kết thúc', N'Quay về Hà Nội.'),
-- TOUR0114 (3 days)
('SCH0224', 'TOUR0114', 1, N'Khởi hành', N'Khởi hành đến Phủ Tây Hồ.'),
('SCH0225', 'TOUR0114', 2, N'Hành hương', N'Tham gia lễ cầu duyên.'),
('SCH0226', 'TOUR0114', 3, N'Kết thúc', N'Thưởng thức chay, trở về.'),
-- TOUR0115 (2 days)
('SCH0227', 'TOUR0115', 1, N'Khởi hành', N'Khởi hành đến Tây Tựu.'),
('SCH0228', 'TOUR0115', 2, N'Trải nghiệm', N'Học trồng hoa, mua hoa tươi.'),
-- TOUR0116 (3 days)
('SCH0229', 'TOUR0116', 1, N'Khởi hành', N'Khởi hành đến Nhà Hát Lớn.'),
('SCH0230', 'TOUR0116', 2, N'Tham quan', N'Xem biểu diễn nghệ thuật.'),
('SCH0231', 'TOUR0116', 3, N'Kết thúc', N'Tìm hiểu lịch sử, trở về.'),
-- TOUR0117 (4 days)
('SCH0232', 'TOUR0117', 1, N'Khởi hành', N'Khởi hành đến làng nón Chuông.'),
('SCH0233', 'TOUR0117', 2, N'Trải nghiệm', N'Học đan nón lá.'),
('SCH0234', 'TOUR0117', 3, N'Mua sắm', N'Mua nón làm quà.'),
('SCH0235', 'TOUR0117', 4, N'Kết thúc', N'Quay về Hà Nội.'),
-- TOUR0118 (2 days)
('SCH0236', 'TOUR0118', 1, N'Khởi hành', N'Khởi hành đến chợ nông sản.'),
('SCH0237', 'TOUR0118', 2, N'Mua sắm', N'Mua rau củ, thưởng thức món dân dã.'),
-- TOUR0119 (5 days)
('SCH0238', 'TOUR0119', 1, N'Khởi hành', N'Khởi hành đến làng đúc đồng.'),
('SCH0239', 'TOUR0119', 2, N'Trải nghiệm', N'Học kỹ thuật đúc đồng.'),
('SCH0240', 'TOUR0119', 3, N'Mua sắm', N'Mua chuông đồng, tượng đồng.'),
('SCH0241', 'TOUR0119', 4, N'Nghỉ ngơi', N'Nghỉ ngơi tại làng.'),
('SCH0242', 'TOUR0119', 5, N'Kết thúc', N'Quay về Hà Nội.'),
-- TOUR0120 (3 days)
('SCH0243', 'TOUR0120', 1, N'Khởi hành', N'Khởi hành đến Công viên Thủ Lệ.'),
('SCH0244', 'TOUR0120', 2, N'Tham quan', N'Tham quan vườn thú, khu vui chơi.'),
('SCH0245', 'TOUR0120', 3, N'Kết thúc', N'Thư giãn bên hồ, trở về.');