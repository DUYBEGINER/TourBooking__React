import React from 'react';
import '../../styles/pages/TourHistory.scss';

function TourHistory(props) {
    // Dữ liệu giả cho lịch sử đặt tour
    const tourHistory = [
        {
            id: 1,
            tourName: "Du lịch Đà Lạt 3N2Đ",
            bookingDate: "2025-05-20",
            startDate: "2025-06-01",
            price: 3500000,
            status: "Đã xác nhận",
            image: "https://placehold.co/300x200?text=Da+Lat+Tour"
        },
        {
            id: 2,
            tourName: "Khám phá Phú Quốc 4N3Đ",
            bookingDate: "2025-04-15",
            startDate: "2025-05-10",
            price: 5500000,
            status: "Đang chờ",
            image: "https://placehold.co/300x200?text=Phu+Quoc+Tour"
        },
        {
            id: 3,
            tourName: "Hà Nội - Hạ Long 2N1Đ",
            bookingDate: "2025-03-10",
            startDate: "2025-04-01",
            price: 2500000,
            status: "Đã hủy",
            image: "https://placehold.co/300x200?text=Ha+Long+Tour"
        }
    ];

    return (
        <div className="tour-history-container">
            <h1>Lịch sử đặt tour</h1>
            {tourHistory.length === 0 ? (
                <p>Chưa có lịch sử đặt tour.</p>
            ) : (
                <div className="tour-list">
                    {tourHistory.map(tour => (
                        <div key={tour.id} className="tour-card">
                            <img src={tour.image} alt={tour.tourName} className="tour-image" />
                            <div className="tour-info">
                                <h3>{tour.tourName}</h3>
                                <p><strong>Ngày đặt:</strong> {tour.bookingDate}</p>
                                <p><strong>Ngày khởi hành:</strong> {tour.startDate}</p>
                                <p><strong>Giá:</strong> {tour.price.toLocaleString('vi-VN')} VNĐ</p>
                                <p className={`status ${tour.status.replace(' ', '-').toLowerCase()}`}>
                                    <strong>Trạng thái:</strong> {tour.status}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TourHistory;