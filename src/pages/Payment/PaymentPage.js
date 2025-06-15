// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import { Container, Row, Col, Alert, Spinner, Breadcrumb } from 'react-bootstrap';
// import PaymentForm from '../../components/Payment/PaymentForm';

// const PaymentPage = () => {
//   const { bookingId } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [loading, setLoading] = useState(true);
//   const [bookingData, setBookingData] = useState(null);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchBookingData = async () => {
//       try {
//         setLoading(true);
        
//         // Kiểm tra xem có dữ liệu từ state không (từ trang checkout)
//         if (location.state?.bookingData) {
//           console.log('Using booking data from state:', location.state.bookingData);
//           setBookingData(location.state.bookingData);
//           setLoading(false);
//           return;
//         }

//         // Nếu không có state, tạo dữ liệu mẫu hoặc gọi API
//         if (bookingId) {
//           // TODO: Thay thế bằng API call thực tế để lấy booking data
//           // const response = await fetch(`/api/bookings/${bookingId}`);
//           // const result = await response.json();
          
//           // Simulate API call
//           await new Promise(resolve => setTimeout(resolve, 1000));
          
//           // Mock booking data - thay thế bằng API call thực tế
//           const mockBookingData = {
//             bookingId: bookingId,
//             amount: 2500000, // 2.5 triệu VND
//             customerInfo: {
//               name: 'Nguyễn Văn A',
//               email: 'nguyenvana@email.com',
//               phone: '0123456789'
//             },
//             tourInfo: {
//               name: 'Tour Hạ Long 3 ngày 2 đêm',
//               startDate: '2024-02-15',
//               endDate: '2024-02-17',
//               participants: 2,
//               description: 'Khám phá vẻ đẹp kỳ vĩ của Vịnh Hạ Long'
//             }
//           };
          
//           setBookingData(mockBookingData);
//         } else {
//           setError('Không tìm thấy thông tin booking');
//         }
//       } catch (error) {
//         console.error('Error fetching booking data:', error);
//         setError('Không thể tải thông tin đặt tour. Vui lòng thử lại.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookingData();
//   }, [bookingId, location.state]);

//   const handlePaymentSuccess = (result) => {
//     console.log('Payment success:', result);
//     // Có thể thêm logic tracking hoặc analytics ở đây
//     // Ví dụ: Google Analytics, Facebook Pixel, etc.
    
//     // Lưu thông tin payment vào localStorage để tracking
//     localStorage.setItem('lastPayment', JSON.stringify({
//       orderId: result.orderId,
//       bookingId: bookingData.bookingId,
//       amount: bookingData.amount/1000,
//       timestamp: new Date().toISOString()
//     }));
//   };

//   const handlePaymentError = (error) => {
//     console.error('Payment error:', error);
//     // Có thể thêm logic error tracking ở đây
    
//     // Lưu lỗi để phân tích
//     localStorage.setItem('lastPaymentError', JSON.stringify({
//       error: error.message || 'Unknown error',
//       bookingId: bookingData?.bookingId,
//       timestamp: new Date().toISOString()
//     }));
//   };

//   if (loading) {
//     return (
//       <Container className="mt-5">
//         <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
//           <div className="text-center">
//             <Spinner animation="border" variant="primary" size="lg" />
//             <div className="mt-3 h5">Đang tải thông tin đặt tour...</div>
//             <p className="text-muted">Vui lòng đợi trong giây lát</p>
//           </div>
//         </div>
//       </Container>
//     );
//   }

//   if (error) {
//     return (
//       <Container className="mt-5">
//         <Row className="justify-content-center">
//           <Col md={8}>
//             <Alert variant="danger">
//               <Alert.Heading>
//                 <i className="fas fa-exclamation-triangle me-2"></i>
//                 Có lỗi xảy ra
//               </Alert.Heading>
//               <p>{error}</p>
//               <hr />
//               <div className="d-flex justify-content-between">
//                 <button 
//                   className="btn btn-outline-secondary"
//                   onClick={() => window.history.back()}
//                 >
//                   <i className="fas fa-arrow-left me-2"></i>
//                   Quay lại
//                 </button>
//                 <button 
//                   className="btn btn-outline-danger"
//                   onClick={() => navigate('/')}
//                 >
//                   <i className="fas fa-home me-2"></i>
//                   Về trang chủ
//                 </button>
//               </div>
//             </Alert>
//           </Col>
//         </Row>
//       </Container>
//     );
//   }

//   return (
//     <Container className="mt-4">
//       {/* Breadcrumb */}
//       <Breadcrumb className="mb-4">
//         <Breadcrumb.Item href="/">Trang chủ</Breadcrumb.Item>
//         <Breadcrumb.Item href="/booking">Đặt tour</Breadcrumb.Item>
//         <Breadcrumb.Item active>Thanh toán</Breadcrumb.Item>
//       </Breadcrumb>

//       <Row className="justify-content-center">
//         <Col lg={8} xl={7}>
//           {/* Header */}
//           <div className="text-center mb-4">
//             <h2 className="mb-3">
//               <i className="fas fa-credit-card me-2 text-primary"></i>
//               Thanh toán đặt tour
//             </h2>
//             <p className="text-muted lead">
//               Vui lòng kiểm tra thông tin và chọn phương thức thanh toán
//             </p>
//           </div>
          
//           {/* Security Notice */}
//           <div className="alert alert-info mb-4">
//             <div className="d-flex align-items-center">
//               <i className="fas fa-shield-alt me-2"></i>
//               <div>
//                 <strong>Thanh toán an toàn</strong>
//                 <div className="small">
//                   Giao dịch được bảo mật bằng công nghệ mã hóa SSL 256-bit
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Payment Form */}
//           <PaymentForm 
//             bookingData={bookingData}
//             onPaymentSuccess={handlePaymentSuccess}
//             onPaymentError={handlePaymentError}
//           />

//           {/* Support Info */}
//           <div className="text-center mt-4 p-3 bg-light rounded">
//             <h6 className="text-primary mb-2">
//               <i className="fas fa-headset me-2"></i>
//               Cần hỗ trợ?
//             </h6>
//             <div className="row">
//               <div className="col-md-6">
//                 <div className="small text-muted">
//                   <i className="fas fa-phone me-1"></i>
//                   Hotline: <strong>1900 1234</strong>
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <div className="small text-muted">
//                   <i className="fas fa-envelope me-1"></i>
//                   Email: <strong>support@tourbooking.com</strong>
//                 </div>
//               </div>
//             </div>
//             <div className="small text-muted mt-2">
//               Hỗ trợ 24/7 - Phản hồi trong vòng 5 phút
//             </div>
//           </div>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default PaymentPage; 