// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser, logoutUser, getUserData } from "../api/authAPI";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  console.log("AuthProvider render")
  // const [token, setToken] = useState();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Hàm kiểm tra và điều hướng theo role
  const checkRole = (role, currentPath) => {
    console.log("🔄 checkRole called:", { role, currentPath });
    
    // Tránh redirect loop: Không điều hướng nếu đã ở đúng trang hoặc ở trang InforUser
    const roleRoutes = {
      customer: "/",
      Support: "/support",
      Sales: "/businessemployee/customer",
      Admin: "/admin/dashboard",
    };
    
    // Các trang không cần chuyển hướng về trang chính của role
    const exemptPages = ["/thongtin", '/booking', '/payment'];
    
    // Nếu đang ở trang được miễn trừ (như trang thông tin cá nhân), không chuyển hướng
    const isExemptPage = exemptPages.some(page => currentPath.includes(page));
    console.log("🚫 Exempt page check:", { currentPath, exemptPages, isExemptPage });
    
    if (isExemptPage) {
      console.log("✅ Page is exempt, no redirect needed");
      return;
    }
    
    const targetRoute = roleRoutes[role];
    console.log("🎯 Checking redirect:", { targetRoute, currentPath });
    
    if (targetRoute && currentPath !== targetRoute) {
        console.log("🔀 Redirecting from", currentPath, "to", targetRoute);
        navigate(targetRoute, { replace: true });
    } else {
        console.log("⚡ No redirect needed");
    }
  };

//   // Trong AuthContext.js
// const fetchUser = async () => {
//   try {
//     const response = await getUserData(token);
//     const userData = response.user;   
//     console.log("userData: ", userData)
//     return userData;
//   } catch (error) {
//     throw error;
//   }
// };

  //Kiểm tra token và gửi request đến server để lấy thông tin user  
  // Kiểm tra token khi khởi động
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      // const token = localStorage.getItem("token");
      try {
        console.log('Gọi getUserData...');
        // const decoded = jwtDecode(token);
        const data = await getUserData();
        if (data) {
          console.log('Dữ liệu người dùng:', data.user);
          setUser(data.user);
          checkRole(data.user.role, window.location.pathname);
          } else {
            console.log('Không có token, đặt user là null');
            setUser(null); // Đặt user là null nếu không có data (không có token)
          }
        } catch (error) {
          console.error("Token không hợp lệ:", error);
          // localStorage.removeItem("token");
          setUser(null);
        }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  // Hàm làm mới thông tin người dùng từ server
  const refreshUserData = async () => {
    setLoading(true);
    try {
      const userData = await getUserData();
      setUser(userData.user);
      return userData;
    } catch (error) {
      console.error("Lỗi khi làm mới thông tin người dùng:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý đăng nhập/đăng ký (tái sử dụng logic)
  const authenticateUser = async (apiCall, ...args) => {
   setLoading(true);
    try {
      const data = await apiCall(...args);
      console.log("data: ", data)
      // localStorage.setItem("token", data.token);
      const userData = data.user
      // const userData = data.user;
      setUser(userData);
      checkRole(userData.role, window.location.pathname);
      return userData;
    } catch (error) {
      throw new Error(error.message || 'Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    return authenticateUser(loginUser, email, password);
  };

  const regist = async (fullname, email, password, phone, date_of_birth) => {
    return authenticateUser(registerUser, fullname, email, password, phone, date_of_birth );
  };


  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      console.log('Logout success');
      navigate('/login');
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
    } finally {
      setLoading(false);
    }
  };


  // Sử dụng useMemo để tránh tạo object mới
  const contextValue = useMemo(() => ({
    user,
    loading,
    login,
    regist,
    logout,
    refreshUserData
  }), [user, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};