// src/pages/Admin/Employees/EmployeeProfile.js

import React, { useState, useEffect } from 'react';
//import { Mail, Phone, MapPin, Users, Building } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById, getAllBranches, updateEmployee, lockEmployees, unlockEmployee } from '../../../api/adminAPI';
import '../../../styles/admin/_profile.scss';
import { Form, Row, Col, Button } from 'react-bootstrap';

// const ROLES = [
//   { value: 2, label: 'Nhân viên kinh doanh' },
//   { value: 3, label: 'Nhân viên hỗ trợ' },
//   { value: 1, label: 'Quản trị viên' },
// ];

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({
    fullname: '',
    phone: '',
    address: '',
    email: '',
    password: '',
    role_id: '',
    branch_id: '',
    status: '',
  });
  const [originalForm, setOriginalForm] = useState({
    fullname: '',
    phone: '',
    address: '',
    email: '',
    password: '',
    role_id: '',
    branch_id: '',
  });
  const [loading, setLoading] = useState(true);

  // Fetch employee & branches
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [emp, branchList] = await Promise.all([
          getEmployeeById(id),
          getAllBranches(),
        ]);
        setEmployee(emp);
        setBranches(branchList);
        setForm({
          fullname: emp.fullname,
          phone: emp.phone,
          address: emp.address,
          email: emp.email,
          password: '',
          role_id: emp.role_id,
          branch_id: emp.branch_id,
          status: emp.em_status,
        });
        setOriginalForm({
          fullname: emp.fullname,
          phone: emp.phone,
          address: emp.address,
          email: emp.email,
          password: '',
          role_id: emp.role_id,
          branch_id: emp.branch_id,
        });
      } catch (err) {
        alert('Không tìm thấy nhân viên!');
        navigate('/admin/nhan-vien');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updateEmployee(id, form);

      //alert('Cập nhật thành công!');
      
    } catch (err) {
      alert('Cập nhật thất bại!');
    }
  };

  const handleLock = async () => {
    //if (window.confirm('Bạn chắc chắn muốn khóa tài khoản này?')) {
      try {
        await lockEmployees([id]);
        setForm((prev) => ({ ...prev, status: 'inactive' }));
        alert('Đã khóa tài khoản!');
      } catch (err) {
        alert('Khóa tài khoản thất bại!');
      }
    //}
  };

  const handleUnlock = async () => {
    //if (window.confirm('Bạn chắc chắn muốn mở khoá tài khoản này?')) {
      try {
        await unlockEmployee([id]);
        setForm((prev) => ({ ...prev, status: 'active' }));
        alert('Đã mở khoá tài khoản!');
      } catch (err) {
        alert('Mở khoá tài khoản thất bại!');
      }
    //}
  };

  const isFormChanged = () => {
    if (!originalForm) return false;
    // So sánh từng trường, bỏ qua password nếu rỗng
    for (let key in form) {
      if (key === 'password' && !form.password) continue;
      //if (form[key] !== originalForm[key]) return true;
      if (form[key]?.toString() !== originalForm[key]?.toString()) return true;

    }
    return false;
  };

  if (loading) return <div>Loading...</div>;
  if (!employee) return null;

  return (
    <div className="profile-page">
      {/* <div className="page-header">
        <h2>Thông tin nhân viên</h2> 
        <button className="logout-button" onClick={() => navigate('/admin/nhan-vien')}>Quay lại</button>
      </div> */}
      <div className="profile-card">
        <div className="profile-header">
          <img src="/avt.jpg" alt="Profile Avatar" className="profile-avatar" />
          <div className="profile-info">
            <h3>{form.fullname}</h3>
            <button className="avatar-button">Đổi ảnh hồ sơ</button>
          </div>
          <div className="account-status">
            <span className="status-label">Trạng thái tài khoản:</span>
            <span className={`status-badge ${form.status === 'active' ? 'status-active' : 'status-inactive'}`}>
              {form.status === 'active' ? 'Đang hoạt động' : 'Đã bị khoá'}
            </span>
          </div>
        </div>
        <div className="profile-content">
          <Form>
            <Row>
              <Col md={6}>
                <h4>Thông tin nhân viên</h4>
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
                <Form.Group className="mb-3">
                  <Form.Label>Phân quyền</Form.Label>
                  <Form.Select name="role_id" value={form.role_id} onChange={handleChange} required>
                    <option value="">Chọn phân quyền</option>
                    <option value="1">Quản trị viên</option>
                    <option value="2">Nhân viên kinh doanh</option>
                    <option value="3">Nhân viên hỗ trợ</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Chi nhánh</Form.Label>
                  <Form.Select name="branch_id" value={form.branch_id} onChange={handleChange} required>
                    <option value="">-- Chọn chi nhánh --</option>
                    {branches.map(branch => (
                      <option key={branch.branch_id} value={branch.branch_id}>{branch.branch_name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </div>
        <div className="profile-actions">
          {form.status === 'active' ? (
            <button className="lock-button" onClick={handleLock}>Khóa tài khoản</button>
          ) : (
            <button className="lock-button" onClick={handleUnlock}>Mở khoá tài khoản</button>
          )}
          <Button className={`save-button${isFormChanged() ? ' changed' : ''}`}
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

export default EmployeeProfile; 
