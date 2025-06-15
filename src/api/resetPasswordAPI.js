import axios from 'axios';
import { API_URL } from '../utils/API_Port';

export const sendOTP = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/reset-password`, { email });
        return response.data;
    } catch (error) {
        console.error("Error sending OTP:", error);
        throw error;
    }
};

export const verifyOTP = async (email, otp) => {
    try {
        const response = await axios.post(`${API_URL}/reset-password/verify`, { email, otp });
        return response.data;
    } catch (error) {
        console.error("Error verifying OTP:", error);
        throw error;
    }
};

export const resetPassword = async (email, newPassword) => {
    try {
        const response = await axios.post(`${API_URL}/reset-password/reset`, { email, newPassword });
        return response.data;
    } catch (error) {
        console.error("Error resetting password:", error);
        throw error;
    }
}