import React, { useState } from 'react';
import { Card, Button, Form, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { createPaymentUrl, formatCurrency, validatePaymentData } from '../../api/paymentAPI';

const PaymentForm = ({ bookingData, onPaymentSuccess, onPaymentError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [agreed, setAgreed] = useState(false);

  // Danh sách ngân hàng hỗ trợ VNPay với logo
  const bankList = [
    { code: '', name: 'Cổng thanh toán VNPAYQR', icon: 'fas fa-qrcode', popular: true },
    { code: 'VNPAYQR', name: 'Thanh toán bằng ứng dụng hỗ trợ VNPAYQR', icon: 'fas fa-mobile-alt', popular: true },
    { code: 'INTCARD', name: 'Thanh toán bằng thẻ quốc tế', icon: 'fas fa-credit-card', popular: true },
    { code: 'VISA', name: 'Thẻ thanh toán VISA', icon: 'fab fa-cc-visa' },
    { code: 'MASTERCARD', name: 'Thẻ thanh toán MasterCard', icon: 'fab fa-cc-mastercard' },
    { code: 'JCB', name: 'Thẻ thanh toán JCB', icon: 'fab fa-cc-jcb' },
    { code: 'VIETCOMBANK', name: 'Ngân hàng Vietcombank', icon: 'fas fa-university' },
    { code: 'VIETINBANK', name: 'Ngân hàng Vietinbank', icon: 'fas fa-university' },
    { code: 'AGRIBANK', name: 'Ngân hàng Agribank', icon: 'fas fa-university' },
    { code: 'BIDV', name: 'Ngân hàng BIDV', icon: 'fas fa-university' },
    { code: 'TECHCOMBANK', name: 'Ngân hàng Techcombank', icon: 'fas fa-university' },
    { code: 'MBBANK', name: 'Ngân hàng MBBank', icon: 'fas fa-university' },
    { code: 'SACOMBANK', name: 'Ngân hàng Sacombank', icon: 'fas fa-university' },
    { code: 'EXIMBANK', name: 'Ngân hàng Eximbank', icon: 'fas fa-university' },
    { code: 'VIB', name: 'Ngân hàng VIB', icon: 'fas fa-university' },
    { code: 'HDBANK', name: 'Ngân hàng HDBank', icon: 'fas fa-university' },
    { code: 'TPBANK', name: 'Ngân hàng TPBank', icon: 'fas fa-university' },
    { code: 'SCB', name: 'Ngân hàng SCB', icon: 'fas fa-university' },
    { code: 'SEABANK', name: 'Ngân hàng SeABank', icon: 'fas fa-university' },
    { code: 'LPB', name: 'Ngân hàng LienVietPostBank', icon: 'fas fa-university' }
  ];

  const popularBanks = bankList.filter(bank => bank.popular);
  const otherBanks = bankList.filter(bank => !bank.popular);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');

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

      // Tạo URL thanh toán
      const paymentData = {
        ...bookingData,
        bankCode
      };

      const result = await createPaymentUrl(paymentData);

      if (result.success) {
        // Chuyển hướng đến VNPay
        window.location.href = result.paymentUrl;
        
        if (onPaymentSuccess) {
          onPaymentSuccess(result);
        }
      } else {
        setError(result.message || 'Không thể tạo URL thanh toán');
        if (onPaymentError) {
          onPaymentError(result);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Lỗi xử lý thanh toán');
      if (onPaymentError) {
        onPaymentError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!bookingData) {
    return (
      <Alert variant="warning">
        <i className="fas fa-exclamation-triangle me-2"></i>
        Không có thông tin booking để thanh toán
      </Alert>
    );
  }

  return (
    <div className="payment-form">
      {/* Thông tin booking */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <i className="fas fa-info-circle me-2"></i>
            Thông tin đặt tour
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <div className="tour-info">
                <h6 className="text-primary mb-2">{bookingData.tourInfo?.name}</h6>
                {bookingData.tourInfo?.description && (
                  <p className="text-muted small mb-2">{bookingData.tourInfo.description}</p>
                )}
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {bookingData.tourInfo?.startDate && (
                    <Badge bg="outline-primary" className="border">
                      <i className="fas fa-calendar me-1"></i>
                      {new Date(bookingData.tourInfo.startDate).toLocaleDateString('vi-VN')}
                    </Badge>
                  )}
                  {bookingData.tourInfo?.participants && (
                    <Badge bg="outline-primary" className="border">
                      <i className="fas fa-users me-1"></i>
                      {bookingData.tourInfo.participants} người
                    </Badge>
                  )}
                </div>
                <div className="customer-info">
                  <div className="small text-muted mb-1">
                    <i className="fas fa-user me-1"></i>
                    <strong>Khách hàng:</strong> {bookingData.customerInfo?.name}
                  </div>
                  <div className="small text-muted">
                    <i className="fas fa-envelope me-1"></i>
                    <strong>Email:</strong> {bookingData.customerInfo?.email}
                  </div>
                </div>
              </div>
            </Col>
            <Col md={4} className="text-md-end">
              <div className="amount-info">
                <div className="small text-muted mb-1">Tổng tiền</div>
                <div className="h4 text-danger mb-0">
                  {formatCurrency(bookingData.amount)}
                </div>
                <div className="small text-success">
                  <i className="fas fa-shield-alt me-1"></i>
                  Đã bao gồm VAT
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Form thanh toán */}
      <Card className="shadow-sm">
        <Card.Header>
          <h5 className="mb-0">
            <i className="fas fa-credit-card me-2"></i>
            Chọn phương thức thanh toán
          </h5>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {/* Phương thức phổ biến */}
          <div className="mb-4">
            <h6 className="text-primary mb-3">
              <i className="fas fa-star me-2"></i>
              Phương thức phổ biến
            </h6>
            <Row>
              {popularBanks.map((bank) => (
                <Col md={6} key={bank.code} className="mb-3">
                  <div 
                    className={`payment-option p-3 border rounded cursor-pointer ${bankCode === bank.code ? 'border-primary bg-light' : ''}`}
                    onClick={() => setBankCode(bank.code)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <i className={`${bank.icon} fa-2x text-primary`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-bold">{bank.name}</div>
                        <div className="small text-muted">
                          {bank.code === '' && 'Quét mã QR để thanh toán'}
                          {bank.code === 'VNPAYQR' && 'Thanh toán qua app ngân hàng'}
                          {bank.code === 'INTCARD' && 'Visa, Mastercard, JCB'}
                        </div>
                      </div>
                      <div>
                        <Form.Check
                          type="radio"
                          name="bankCode"
                          checked={bankCode === bank.code}
                          onChange={() => setBankCode(bank.code)}
                        />
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          {/* Ngân hàng khác */}
          <div className="mb-4">
            <h6 className="text-primary mb-3">
              <i className="fas fa-university me-2"></i>
              Ngân hàng khác
            </h6>
            <Form.Select 
              value={otherBanks.some(bank => bank.code === bankCode) ? bankCode : ''} 
              onChange={(e) => setBankCode(e.target.value)}
              className="form-select-lg"
            >
              <option value="">Chọn ngân hàng</option>
              {otherBanks.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </Form.Select>
          </div>

          {/* Thông tin bảo mật */}
          <div className="security-info mb-4 p-3 bg-light rounded">
            <h6 className="text-success mb-2">
              <i className="fas fa-shield-alt me-2"></i>
              Thanh toán an toàn với VNPay
            </h6>
            <Row>
              <Col md={6}>
                <ul className="mb-0 small text-muted">
                  <li>Giao dịch được mã hóa SSL 256-bit</li>
                  <li>Thông tin thẻ không được lưu trữ</li>
                </ul>
              </Col>
              <Col md={6}>
                <ul className="mb-0 small text-muted">
                  <li>Tuân thủ tiêu chuẩn bảo mật PCI DSS</li>
                  <li>Hỗ trợ 24/7 từ VNPay</li>
                </ul>
              </Col>
            </Row>
          </div>

          {/* Điều khoản */}
          <div className="terms-agreement mb-4">
            <Form.Check
              type="checkbox"
              id="terms-agreement"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              label={
                <span className="small">
                  Tôi đồng ý với{' '}
                  <a href="/terms" target="_blank" className="text-primary">
                    điều khoản và điều kiện
                  </a>{' '}
                  của dịch vụ
                </span>
              }
            />
          </div>

          {/* Nút thanh toán */}
          <div className="d-grid">
            <Button
              variant="primary"
              size="lg"
              onClick={handlePayment}
              disabled={loading || !agreed}
              className="payment-button py-3"
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
                  Thanh toán {formatCurrency(bookingData.amount)}
                </>
              )}
            </Button>
          </div>

          {/* Lưu ý */}
          <div className="payment-note mt-3 text-center">
            <small className="text-muted">
              <i className="fas fa-info-circle me-1"></i>
              Bạn sẽ được chuyển đến trang thanh toán an toàn của VNPay
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PaymentForm; 