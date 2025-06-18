const { sql, getPool } = require("../config/db");
const express = require('express');

const getHistoryBooking = async (req, res) => {
    let transaction;
    try {
        const { customer_id } = req.query; // Lấy tham số từ query string
        const pool = await getPool();
        transaction = pool.transaction();
        await transaction.begin();

        let query = `
           SELECT 
                b.booking_id, 
                b.tour_id, 
                b.cus_id, 
                b.booking_date, 
                b.status, 
                b.total_price,
                t.name AS tour_name,
                t.start_date,
                t.duration,
                t.departure_location,
                t.end_date,
                (SELECT TOP 1 image_url 
                    FROM Tour_image ti 
                    WHERE ti.tour_id = t.tour_id 
                    ORDER BY image_id ASC
                ) AS cover_image,
                SUM(bd.quantity) AS number_of_guests
            FROM Booking b
            JOIN Tour t ON b.tour_id = t.tour_id
            LEFT JOIN Booking_Detail bd ON bd.booking_id = b.booking_id
            WHERE b.cus_id = @customer_id
            GROUP BY 
                b.booking_id, 
                b.tour_id, 
                b.cus_id,
                b.total_price, 
                b.booking_date, 
                b.status, 
                t.name,
                t.tour_id,
                t.start_date,
                t.duration,
                t.departure_location,
                t.end_date
            ORDER BY b.booking_date DESC
        `;
        
        const request = transaction.request();
        request.input("customer_id", sql.NVarChar, customer_id);

        const result = await request.query(query);
        
        await transaction.commit();
        return res.status(200).json(result.recordset);
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        console.error("Error fetching booking history:", error.message);
        return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
}

const getHistoryBookingById = async (req, res) => {
    try {
        const booking_id = req.params.id; // Lấy booking_id từ params
        console.log("Booking ID:", booking_id);
        const pool = await getPool();
        const result = await pool.request()
            .input("booking_id", sql.NVarChar, booking_id)
            .query(`
                SELECT * FROM Booking_Detail pd
                WHERE booking_id = @booking_id
            `);
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy thông tin booking" });
        }

        const promotion = await pool.request()
            .input("booking_id", sql.NVarChar, booking_id)
            .query(`
               SELECT pb.promo_id,
                      p.discount_percentage
                FROM Booking_Promotion pb
                JOIN Booking b ON b.booking_id = pb.booking_id
                JOIN Promotion p ON pb.promo_id = p.promo_id
                WHERE b.booking_id = @booking_id
            `);
        
        var realTotalPrice = 0;
        //% giảm giá
        var discount_percentage = 0;
        if (promotion.recordset.length > 0) {
            discount_percentage = promotion.recordset[0].discount_percentage;
        }

        //Tính tổng giá tiền thực tế:
        result.recordset.forEach((row) => {
            realTotalPrice += row.price_per_person * row.quantity;
        });

        // Tính discount dựa trên % giảm giá và tổng giá tiền thực tế
        const discount = promotion.recordset.length > 0 ? (discount_percentage/100) * realTotalPrice : 0;
         
        //Nhóm thông tin booking theo age_group
        const bookingDetail = {
            voucher: discount, //Thông tin voucher đã giảm
            adultPrice: {
                quantity: 0,
                total_price: 0
            },
            childPrice: {
                quantity: 0,
                total_price: 0
            },
            infantPrice: {
                quantity: 0,
                total_price: 0
            }
        }
        result.recordset.forEach((row) => {
            bookingDetail[row.age_group] = {
                quantity: row.quantity,
                total_price: row.price_per_person * row.quantity
            };
        });

        return res.status(200).json(bookingDetail);
    } catch (error) {
        console.error("Error fetching booking details:", error.message);
        return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
}

module.exports = {
    getHistoryBooking,
    getHistoryBookingById
};