import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import SocialLogin from '../../../components/SocialLogin/SocialLogin';
import "../../../styles/pages/Auth.scss";
import Alert from 'react-bootstrap/Alert';

// Thành phần cơ sở cho trang đăng nhập/đăng ký
const AuthBase = ({
  isRegister,
  children,
  error,
  errorCode,
  success,
  handleSubmit,
  handleGoogleLogin, // Hàm xử lý đăng nhập bằng Google
}) => {

  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  // const clientID = process.env.GOOGLE_CLIENT_AUTH_ID;
  // console.log("Google Client ID:", clientID); // Log the client ID to verify it's being set correctly

  // Effect để xử lý hiển thị và tự động ẩn thông báo thành công
  useEffect(() => {
    console.log("AuthBase - error:", error, "errorCode:", errorCode); // Log chỉ khi error hoặc success thay đổi
    if (success) {
      setShowSuccess(true);
      // Tự động ẩn thông báo thành công sau 1 giây
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
    if (error) {
      setShowError(true);
      // Tự động ẩn thông báo lỗi sau 1 giây
      const timer = setTimeout(() => {
        setShowError(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="auth">
      <div className={`auth__container ${isRegister ? "" : "auth__container--login"} flex`}>
        <div className="auth__intro flex">
          <Link to="/" className="auth__home-link">Trở lại trang chủ</Link>
          <div className="auth__intro-content">
            <h1 className="auth__title">Chào mừng đến với </h1>
            <h2 className="auth__subtitle">Tour Guide</h2>
            <p className="auth__description">Chào mừng bạn đến với hệ thống đặt tour du lịch số 1 PTIT! Hãy khám phá những chuyến đi tuyệt vời và lên kế hoạch cho hành trình sắp tới của bạn ngay hôm nay!</p>
            <Link to={isRegister ? "/login" : "/register"} className="auth__switch-btn">
              {isRegister ? "Đăng nhập" : "Đăng ký"}
            </Link>
          </div>
          <img src="/illus_Login_Regis.png" alt="Illustration" className="auth__illustration" />
        </div>

        <div className={`auth__form-container ${isRegister ? "auth__form-container--register" : "auth__form-container--login"} flex`}>
          <div className="auth__header">
            <img src="./logo.png" alt="Logo" className="auth__logo" />
            <h2 className="auth__heading">{isRegister ? "Đăng ký" : "Đăng nhập"}</h2>
            {showError && error && (
              <Alert variant="danger" className="auth__alert ">
                <Alert.Heading>{errorCode}</Alert.Heading>
                <p>{error}</p>
              </Alert>
            )}
            {showSuccess && success && (
              <Alert variant="success" className="auth__alert ">{success}</Alert>
            )}
          </div>

          <form onSubmit={handleSubmit} className="auth__form grid" autoComplete="on">
            {children}
            {!isRegister && (
              <>
                <span className="auth__separator">Hoặc</span>
                <SocialLogin handleGoogleSignIn={handleGoogleLogin} />
              </>
            )}
            <div className="auth__switch-message">
              {isRegister
                ? <p>Đã có tài khoản? <Link to="/login"><span className="auth__link">Đăng nhập ngay</span></Link></p>
                : <p>Chưa có tài khoản? <Link to="/register"><span className="auth__link">Đăng kí ngay</span></Link></p>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthBase; 