import React, { useRef, useState, useEffect, useContext} from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import "../../styles/pages/BookingTour.scss";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import TourSchedule from '../../components/Common/TourSchedule/TourSchedule';
import Footer from '../../layouts/Footer';
//import TourList from "../../components/TourList/Tourlist";
import { FaRegHeart } from "react-icons/fa";
import { RiShareForwardLine } from "react-icons/ri";
import Navbar from '../../layouts/Navbar';
import TourInforCard from '../../components/TourInforCard.js/TourInforCard';
import ReviewSection from '../../layouts/ReviewSection';
import { API_URL } from '../../utils/API_Port';
import TourCard from '../../components/Common/TourCard/TourCard';
import { useSearchParams } from 'react-router-dom';
import { getTourImages} from '../../api/imageAPI';
import { getTourById } from '../../api/tourAPI';
import {getItinerary} from '../../api/scheduleAPI';
import { formatPrice } from '../../feature/formatPrice';
import { useNavigate } from 'react-router-dom';
import { getStatsResults } from '../../api/reviewAPI';
import { getTourByProvince } from '../../api/tourAPI';
import { AuthContext } from '../../context/AuthContext';

function BookingTour(props) {
    const { user, loading } = useContext(AuthContext);
    const bookingPageRef = useRef(null); // Tạo ref cho .bookingPage để sử dụng trong Navbar
    const relatedToursRef = useRef(null);
    const [searchParams] = useSearchParams(); // Sử dụng useSearchParams để lấy query parameters
    // Lấy tourId từ query parameters
    const tourId = searchParams.get('id');
    const [isLoading, setIsLoading] = useState(true);
    console.log("Tour ID:", tourId); // Kiểm tra giá trị tourId
    const [imageIndex, setImageIndex] = useState(0);
    const [images, setImages] = useState([]); // Lưu trữ hình ảnh của tour
    const [tour, setTour] = useState({});   // Lưu trữ thông tin tour
    const [tours, setTours] = useState([]); // Lưu trữ danh sách tour liên quan
    const [isLoadingRelatedTours, setIsLoadingRelatedTours] = useState(false); // Loading cho tour liên quan
    const [schedules, setSchedules] = useState([]);
    const [stats, setStats] = useState({}); // Lưu trữ thống kê đánh giá của tour
    
    const navigate = useNavigate();
    

     // Chuyển hướng về trang không được phép nếu không có tourId
    useEffect(() => {
        if (!tourId) {
            navigate('/unauthorized', { replace: true }); // Redirect to tours list page
            return;
        }
        window.scrollTo(0, 0);
        setTours([]);
        setImages([]);
        setSchedules([]);
        setStats({});
        setTour({});
        setImageIndex(0);
    }, [tourId, navigate]);


     // Cuộn về đầu trang và reset trạng thái khi tourId thay đổi
    
   
    // Hàm lấy danh sách tour liên quan
    const fetchRelatedTours = async (destination) => {
        setIsLoadingRelatedTours(true);
        try {
            const relatedTours = await getTourByProvince(destination, 8, (user?.id) || null); // Lấy tối đa 8 tour liên quan
            const filteredTours = relatedTours.filter((t) => t.tour_id !== tourId);
            setTours(filteredTours);
            console.log("Related tours fetched:", filteredTours);
        } catch (error) {
        console.error("Error fetching related tours:", error);
        } finally {
        setIsLoadingRelatedTours(false);
        }
    };


    useEffect(() => {
        const fetchTour = async () => {
            setIsLoading(true);
            try {
                const [tourData, scheduleData, imageData, statsData] = await Promise.all([
                getTourById(tourId).catch((err) => {
                    console.error("Error fetching tour:", err);
                    return null;
                }),
                getItinerary(tourId).catch((err) => {
                    console.error("Error fetching itinerary:", err);
                    return [];
                }),
                getTourImages(tourId).catch((err) => {
                    console.error("Error fetching images:", err);
                    return [];
                }),
                getStatsResults(tourId).catch((err) => {
                    console.error("Error fetching stats:", err);
                    return { total_reviews: 0, average_rating: 0 };
                }),
                ]);

                if (!tourData) {
                throw new Error("Không thể tải thông tin tour");
                }

                setTour(tourData);
                setSchedules(scheduleData);
                setImages(imageData);
                setStats(statsData);
                console.log("Tour data:", tourData);
                console.log("Schedule data:", scheduleData);
                console.log("Image data:", imageData);
                console.log("Stats data:", statsData);
            } catch (error) {
                console.error("Error in fetchTour:", error);
                navigate("/unauthorized", { replace: true }); // Chuyển hướng nếu lỗi
            } finally {
                setIsLoading(false);
            }
        };
        fetchTour();
    }, [tourId]);

    // Lấy tour liên quan khi tour.destination thay đổi
    useEffect(() => {
        if (tour?.destination) {
            fetchRelatedTours(tour.destination);
        }
    }, [tour?.destination, user?.id, loading]);

    const onChangeFavoriteTour = async () => {
        console.log("Cập nhật danh sách tour yêu thích");
        if (tour?.destination) {
            await fetchRelatedTours(tour.destination);
        }
    };

    console.log("Tour data in tour Booking:", tour); // Kiểm tra dữ liệu tour

   
    const handleBookNow = () => {
        // Kiểm tra xem user đã đăng nhập hay chưa
        if (!user) {
            console.log("User is not logged in. Redirecting to login page...");
            // Lưu URL hiện tại để sau khi login có thể quay lại
            const currentUrl = `/booking?id=${tourId}`;
            navigate('/login', { 
                state: { 
                    returnUrl: currentUrl,
                    message: "Vui lòng đăng nhập để đặt tour"
                } 
            });
            return;
        }

        // Nếu đã đăng nhập, chuyển đến trang booking info
        navigate('/user/booking-info', { state: { tour: tour, tourId: tourId , image: images[0] } });
    };
    

    return (
        <div className="bookingPage" ref={bookingPageRef}>
            <Navbar pageRef={bookingPageRef}/>
            <Container className="bookingContent"  >
                <Row>
                    <Col md={9} className="bookingContent-left">
                        <h1>{tour.name}</h1>
                        <div className="d-flex align-items-center mb-3">
                            <span className="me-2">{tour.destination}</span>
                            <span className="text-warning">
                                {[1,2,3,4,5].map(i => (
                                    <span key={i} className={i <= stats.average_rating ? "star filled" : "star"}>★</span>
                                ))}
                            </span>
                            <span className="ms-2 text-muted">{stats.total_reviews} đánh giá</span>
                        </div>
                        {/*Vùng hiển thị hình ảnh */}
                        <Container className="mb-4 p-0">
                            {/* Hình ảnh chính */}
                            <Row>
                                {!isLoading ? (
                                    <div className="main-image-container"><img
                                        src={`${API_URL}/${images[imageIndex].image_url}`}
                                        alt="Main Tour"
                                        className="main-image"
                                    /></div>
                                ) : (
                                    <div className="main-image-container">
                                      <p>Đang tải...</p>
                                    </div>
                                )}
                            </Row>
                            {/* Hình ảnh phụ */}
                            <Row className="d-flex flex-wrap pt-md-2">
                                {!isLoading && images.length === 0 ? (
                                    <div>No images available</div>
                                ) : (
                                    images.map((image, index) => (
                                        <img
                                        key={index}
                                        src={`${API_URL}/${image.image_url}`}
                                        alt={image.alt}
                                        onClick={() => setImageIndex(index)}
                                        className="thumbnail-image img-fluid rounded m-1"
                                        style={{ width: '15%' }}
                                        />
                                    ))
                                )}
                            </Row>
                        </Container>

                        <TourInforCard tour={tour} />
                        {/* Thông tin bổ sung */}
                        <div className="mt-4">
                            <h3 className="section-title">Tour Này Có Gì Hay!</h3>
                            <p>
                                {tour.description}
                            </p>
                        </div>

                        <hr className="my-4"></hr>
                        {/* Thông tin lịch trình */}    
                        <h3 className="section-title">Lịch Trình</h3>
                        <TourSchedule schedules={schedules} />

                        <hr className="my-4"></hr>

                        <h3 className="section-title">Những lưu ý khi đặt tour</h3>
                        <ul>
                            <li>Giá tour không bao gồm chi phí ăn uống cá nhân</li>
                            <li>Nếu hủy hoặc chuyển sang các tuyến du lịch khác trước ngày khởi hành 20: Không mất chi phí.</li>
                            <li>Nếu chương trình du lịch bị hủy bỏ hoặc thay đổi bởi một trong hai bên vì một lý do bất khả kháng như hỏa hoạn, thời tiết, tai nạn, thiên tai, chiến tranh, dịch bệnh, hoãn, dời, hủy chuyến hoặc thay đổi khác của các phương tiện vận chuyển công cộng hoặc các sự kiện bất khả kháng khác theo quy định pháp luật …), thì Tour Guidee sẽ không chịu bất kỳ nghĩa vụ bồi hoàn các tổn thất đã xảy ra và không chịu bất kỳ trách nhiệm pháp lý nào.</li>
                        </ul>

                        <hr className="my-4"></hr>

                        <h3 className="section-title">Đánh giá của du khách</h3>
                        <ReviewSection 
                            num_reviews={stats.total_reviews}  
                            avg_rating={stats.average_rating}
                            tour_id={tourId} 
                        />

                        {/* <hr className="my-4"></hr> */}

                     
                    </Col>
                    
                    <Col md={3} className="booking_card" >
                        <Card className="booking-card-sticky ">
                            <Card.Header><span style={{fontWeight: 'bold', fontSize: '20px'}}>Booking</span></Card.Header>
                            <Card.Body>
                                <h6>Giá</h6>
                                <h4 className="text-danger text-center fw-bold">{formatPrice(tour.adultPrice)} đ<span style={{fontWeight: 'bold', color: "black", fontSize: '15px'}}>/ Khách</span></h4>
                                <Card.Text as="div">
                                     <Button variant="custom-primary" className="mb-2 w-100" onClick={handleBookNow}>Đặt Tour</Button>
                                </Card.Text>
                                <Card.Text>
                                    <Button variant="custom-secondary" className="mb-2 w-100">
                                        <span role="img" aria-label="heart"></span><FaRegHeart /> Thêm Vào Yêu Thích
                                    </Button>
                                </Card.Text>
                                <Card.Text>
                                    <Button variant="custom-secondary" className="mb-2 w-100" onClick={() => navigate("/contact")}>
                                        <RiShareForwardLine /> Liên Hệ Tư Vấn
                                    </Button>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                
                <div className='my-md-5' ref={relatedToursRef}>
                    <h2 className="tour-relevant py-md-3 text-center">Các tour liên quan</h2>
                    <Container className="tourlist-container">
                             {isLoadingRelatedTours ? (
                            <p className="text-center">Đang tải các tour liên quan...</p>
                        ) : tours.length === 0 ? (
                            <p className="text-center">Không có tour liên quan</p>
                        ) : (
                            <Row className="custom-row g-3" xs={1} sm={2} md={3} xl={3} xxl={4}>
                                {tours.map((tour) => (
                                    <Col key={tour.tour_id} className="custom-col">
                                        <TourCard {...tour} onFavoriteChange={onChangeFavoriteTour}/>
                                    </Col>
                                ))}
                            </Row>
                        )}
                        {/* <div className="show-all-container">
                        <ShowAllButton />
                        </div> */}
                    </Container>
                </div>
            </Container>
             
            <Footer />
        </div>
    );
}

export default BookingTour;