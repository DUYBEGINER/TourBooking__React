import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';

const PaymentDemo = () => {
  const navigate = useNavigate();
  const [selectedTour, setSelectedTour] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [participants, setParticipants] = useState(1);

  // Dữ liệu tour mẫu
  const sampleTours = [
    {
      id: 'TOUR001',
      name: 'Tour Hạ Long 3 ngày 2 đêm',
      price: 2500000,
      description: 'Khám phá vẻ đẹp kỳ vĩ của Vịnh Hạ Long với du thuyền 5 sao',
      duration: '3 ngày 2 đêm',
      startDate: '2024-03-15'
    },
    {
      id: 'TOUR002', 
      name: 'Tour Sapa 4 ngày 3 đêm',
      price: 3200000,
      description: 'Trekking và khám phá văn hóa dân tộc thiểu số tại Sapa',
      duration: '4 ngày 3 đêm',
      startDate: '2024-03-20'
    },
    {
      id: 'TOUR003',
      name: 'Tour Phú Quốc 5 ngày 4 đêm',
      price: 4500000,
      description: 'Nghỉ dưỡng tại đảo ngọc Phú Quốc với resort 5 sao',
      duration: '5 ngày 4 đêm',
      startDate: '2024-03-25'
    },
    {
      id: 'TOUR004',
      name: 'Tour Đà Nẵng - Hội An 3 ngày 2 đêm',
      price: 2800000,
      description: 'Khám phá phố cổ Hội An và thành phố Đà Nẵng hiện đại',
      duration: '3 ngày 2 đêm',
      startDate: '2024-03-18'
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleBookTour = () => {
    if (!selectedTour || !customerName || !customerEmail) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const tour = sampleTours.find(t => t.id === selectedTour);
    const totalAmount = tour.price * participants;

    // Tạo booking data
    const bookingData = {
      bookingId: `BOOK_${Date.now()}`,
      amount: totalAmount,
      customerInfo: {
        name: customerName,
        email: customerEmail,
        phone: '0123456789'
      },
      tourInfo: {
        name: tour.name,
        description: tour.description,
        startDate: tour.startDate,
        participants: participants,
        duration: tour.duration
      }
    };

    // Chuyển đến trang thanh toán với dữ liệu booking
    navigate(`/payment/${bookingData.bookingId}`, {
      state: { bookingData }
    });
  };

  const selectedTourData = sampleTours.find(t => t.id === selectedTour);

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="mb-3">
              <i className="fas fa-plane me-2 text-primary"></i>
              Demo Đặt Tour & Thanh toán VNPay
            </h2>
            <p className="text-muted lead">
              Chọn tour và thông tin để test chức năng thanh toán
            </p>
          </div>

          {/* Demo Notice */}
          <Alert variant="info" className="mb-4">
            <Alert.Heading>
              <i className="fas fa-info-circle me-2"></i>
              Thông tin Demo
            </Alert.Heading>
            <p className="mb-2">
              Đây là trang demo để test chức năng thanh toán VNPay. Sử dụng thông tin test card:
            </p>
            <ul className="mb-0">
              <li><strong>Số thẻ:</strong> 9704198526191432198</li>
              <li><strong>Tên chủ thẻ:</strong> NGUYEN VAN A</li>
              <li><strong>Ngày phát hành:</strong> 07/15</li>
              <li><strong>OTP:</strong> 123456</li>
            </ul>
          </Alert>

          {/* Booking Form */}
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-edit me-2"></i>
                Thông tin đặt tour
              </h5>
            </Card.Header>
            <Card.Body>
              <Form>
                {/* Chọn tour */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    <i className="fas fa-map-marked-alt me-2"></i>
                    Chọn tour
                  </Form.Label>
                  <Form.Select 
                    value={selectedTour} 
                    onChange={(e) => setSelectedTour(e.target.value)}
                    size="lg"
                  >
                    <option value="">-- Chọn tour --</option>
                    {sampleTours.map(tour => (
                      <option key={tour.id} value={tour.id}>
                        {tour.name} - {formatCurrency(tour.price)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Thông tin tour đã chọn */}
                {selectedTourData && (
                  <div className="tour-preview mb-4 p-3 bg-light rounded">
                    <h6 className="text-primary mb-2">{selectedTourData.name}</h6>
                    <p className="text-muted small mb-2">{selectedTourData.description}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="badge bg-primary me-2">{selectedTourData.duration}</span>
                        <span className="badge bg-success">
                          Khởi hành: {new Date(selectedTourData.startDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="text-end">
                        <div className="h6 text-danger mb-0">
                          {formatCurrency(selectedTourData.price)}/người
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Row>
                  {/* Thông tin khách hàng */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">
                        <i className="fas fa-user me-2"></i>
                        Họ và tên
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập họ và tên"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        size="lg"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">
                        <i className="fas fa-envelope me-2"></i>
                        Email
                      </Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Nhập email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        size="lg"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Số lượng người */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">
                    <i className="fas fa-users me-2"></i>
                    Số lượng người
                  </Form.Label>
                  <Form.Select 
                    value={participants} 
                    onChange={(e) => setParticipants(parseInt(e.target.value))}
                    size="lg"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num} người</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Tổng tiền */}
                {selectedTourData && (
                  <div className="total-amount mb-4 p-3 bg-success bg-opacity-10 rounded border border-success">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-success mb-1">Tổng tiền thanh toán</h6>
                        <small className="text-muted">
                          {formatCurrency(selectedTourData.price)} x {participants} người
                        </small>
                      </div>
                      <div className="text-end">
                        <div className="h4 text-success mb-0">
                          {formatCurrency(selectedTourData.price * participants)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nút đặt tour */}
                <div className="d-grid">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleBookTour}
                    disabled={!selectedTour || !customerName || !customerEmail}
                    className="py-3"
                  >
                    <i className="fas fa-credit-card me-2"></i>
                    Đặt tour và thanh toán
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Test Info */}
          <div className="text-center mt-4 p-3 bg-light rounded">
            <h6 className="text-primary mb-2">
              <i className="fas fa-flask me-2"></i>
              Hướng dẫn test
            </h6>
            <div className="small text-muted">
              <p className="mb-1">1. Chọn tour và điền thông tin khách hàng</p>
              <p className="mb-1">2. Nhấn "Đặt tour và thanh toán" để chuyển đến trang thanh toán</p>
              <p className="mb-1">3. Chọn phương thức thanh toán VNPay</p>
              <p className="mb-0">4. Sử dụng thông tin test card ở trên để thanh toán</p>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentDemo; 