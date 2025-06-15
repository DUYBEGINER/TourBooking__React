// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, googleAuth, registerUser, logoutUser, getUserData } from "../api/authAPI";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // const [token, setToken] = useState();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  console.log("AuthProvider user: ", user)
  // Hàm kiểm tra và điều hướng theo role
  const checkRole = (role, currentPath) => {
    console.log("🔄 checkRole called:", { role, currentPath });
    
    // Tránh redirect loop: Không điều hướng nếu đã ở đúng trang hoặc ở trang InforUser
    const roleRoutes = {
      customer: "/",
      Support: "/consultantemployee/request-support",
      Sales: "/businessemployee/customer",
      Admin: "/admin/dashboard",
    };
    
    // Các trang không cần chuyển hướng về trang chính của role
    // const exemptPages = ["/thongtin", '/booking', '/payment'];
    // Các trang không cần chuyển hướng về trang chính của role khi reset
    const exemptPages = ["/thongtin",'/booking','/tourFavorite','/contact','/payment'];
    
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


  //Kiểm tra token và gửi request đến server để lấy thông tin user  
  // Kiểm tra token khi khởi động
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      // const token = localStorage.getItem("token");
      try {
        console.log('Gọi getUserData... in window.location.pathname: ', window.location.pathname);
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
    console.log('Gửi getUserData tại:', new Date().toISOString(), 'Cookies:', document.cookie);
    initializeAuth();
  }, []);

  // Hàm làm mới thông tin người dùng từ server
  const refreshUserData = async () => {
    setLoading(true);
    console.log("Làm mới thông tin người dùng từ server...");
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
      throw error
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    return authenticateUser(loginUser, email, password);
  };

  const regist = async (fullname, email, password, phone, birthday) => {
    return authenticateUser(registerUser, fullname, email, password, phone, birthday );
  };

  const loginWithGoogle = async (credentialResponse) => {
      return authenticateUser(googleAuth, credentialResponse);
  };

  const logout = async () => {
    setLoading(true);
    try {
      setUser(null);
      await logoutUser();
      localStorage.clear();
      sessionStorage.clear();
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
    loginWithGoogle,
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