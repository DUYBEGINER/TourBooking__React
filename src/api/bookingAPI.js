import { API_URL } from '../utils/API_Port';

// Tạo booking mới
export const createBooking = async (tourId, cusId) => {
    try {
        const response = await fetch(`${API_URL}/api/booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                tour_id: tourId,
                cus_id: cusId
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Lỗi khi tạo booking');
        }

        return data;
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
};

// Tạo booking details
export const createBookingDetail = async (bookingId, tourId, bookingDetails) => {
    try {
        const response = await fetch(`${API_URL}/api/booking/details`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                booking_id: bookingId,
                tour_id: tourId,
                booking_details: bookingDetails
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Lỗi khi tạo booking details');
        }

        return data;
    } catch (error) {
        console.error('Error creating booking details:', error);
        throw error;
    }
};

// Lấy thông tin booking
export const getBooking = async (bookingId) => {
    try {
        const response = await fetch(`${API_URL}/api/booking/${bookingId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Lỗi khi lấy thông tin booking');
        }

        return data;
    } catch (error) {
        console.error('Error getting booking:', error);
        throw error;
    }
}; 