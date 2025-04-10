import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import FormInput from '../../components/FormInput/FormInput';
import SocialLogin from '../../components/SocialLogin/SocialLogin';
import authInputs from './authInput';
import "../../styles/pages/Auth.scss";


function AuthForm({ mode }) {

    // useEffect(() => {
    //     document.body.style.overflow = "hidden"; // Ẩn thanh cuộn khi vào trang đăng nhập
    //     return () => {
    //         document.body.style.overflow = "auto"; };// Hiện lại thanh cuộn khi rời trang đăng nhập
    // },[]);

    const isRegister = mode === "register";

    const [values, setValues] = useState(
        isRegister
            ? { username: '', phone: '', email: '', password: '', confirmPassword: '' }
            : { email: '', password: '' }
    );

    const [showAlert, setShowAlert] = useState(false);
    const [isChecked, setIsChecked] = useState(false);


    const onChange = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isRegister) {
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
        } else if (!isChecked) {
            alert("Vui lòng đồng ý với chính sách trước khi tiếp tục.");
        }
    };

    return (
        <div className={`authPage ${isRegister ? "register" : ""}`}>
            <div className={`containerAuth ${isRegister ? "" : "login"} flex`}>
                <div className="introduceDiv flex">
                    <Link to="/">Trở lại trang chủ</Link>
                    <div className="introduceDiv--header">
                        <h1 className="title">Chào mừng đến với </h1>
                        <h2>Tour Guide</h2>
                        <p>Chào mừng bạn đến với hệ thống đặt tour du lịch số 1 PTIT! Hãy khám phá những chuyến đi tuyệt vời và lên kế hoạch cho hành trình sắp tới của bạn ngay hôm nay!</p>
                        <Link to={isRegister ? "/login" : "/register"} className="btn--switch">
                            {isRegister ? "Đăng nhập" : "Đăng ký"}
                        </Link>
                    </div>
                    <img src="/illus_Login_Regis.png" alt="Illustration" />
                </div>

                <div className={`formDiv ${isRegister ? "register" : "login"} flex`}>
                    <div className="header--AuthForm">
                        <img src="./logo.png" alt="Logo" />
                        <h2>{isRegister ? "Đăng ký" : "Đăng nhập"}</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form grid">
                        {showAlert && <span className="alert">Bạn đã đăng kí thành công</span>}
                        {authInputs[isRegister ? "register" : "login"].map(input => (
                            <FormInput key={input.id} {...input} value={values[input.name]} onChange={onChange} />
                        ))}

                        {isRegister ? null : (
                            <div className="checkbox-container">
                                <label>
                                    <input type="checkbox" checked={isChecked} onChange={() => setIsChecked(!isChecked)} />
                                    Đồng ý với điều khoản</label>
                                <a href="#" className="forgotPassword">Quên mật khẩu</a>
                            </div>
                        )}

                        <button type="submit" className="btn--submit">{isRegister ? "Đăng ký" : "Đăng nhập"}</button>

                        <span className="or">Hoặc</span>
                        <SocialLogin />
                        <div className="switch--auth">
                            {isRegister ? <p>Đã có tài khoản? <Link to="/login" ><span style={{ color: "#4461F2" }}>Đăng nhập ngay</span></Link></p> : <p>Chưa có tài khoản? <Link to="/register" ><span style={{ color: "#4461F2" }}>Đăng kí ngay</span></Link></p>}
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default AuthForm;