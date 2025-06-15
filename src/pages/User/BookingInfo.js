// src/pages/User/BookingInfo.js
import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col, Card, InputGroup } from "react-bootstrap";
import { FaMapMarkerAlt, FaCalendarAlt, FaUser, FaUsers, FaBaby, FaTag, FaTimes } from "react-icons/fa";
import NavBar from '../../layouts/Navbar';
import PromotionModal from '../../components/Common/PromotionModal/PromotionModal';
import "../../styles/pages/BookingInfo.scss";
import { AuthContext } from '../../context/AuthContext';
import { createBooking, createBookingDetail } from '../../api/bookingAPI';
import { applyPromotionToBooking } from '../../api/promotionAPI';
import { formatDate } from "../../feature/formatDate";
import { API_URL } from '../../utils/API_Port';

const defaultPassenger = (type) => ({
  type, // 'adult', 'child', 'baby'
  fullname: "",
  gender: "",
  dob: "",
});

const BookingInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // Lấy dữ liệu tour từ location.state
  const tour = location.state?.tour || {};
  const tourId = location.state?.tourId || '';
  const image = location.state?.image || '';

  console.log('Tour data received:', tour);
  console.log('Tour ID received:', tourId);

  // State cho form
  const [contact, setContact] = useState({ 
    fullname: "", 
    phone: "", 
    email: "", 
    address: "" 
  });
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [babies, setBabies] = useState(0);
  const [passengers, setPassengers] = useState([
    { ...defaultPassenger("adult") }
  ]);
  const [payment, setPayment] = useState("vnpay");
  const [agree, setAgree] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State cho mã giảm giá
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Tính tổng tiền - sử dụng giá từ tour thực tế
  const getPrice = (type) => {
    switch(type) {
      case 'adult':
        return tour.adultPrice || 0;
      case 'child':
        return tour.childPrice || 0;
      case 'baby':
        return tour.infantPrice || 0;
      default:
        return 0;
    }
  };

  const originalTotal = adults * getPrice('adult') + children * getPrice('child') + babies * getPrice('baby');
  const total = originalTotal - discountAmount;

  // Xử lý tăng/giảm số lượng hành khách
  const handleChangeCount = (type, delta) => {
    let count, setCount, label;
    if (type === "adult") { count = adults; setCount = setAdults; label = "adult"; }
    if (type === "child") { count = children; setCount = setChildren; label = "child"; }
    if (type === "baby") { count = babies; setCount = setBabies; label = "baby"; }
    
    const newCount = count + delta;
    if (newCount < 0) return;
    if (type === "adult" && newCount < 1) return; // Ít nhất 1 người lớn
    
    setCount(newCount);

    // Cập nhật mảng passengers
    setPassengers(prev => {
      const filtered = prev.filter(p => p.type !== type);
      const newArr = Array(newCount).fill(0).map(() => defaultPassenger(type));
      return [...filtered, ...newArr];
    });

    // Reset mã giảm giá khi thay đổi số lượng khách
    if (appliedPromotion) {
      const newOriginalTotal = newCount * getPrice(type) + 
        (type !== "adult" ? adults : newCount) * getPrice('adult') + 
        (type !== "child" ? children : newCount) * getPrice('child') + 
        (type !== "baby" ? babies : newCount) * getPrice('baby');
      const newDiscountAmount = (newOriginalTotal * appliedPromotion.discount_percentage) / 100;
      setDiscountAmount(newDiscountAmount);
    }
  };

  // Xử lý áp dụng mã giảm giá
  const handleApplyPromotion = (promotion) => {
    setAppliedPromotion(promotion);
    const newDiscountAmount = (originalTotal * promotion.discount_percentage) / 100;
    setDiscountAmount(newDiscountAmount);
  };

  // Xử lý gỡ bỏ mã giảm giá
  const handleRemovePromotion = () => {
    setAppliedPromotion(null);
    setDiscountAmount(0);
  };

  // Xử lý submit - tạo booking và booking details
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setIsLoading(true);

    try {
      // Kiểm tra contact
      if (
        !contact.fullname.trim() ||
        !contact.phone.trim() ||
        !contact.email.trim() ||
        !contact.address.trim()
      ) {
        alert('Vui lòng điền đầy đủ thông tin liên lạc!');
        setIsLoading(false);
        return;
      }

      // Kiểm tra từng passenger
      for (let p of passengers) {
        if (!p.fullname.trim() || !p.gender.trim() || !p.dob.trim()) {
          alert('Vui lòng điền đầy đủ thông tin hành khách!');
          setIsLoading(false);
          return;
        }
      }

      if (!agree) {
        alert("Bạn phải đồng ý với các điều khoản!");
        setIsLoading(false);
        return;
      }

      // Sử dụng user.id thay vì user.cus_id
      const customerId = user?.id;
      if (!customerId) {
        alert('Không thể xác định thông tin khách hàng. Vui lòng thử lại!');
        setIsLoading(false);
        return;
      }

      // Bước 1: Tạo booking
      console.log('Creating booking for:', { tourId, customerId });
      const bookingResponse = await createBooking(tourId, customerId);
      const bookingId = bookingResponse.booking_id;
      
      console.log('Booking created with ID:', bookingId);

      // Bước 2: Tạo booking details
      const bookingDetails = [];
      
      if (adults > 0) {
        bookingDetails.push({
          age_group: 'adultPrice',
          quantity: adults,
          price_per_person: getPrice('adult')
        });
      }
      
      if (children > 0) {
        bookingDetails.push({
          age_group: 'childPrice',
          quantity: children,
          price_per_person: getPrice('child')
        });
      }
      
      if (babies > 0) {
        bookingDetails.push({
          age_group: 'infantPrice',
          quantity: babies,
          price_per_person: getPrice('baby')
        });
      }

      console.log('Creating booking details:', { bookingId, tourId, bookingDetails });
      const detailResponse = await createBookingDetail(bookingId, tourId, bookingDetails);
      
      console.log('Booking details created successfully');

      // Bước 3: Áp dụng mã giảm giá nếu có
      if (appliedPromotion) {
        try {
          console.log('Applying promotion to booking:', { bookingId, promoId: appliedPromotion.promo_id });
          await applyPromotionToBooking(bookingId, appliedPromotion.promo_id);
          console.log('Promotion applied successfully');
        } catch (promoError) {
          console.error('Error applying promotion:', promoError);
          // Không dừng lại nếu lỗi áp dụng mã giảm giá, chỉ cảnh báo
          alert('Cảnh báo: Không thể áp dụng mã giảm giá, nhưng đặt tour đã thành công');
        }
      }

      // Điều hướng đến trang thanh toán
      navigate("/checkout", {
        state: {
          contact,
          passengers,
          tour,
          total,
          payment,
          bookingId,
          bookingDate: new Date().toLocaleString('vi-VN'),
          adults,
          children,
          babies,
          appliedPromotion,
          discountAmount
        }
      });

    } catch (error) {
      console.error('Error during booking process:', error);
      alert('Có lỗi xảy ra khi đặt tour: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fill contact info from user context
  useEffect(() => {
    if (user) {
      setContact({
        fullname: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        address: user.address || ''
      });
    }
  }, [user]);

  return (
    <div style={{background: '#f7f8fa', minHeight: '100vh'}}>
      <NavBar />
      <div className="container py-4 booking-info-container">
        {/* Breadcrumb */}
        <div className="mb-3">
          <a href="/" className="back-button">
            ← Quay lại
          </a>
        </div>
        
        <h2 className="text-center mb-4" style={{fontWeight: 700, color: "#1a237e", letterSpacing: 1}}>
          NHẬP THÔNG TIN
        </h2>
        
        <Row>
          <Col lg={8}>
            <Form onSubmit={handleSubmit}>
              {/* Thông tin liên lạc */}
              <Card className="mb-4 shadow-sm booking-card">
                <Card.Header>
                  <h5 className="mb-0 section-title">THÔNG TIN LIÊN LẠC</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="form-label">Họ tên *</Form.Label>
                        <Form.Control 
                          required 
                          value={contact.fullname} 
                          onChange={e => setContact({ ...contact, fullname: e.target.value })}
                          placeholder="Nhập họ tên"
                          className="form-input"
                        />
                        {submitted && !contact.fullname && (
                          <div className="validation-text">Thông tin bắt buộc</div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="form-label">Điện thoại *</Form.Label>
                        <Form.Control 
                          required 
                          value={contact.phone} 
                          onChange={e => setContact({ ...contact, phone: e.target.value })}
                          placeholder="Nhập số điện thoại"
                          className="form-input"
                        />
                        {submitted && !contact.phone && (
                          <div className="validation-text">Thông tin bắt buộc</div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="form-label">Email *</Form.Label>
                        <Form.Control 
                          required 
                          type="email" 
                          value={contact.email} 
                          onChange={e => setContact({ ...contact, email: e.target.value })}
                          placeholder="Nhập email"
                          className="form-input"
                        />
                        {submitted && !contact.email && (
                          <div className="validation-text">Thông tin bắt buộc</div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="form-label">Địa chỉ *</Form.Label>
                        <Form.Control 
                          required 
                          value={contact.address} 
                          onChange={e => setContact({ ...contact, address: e.target.value })}
                          placeholder="Nhập địa chỉ"
                          className="form-input"
                        />
                        {submitted && !contact.address && (
                          <div className="validation-text">Thông tin bắt buộc</div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Hành khách */}
              <Card className="mb-4 shadow-sm booking-card">
                <Card.Header>
                  <h5 className="mb-0 section-title">HÀNH KHÁCH</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4} className="mb-3">
                      <div className="passenger-type">
                        <FaUser className="passenger-icon" />
                        <div>
                          <div className="passenger-label">Người lớn</div>
                          <div className="passenger-age">(Từ 12 tuổi trở lên)</div>
                        </div>
                        <div className="counter-group">
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => handleChangeCount("adult", -1)}
                            disabled={adults <= 1}
                            className="counter-btn"
                          >
                            −
                          </Button>
                          <span className="counter-value">{adults}</span>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => handleChangeCount("adult", 1)}
                            className="counter-btn"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </Col>
                    <Col md={4} className="mb-3">
                      <div className="passenger-type">
                        <FaUsers className="passenger-icon" />
                        <div>
                          <div className="passenger-label">Trẻ em</div>
                          <div className="passenger-age">(Từ 4 - 11 tuổi)</div>
                        </div>
                        <div className="counter-group">
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => handleChangeCount("child", -1)}
                            className="counter-btn"
                          >
                            −
                          </Button>
                          <span className="counter-value">{children}</span>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => handleChangeCount("child", 1)}
                            className="counter-btn"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </Col>
                    <Col md={4} className="mb-3">
                      <div className="passenger-type">
                        <FaBaby className="passenger-icon" />
                        <div>
                          <div className="passenger-label">Em bé</div>
                          <div className="passenger-age">(Dưới 4 tuổi)</div>
                        </div>
                        <div className="counter-group">
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => handleChangeCount("baby", -1)}
                            className="counter-btn"
                          >
                            −
                          </Button>
                          <span className="counter-value">{babies}</span>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => handleChangeCount("baby", 1)}
                            className="counter-btn"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Thông tin hành khách */}
              <Card className="mb-4 shadow-sm booking-card">
                <Card.Header>
                  <h5 className="mb-0 section-title">THÔNG TIN HÀNH KHÁCH</h5>
                </Card.Header>
                <Card.Body>
                  {passengers.map((p, idx) => {
                    const passengerLabel = p.type === 'adult' ? 'Người lớn' : p.type === 'child' ? 'Trẻ em' : 'Em bé';
                    const passengerIndex = passengers.filter((pass, i) => i <= idx && pass.type === p.type).length;
                    
                    return (
                      <div key={idx} className="passenger-form mb-4">
                        <div className="passenger-header">
                          <FaUser className="me-2" />
                          <span className="passenger-title">{passengerLabel} ({passengerIndex})</span>
                        </div>
                        <Row className="mt-3">
                          <Col md={4} className="mb-3">
                            <Form.Group>
                              <Form.Label className="form-label">Họ tên *</Form.Label>
                              <Form.Control 
                                required 
                                value={p.fullname} 
                                onChange={e => {
                                  const arr = [...passengers];
                                  arr[idx].fullname = e.target.value;
                                  setPassengers(arr);
                                }}
                                placeholder="Nhập họ tên"
                                className="form-input"
                              />
                              {submitted && !p.fullname && (
                                <div className="validation-text">Thông tin bắt buộc</div>
                              )}
                            </Form.Group>
                          </Col>
                          <Col md={4} className="mb-3">
                            <Form.Group>
                              <Form.Label className="form-label">Giới tính *</Form.Label>
                              <Form.Select 
                                required 
                                value={p.gender} 
                                onChange={e => {
                                  const arr = [...passengers];
                                  arr[idx].gender = e.target.value;
                                  setPassengers(arr);
                                }}
                                className="form-input"
                              >
                                <option value="">Chọn giới tính</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                              </Form.Select>
                              {submitted && !p.gender && (
                                <div className="validation-text">Thông tin bắt buộc</div>
                              )}
                            </Form.Group>
                          </Col>
                          <Col md={4} className="mb-3">
                            <Form.Group>
                              <Form.Label className="form-label">Ngày sinh *</Form.Label>
                              <Form.Control 
                                required 
                                type="date" 
                                value={p.dob} 
                                onChange={e => {
                                  const arr = [...passengers];
                                  arr[idx].dob = e.target.value;
                                  setPassengers(arr);
                                }}
                                className="form-input"
                              />
                              {submitted && !p.dob && (
                                <div className="validation-text">Thông tin bắt buộc</div>
                              )}
                            </Form.Group>
                          </Col>
                        </Row>
                      </div>
                    );
                  })}
                </Card.Body>
              </Card>

              {/* Các hình thức thanh toán */}
              <Card className="mb-4 shadow-sm booking-card">
                <Card.Header>
                  <h5 className="mb-0 section-title">CÁC HÌNH THỨC THANH TOÁN</h5>
                </Card.Header>
                <Card.Body>
                  <div className="payment-options">
                    <Form.Check
                      type="radio"
                      id="payment-vnpay"
                      name="payment"
                      label={
                        <span>
                          Thanh toán bằng VNPAY 
                          <img src="https://via.placeholder.com/40x20/1a237e/white?text=VNP" alt="VNPay" className="ms-2" style={{height: '20px'}} />
                        </span>
                      }
                      checked={payment === "vnpay"}
                      onChange={() => setPayment("vnpay")}
                      className="payment-option mb-3"
                    />
                    <Form.Check
                      type="radio"
                      id="payment-momo"
                      name="payment"
                      label={
                        <span>
                          Thanh toán bằng MoMo 
                          <img src="https://via.placeholder.com/40x20/d82d8b/white?text=MOMO" alt="MoMo" className="ms-2" style={{height: '20px'}} />
                        </span>
                      }
                      checked={payment === "momo"}
                      onChange={() => setPayment("momo")}
                      className="payment-option mb-3"
                    />
                  </div>
                </Card.Body>
              </Card>

              {/* Điều khoản */}
              <Card className="mb-4 shadow-sm booking-card">
                <Card.Header>
                  <h5 className="mb-0 section-title">Điều khoản bắt buộc khi đăng ký online</h5>
                </Card.Header>
                <Card.Body>
                  <div className="terms-content mb-3">
                    <h6 className="terms-subtitle">ĐIỀU KHOẢN THỎA THUẬN SỬ DỤNG DỊCH VỤ DU LỊCH HỢI DIA</h6>
                    <p className="terms-text">
                      Quý khách khi đặt chỗ đã được biết đó là chỗ, phòng số đó hay những ý định cần thiết, vì vậy Quý khách gần như không được thay đổi phòng trên chỗ phiên bản hiện tại khi sắp ra đi đây vào mồng chỗ sửa thành phần đó khi làm.
                    </p>
                    <p className="terms-text">
                      Nội dung đảm bảo giữa và đối với:
                    </p>
                    <ul className="terms-list">
                      <li>Phần 1: Điều khoản loại về các chương trình du lịch này</li>
                      <li>Phần 2: Chức năng điều khoản điền đầy đủ hay tên</li>
                      <li>Có khi đó dùng hiểu như mà</li>
                    </ul>
                    <p className="terms-footer">
                      <strong>PHẢN ỨNG ĐIỀU KIỆN VỀ CÁC CHƯƠNG TRÌNH DU LỊCH HỢI ĐIA</strong>
                    </p>
                    <p className="terms-footer">
                      <strong>1. GỢI Ý DU LỊCH</strong>
                    </p>
                    <p className="terms-text">
                      Gói dịch vụ du lịch được đặt hỗ trợ thông qua không phiết chăm sóc khách hàng của Vietnamworks tác: Du lịch được thông tri vào nhiều hứa Hà khẩu trong phuỗi chế hết cảnh đó.
                    </p>
                  </div>
                  <Form.Group>
                    <Form.Check
                      type="checkbox"
                      id="agree-terms"
                      label={
                        <span>
                          Tôi đồng ý với{' '}
                          <a href="#" className="terms-link">Chính sách</a>
                          {' '}bảo vệ dữ liệu cá nhân và các{' '}
                          <a href="#" className="terms-link">điều khoản trên</a>.
                        </span>
                      }
                      checked={agree}
                      onChange={e => setAgree(e.target.checked)}
                      required
                      className="terms-checkbox"
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            </Form>
          </Col>

          {/* Sidebar - Phiếu xác nhận booking */}
          <Col lg={4}>
            <Card className="booking-summary shadow-sm sticky-top">
              <Card.Header className="summary-header">
                <h5 className="mb-0">PHIẾU XÁC NHẬN BOOKING</h5>
              </Card.Header>
              <Card.Body>
                <div className="tour-summary mb-3">
                  <div className="tour-image mb-3">
                    <img src={`${API_URL}/${image.image_url}`} alt={tour.name} className="img-fluid rounded" />
                  </div>
                  <h6 className="tour-name">{tour.name || 'Tên tour'}</h6>
                  <div className="tour-details">
                    <div className="detail-item">
                      <span className="detail-label">Mã tour:</span>
                      <span className="detail-value text-danger fw-bold">{tour.tour_id || tour.code || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="trip-info mb-3">
                  <h6 className="info-title">THÔNG TIN TOUR:</h6>
                  <Row className="info-grid">
                    <Col xs={6} className="info-item">
                      <FaCalendarAlt className="info-icon" />
                      <div>
                        <div className="info-label">Ngày đi:</div>
                        <div className="info-value">{formatDate(tour.start_date) || formatDate(tour.date) || 'N/A'}</div>
                      </div>
                    </Col>
                    <Col xs={6} className="info-item">
                      <FaCalendarAlt className="info-icon" />
                      <div>
                        <div className="info-label">Ngày về:</div>
                        <div className="info-value">{formatDate(tour.end_date) || formatDate(tour.returnDate) || 'N/A'}</div>
                      </div>
                    </Col>
                    <Col xs={6} className="info-item">
                      <FaMapMarkerAlt className="info-icon" />
                      <div>
                        <div className="info-label">Nơi khởi hành:</div>
                        <div className="info-value">{tour.departure_location || tour.start || 'N/A'}</div>
                      </div>
                    </Col>
                    <Col xs={6} className="info-item">
                      <FaMapMarkerAlt className="info-icon" />
                      <div>
                        <div className="info-label">{tour.transport || 'Xe khách'}</div>
                      </div>
                    </Col>
                  </Row>
                </div>

                <div className="pricing-summary mb-3">
                  <h6 className="info-title">KHÁCH HÀNG</h6>
                  <div className="price-breakdown">
                    <div className="price-item">
                      <span>Người lớn</span>
                      <span>{adults} x {getPrice('adult').toLocaleString()} đ</span>
                    </div>
                    <div className="price-item">
                      <span>Trẻ em</span>
                      <span>{children} x {getPrice('child').toLocaleString()} đ</span>
                    </div>
                    <div className="price-item">
                      <span>Em bé</span>
                      <span>{babies} x {getPrice('baby').toLocaleString()} đ</span>
                    </div>
                  </div>
                  
                  <div className="subtotal-section">
                    <div className="price-item subtotal">
                      <span>Tạm tính:</span>
                      <span>{originalTotal.toLocaleString()} đ</span>
                    </div>
                  </div>
                </div>

                {/* Mã giảm giá */}
                <div className="promotion-section mb-3">
                  <h6 className="info-title">MÃ GIẢM GIÁ</h6>
                  {!appliedPromotion ? (
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="w-100 add-promotion-btn"
                      onClick={() => setShowPromotionModal(true)}
                    >
                      <FaTag className="me-2" />
                      Thêm mã giảm giá
                    </Button>
                  ) : (
                    <div className="applied-promotion">
                      <div className="promotion-info">
                        <div className="promotion-code">
                          <FaTag className="me-2" />
                          <span className="fw-bold">{appliedPromotion.code}</span>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="remove-promotion-btn p-0 ms-2"
                            onClick={handleRemovePromotion}
                          >
                            <FaTimes />
                          </Button>
                        </div>
                        <div className="promotion-description">
                          {appliedPromotion.description}
                        </div>
                        <div className="promotion-discount">
                          Giảm {appliedPromotion.discount_percentage}%
                        </div>
                      </div>
                      <div className="discount-amount">
                        <div className="price-item discount">
                          <span>Giảm giá:</span>
                          <span className="text-success">-{discountAmount.toLocaleString()} đ</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="price-total mb-3">
                  <div className="total-label">Tổng tiền:</div>
                  <div className="total-amount">{total.toLocaleString()} đ</div>
                </div>

                <Button 
                  type="submit" 
                  variant="danger" 
                  size="lg" 
                  className="w-100 book-now-btn"
                  onClick={handleSubmit}
                  disabled={!agree || isLoading}
                >
                  {isLoading ? 'Đang xử lý...' : 'Đặt ngay'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Promotion Modal */}
        <PromotionModal
          show={showPromotionModal}
          onHide={() => setShowPromotionModal(false)}
          onApplyPromotion={handleApplyPromotion}
          originalTotal={originalTotal}
        />
      </div>
    </div>
  );
};

export default BookingInfo;