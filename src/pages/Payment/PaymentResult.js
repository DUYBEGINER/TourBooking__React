import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Alert, Button, Spinner } from 'react-bootstrap';
import { getPaymentInfo } from '../../api/paymentAPI';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        // Lấy parameters từ URL callback của VNPay
        const success = searchParams.get('success');
        const message = searchParams.get('message');
        const orderId = searchParams.get('orderId');

        console.log('🔍 PaymentResult received parameters:', {
          success,
          message,
          orderId,
          allParams: Object.fromEntries(searchParams)
        });

        if (success === 'true') {
          // Thanh toán thành công - lấy thông tin chi tiết
          if (orderId) {
            try {
              const paymentInfo = await getPaymentInfo(orderId);
              setPaymentResult({
                success: true,
                message: message || 'Thanh toán thành công',
                orderId,
                paymentInfo: paymentInfo.data
              });
            } catch (error) {
              console.error('Error getting payment info:', error);
              setPaymentResult({
                success: true,
                message: message || 'Thanh toán thành công',
                orderId,
                paymentInfo: null
              });
            }
          } else {
            setPaymentResult({
              success: true,
              message: message || 'Thanh toán thành công',
              orderId: null,
              paymentInfo: null
            });
          }
        } else {
          // Thanh toán thất bại
          setPaymentResult({
            success: false,
            message: message || 'Thanh toán thất bại',
            orderId,
            paymentInfo: null
          });
        }
      } catch (error) {
        console.error('Error processing payment result:', error);
        setError('Có lỗi xảy ra khi xử lý kết quả thanh toán');
      } finally {
        setLoading(false);
      }
    };

    console.log('🚀 PaymentResult component mounted, processing payment result...');
    processPaymentResult();
  }, [searchParams]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" size="lg" />
            <div className="mt-3 h5">Đang xử lý kết quả thanh toán...</div>
            <p className="text-muted">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="danger">
              <Alert.Heading>
                <i className="fas fa-exclamation-triangle me-2"></i>
                Có lỗi xảy ra
              </Alert.Heading>
              <p>{error}</p>
              <hr />
              <div className="d-flex justify-content-end">
                <Button variant="outline-danger" onClick={() => navigate('/')}>
                  Về trang chủ
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header className={`text-center py-4 ${paymentResult?.success ? 'bg-success text-white' : 'bg-danger text-white'}`}>
              <div className="mb-3">
                <i className={`fas ${paymentResult?.success ? 'fa-check-circle' : 'fa-times-circle'} fa-3x`}></i>
              </div>
              <h3 className="mb-0">
                {paymentResult?.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
              </h3>
            </Card.Header>

            <Card.Body className="p-4">
              {/* Thông báo kết quả */}
              <Alert variant={paymentResult?.success ? 'success' : 'danger'} className="mb-4">
                <div className="d-flex align-items-center">
                  <i className={`fas ${paymentResult?.success ? 'fa-info-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                  <span>{paymentResult?.message}</span>
                </div>
              </Alert>

              {/* Thông tin giao dịch */}
              {paymentResult?.orderId && (
                <div className="transaction-info mb-4">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-receipt me-2"></i>
                    Thông tin giao dịch
                  </h5>
                  <Row>
                    <Col md={6}>
                      <div className="info-item mb-2">
                        <strong>Mã giao dịch:</strong>
                        <span className="ms-2 text-monospace">{paymentResult.orderId}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="info-item mb-2">
                        <strong>Thời gian:</strong>
                        <span className="ms-2">{formatDate(new Date())}</span>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Chi tiết thanh toán */}
              {paymentResult?.paymentInfo && (
                <div className="payment-details mb-4">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-credit-card me-2"></i>
                    Chi tiết thanh toán
                  </h5>
                  <Row>
                    <Col md={6}>
                      <div className="info-item mb-2">
                        <strong>Booking ID:</strong>
                        <span className="ms-2">{paymentResult.paymentInfo.booking_id}</span>
                      </div>
                      <div className="info-item mb-2">
                        <strong>Khách hàng:</strong>
                        <span className="ms-2">{paymentResult.paymentInfo.customer_name}</span>
                      </div>
                      <div className="info-item mb-2">
                        <strong>Email:</strong>
                        <span className="ms-2">{paymentResult.paymentInfo.customer_email}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="info-item mb-2">
                        <strong>Tour:</strong>
                        <span className="ms-2">{paymentResult.paymentInfo.tour_name}</span>
                      </div>
                      <div className="info-item mb-2">
                        <strong>Số tiền:</strong>
                        <span className="ms-2 text-success fw-bold">
                          {formatCurrency(paymentResult.paymentInfo.amount)}
                        </span>
                      </div>
                      <div className="info-item mb-2">
                        <strong>Phương thức:</strong>
                        <span className="ms-2 badge bg-primary">
                          {paymentResult.paymentInfo.payment_method}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Hướng dẫn tiếp theo */}
              {paymentResult?.success ? (
                <div className="next-steps mb-4 p-3 bg-light rounded">
                  <h6 className="text-success mb-2">
                    <i className="fas fa-lightbulb me-2"></i>
                    Bước tiếp theo
                  </h6>
                  <ul className="mb-0 small">
                    <li>Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn</li>
                    <li>Vui lòng kiểm tra email để xem chi tiết booking</li>
                    <li>Liên hệ hotline nếu cần hỗ trợ: <strong>1900 1234</strong></li>
                    <li>Bạn có thể xem lịch sử booking trong tài khoản của mình</li>
                  </ul>
                </div>
              ) : (
                <div className="retry-info mb-4 p-3 bg-light rounded">
                  <h6 className="text-warning mb-2">
                    <i className="fas fa-redo me-2"></i>
                    Thử lại thanh toán
                  </h6>
                  <ul className="mb-0 small">
                    <li>Kiểm tra lại thông tin thẻ và số dư tài khoản</li>
                    <li>Thử lại với phương thức thanh toán khác</li>
                    <li>Liên hệ ngân hàng nếu vấn đề tiếp tục xảy ra</li>
                    <li>Hotline hỗ trợ: <strong>1900 1234</strong></li>
                  </ul>
                </div>
              )}

              {/* Nút hành động */}
              <div className="action-buttons d-flex gap-3 justify-content-center">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => navigate('/')}
                >
                  <i className="fas fa-home me-2"></i>
                  Về trang chủ
                </Button>
                
                {!paymentResult?.success && (
                  <Button 
                    variant="warning" 
                    size="lg"
                    onClick={() => window.history.back()}
                  >
                    <i className="fas fa-redo me-2"></i>
                    Thử lại
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentResult; 