// src/api/adminAPI.js
import axios from "axios";
import { API_URL } from "../utils/API_Port"; // Có thể lưu vào .env

// Lấy số liệu tổng quan
export const getOverviewStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/overview`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi lấy số liệu tổng quan");
  }
};

// Lấy số liệu chi nhánh
export const getBranchStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/branches`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi lấy số liệu chi nhánh");
  }
};

// Lấy dữ liệu biểu đồ (6 tháng gần nhất)
export const getChartData = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/chart`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi lấy dữ liệu biểu đồ");
  }
};

// Lấy giao dịch gần nhất
export const getTransactions = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/transactions`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi lấy giao dịch gần đây");
  }
};

// Lấy danh sách nhân viên
// export const getEmployees = async () => {
//   try {
//     const response = await axios.get(`${API_URL}/api/admin/employeeFilter`);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.message || "Lỗi khi lấy danh sách nhân viên");
//   }
// };
// Lấy danh sách nhân viên theo điều kiện
export const getEmployees = async ({page = 1, pageSize = 10 }) => {
  const res = await axios.get(`${API_URL}/api/admin/employeeFilter`, {
    params: { page, pageSize }
  });
  return res.data;
};
//// Lấy danh sách tour theo điều kiện
export const getTour = async ({ status = "active", page = 1, pageSize = 10 }) => {
  const res = await axios.get(`${API_URL}/api/admin/tours`, {
    params: { page, pageSize }
  });
  return res.data;
};
// Duyệt tour
export const approveTour = async (tourId) => {
  return axios.put(`${API_URL}/api/admin/tours/${tourId}/approve`);
};

// Từ chối duyệt tour
export const rejectTour = async (tourId) => {
  return axios.put(`${API_URL}/api/admin/tours/${tourId}/reject`);
};

// Khóa nhân viên
export const lockEmployees = async (ids) => {
  const res = await axios.put(
    `${API_URL}/api/admin/employees/lock`,
    { ids }
  );
  return res.data;
};

// Mở khoá tài khoản nhân viên
export const unlockEmployee = async (ids) => {
  const res = await axios.put(
    `${API_URL}/api/admin/employees/unlock`,
    { ids }
  );
  return res.data;
};

// Thêm chi nhánh mới
export const addBranch = async ({ branch_name, phone, address }) => {
  const res = await axios.post(`${API_URL}/api/admin/branches`, {
    branch_name,
    phone,
    address,
  });
  return res.data;
};

export const getBranchDetail = async (id, year = new Date().getFullYear()) => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/branches/${id}`, {
      params: { year }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi lấy chi tiết chi nhánh");
  }
};

export const getEmployeeById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/employees/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi lấy thông tin nhân viên");
  }
};

// Cập nhật thông tin nhân viên
export const updateEmployee = async (id, data) => {
  try {
    const res = await axios.put(`${API_URL}/api/admin/employees/update/${id}`, data);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin nhân viên');
  }
};

// Lấy tất cả chi nhánh
export const getAllBranches = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/getBranch`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách chi nhánh');
  }
};

// Cập nhật trạng thái tour tự động
export const updateTourStatus = async () => {
  try {
    const response = await axios.put(`${API_URL}/api/admin/tours/update-status`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi cập nhật trạng thái tour");
  }
};
