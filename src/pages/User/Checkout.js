import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Modal, Alert, Spinner } from 'react-bootstrap';
import { FaChevronDown, FaCalendarAlt, FaMapMarkerAlt, FaBus, FaCreditCard, FaMobileAlt, FaUniversity, FaQrcode, FaCheckCircle, FaExternalLinkAlt } from 'react-icons/fa';
import NavBar from '../../layouts/Navbar';
import '../../styles/pages/Checkout.scss';
import { createPaymentUrl, createMoMoPayment, formatCurrency, validatePaymentData } from '../../api/paymentAPI';
import { AuthContext } from '../../context/AuthContext';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // State cho thanh toán
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showMoMoModal, setShowMoMoModal] = useState(false);
  const [momoQrCode, setMomoQrCode] = useState('');
  const [momoOrderId, setMomoOrderId] = useState('');
  const [momoPayUrl, setMomoPayUrl] = useState('');
  const [momoDeepLink, setMomoDeepLink] = useState('');
  
  // Lấy dữ liệu từ location.state
  const {
    contact = {},
    passengers = [],
    tour = {},
    total = 0,
    payment = "",
    bookingCode = "2503125VPHXB",
    status = "Chưa thanh toán",
    bookingDate = "12/3/2025 10:50",
    paymentDeadline = "13/03/2025 10:50"
  } = location.state || {};

  // Danh sách ngân hàng hỗ trợ VNPay
  const bankList = [
    { code: '', name: 'Cổng thanh toán VNPAYQR', icon: FaQrcode, popular: true },
    { code: 'VNPAYQR', name: 'Thanh toán bằng ứng dụng hỗ trợ VNPAYQR', icon: FaMobileAlt, popular: true },
    { code: 'INTCARD', name: 'Thanh toán bằng thẻ quốc tế', icon: FaCreditCard, popular: true },
    { code: 'VIETCOMBANK', name: 'Ngân hàng Vietcombank', icon: FaUniversity },
    { code: 'VIETINBANK', name: 'Ngân hàng Vietinbank', icon: FaUniversity },
    { code: 'AGRIBANK', name: 'Ngân hàng Agribank', icon: FaUniversity },
    { code: 'BIDV', name: 'Ngân hàng BIDV', icon: FaUniversity },
    { code: 'TECHCOMBANK', name: 'Ngân hàng Techcombank', icon: FaUniversity },
    { code: 'MBBANK', name: 'Ngân hàng MBBank', icon: FaUniversity }
  ];

  const popularBanks = bankList.filter(bank => bank.popular);
  const otherBanks = bankList.filter(bank => !bank.popular);

  // Xử lý thanh toán MoMo
  const handleMoMoPayment = async () => {
    try {
      setLoading(true);
      setError('');

      // Tạo booking data cho MoMo
      const bookingData = {
        bookingId: bookingCode,
        amount: total,
        customerInfo: {
          name: contact.fullname || 'Khách hàng',
          email: contact.email || 'customer@email.com',
          phone: contact.phone || '0123456789'
        },
        tourInfo: {
          name: tour.name || 'Tour du lịch',
          description: `Tour ${tour.name} - Mã tour: ${tour.code}`,
          startDate: tour.startDate || '2024-03-20',
          endDate: tour.endDate || '2024-03-24',
          participants: passengers.length || 1,
          duration: `${tour.startDate} - ${tour.endDate}`,
          tour_id: tour.tour_id
        },
        phoneNumber: contact.phone,
        tour_id: tour.tour_id,
        cus_id: user?.id
      };

      // Validate dữ liệu
      const validation = validatePaymentData(bookingData, 'MOMO');
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      // Kiểm tra điều khoản
      if (!agreed) {
        setError('Vui lòng đồng ý với điều khoản và điều kiện');
        return;
      }

      // Tạo thanh toán MoMo
      const result = await createMoMoPayment(bookingData);

      if (result.success) {
        // Hiển thị modal MoMo với QR code
        setMomoQrCode(result.qrCodeUrl || result.qrCode);
        setMomoOrderId(result.orderId);
        setMomoPayUrl(result.payUrl);
        setMomoDeepLink(result.deepLink);
        setShowMoMoModal(true);
        
        // Store payment URLs for user convenience
        if (result.payUrl) {
          // Allow user to open payment URL in new tab
          console.log('MoMo Payment URL:', result.payUrl);
        }
        
        if (result.deepLink) {
          // Allow user to open MoMo app directly
          console.log('MoMo Deep Link:', result.deepLink);
        }
        
        // For demo: simulate success after 30 seconds instead of 10
        setTimeout(() => {
          setShowMoMoModal(false);
          navigate('/payment/result', {
            state: {
              success: true,
              message: 'Thanh toán MoMo thành công!',
              orderId: result.orderId,
              amount: total/1000,
              paymentMethod: 'MOMO'
            }
          });
        }, 30000); // 30 seconds for real testing
      } else {
        setError(result.message || 'Không thể tạo thanh toán MoMo');
      }
    } catch (error) {
      console.error('MoMo payment error:', error);
      setError(error.message || 'Lỗi xử lý thanh toán MoMo');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thanh toán VNPay
  const handleVNPayPayment = async () => {
    try {
      setLoading(true);
      setError('');

      // Tạo booking data cho VNPay
      const bookingData = {
        bookingId: bookingCode,
        amount: total,
        customerInfo: {
          name: contact.fullname || 'Khách hàng',
          email: contact.email || 'customer@email.com',
          phone: contact.phone || '0123456789'
        },
        tourInfo: {
          name: tour.name || 'Tour du lịch',
          description: `Tour ${tour.name} - Mã tour: ${tour.code}`,
          startDate: tour.startDate || '2024-03-20',
          endDate: tour.endDate || '2024-03-24',
          participants: passengers.length || 1,
          duration: `${tour.startDate} - ${tour.endDate}`
        },
        bankCode,
        paymentMethod: 'VNPAY'
      };

      // Validate dữ liệu
      const validation = validatePaymentData(bookingData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      // Kiểm tra điều khoản
      if (!agreed) {
        setError('Vui lòng đồng ý với điều khoản và điều kiện');
        return;
      }

      // Tạo URL thanh toán VNPay
      const result = await createPaymentUrl(bookingData);

      if (result.success) {
        // Chuyển hướng đến VNPay
        window.location.href = result.paymentUrl;
      } else {
        setError(result.message || 'Không thể tạo URL thanh toán');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Lỗi xử lý thanh toán');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thanh toán dựa trên phương thức được chọn
  const handlePayment = () => {
    if (payment === 'momo') {
      handleMoMoPayment();
    } else {
      handleVNPayPayment();
    }
  };

  return (
    <div style={{background: '#f7f8fa', minHeight: '100vh'}}>
      <NavBar />
      <div className="container py-4 checkout-container">
        <a href="/" className="back-button-checkout">&larr; Quay lại trang chủ</a>
        <h2 className="text-center mb-4" style={{fontWeight: 700, color: "#1a237e", letterSpacing: 1}}>THANH TOÁN</h2>
        <Row>
          <Col md={7}>
            {/* Thông tin liên lạc */}
            <Card className="mb-3 shadow-sm" style={{borderRadius: 12, border: 'none'}}>
              <Card.Header style={{background: '#f3f4f6', fontWeight: 700, color: '#1a237e', borderTopLeftRadius: 12, borderTopRightRadius: 12, fontSize: 16}}>THÔNG TIN LIÊN LẠC</Card.Header>
              <Card.Body style={{background: '#fafbfc'}}>
                <Row className="mb-2">
                  <Col md={4}><b>Họ tên</b><div>{contact.fullname}</div></Col>
                  <Col md={4}><b>Email</b><div>{contact.email}</div></Col>
                  <Col md={4}><b>Điện thoại</b><div>{contact.phone}</div></Col>
                </Row>
                <Row>
                  <Col md={12}><b>Địa chỉ</b><div>{contact.address}</div></Col>
                </Row>
              </Card.Body>
            </Card>
            {/* Chi tiết booking */}
            <Card className="mb-3 shadow-sm" style={{borderRadius: 12, border: 'none'}}>
              <Card.Header style={{background: '#f3f4f6', fontWeight: 700, color: '#1a237e', borderTopLeftRadius: 12, borderTopRightRadius: 12, fontSize: 16}}>CHI TIẾT BOOKING</Card.Header>
              <Card.Body style={{background: '#fafbfc'}}>
                <Row className="mb-2">
                  <Col md={6}><b>Mã đặt chỗ:</b> <span style={{color: "#e53935", fontWeight: 700}}>{bookingCode}</span></Col>
                  <Col md={6}><b>Ngày tạo:</b> {bookingDate}</Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}><b>Trị giá Booking:</b> <span style={{color: '#e53935', fontWeight: 700}}>{total.toLocaleString()} đ</span></Col>
                  <Col md={6}><b>Hình thức thanh toán:</b> {payment === "bank" ? "Chuyển khoản ngân hàng" : payment === "vnpay" ? "VNPAY" : "MoMo"}</Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}><b>Tình trạng:</b> {status}</Col>
                  <Col md={6}><b>Thời hạn thanh toán:</b> {paymentDeadline}</Col>
                </Row>
              </Card.Body>
            </Card>
            {/* Danh sách hành khách */}
            <Card className="mb-3 shadow-sm" style={{borderRadius: 12, border: 'none'}}>
              <Card.Header style={{background: '#f3f4f6', fontWeight: 700, color: '#1a237e', borderTopLeftRadius: 12, borderTopRightRadius: 12, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                DANH SÁCH HÀNH KHÁCH
                <FaChevronDown style={{fontSize: 18}} />
              </Card.Header>
              <Card.Body style={{background: '#fafbfc', paddingBottom: 8}}>
                <div style={{maxHeight: 180, overflowY: 'auto'}}>
                  <Row style={{fontWeight: 600, color: '#222', borderBottom: '1px solid #e0e0e0', marginBottom: 4, fontSize: 15}}>
                    <Col md={4}>Họ tên</Col>
                    <Col md={3}>Ngày sinh</Col>
                    <Col md={3}>Giới tính</Col>
                    <Col md={2}>Độ tuổi</Col>
                  </Row>
                  {passengers.map((p, idx) => (
                    <Row key={idx} style={{fontSize: 15, borderBottom: '1px solid #f0f0f0', marginBottom: 2}}>
                      <Col md={4}>{p.fullname}</Col>
                      <Col md={3}>{p.dob}</Col>
                      <Col md={3}>{p.gender}</Col>
                      <Col md={2}>{p.dob ? (new Date().getFullYear() - new Date(p.dob).getFullYear()) + " Tuổi" : ""}</Col>
                    </Row>
                  ))}
                </div>
                <div style={{textAlign: 'right', fontWeight: 700, color: '#e53935', fontSize: 18, marginTop: 8}}>
                  Tổng cộng: {total.toLocaleString()} đ
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={5}>
            <Card className="shadow-sm" style={{borderRadius: 12, border: 'none', background: '#f3f4f6'}}>
              <Card.Body>
                <div style={{fontWeight: 700, color: '#1a237e', fontSize: 16, marginBottom: 8, textTransform: 'uppercase'}}>PHIẾU XÁC NHẬN BOOKING</div>
                <div className="d-flex align-items-center mb-2">
                  <img src={tour.image} alt="tour" style={{width: 110, height: 80, objectFit: "cover", borderRadius: 8, marginRight: 12, border: '1px solid #e0e0e0'}} />
                  <div>
                    <div style={{fontWeight: 700, fontSize: 16, color: '#222'}}>{tour.name}</div>
                    <div style={{fontSize: 15}}>Mã tour: <span style={{color: "#e53935", fontWeight: 700}}>{tour.code}</span></div>
                    <div style={{fontSize: 15}}>Mã đặt chỗ: <span style={{color: "#e53935", fontWeight: 700}}>{bookingCode}</span></div>
                  </div>
                </div>
                <div style={{marginTop: 12, marginBottom: 8, fontWeight: 600, color: '#222'}}>THÔNG TIN TOUR:</div>
                <Row style={{fontSize: 15, color: '#444'}}>
                  <Col xs={6} className="mb-2"><FaCalendarAlt style={{marginRight: 6}}/> Ngày đi: <b>{tour.startDate || "20/03/2025"}</b></Col>
                  <Col xs={6} className="mb-2"><FaCalendarAlt style={{marginRight: 6}}/> Ngày về: <b>{tour.endDate || "24/03/2025"}</b></Col>
                  <Col xs={6} className="mb-2"><FaMapMarkerAlt style={{marginRight: 6}}/> {tour.start || "Đà Lạt"}</Col>
                  <Col xs={6} className="mb-2"><FaBus style={{marginRight: 6}}/> Xe khách</Col>
                </Row>
                
                {/* Form chọn phương thức thanh toán */}
                <div className="payment-section mt-4">
                  <h6 className="text-primary mb-3">
                    <FaCreditCard className="me-2" />
                    {payment === 'momo' ? 'Thanh toán MoMo' : 'Thanh toán VNPay'}
                  </h6>
                  
                  {error && (
                    <Alert variant="danger" className="mb-3">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {error}
                    </Alert>
                  )}

                  {payment === 'momo' ? (
                    // MoMo payment interface
                    <div className="mb-3">
                      <div className="payment-option p-3 border rounded mb-2 bg-light">
                        <div className="d-flex align-items-center">
                          <img 
                            src="https://via.placeholder.com/40x40/d82d8b/white?text=M" 
                            alt="MoMo" 
                            className="me-3"
                            style={{borderRadius: '8px'}}
                          />
                          <div className="flex-grow-1">
                            <div className="fw-bold text-primary">Thanh toán MoMo</div>
                            <div className="small text-muted">
                              Quét mã QR hoặc mở ứng dụng MoMo để thanh toán
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="security-info mb-3 p-2 bg-light rounded">
                        <small className="text-success">
                          <i className="fas fa-shield-alt me-1"></i>
                          Thanh toán an toàn với MoMo - Bảo mật đa lớp
                        </small>
                      </div>
                    </div>
                  ) : (
                    // VNPay payment interface (existing code)
                    <>
                      {/* Phương thức phổ biến */}
                      <div className="mb-3">
                        <small className="text-muted mb-2 d-block">Phương thức phổ biến</small>
                        {popularBanks.map((bank) => {
                          const IconComponent = bank.icon;
                          return (
                            <div 
                              key={bank.code}
                              className={`payment-option p-2 border rounded mb-2 cursor-pointer ${bankCode === bank.code ? 'border-primary bg-light' : ''}`}
                              onClick={() => setBankCode(bank.code)}
                              style={{ cursor: 'pointer', fontSize: '14px' }}
                            >
                              <div className="d-flex align-items-center">
                                <IconComponent className="me-2 text-primary" />
                                <div className="flex-grow-1">
                                  <div className="fw-bold">{bank.name}</div>
                                  <div className="small text-muted">
                                    {bank.code === '' && 'Quét mã QR để thanh toán'}
                                    {bank.code === 'VNPAYQR' && 'Thanh toán qua app ngân hàng'}
                                    {bank.code === 'INTCARD' && 'Visa, Mastercard, JCB'}
                                  </div>
                                </div>
                                <Form.Check
                                  type="radio"
                                  name="bankCode"
                                  checked={bankCode === bank.code}
                                  onChange={() => setBankCode(bank.code)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Ngân hàng khác */}
                      <div className="mb-3">
                        <Form.Select 
                          value={otherBanks.some(bank => bank.code === bankCode) ? bankCode : ''} 
                          onChange={(e) => setBankCode(e.target.value)}
                          size="sm"
                        >
                          <option value="">Chọn ngân hàng khác</option>
                          {otherBanks.map((bank) => (
                            <option key={bank.code} value={bank.code}>
                              {bank.name}
                            </option>
                          ))}
                        </Form.Select>
                      </div>

                      {/* Thông tin bảo mật */}
                      <div className="security-info mb-3 p-2 bg-light rounded">
                        <small className="text-success">
                          <i className="fas fa-shield-alt me-1"></i>
                          Thanh toán an toàn với VNPay - Mã hóa SSL 256-bit
                        </small>
                      </div>
                    </>
                  )}

                  {/* Điều khoản */}
                  <div className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="terms-agreement"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      label={
                        <small>
                          Tôi đồng ý với{' '}
                          <a href="/terms" target="_blank" className="text-primary">
                            điều khoản và điều kiện
                          </a>{' '}
                          của dịch vụ
                        </small>
                      }
                    />
                  </div>

                  {/* Nút thanh toán */}
                  <Button 
                    variant="danger" 
                    className="w-100" 
                    size="lg" 
                    style={{fontWeight: 700, fontSize: 16, borderRadius: 8}}
                    onClick={handlePayment}
                    disabled={loading || !agreed}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-lock me-2"></i>
                        Thanh toán {formatCurrency(total)}
                      </>
                    )}
                  </Button>
                  
                  <div className="text-center mt-2">
                    <small className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      {payment === 'momo' 
                        ? 'Bạn sẽ được chuyển đến ứng dụng MoMo để thanh toán'
                        : 'Bạn sẽ được chuyển đến trang thanh toán an toàn của VNPay'
                      }
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* MoMo Payment Modal */}
        <Modal show={showMoMoModal} onHide={() => setShowMoMoModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <img 
                src="https://via.placeholder.com/30x30/d82d8b/white?text=M" 
                alt="MoMo" 
                className="me-2"
                style={{borderRadius: '4px'}}
              />
              Thanh toán MoMo
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <div className="mb-3">
              <h5>Quét mã QR để thanh toán</h5>
              <p className="text-muted">Mở ứng dụng MoMo và quét mã QR bên dưới</p>
            </div>
            
            {momoQrCode && (
              <div className="mb-3">
                <img 
                  src={momoQrCode} 
                  alt="MoMo QR Code" 
                  style={{width: '200px', height: '200px', border: '1px solid #ddd'}}
                />
              </div>
            )}
            
            <div className="mb-3">
              <p><strong>Mã giao dịch:</strong> {momoOrderId}</p>
              <p><strong>Số tiền:</strong> {formatCurrency(total)}</p>
            </div>
            
            <Alert variant="info">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Demo:</strong> Thanh toán sẽ được xác nhận tự động sau 30 giây
            </Alert>
            
            <div className="d-flex gap-2 justify-content-center">
              {momoPayUrl && (
                <Button 
                  variant="primary" 
                  onClick={() => window.open(momoPayUrl, '_blank')}
                  className="flex-fill"
                >
                  <i className="fas fa-external-link-alt me-2"></i>
                  Mở trang thanh toán
                </Button>
              )}
              
              {momoDeepLink && (
                <Button 
                  variant="success" 
                  onClick={() => window.location.href = momoDeepLink}
                  className="flex-fill"
                >
                  <i className="fab fa-mobile-alt me-2"></i>
                  Mở app MoMo
                </Button>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowMoMoModal(false)}>
              Hủy thanh toán
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Checkout;