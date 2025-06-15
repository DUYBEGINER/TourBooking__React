import React from 'react';
import './BookingHistoryCustomer.scss'; // Import your styles here
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router';

interface BookingHistoryCustomerProps {
  customerName?: string;
  bookingDate?: string;
  bookingCode?: string;
  destination?: string;
  duration?: string;
  totalGuests?: number;
  transport?: string;
  departureDate?: string;
  returnDate?: string;
  adultCount?: number;
  childCount?: number;
  infantCount?: number;
  adultPrice?: number;
  childPrice?: number;
  infantPrice?: number;
  voucherDiscount?: number;
  totalAmount?: number;
}

function BookingHistoryCustomer(props: BookingHistoryCustomerProps) {
  const {
    customerName = "Phạm Phúc Duy",
    bookingDate = "17/03/2022",
    bookingCode = "#XYZABC",
    destination = "Đà Lạt",
    duration = "4 ngày 3 đêm",
    totalGuests = 50,
    transport = "Xe khách",
    departureDate = "20/03/2025",
    returnDate = "24/03/2025",
    adultCount = 1,
    childCount = 2,
    infantCount = 3,
    adultPrice = 3990000,
    childPrice = 3990000,
    infantPrice = 3990000,
    voucherDiscount = 1000000,
    totalAmount = 10970000
  } = props;

    const navigate = useNavigate();

  

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="booking-history-customer">
      {/* Header */}
      <div className="flex align-items-center" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
        <IoIosArrowRoundBack />
        <p className="back-text"> Quay lại</p>
      </div>

      <div className="content">
        {/* Title */}
        <h1 className="title">Tour Đà Lạt</h1>

        {/* Customer Info */}
        <div className="customer-info">
          <div className="info-row">
            <span className="label">Khách hàng: </span>
            <span>{customerName}</span>
          </div>
          <div className="info-row">
            <span className="label">Ngày đặt tour: </span>
            <span>{bookingDate}</span>
          </div>
          <div className="info-row">
            <span className="label">Mã booking: </span>
            <span>{bookingCode}</span>
          </div>
        </div>

        {/* Tour Information Card */}
        <div className="tour-info-card">
          <h2 className="tour-title">THÔNG TIN TOUR</h2>
          
          <div className="tour-grid">
            {/* Location */}
            <div className="info-item">
              {/* <MapPin className="icon green" /> */}
              <div className="info-content">
                <h3 className="info-label">Địa Điểm</h3>
                <p className="info-value">{destination}</p>
              </div>
            </div>

            {/* Duration */}
            <div className="info-item">
              {/* <Clock className="icon blue" /> */}
              <div className="info-content">
                <h3 className="info-label">Thời Lượng</h3>
                <p className="info-value">{duration}</p>
              </div>
            </div>

            {/* Total Guests */}
            <div className="info-item">
              {/* <Users className="icon blue" /> */}
              <div className="info-content">
                <h3 className="info-label">Tổng Số Ghế</h3>
                <p className="info-value">{totalGuests}</p>
              </div>
            </div>

            {/* Transport */}
            <div className="info-item">
              {/* <Car className="icon green" /> */}
              <div className="info-content">
                <h3 className="info-label">Phương Tiện</h3>
                <p className="info-value">{transport}</p>
              </div>
            </div>

            {/* Departure Date */}
            <div className="info-item">
              {/* <Calendar className="icon blue" /> */}
              <div className="info-content">
                <h3 className="info-label">Ngày Khởi Hành</h3>
                <p className="info-value">{departureDate}</p>
              </div>
            </div>

            {/* Return Date */}
            <div className="info-item">
              {/* <CalendarCheck className="icon green" /> */}
              <div className="info-content">
                <h3 className="info-label">Ngày Về</h3>
                <p className="info-value">{returnDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="pricing-section">
          {/* Left side - Guest counts and prices */}
          <div className="pricing-left">
            <div className="pricing-row">
              <div className="pricing-label">
                <span className="label-text">Người lớn</span>
                <span className="quantity">x {adultCount} =</span>
              </div>
              <span className="price">{formatPrice(adultPrice)}</span>
            </div>

            <div className="pricing-row">
              <div className="pricing-label">
                <span className="label-text">Trẻ em</span>
                <span className="quantity">x {childCount} =</span>
              </div>
              <span className="price">{formatPrice(childPrice)}</span>
            </div>

            <div className="pricing-row">
              <div className="pricing-label">
                <span className="label-text">Em bé</span>
                <span className="quantity">x {infantCount} =</span>
              </div>
              <span className="price">{formatPrice(infantPrice)}</span>
            </div>

            <div className="pricing-row total-border">
              <span className="label-text">Voucher</span>
              <span className="price">-{formatPrice(voucherDiscount)}</span>
            </div>
          </div>

          {/* Right side - Total */}
          <div className="pricing-right">
            <div className="total-container">
              <h3 className="total-label">Thành tiền:</h3>
              <p className="total-amount">{formatPrice(totalAmount)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingHistoryCustomer;