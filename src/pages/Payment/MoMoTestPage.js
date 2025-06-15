import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Modal } from 'react-bootstrap';
import { FaQrcode, FaMobileAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import NavBar from '../../layouts/Navbar';
import { createMoMoPayment, testMoMoPaymentStatus, testMoMoConfig, formatCurrency } from '../../api/paymentAPI';

const MoMoTestPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [orderId, setOrderId] = useState('');
  const [scenario, setScenario] = useState('success');
  const [config, setConfig] = useState(null);

  // Test form data
  const [formData, setFormData] = useState({
    amount: 100000,
    customerName: 'Nguyễn Văn Test',
    customerEmail: 'test@email.com',
    customerPhone: '0123456789',
    tourName: 'Tour Test MoMo',
    tourCode: 'MOMO001'
  });

  // Test MoMo config
  const handleTestConfig = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await testMoMoConfig();
      setConfig(result.data);
      setSuccess('Cấu hình MoMo đã được tải thành công!');
    } catch (error) {
      setError(error.message || 'Lỗi kiểm tra cấu hình MoMo');
    } finally {
      setLoading(false);
    }
  };

  // Test create MoMo payment
  const handleCreatePayment = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const bookingData = {
        bookingId: `TEST_${Date.now()}`,
        amount: formData.amount,
        customerInfo: {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone
        },
        tourInfo: {
          name: formData.tourName,
          code: formData.tourCode,
          description: `Test tour payment with MoMo`
        },
        phoneNumber: formData.customerPhone
      };

      const result = await createMoMoPayment(bookingData);
      
      if (result.success) {
        setTestResult(result);
        setShowModal(true);
        setSuccess('Tạo thanh toán MoMo thành công!');
      } else {
        setError(result.message || 'Không thể tạo thanh toán MoMo');
      }
    } catch (error) {
      setError(error.message || 'Lỗi tạo thanh toán MoMo');
    } finally {
      setLoading(false);
    }
  };

  // Test payment status
  const handleTestStatus = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (!orderId) {
        setError('Vui lòng nhập mã đơn hàng');
        return;
      }

      const result = await testMoMoPaymentStatus(orderId, scenario);
      setTestResult(result);
      setSuccess(`Test trạng thái thanh toán: ${result.status} - ${result.message}`);
    } catch (error) {
      setError(error.message || 'Lỗi test trạng thái thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const scenarios = [
    { value: 'success', label: 'Thành công', color: 'success' },
    { value: 'pending', label: 'Đang xử lý', color: 'warning' },
    { value: 'failed', label: 'Thất bại', color: 'danger' },
    { value: 'rejected', label: 'Bị từ chối', color: 'danger' },
    { value: 'timeout', label: 'Hết thời gian', color: 'secondary' }
  ];

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <NavBar />
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="text-center mb-4">
              <h2 className="text-primary mb-3">
                <FaMobileAlt className="me-2" />
                MoMo Payment Integration Test
              </h2>
              <p className="text-muted">
                Trang test tích hợp thanh toán MoMo cho môi trường phát triển
              </p>
            </div>

            {/* Test Config */}
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-cog me-2"></i>
                  1. Kiểm tra cấu hình MoMo
                </h5>
              </Card.Header>
              <Card.Body>
                <p>Kiểm tra xem cấu hình MoMo đã được thiết lập đúng hay chưa.</p>
                <Button 
                  variant="primary" 
                  onClick={handleTestConfig}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" className="me-2" /> : null}
                  Kiểm tra cấu hình
                </Button>

                {config && (
                  <Alert variant="success" className="mt-3">
                    <h6>Cấu hình MoMo:</h6>
                    <ul className="mb-0">
                      <li><strong>Environment:</strong> {config.environment}</li>
                      <li><strong>Base URL:</strong> {config.baseUrl}</li>
                      <li><strong>Currency:</strong> {config.currency}</li>
                      <li><strong>Target Environment:</strong> {config.targetEnvironment}</li>
                    </ul>
                  </Alert>
                )}
              </Card.Body>
            </Card>

            {/* Test Create Payment */}
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">
                  <FaQrcode className="me-2" />
                  2. Tạo thanh toán MoMo
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Số tiền (VNĐ)</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value)})}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên khách hàng</Form.Label>
                      <Form.Control
                        value={formData.customerName}
                        onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Số điện thoại</Form.Label>
                      <Form.Control
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên tour</Form.Label>
                      <Form.Control
                        value={formData.tourName}
                        onChange={(e) => setFormData({...formData, tourName: e.target.value})}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Mã tour</Form.Label>
                      <Form.Control
                        value={formData.tourCode}
                        onChange={(e) => setFormData({...formData, tourCode: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button 
                  variant="success" 
                  onClick={handleCreatePayment}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" className="me-2" /> : null}
                  Tạo thanh toán MoMo
                </Button>
              </Card.Body>
            </Card>

            {/* Test Payment Status */}
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-warning text-dark">
                <h5 className="mb-0">
                  <i className="fas fa-search me-2"></i>
                  3. Test trạng thái thanh toán
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mã đơn hàng</Form.Label>
                      <Form.Control
                        placeholder="Nhập mã đơn hàng để test"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Kịch bản test</Form.Label>
                      <Form.Select
                        value={scenario}
                        onChange={(e) => setScenario(e.target.value)}
                      >
                        {scenarios.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Button 
                  variant="warning" 
                  onClick={handleTestStatus}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" className="me-2" /> : null}
                  Test trạng thái
                </Button>
              </Card.Body>
            </Card>

            {/* Results */}
            {error && (
              <Alert variant="danger">
                <FaTimesCircle className="me-2" />
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success">
                <FaCheckCircle className="me-2" />
                {success}
              </Alert>
            )}

            {/* Test Scenarios Info */}
            <Card className="shadow-sm">
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  Thông tin test scenarios
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {scenarios.map(s => (
                    <Col md={4} key={s.value} className="mb-2">
                      <div className={`p-2 rounded border-start border-${s.color} border-3`}>
                        <strong className={`text-${s.color}`}>{s.label}</strong>
                        <div className="small text-muted">
                          Scenario: {s.value}
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* MoMo Payment Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              <img 
                src="https://via.placeholder.com/30x30/d82d8b/white?text=M" 
                alt="MoMo" 
                className="me-2"
                style={{borderRadius: '4px'}}
              />
              Kết quả tạo thanh toán MoMo
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {testResult && (
              <div>
                <Alert variant="success">
                  <h5>Thanh toán đã được tạo thành công!</h5>
                </Alert>
                
                <Row>
                  <Col md={6}>
                    <div className="text-center mb-3">
                      <h6>QR Code (Demo)</h6>
                      <img 
                        src={testResult.qrCode} 
                        alt="MoMo QR Code" 
                        style={{width: '150px', height: '150px', border: '1px solid #ddd'}}
                      />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div>
                      <h6>Thông tin giao dịch:</h6>
                      <ul>
                        <li><strong>Order ID:</strong> {testResult.orderId}</li>
                        <li><strong>Transaction ID:</strong> {testResult.transactionId}</li>
                        <li><strong>Số tiền:</strong> {formatCurrency(formData.amount)}</li>
                        <li><strong>Trạng thái:</strong> <span className="text-success">Đã tạo</span></li>
                      </ul>
                      
                      <Alert variant="info" className="mt-3">
                        <strong>Hướng dẫn:</strong>
                        <br />1. Mở ứng dụng MoMo trên điện thoại
                        <br />2. Quét mã QR code ở bên trái
                        <br />3. Xác nhận thanh toán
                      </Alert>
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default MoMoTestPage; 