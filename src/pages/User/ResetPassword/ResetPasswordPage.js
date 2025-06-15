import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import {resetPassword} from '../../../api/resetPasswordAPI'; // Giả lập hàm reset password, thay bằng API thực tế nếu cần
import { useLocation, useNavigate } from 'react-router-dom';
import validator from '../../../feature/validator'; 
import PATTERN from '../../../utils/pattern'; // Import PATTERN nếu cần


function ResetPasswordPage(props) {
  const [value, setValue] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get email from location state
  const location = useLocation();
  const email = location.state?.email;

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValue((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (value.password !== value.confirmPassword) {
      setError('Passwords do not match');
      setSuccess('');
      return;
    }
    if (value.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setSuccess('');
      return;
    }

    console.log('Resetting password for:', email);
    // Reset error and success messages
    await resetPassword(email, value.password); // Call the API to reset password

    setError('');
    setSuccess('Password reset successfully! Redirecting...');
    // Add API call to update password here
    // Example: props.handleResetPassword(email, password);
    setTimeout(() => {
      // Redirect to login page or home page after success
      navigate('/login'); // Adjust the path as needed
    }, 2000);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Row style={{ width: '100%' }} className="justify-content-center">
        <Col md={12} lg={4}>
          <h2 className="text-center mb-4">Reset Password</h2>
          {error && <Alert variant="danger" className="text-center">{error}</Alert>}
          {success && <Alert variant="success" className="text-center">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={value.password}
                onChange={handleChange}
                name="password"
                placeholder="Enter new password"
                pattern={PATTERN.password} // Assuming you have a password pattern defined
                required
              />
            </Form.Group>
            <Form.Group controlId="formConfirmPassword" className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                value={value.confirmPassword}
                onChange={handleChange}
                name="confirmPassword"
                placeholder="Confirm new password"
                pattern={PATTERN.password} // Assuming you have a password pattern defined
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Reset Password
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default ResetPasswordPage;