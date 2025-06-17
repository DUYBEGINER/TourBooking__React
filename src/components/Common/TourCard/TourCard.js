import React, {useState, useContext} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCar, faUsers, faHeart } from "@fortawesome/free-solid-svg-icons";
import { FaCalendarAlt } from "react-icons/fa";
import {formatDate} from "../../../feature/formatDate";
import { API_URL } from "../../../utils/API_Port";
import "./TourCard.scss";
import { useNavigate } from 'react-router';
import {addFavoriteTour, deleteFavoriteTour} from '../../../api/favoriteTourAPI';
import generateId from '../../../feature/GenerateId';
import {AuthContext} from '../../../context/AuthContext';

function TourCard(props) {
    const { onFavoriteChange } = props;
    const { user } = useContext(AuthContext);
    // const [tourFavorite, setTourFavorite] = useState(false);
    const { tour_id, fav_id } = props;
    // const [isFavorite, setIsFavorite] = React.useState(is_favorite || false);
    const isFavorite = props.is_favorite;
    // const [currentFavId, setCurrentFavId] = React.useState(fav_id || null);
    const navigate = useNavigate();    
    
    const handleToggleFavorite = async () => {
        try {
            if (!user) {
                console.log("User is not logged in. Redirecting to login page...");
                navigate('/login', { state: { returnUrl: '/tourFavourite' } });
                return;
            }

            if (isFavorite) {
                // Xóa tour khỏi danh sách yêu thích
                await deleteFavoriteTour(fav_id);
                // setIsFavorite(false);
                // setCurrentFavId(null);
                console.log("Tour removed from favorites");
            } else {
                // Thêm tour vào danh sách yêu thích
                const newFavId = generateId();
                await addFavoriteTour(newFavId, user.id, tour_id);
                // setIsFavorite(true);
                // setCurrentFavId(newFavId);
                console.log("Tour added to favorites");
            }
           
            // Gọi callback để cập nhật danh sách tour yêu thích
            if (onFavoriteChange) {
                onFavoriteChange();
            }
        } catch (error) {
        console.error("Error toggling favorite status:", error);
        }
  };

    const handleBooking = () => {
        // Truyền id qua query parameter
        console.log("click đặt tour")
        const tourId = props.tour_id; // Giả định props có id, nếu không cần điều chỉnh
        // window.location.href = `/booking?id=${tourId}`;
        navigate(`/booking?id=${tourId}`);
    };

    const adultPrice = Number(props.price).toLocaleString('vi-VN');

    // console.log(props.prices);
    return (
        <div className="tour-card" >
            <div className="tour-card__image-container">
                {/* Biểu tượng khuyến mãi
                <div className="tour-card__discount">-20%</div> */}
                {/* Nút yêu thích */}
                <button className={`tour-card__favorite ${isFavorite ? "filled" : ""}`} onClick={handleToggleFavorite}>
                    <FontAwesomeIcon icon={faHeart} />
                </button>

                {/* Hình ảnh */}
                <img
                    src={`${API_URL}/${props.cover_image}`}
                    alt="Tour"
                    className="tour-card__img"
                />
            </div>

            <div className="tour-card__info">
                <h3 className="tour-card__name">{props.name}</h3>
                <ul className="tour-card__details">
                    <li>
                        <p>
                            <FontAwesomeIcon icon={faClock} /> Thời lượng: {props.duration} ngày {props.duration - 1} đêm
                        </p>
                    </li>
                    <li>
                        <p>
                            <FontAwesomeIcon icon={faCar} /> Phương tiện: {props.transport}
                        </p>
                    </li>
                    <li>
                        <p>
                            <FontAwesomeIcon icon={faUsers} /> Chỗ còn trống: {props.max_guests - props.booked_slots}/{props.max_guests}
                        </p>
                    </li>
                    <li>
                        <p>
                            <FaCalendarAlt /> Ngày khởi hành: {formatDate(props.start_date)}
                        </p>
                    </li>
                </ul>
                <div className="tour-card__footer">
                    <div className="tour-card__footer__price-container">
                        <p>Giá từ:</p>
                        <p id="price">{adultPrice} đ</p>
                    </div>
                    <button className="book-btn" onClick={() => handleBooking()}>Đặt ngay</button>
                </div>
            </div>
        </div>
    );
}

export default TourCard;