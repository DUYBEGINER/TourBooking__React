
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

CREATE TABLE table_name (
    email VARCHAR(255) NULL,
    opt varbinary(MAX) NULL,
    createdAt datetime NULL,
    expiredAt datetime NOT NULL
);

PRINT 'Tạo bảng thành công!';

