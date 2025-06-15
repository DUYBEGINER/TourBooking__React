import React, { useContext, useState, useEffect } from 'react';
import FormInput from '../../components/Common/FormInput/FormInput';
import AuthBase from '../../components/Common/Auth/AuthBase';
import authInputs from '../../utils/AuthInput';
import { AuthContext } from '../../context/AuthContext';

function Register() {
  const { regist } = useContext(AuthContext);

  const [values, setValues] = useState({
    username: '',
    phone: '',
    email: '',
    birthday: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showError, setShowError] = useState(false); // Thêm trạng thái showError

  // Hàm tính tuổi từ ngày sinh
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Effect để tự động ẩn thông báo lỗi
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        setError(null); // Reset error after showing
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const onChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra mật khẩu xác nhận
    if (values.password !== values.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    // Kiểm tra tuổi
    if (values.birthday) {
      const age = calculateAge(values.birthday);
      if (age < 18) {
        setError("Bạn phải trên 18 tuổi để đăng ký!");
        return;
      }
    } else {
      setError("Vui lòng nhập ngày sinh!");
      return;
    }

    try {
      //Reset lại các state
      setError(null);
      setErrorCode(null);
      await regist(values.username, values.email, values.password, values.phone, values.birthday);
      setSuccess("Đăng ký thành công! Chuyển hướng về trang chủ.");
      // setValues({ username: '', phone: '', email: '', password: '', confirmPassword: '' });
    } catch (error) {
      setSuccess(null);
      setErrorCode(error.code);
      setError(error.message);
      console.error("Đăng ký thất bại:", error);
    }
  };

  return (
    <AuthBase
      isRegister={true}
      error={error}
      errorCode={errorCode}
      success={success}
      handleSubmit={handleSubmit}
      showError={showError} // Truyền trạng thái showError vào AuthBase
    >
      {/* Form inputs specific to register */}
      {authInputs.register.map(input => (
        <FormInput
          key={input.id}
          {...input}
          value={values[input.name]}
          onChange={onChange}
          valueconfirm={input.name === "confirmPassword" ? values.password : ""}
        />
      ))}

      <button type="submit" className="btn--submit">Đăng ký</button>
    </AuthBase>
  );
}

export default Register;
