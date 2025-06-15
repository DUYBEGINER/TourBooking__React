const { sql, getPool } = require('../config/db');
const moment = require('moment-timezone');

// Hàm sinh booking_id ngẫu nhiên
const generateBookingId = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK${timestamp}${random}`;
};

// Hàm sinh book_detail_id ngẫu nhiên
const generateBookDetailId = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BD${timestamp}${random}`;
};

// Tạo booking mới
const createBooking = async (req, res) => {
    try {
        const { tour_id, cus_id } = req.body;

        if (!tour_id || !cus_id) {
            return res.status(400).json({
                success: false,
                message: 'tour_id và cus_id là bắt buộc'
            });
        }

        const pool = await getPool();
        const booking_id = generateBookingId();

        // Kiểm tra customer có tồn tại không
        const customerCheck = await pool.request()
            .input('cus_id', sql.VarChar(20), cus_id)
            .query('SELECT cus_id FROM Customer WHERE cus_id = @cus_id');

        if (customerCheck.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Customer không tồn tại'
            });
        }

        // Kiểm tra tour có tồn tại không
        const tourCheck = await pool.request()
            .input('tour_id', sql.VarChar(20), tour_id)
            .query('SELECT tour_id FROM Tour WHERE tour_id = @tour_id');

        if (tourCheck.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tour không tồn tại'
            });
        }

        const bookingDate = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');

        // Tạo booking mới
        await pool.request()
            .input('booking_id', sql.VarChar(20), booking_id)
            .input('cus_id', sql.VarChar(20), cus_id)
            .input('tour_id', sql.VarChar(20), tour_id)
            .input('booking_date', sql.DateTime, bookingDate)
            .query(`
                INSERT INTO Booking (booking_id, cus_id, tour_id, booking_date, total_price, status)
                VALUES (@booking_id, @cus_id, @tour_id, @booking_date, 0.0, 'pending')
            `);

        res.status(201).json({
            success: true,
            message: 'Booking đã được tạo thành công',
            booking_id: booking_id
        });

    } catch (error) {
        console.error('Lỗi tạo booking:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tạo booking',
            error: error.message
        });
    }
};

// Tạo booking detail
const createBookingDetail = async (req, res) => {
    try {
        const { booking_id, tour_id, booking_details } = req.body;

        if (!booking_id || !tour_id || !booking_details || !Array.isArray(booking_details)) {
            return res.status(400).json({
                success: false,
                message: 'booking_id, tour_id và booking_details (array) là bắt buộc'
            });
        }

        const pool = await getPool();

        // Kiểm tra booking có tồn tại không
        const bookingCheck = await pool.request()
            .input('booking_id', sql.VarChar(20), booking_id)
            .query('SELECT booking_id FROM Booking WHERE booking_id = @booking_id');

        if (bookingCheck.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking không tồn tại'
            });
        }

        let total_price = 0;
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();

            // Xóa các booking detail cũ nếu có
            await transaction.request()
                .input('booking_id', sql.VarChar(20), booking_id)
                .query('DELETE FROM Booking_Detail WHERE booking_id = @booking_id');

            // Thêm từng booking detail
            for (const detail of booking_details) {
                const { age_group, quantity, price_per_person } = detail;

                if (!age_group || quantity <= 0 || price_per_person < 0) {
                    throw new Error(`Thông tin booking detail không hợp lệ cho nhóm tuổi: ${age_group}`);
                }

                const book_detail_id = generateBookDetailId();
                const subtotal = quantity * price_per_person;
                total_price += subtotal;

                await transaction.request()
                    .input('book_detail_id', sql.VarChar(20), book_detail_id)
                    .input('booking_id', sql.VarChar(20), booking_id)
                    .input('tour_id', sql.VarChar(20), tour_id)
                    .input('age_group', sql.VarChar(20), age_group)
                    .input('quantity', sql.Int, quantity)
                    .input('price_per_person', sql.Decimal(15, 2), price_per_person)
                    .query(`
                        INSERT INTO Booking_Detail (book_detail_id, booking_id, tour_id, age_group, quantity, price_per_person)
                        VALUES (@book_detail_id, @booking_id, @tour_id, @age_group, @quantity, @price_per_person)
                    `);
            }

            // Cập nhật tổng giá tiền trong bảng Booking
            await transaction.request()
                .input('booking_id', sql.VarChar(20), booking_id)
                .input('total_price', sql.Decimal(15, 2), total_price)
                .query('UPDATE Booking SET total_price = @total_price WHERE booking_id = @booking_id');

            await transaction.commit();

            res.status(201).json({
                success: true,
                message: 'Booking details đã được tạo thành công',
                booking_id: booking_id,
                total_price: total_price
            });

        } catch (transactionError) {
            await transaction.rollback();
            throw transactionError;
        }

    } catch (error) {
        console.error('Lỗi tạo booking detail:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tạo booking detail',
            error: error.message
        });
    }
};

// Lấy thông tin booking
const getBooking = async (req, res) => {
    try {
        const { booking_id } = req.params;

        if (!booking_id) {
            return res.status(400).json({
                success: false,
                message: 'booking_id là bắt buộc'
            });
        }

        const pool = await getPool();

        // Lấy thông tin booking
        const bookingResult = await pool.request()
            .input('booking_id', sql.VarChar(20), booking_id)
            .query(`
                SELECT b.*, t.name as tour_name, c.name as customer_name, c.email as customer_email
                FROM Booking b
                LEFT JOIN Tour t ON b.tour_id = t.tour_id
                LEFT JOIN Customer c ON b.cus_id = c.cus_id
                WHERE b.booking_id = @booking_id
            `);

        if (bookingResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking không tồn tại'
            });
        }

        // Lấy booking details
        const detailsResult = await pool.request()
            .input('booking_id', sql.VarChar(20), booking_id)
            .query('SELECT * FROM Booking_Detail WHERE booking_id = @booking_id');

        res.status(200).json({
            success: true,
            booking: bookingResult.recordset[0],
            booking_details: detailsResult.recordset
        });

    } catch (error) {
        console.error('Lỗi lấy booking:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy booking',
            error: error.message
        });
    }
};

module.exports = {
    createBooking,
    createBookingDetail,
    getBooking
}; 