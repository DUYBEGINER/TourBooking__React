import React, { useContext, useState, useEffect } from 'react';
import Slider from 'react-slick';
import { SlArrowLeftCircle, SlArrowRightCircle } from 'react-icons/sl';
import TourCard from '../components/Common/TourCard/TourCard';
import { TourContext } from '../context/TourContext';

function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFDA32',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        zIndex: 1, // Đảm bảo nút nổi lên trên slider
        right: '10px', // Căn chỉnh vị trí
        cursor: 'pointer',
        boxShadow: "0 0 3px rgba(236, 214, 115, 0.8),  0 0 10px rgba(224, 217, 108, 0.6), 0 0 20px rgba(230, 206, 73, 0.19)",
    }}
      onClick={onClick}
    >
      <SlArrowRightCircle size={24} color='black' />
    </div>
  );
}

function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFDA32',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        zIndex: 1,
        left: '10px', // Căn chỉnh vị trí
        cursor: 'pointer',
        boxShadow: "0 0 3px rgba(236, 214, 115, 0.8),  0 0 10px rgba(224, 217, 108, 0.6), 0 0 20px rgba(230, 206, 73, 0.19)",
      }}
      onClick={onClick}
    >
      <SlArrowLeftCircle size={24} color='black' />
    </div>
  );
}

function Touroutstanding(props) {
  const settings = {
    className: 'center',
    infinite: true,
    centerPadding: '20px', // Giảm padding để tận dụng không gian
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: true,
    swipeToSlide: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1400, // $breakpoint-xxl
        settings: {
          slidesToShow: 4,
          centerPadding: '10px',
        },
      },
      {
        breakpoint: 1200, // $breakpoint-xl
        settings: {
          slidesToShow: 3,
          centerPadding: '10px',
        },
      },
      {
        breakpoint: 768, // $breakpoint-md
        settings: {
          slidesToShow: 2,
          centerPadding: '10px',
        },
      },
      {
        breakpoint: 576, // $breakpoint-sm
        settings: {
          slidesToShow: 1,
          centerPadding: '0px',
        },
      },
    ],
  };

  // const { getTourOutstanding } = useContext(TourContext);
  const {tours, loading, error, onChangeFavoriteTour} = props;
  console.log('Tours outstanding:', tours);
  if (loading) return <div className='loading'>Đang tải...</div>;
  if (error) return <div className='error'>Lỗi: {error.message}</div>;

  return (
    <div className='TourOutStanding_container'>
      <h1 className="title">Điểm đến nổi bật</h1>
      <p className="description">
        Trải nghiệm du lịch đẳng cấp với những tour được thiết kế chuyên nghiệp, hướng dẫn viên tận tâm và dịch vụ trọn gói. Hãy chọn ngay điểm đến yêu thích của bạn!
      </p>
      <Slider {...settings}>
        {tours.map((tour) => (
          <div key={tour.id} style={{ padding: '0 10px' }}>
            <TourCard  {...tour} className='Tourout' onFavoriteChange={onChangeFavoriteTour}/>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default Touroutstanding;