import React, { useState, useContext, useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import '../../../styles/admin/_profile.scss';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { updateEmployee } from '../../../api/adminAPI';

const AdminAccounts = () => {
  const { user, refreshUserData } = useContext(AuthContext);
  //const navigate = useNavigate();
  
  const [form, setForm] = useState({
    fullname: '',
    phone: '',
    address: '',
    email: '',
    password: '',
  });
  const [originalForm, setOriginalForm] = useState({
    fullname: '',
    phone: '',
    address: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu admin từ user context
  useEffect(() => {
    if (user) {
      setForm({
        fullname: user.fullname || user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        email: user.email || '',
        password: '',
      });
      
      setOriginalForm({
        fullname: user.fullname || user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        email: user.email || '',
        password: '',
      });
      
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updateEmployee(user.emp_id, form);
      // Cập nhật lại thông tin user trong context
      await refreshUserData();
      // Cập nhật originalForm để form nhận biết không còn thay đổi
      setOriginalForm({
        fullname: form.fullname,
        phone: form.phone,
        address: form.address,
        email: form.email,
        password: '',
      });
      // alert('Cập nhật thông tin thành công!');
    } catch (err) {
      console.error('Lỗi cập nhật:', err);
      alert('Cập nhật thất bại!');
    }
  };

  const isFormChanged = () => {
    if (!originalForm) return false;
    // So sánh từng trường, bỏ qua password nếu rỗng
    for (let key in form) {
      if (key === 'password' && !form.password) continue;
      if (form[key]?.toString() !== originalForm[key]?.toString()) return true;
    }
    return false;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="profile-page">
      {/* <div className="page-header">
        <h2>Thông tin cá nhân</h2> 
        <button className="logout-button" onClick={logout}>Thoát</button>
      </div> */}
      <div className="profile-card">
        <div className="profile-header">
          <img src="/avt.jpg" alt="Profile Avatar" className="profile-avatar" />
          <div className="profile-info">
            <h3>{form.fullname}</h3>
            <button className="avatar-button">Đổi ảnh hồ sơ</button>
          </div>
          <div className="account-status">
            <span className="status-label">Vai trò:</span>
            <span className="status-badge status-active">
              Quản trị viên
            </span>
          </div>
        </div>
        <div className="profile-content">
          <Form>
            <Row>
              <Col md={6}>
                <h4>Thông tin cá nhân</h4>
                <Form.Group className="mb-3">
                  <Form.Label>Họ và tên</Form.Label>
                  <Form.Control name="fullname" value={form.fullname} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control name="phone" value={form.phone} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Địa chỉ</Form.Label>
                  <Form.Control name="address" value={form.address} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <h4>Thông tin tài khoản</h4>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control name="email" value={form.email} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu mới</Form.Label>
                  <Form.Control 
                    name="password" 
                    type="password" 
                    value={form.password} 
                    onChange={handleChange} 
                    placeholder="Để trống nếu không đổi"
                    autocomplete="new-password"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </div>
        <div className="profile-actions">
          <Button 
            className={`save-button${isFormChanged() ? ' changed' : ''}`}
            variant={isFormChanged() ? "success" : "outline-success"}
            onClick={handleSave}
            disabled={!isFormChanged()}
          >
            Lưu cập nhật
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAccounts;
