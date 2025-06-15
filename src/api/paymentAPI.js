import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Tạo URL thanh toán VNPay
export const createPaymentUrl = async (paymentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/payment/create-payment-url`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Error creating payment URL:', error);
    throw error.response?.data || { message: 'Lỗi tạo URL thanh toán' };
  }
};

// Tạo thanh toán MoMo
export const createMoMoPayment = async (paymentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/payment/create-momo-payment`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Error creating MoMo payment:', error);
    throw error.response?.data || { message: 'Lỗi tạo thanh toán MoMo' };
  }
};

// Test MoMo payment status
export const testMoMoPaymentStatus = async (orderId, scenario = 'success') => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/payment/test-momo-status`, {
      orderId,
      scenario
    });
    return response.data;
  } catch (error) {
    console.error('Error testing MoMo payment status:', error);
    throw error.response?.data || { message: 'Lỗi test trạng thái thanh toán MoMo' };
  }
};

// Test MoMo config
export const testMoMoConfig = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/payment/test-momo-config`);
    return response.data;
  } catch (error) {
    console.error('Error testing MoMo config:', error);
    throw error.response?.data || { message: 'Lỗi kiểm tra cấu hình MoMo' };
  }
};

// Lấy thông tin payment
export const getPaymentInfo = async (orderId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/payment/payment-info/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting payment info:', error);
    throw error.response?.data || { message: 'Lỗi lấy thông tin thanh toán' };
  }
};

// Test VNPay config
export const testVNPayConfig = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/payment/test-config`);
    return response.data;
  } catch (error) {
    console.error('Error testing VNPay config:', error);
    throw error.response?.data || { message: 'Lỗi kiểm tra cấu hình VNPay' };
  }
};

// Format currency VND
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Validate payment data before submitting
export const validatePaymentData = (paymentData, paymentMethod = 'VNPAY') => {
  const errors = [];
  
  if (!paymentData.bookingId) {
    errors.push('Thiếu mã booking');
  }
  
  if (!paymentData.amount || paymentData.amount <= 0) {
    errors.push('Số tiền không hợp lệ');
  }
  
  if (!paymentData.customerInfo) {
    errors.push('Thiếu thông tin khách hàng');
  } else {
    if (!paymentData.customerInfo.name) {
      errors.push('Thiếu tên khách hàng');
    }
    if (!paymentData.customerInfo.email) {
      errors.push('Thiếu email khách hàng');
    }
    if (paymentMethod === 'MOMO' && !paymentData.customerInfo.phone) {
      errors.push('Thiếu số điện thoại cho thanh toán MoMo');
    }
  }
  
  if (!paymentData.tourInfo) {
    errors.push('Thiếu thông tin tour');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 