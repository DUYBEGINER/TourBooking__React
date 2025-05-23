import axios from "axios";
import { API_URL } from "../utils/API_Port";


// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/login`,
      { email, password },
      { withCredentials: true } // Đảm bảo gửi cookie
    );
    return response.data;
  } catch (error) {
    // Lấy mã lỗi và thông báo từ response
    if (error.response && error.response.data) {
      const err = new Error(error.response.data.message || 'Có lỗi xảy ra khi đăng nhập');
      err.code = error.response.data.code || 'UNKNOWN_ERROR';
      throw err;
    } else {
      const err = new Error('Không thể kết nối đến máy chủ');
      err.code = 'NETWORK_ERROR';
      throw err;
    }
  }
};

// Register new user
export const registerUser = async (fullname, email, password, phone) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      fullname,
      email,
      password,
      phone,
    },
    { withCredentials: true }
  );
    return response.data;
  } catch (error) {
    // Lấy mã lỗi và thông báo từ response
    if (error.response && error.response.data) {
      const err = new Error(error.response.data.message || 'Có lỗi xảy ra khi đăng ký');
      err.code = error.response.data.code || 'UNKNOWN_ERROR';
      throw err;
    } else {
      const err = new Error('Không thể kết nối đến máy chủ');
      err.code = 'NETWORK_ERROR';
      throw err;
    }
  }
};


export const logoutUser = async () => {
  try {
    const response = await axios.post(`${API_URL}/auth/logout`, {}, {
      withCredentials: true, // Đảm bảo gửi cookie
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Get user info
export const getUserData = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/user`, {
      withCredentials: true, // Đảm bảo gửi cookie
    });
    console.log("response.data: ", response.data)
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
        console.log("Không có token hoặc token không hợp lệ, trả về null");
        return null; // Trả về null nếu 401 (không có token)
      }
      throw error; // Ném lỗi nếu là lỗi khác (ví dụ: 500)
  }
}


// Other auth-related API calls can be added here 