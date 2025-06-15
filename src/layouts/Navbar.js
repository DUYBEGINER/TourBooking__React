import React, { useState, useEffect} from 'react';
import { Link } from "react-router-dom";
import "../styles/layouts/Navbar.scss";
import { FaBars, FaTimes} from "react-icons/fa";
import UserAvatar from '../components/Common/UserAvatar/UserAvatar';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLocation } from "react-router-dom";
import { API_URL } from '../utils/API_Port';
import { FaRegUserCircle } from "react-icons/fa";
import { LuHistory } from "react-icons/lu";
import { TbLogout2 } from "react-icons/tb";
import { FaHistory } from "react-icons/fa";
import Spinner from 'react-bootstrap/Spinner';

function Navbar({ pageRef }) {
    const { user, loading, logout } = useContext(AuthContext);
    console.log("Navbar user:", user);
    // State to manage the open/close state of the navbar (mobile view)
    const [isOpen, setIsOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(false);
    // Kiểm tra xem có phải trang chủ không, nếu không thì sẽ áp dung style not-home
    const location = useLocation();
    const isHomePage = location.pathname === "/";
    
    const[isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
    // Function to handle scroll event and change navbar style
        const handleScroll = () => {
           if (pageRef?.current) {
                // Kiểm tra vị trí cuộn của .bookingPage
                if (pageRef.current.scrollTop > 0) {
                    setIsScrolled(true);
                } else {
                    setIsScrolled(false);
                }
            } else {
                // Dự phòng cho các trang khác sử dụng window.scrollY
                if (window.scrollY > 0) {
                setIsScrolled(true);
                } else {
                setIsScrolled(false);
                }
      }
        };
        // Thêm sự kiện cuộn cho .bookingPage hoặc window
        const scrollElement = pageRef?.current || window;
        scrollElement.addEventListener("scroll", handleScroll);
        
        return () => {
            window.removeEventListener("scroll", handleScroll);
        }
    },[pageRef]);


    return (
        <div className={`navbar ${isScrolled ? "scrolled" : ""} ${!isHomePage ? "not-home" : ""}`}>
            <div className="navbar-content">
                <h1 className="logo"><Link to="/">Tour Guide</Link></h1>
                <ul className={`nav-links ${isOpen ? "active" : ""}`}>
                    <li className="btn--close" onClick={() => setIsOpen(!isOpen)}><FaTimes /></li>
                    <li><Link to="/about-us">Về công ty</Link></li>
                    <li><Link to="/contact">Liên hệ</Link></li>
                    <li><Link to="/tourFavorite">Tour Yêu thích</Link></li>
                    {!user && loading ? (
                        <li className="auth-loading">
                            <Spinner animation="border" size="sm" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </Spinner>
                        </li>
                    ) : !user ? (
                        <>
                            <li><Link to="/register" className="btn btn--signup">Đăng kí</Link></li>
                            <li><Link to="/login" className="btn btn--login">Đăng nhập</Link></li>
                        </>
                    ) : (
                        <>
                            <li onClick={() => setOpenDropdown(!openDropdown)}>
                                    <UserAvatar name={user.name} image={user.avatar} size="50px"/>
                            </li>
                            {/* Dropdown menu for user actions */}
                            <div className={`nav_dropdown ${openDropdown ? "active" : ""}`}>
                                <ul className="list_page">
                                    <li>
                                        <Link to="/thongtin">
                                            <div className="menu-item"><FaRegUserCircle size={25}/>Thông tin cá nhân</div>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/historyBooking"><div className="menu-item"><LuHistory size={25}/> Lịch sử đặt tour</div></Link>
                                    </li>
                                    <hr style={{ margin: "5px 0" }}></hr>
                                    <li>
                                        <Link onClick={logout}><div className="menu-item logout"><TbLogout2 size={25}/> Đăng xuất</div></Link>
                                    </li>
                                </ul>
                            </div>
                        </>
                    )}
                    
                </ul>
                
                <div className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <FaTimes /> : <FaBars />}
                </div>
            </div>
        </div>
    );
}

export default Navbar;
