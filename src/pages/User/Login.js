import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FormInput from '../../components/Common/FormInput/FormInput';
import AuthBase from '../../components/Common/Auth/AuthBase';
import authInputs from '../../utils/AuthInput';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

function Login() {
  const { login,  loginWithGoogle } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [success, setSuccess] = useState(null);
  // State để quản lý checkbox đồng ý với điều khoản
  const [isChecked, setIsChecked] = useState(false);

  // Lấy returnUrl và message từ state
  const returnUrl = location.state?.returnUrl;
  const loginMessage = location.state?.message;

  // Hiển thị thông báo từ returnUrl nếu có
  useEffect(() => {
    if (loginMessage) {
      setError(loginMessage);
    }
  }, [loginMessage]);

  console.log("error: ", error)
  const onChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  //Hàm xử lí đăng nhập google
  const handleGoogleLogin = async (credentialResponse) => {
    try{
      setError(null);
      setErrorCode(null);
      const user = await loginWithGoogle(credentialResponse.credential);
      console.log("Google login response:", user);
       //Reset lại các state
      setSuccess("Đăng nhập thành công!");
    }catch (error) {
      setSuccess(null);
      setErrorCode(error.code);
      setError(error.message);
      console.error("Google login error:", error);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isChecked) {
      alert("Vui lòng đồng ý với chính sách trước khi tiếp tục.");
      return;
    }

    try {
      //Reset lại các state
      setError(null);
      setErrorCode(null);
      const getUser = await login(values.email, values.password);
      console.log("getUser: ", getUser)
      setSuccess("Đăng nhập thành công!");
      
      // Chuyển hướng sau khi đăng nhập thành công
      setTimeout(() => {
        if (returnUrl) {
          // Nếu có returnUrl thì chuyển về đó
          navigate(returnUrl, { replace: true });
        } else {
          // Nếu không có returnUrl thì để AuthContext xử lý điều hướng theo role
          // (checkRole sẽ được gọi tự động trong AuthContext)
        }
      }, 1000); // Đợi 1 giây để hiển thị thông báo thành công
      
    } catch (error) {
      setSuccess(null);
      setErrorCode(error.code);
      setError(error.message);
      console.error("Login error:", error);
    }
  };

  return (
    <AuthBase
      isRegister={false}
      error={error}
      errorCode={errorCode}
      success={success}
      handleSubmit={handleSubmit}
      handleGoogleLogin={handleGoogleLogin}
    >
      {/* Form inputs specific to login */}
      {authInputs.login.map(input => (
        <FormInput
          key={input.id}
          {...input}
          value={values[input.name]}
          onChange={onChange}
        />
      ))}

      <div className="checkbox-container">
        <label>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
          />
          Đồng ý với điều khoản
        </label>
        <Link to="/forgot-password" className="forgotPassword">Quên mật khẩu</Link>
      </div>

      <button type="submit" className="btn--submit">Đăng nhập</button>
    </AuthBase>
  );
}

export default Login;
