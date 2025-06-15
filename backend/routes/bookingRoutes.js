const express = require('express');
const router = express.Router();
const { createBooking, createBookingDetail, getBooking } = require('../controller/bookingController');

// POST /api/booking - Tạo booking mới
router.post('/', createBooking);

// POST /api/booking/details - Tạo booking details
router.post('/details', createBookingDetail);

// GET /api/booking/:booking_id - Lấy thông tin booking
router.get('/:booking_id', getBooking);

module.exports = router; 