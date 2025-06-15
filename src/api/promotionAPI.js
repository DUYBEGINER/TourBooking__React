import axios from 'axios';
import { API_URL } from '../utils/API_Port';

export const getPromotionList = async (filters = {}) => {
    try {
        const response = await axios.get(`${API_URL}/promotions`, { 
            params: filters,    // Gửi status, code, promo_name, v.v.
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching promotions:", error);
        throw error;
    }
};


export const createPromotion = async (promotionData) => {
    try {
        const response = await axios.post(`${API_URL}/promotions`, promotionData);
        return response.data;
    } catch (error) {
        console.error("Error creating promotion:", error);
        throw error;
    }
}

export const updatePromotion = async (promotionId, promotionData) => {
    try {
        const response = await axios.put(`${API_URL}/promotions/update/${promotionId}`, promotionData);
        return response.data;
        
    } catch (error) {
        console.error("Error updating promotion:", error);
        throw error;
    }
}

export const blockPromotion = async (promotionId) => {
    try {
        const response = await axios.put(`${API_URL}/promotions/block/${promotionId}`);
        return response.data;
    } catch (error) {
        console.error("Error blocking promotion:", error);
        throw error;
    }
}

export const blockBatchPromotion = async (promotionIds) => {
    try {
        const response = await axios.put(`${API_URL}/promotions/block_batch`, { ids: promotionIds });
        return response.data;
    } catch (error) {
        console.error("Error blocking promotions:", error);
        throw error;
    }
}

// Kiểm tra mã giảm giá
export const checkPromotionCode = async (code) => {
  try {
    const response = await axios.get(`${API_URL}/promotions/check/${code}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Lỗi khi kiểm tra mã giảm giá');
  }
};

// Áp dụng mã giảm giá cho booking
export const applyPromotionToBooking = async (bookingId, promoId) => {
  try {
    const response = await axios.post(`${API_URL}/promotions/apply`, {
      booking_id: bookingId,
      promo_id: promoId
    }, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Lỗi khi áp dụng mã giảm giá');
  }
};


