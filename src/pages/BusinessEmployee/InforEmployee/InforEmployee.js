import React, {useContext} from 'react';
import './InforEmployee.scss'; // Import your styles here
import { Container, Row, Col } from 'react-bootstrap'; // Assuming you're using react-bootstrap for layout
import Form from 'react-bootstrap/Form'; // Import Form component if needed
import Button from 'react-bootstrap/Button'; // Import Button component if needed
import { useLocation, useNavigate } from 'react-router';
import Image from 'react-bootstrap/Image'; // Import Image component if needed
import { AuthContext } from "../../../context/AuthContext";

function InforEmployee(props) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user} = location.state || {};
    const { logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout(); // Call the logout function to clear the token from localStorage
    }


    return (
        <div className="infor-employee-container">
            <Container fluid>
                <Row className="mb-4">
                    <Col md={3}>
                        <h2>Thông tin nhân viên</h2>
                    </Col>
                </Row>
                <Row>
                    <Col md={2}>
                        <Image src={user.avatar || '/default-avatar.jpg'} alt="Avatar" className="employee-avatar" roundedCircle fluid/>
                    </Col>
                    <Col md={{span: 4, offset: 1}}>
                        <Form>
                            <Form.Group controlId="formFullName">
                                <Form.Label>Họ và tên</Form.Label>
                                <Form.Control type="text" placeholder="Nhập họ và tên" value={user.name} readOnly disabled />
                            </Form.Group>

                            <Form.Group controlId="formEmail">
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" placeholder="Nhập email" value={user.email} readOnly disabled />
                            </Form.Group>

                            <Form.Group controlId="formRole">
                                <Form.Label>Vai trò</Form.Label>
                                <Form.Control type="text" placeholder="Nhập vai trò" value={user.role} readOnly disabled />
                            </Form.Group>
                        </Form>
                    </Col>
                    <Col md={{span: 4, offset: 0}}>
                     <Form>
                            <Form.Group controlId="formPhone">
                                <Form.Label>Số điện thoại</Form.Label>
                                <Form.Control type="text" placeholder="Nhập số điện thoại" value={user.phone} readOnly disabled />
                            </Form.Group>
                            <Form.Group controlId="formAddress">
                                <Form.Label>Địa chỉ</Form.Label>
                                <Form.Control type="text" placeholder="Nhập địa chỉ" value={user.address} readOnly disabled />
                            </Form.Group>

                            <Form.Group controlId="formBranch">
                                <Form.Label>Chi nhánh</Form.Label>
                                <Form.Control type="text" placeholder="Nhập chi nhánh" value={user.branch_name} readOnly disabled />
                            </Form.Group>

                            <Button variant="danger" className="btn btn-primary mt-3 float-end" onClick={handleLogout}>Đăng xuất</Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default InforEmployee;