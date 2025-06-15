import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import NavBar from '../../layouts/Navbar';
import '../../styles/pages/AboutUs.scss';

const AboutUs = () => {
  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh' }}>
      <NavBar />
      <div className="aboutus-container">
        <Container>
    
          <Card className="aboutus-card shadow-sm mb-4">
            <Card.Img variant="top" src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80" className="aboutus-img" />
          </Card>
          <Card className="aboutus-card shadow-sm mb-4">
            <Card.Body>
              <h2 className="aboutus-title mb-3">Chào mừng đến với Tour Guide</h2>
              <p className="aboutus-desc">
                Bạn Đang Mê Khám Phá Và Du Lịch? Chào Mừng Các Bạn Đến Với Tour Guide. Tour Guide Là Nền Tảng Đăng Ký Du Lịch Hàng Đầu, Giúp Bạn Tìm Kiếm, Đặt Chỗ Và Tận Hưởng Những Chuyến Du Lịch Tuyệt Vời.
              </p>
              <h3 className="aboutus-section-title mt-4 mb-2">Nhiệm Vụ Của Chúng Tôi</h3>
              <p className="aboutus-desc">
                Chúng Tôi Mong Muốn Mang Đến Trải Nghiệm Du Lịch Trọn Vẹn Và Dễ Dàng Nhất Cho Mọi Người. Với Nền Tảng Thân Thiện, Dịch Vụ Chuyên Nghiệp Và Đối Tác Uy Tín, Tour Guide Giúp Bạn Biến Giấc Mơ Khám Phá Thế Giới Thành Hiện Thực.
              </p>
              <h3 className="aboutus-section-title mt-4 mb-2">Tại sao lựa chọn chúng tôi</h3>
              <ul className="aboutus-list mb-4">
                <li>✓ Hệ Thống Đặt Tour Nhanh Chóng & Tiện Lợi: Chỉ Với Vài Cú Nhấp Chuột, Bạn Có Thể Đăng Ký Chuyến Đi Hoàn Hảo Cho Mình.</li>
                <li>✓ Kho Tàng Tour Đa Dạng: Từ Những Điểm Đến Nổi Tiếng Đến Các Hành Trình Độc Đáo, Chúng Tôi Có Tất Cả!</li>
                <li>✓ Giá Cả Cạnh Tranh: Cung Cấp Các Gói Du Lịch Với Mức Giá Tốt Nhất Từ Các Nhà Cung Cấp Uy Tín.</li>
                <li>✓ Dịch Vụ Hỗ Trợ 24/7: Đội Ngũ Chuyên Gia Luôn Sẵn Sàng Giúp Bạn Trong Mọi Tình Huống.</li>
              </ul>
              <h3 className="aboutus-section-title mt-4 mb-2">Hành Trình Của Bạn – Niềm Vui Của Chúng Tôi!</h3>
              <p className="aboutus-desc">
                Dù Bạn Đang Tìm Kiếm Một Chuyến Du Lịch Nghỉ Dưỡng, Phiêu Lưu Hay Khám Phá Văn Hóa, [Tên Trang Web] Đều Có Những Lựa Chọn Phù Hợp Nhất Cho Bạn. Hãy Để Chúng Tôi Giúp Bạn Tạo Nên Những Kỷ Niệm Đáng Nhớ Trên Mọi Chặng Đường.
              </p>
            </Card.Body>
          </Card>
        </Container>
      </div>
      <footer className="aboutus-footer mt-5">
        <Container>
          <Row>
            <Col md={3} className="mb-3 mb-md-0">
              <div className="footer-section">
                <div className="footer-title">Language</div>
                <select className="footer-select mb-2">
                  <option>English (UK)</option>
                </select>
                <div className="footer-title">Currency</div>
                <select className="footer-select">
                  <option>U.S. Dollar ($)</option>
                </select>
              </div>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <div className="footer-section">
                <div className="footer-title">Company</div>
                <div className="footer-link">About Us</div>
                <div className="footer-link">Blog</div>
                <div className="footer-link">Press Room</div>
                <div className="footer-link">Careers</div>
              </div>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <div className="footer-section">
                <div className="footer-title">Help</div>
                <div className="footer-link">Contact us</div>
                <div className="footer-link">FAQs</div>
                <div className="footer-link">Terms and conditions</div>
                <div className="footer-link">Privacy policy</div>
                <div className="footer-link">Sitemap</div>
              </div>
            </Col>
            <Col md={3}>
              <div className="footer-section">
                <div className="footer-title">Payment methods possible</div>
                <div className="footer-payments mb-2">
                  <img src="https://i.imgur.com/2ISgYja.png" alt="payment-methods" style={{width: '100%'}} />
                </div>
                <div className="footer-title">Company</div>
                <div className="footer-link">Become a Tour guide for Us</div>
              </div>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col className="text-center text-light small">
              Copyright 2021 Tour Guide. All Rights Reserved
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default AboutUs; 