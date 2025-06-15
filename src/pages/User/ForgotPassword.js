import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import {sendOTP} from '../../api/resetPasswordAPI'; // Giả lập hàm gửi OTP, thay bằng API thực tế nếu cần

function ForgotPassword(props) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Logic gửi yêu cầu quên mật khẩu (giả lập)
    if (email) {
      try {
        setLoading(true);
        await sendOTP(email);
        navigate('/verifyOTP', { state: { email } }); // Chuyển hướng đến VerifyOTP với email
        setError('');
        setMessage('Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra!');
      } catch (error) {
        setMessage('');
        setError('Lỗi khi gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại!');
      } finally {
        setLoading(false);
      }
    } else {
      setMessage('');
      setError('Vui lòng nhập email hợp lệ!');
    }
    // Thay bằng API thực tế nếu cần
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <Card className="p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">Quên Mật Khẩu</Card.Title>
          <Card.Text className="text-center text-muted mb-4">
            Vui lòng nhập email của bạn. Chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
          </Card.Text>
          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                required
              />
            </Form.Group>
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}
            <Button variant="primary" type="submit" className="w-100 mb-3" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
            </Button>
            <p className="text-center text-muted">
              Nhớ mật khẩu?{' '}
              <a href="/login" className="text-primary text-decoration-none">
                Quay lại đăng nhập
              </a>
            </p>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ForgotPassword;