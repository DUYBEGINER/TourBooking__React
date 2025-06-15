import React from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import {useLocation, useNavigate} from 'react-router-dom';
import { Link } from 'react-router-dom';
import {sendOTP, verifyOTP} from '../../api/resetPasswordAPI'; // Giả lập hàm gửi OTP, thay bằng API thực tế nếu cần


function VerifyOTP(props) {
    const navigate = useNavigate();
    const email = useLocation().state?.email || '';

    const [otp, setOtp] = React.useState('');
    const [error, setError] = React.useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!otp) {
            setError("Vui lòng nhập mã OTP.");
            return;
        }
        try {
            const result = await verifyOTP(email, otp);
            console.log("Xác nhận OTP thành công:", result);
            if(result.status === 'VERIFIED'){
              navigate("/reset-password", { state: { email } }); // Chuyển hướng đến trang đặt lại mật khẩu
            }
            // Chuyển hướng đến trang đặt lại mật khẩu nếu xác nhận thành công
        } catch (error) {
            console.error("Xác nhận OTP thất bại:", error);
            setError("Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.");
        }
    };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <Card className="p-4 shadow-sm" style={{ maxWidth: '500px', width: '100%' }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">Mã OTP đã được gửi đến: <strong>{email}</strong></Card.Title>
          {/* <Alert variant="success" className="mb-4">
            Mã OTP đã được gửi đến email hoặc số điện thoại của bạn. Vui lòng kiểm tra!
          </Alert> */}
          <Card.Text className="text-center text-muted mb-4">
            Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam) của bạn để nhận mã OTP. Nếu không thấy, hãy thử lại sau vài phút.
          </Card.Text>
          {error &&
          <Alert variant="danger" className="mb-4">
            <p className="text-center mb-0">
              {error}
            </p>
          </Alert>
      }
         <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3" controlId="otp">
              <Form.Control
                type="text"
                placeholder="Nhập mã OTP"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 mb-3">
                Xác nhận
            </Button>
            <Button variant="secondary" disabled={true} type="submit" className="w-100 mb-3">
              Gửi lại OTP
            </Button>
            <p className="text-center text-muted">
              Đổi gmail? {' '}
              <a href="/forgot-password" className="text-primary text-decoration-none">
                Quay lại
              </a>
            </p>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default VerifyOTP;