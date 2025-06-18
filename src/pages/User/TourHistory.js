    import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getHistoryBooking } from '../../api/historyBookingAPI';
import Navbar from '../../layouts/Navbar';
import Footer from '../../layouts/Footer';
import '../../styles/pages/TourHistory.scss';
import { FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaRegClock } from 'react-icons/fa';
import { API_URL } from '../../utils/API_Port';

function TourHistory() {
    const { user, loading } = useContext(AuthContext);
    const [tourHistory, setTourHistory] = useState([]);
    const [error, setError] = useState(null);
    const [isFetching, setIsFetching] = useState(true);
    const navigate = useNavigate();

    const STATUS_LABELS = {
        pending: 'Chờ xác nhận',
        confirmed: 'Đã xác nhận',
        cancelled: 'Đã hủy',
    };

    useEffect(() => {
        if (!loading) {
            if (!user) {
                console.log('User is not logged in. Redirecting to login page...');
                navigate('/login', { state: { returnUrl: '/historyBooking' } });
            } else {
                const fetchTourHistory = async () => {
                    try {
                        setIsFetching(true);
                        const data = await getHistoryBooking(user.id);
                        if (!Array.isArray(data)) {
                            throw new Error('Dữ liệu trả về không phải là mảng');
                        }
                        setTourHistory(data);
                    } catch (err) {
                        setError(err.message || 'Không thể tải lịch sử đặt tour');
                    } finally {
                        setIsFetching(false);
                    }
                };
                fetchTourHistory();
            }
        }
    }, [user, loading, navigate]);

    return (
        <div>
            <Navbar />
            <div className="tour-history__banner">
                <Container className="tour_history">
                    {loading || isFetching ? (
                        <div className="text-center mt-5">
                            <Spinner animation="border" />
                        </div>
                    ) : (
                        <>
                            <h2 className="tour-history__title text-center">Các Tour Bạn Đã Đặt:</h2>
                            {error && (
                                <Alert variant="danger" className="text-center mt-4">
                                    {error}
                                </Alert>
                            )}
                            {tourHistory.length === 0 && !error && (
                                <Alert variant="info" className="text-center mt-4">
                                    Bạn chưa có lịch sử đặt tour nào.
                                </Alert>
                            )}
                            {tourHistory.length > 0 && (
                                <Row className="g-4 mt-4" xs={1}>
                                    {tourHistory.map((tour) => (
                                        <Col key={tour.booking_id}>
                                            <div className="tour-card-horizontal">
                                                <img
                                                    src={`${API_URL}/${tour.cover_image}` || 'https://placehold.co/300x200?text=No+Image'}
                                                    alt={tour.tour_name}
                                                    className="tour-card-horizontal__image"
                                                />
                                                <div className="tour-card-horizontal__content">
                                                    <h3 className="tour-card-horizontal__title">{tour.tour_name || 'Tên tour không có'}</h3>
                                                    <div className="tour-card-horizontal__info">
                                                        <div className="tour-info-row">
                                                            <span><FaRegClock /> Thời gian: {tour.duration} N {tour.duration - 1} Đ</span>
                                                            <span><FaMapMarkerAlt /> Khởi hành: {tour.departure_location || 'N/A'}</span>
                                                        </div>
                                                        <div className="tour-info-row">
                                                            <span><FaCalendarAlt /> Ngày khởi hành: {tour.start_date ? new Date(tour.start_date).toLocaleDateString('vi-VN') : 'N/A'}</span>
                                                            <span><FaCalendarAlt /> Ngày đặt: {tour.booking_date ? new Date(tour.booking_date).toLocaleDateString('vi-VN') : 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="tour-card-horizontal__price">
                                                        <FaMoneyBillWave /> Thành tiền: <span>{tour.total_price ? tour.total_price.toLocaleString('vi-VN') + ' đ' : 'Chưa xác định'}</span>
                                                    </div>
                                                    <div className="tour-card-horizontal__footer">
                                                        <button className={`btn-detail ${tour.status}`}> 
                                                            {STATUS_LABELS[tour.status] || tour.status || 'Không rõ'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                            <div className="text-center mt-4">
                                <button className="btn-show-more">Hiển thị thêm</button>
                            </div>
                        </>
                    )}
                </Container>
            </div>
            <Footer />
        </div>
    );
}

export default TourHistory;