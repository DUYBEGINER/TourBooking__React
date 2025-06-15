import axios from "axios";
import { API_URL } from "../utils/API_Port";

export const getHistoryBooking = async (customer_id) => {
    try {
        const response = await axios.get(`${API_URL}/historyBooking/history`, {
            params: { customer_id }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching booking history:", error);
        throw error;
    }
};
