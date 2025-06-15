import React, { useState, useEffect, useContext } from 'react';
import Form from 'react-bootstrap/Form';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { API_URL } from '../../../utils/API_Port';
import Image from 'react-bootstrap/Image';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoChevronBackOutline } from "react-icons/io5";
import './InforCustomer.scss';
import { getHistoryBooking } from '../../../api/historyBookingAPI';
import { CustomerContext } from '../../../context/CustomerContext';
import { updateCustomer, getCustomerById } from '../../../api/customerAccountAPI'; // Giả định API
import {formatDate} from '../../../feature/formatDate'; // Giả định hàm định dạng ngày tháng
import ConfirmDialog from "../../../components/Common/ConfirmDialog/ConfirmDialog";


function InforCustomer() {
    const navigate = useNavigate();
    const location = useLocation();
    const {blockCustomer } = useContext(CustomerContext);

    // Lấy thông tin khách hàng từ state
    const customerDetail  = location.state?.customerInfor || null;

    console.log("Customer Detail: ", customerDetail);
    const [customer, setCustomer] = useState(null);
    const [tourHistory, setTourHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


   
    const [values, setValues] = useState({
        name: customerDetail?.fullname || '',
        phone: customerDetail?.phone || '',
        address: customerDetail?.address || '',
        email: customerDetail?.email || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues((prevValues) => ({
            ...prevValues,
            [name]: value
        }));
    };

    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                setLoading(true);
                const tourHistoryData = await getHistoryBooking(customerDetail.cus_id);
                console.log("Tour History Data: ", tourHistoryData);
                setCustomer(customerDetail);
                setTourHistory(tourHistoryData);
            } catch (err) {
                setError('Lỗi khi tải dữ liệu: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomerData();
    }, []);

    const refreshCustomerInfor = async () => {
        try {
            const customerData = await getCustomerById(customerDetail.cus_id);
            setCustomer(customerData);
            setValues({
                name: customerData.fullname || '',
                phone: customerData.phone || '',
                address: customerData.address || '',
                email: customerData.email || ''
            });
        } catch (err) {
            alert('Lỗi khi làm mới thông tin khách hàng: ' + err.message);
        }
    }


    const handleUpdateCustomer = async () => {
        try{
            const formData = {
                    name: values.name,
                    phone: values.phone,
                    address: values.address,
                    image: null
            };
            await updateCustomer(customer.cus_id, formData);
            alert('Cập nhật thông tin khách hàng thành công');
            await refreshCustomerInfor(); // Làm mới thông tin khách hàng sau khi cập nhật
        } catch (err) {
            alert('Cập nhật thông tin khách hàng thất bại: ' + err.message);
        }
    }

    const handleBlockAccount = async () => {
        if (window.confirm('Bạn có chắc chắn muốn khóa tài khoản này không?')) {
            try {
                await blockCustomer(customer.cus_id);
                alert('Khóa tài khoản thành công');
                goBack(); // Chuyển hướng về danh sách khách hàng
            } catch (err) {
                alert('Khóa tài khoản thất bại: ' + err.message);
            }
        }
    };

    const goBack = () => {
        navigate(-1);
    };

    if (loading) return <div>Đang tải dữ liệu...</div>;
    if (error) return <div>{error}</div>;
    if (!customer) return <div>Không tìm thấy khách hàng.</div>;

    return (
        <div className="infor_CustomerPage">
            <Container fluid className="infor_CustomerContainer py-4">
                <Row>
                    <Col xs={6} className="px-5">
                        <Row className="title">
                            <h2><IoChevronBackOutline onClick={goBack} size={30}/>Thông tin khách hàng</h2>
                        </Row>
                        <Row>
                            <div className="avatar-container">    
                                <Image 
                                    src={(customer.pi_url ? `${API_URL}/${customer.pi_url}` : `/default-avatar.jpg`)}
                                    alt="avatar" 
                                    className="avatar-image"
                                    fluid
                                    roundedCircle
                                />
                            </div>
                        </Row>
                        <Row>
                           
                            <Form className="user-form">
                                <Form.Group className="mb-4" controlId="fullName">
                                    <Form.Label>Họ và tên</Form.Label>
                                    <Form.Control type="text" name="name" value={values.name} onChange={handleChange} />
                                </Form.Group>
                                
                                <Form.Group className="mb-4" controlId="phone">
                                    <Form.Label>Số điện thoại</Form.Label>
                                    <Form.Control type="text" name="phone" value={values.phone} onChange={handleChange} />
                                </Form.Group>
                                
                                <Form.Group className="mb-4" controlId="email">
                                    <Form.Label>Địa chỉ email</Form.Label>
                                    <Form.Control type="email" name="email" value={values.email || ''} onChange={handleChange} disabled/>
                                </Form.Group>
                                
                                <Form.Group className="mb-4" controlId="address">
                                    <Form.Label>Địa chỉ</Form.Label>
                                    <Form.Control type="text" name="address" value={values.address} onChange={handleChange} />
                                </Form.Group>
                                <div className="d-flex justify-content-between mb-3">
                                    <Button className="update-btn" onClick={handleUpdateCustomer}>
                                        Lưu cập nhật
                                    </Button>
                                    <Button className="block-btn" onClick={handleBlockAccount}>
                                        Khóa tài khoản
                                    </Button>
                                </div>
                            </Form>
                        </Row>
                    </Col>
                    <Col xs={6} md={6} className="px-5">
                        <Row className="title">
                            <h2>Lịch sử đặt tour</h2>
                        </Row>
                        <div className="tour-history-container">
                            {tourHistory.length > 0 ? (
                                tourHistory.map((booking) => (
                                    <Row key={booking.booking_id} xs={12} className="history_card mb-3">
                                        <Card>
                                            <Card.Body>
                                                <Card.Title><strong>{booking.tour_name}</strong></Card.Title>
                                                <div className="d-flex justify-content-between">
                                                    <Card.Text>
                                                        <strong>Ngày đặt:</strong> {formatDate(booking.booking_date)}<br />
                                                        <strong>Số khách:</strong> {booking.number_of_guests}<br />
                                                    </Card.Text>
                                                    <Button
                                                        variant="link"
                                                        onClick={() => navigate(`/businessemployee/customer/inforcustomer/history`)}
                                                    >
                                                        Chi tiết
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Row>
                                ))
                            ) : (
                                <div>Chưa có lịch sử đặt tour.</div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default InforCustomer;