const { sql, getPool } = require("../config/db");
const express = require('express');

const getHistoryBooking = async (req, res) => {
    let transaction;
    try {
        const { customer_id } = req.query; // Lấy tham số từ query string

        if (!customer_id) {
            return res.status(400).json({ message: "customer_id is required" });
        }
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
                t.name AS tour_name,
                t.start_date,
                t.duration,
                t.departure_location,
                COALESCE(
                    (SELECT TOP 1 ti.image_url 
                     FROM Tour_image ti 
                     WHERE ti.tour_id = t.tour_id
                     ORDER BY ti.image_id),
                    'https://placehold.co/300x200?text=No+Image'
                ) AS image,
                SUM(bd.quantity * bd.price_per_person) AS total_price,
                SUM(bd.quantity) AS number_of_guests
            FROM Booking b
            JOIN Tour t ON b.tour_id = t.tour_id
            LEFT JOIN Booking_Detail bd ON bd.booking_id = b.booking_id
            WHERE b.cus_id = @customer_id
            GROUP BY 
                b.booking_id,
                b.tour_id,
                b.cus_id,
                b.booking_date,
                b.status,
                t.name,
                t.start_date,
                t.duration,
                t.departure_location,
                t.tour_id
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

module.exports = {
    getHistoryBooking
};