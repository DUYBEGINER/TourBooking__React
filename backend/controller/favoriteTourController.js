const {sql, getPool} = require("../config/db");

const getFavoriteTours = async (req, res) => {
    const cusId = req.params.id;
    console.log("Fetching favorite tours for customer ID:", cusId);
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input("cusId", sql.NVarChar, cusId)
            .query(`
                SELECT t.tour_id, t.name,t.destination, t.duration, t.start_date, t.max_guests, tp.price,
                (SELECT TOP 1 image_url 
                    FROM Tour_image ti 
                    WHERE ti.tour_id = t.tour_id 
                    ORDER BY image_id ASC
                ) AS cover_image,
                1 AS is_favorite,
                ft.fav_id
                FROM Favorite_Tour ft
                JOIN Tour t ON ft.tour_id = t.tour_id
                LEFT JOIN Tour_price tp ON t.tour_id = tp.tour_id AND tp.age_group = 'adultPrice' 
                WHERE ft.cus_id = @cusId AND t.status IN ('active', 'upcoming')
            `);
       res.json(result.recordset);
    } catch (error) {
        console.error("Error in getFavoriteTours:", error); // Log chi tiết lỗi
        res.status(500).json({ message: "Lỗi server", error });
    }    
};


const addFavoriteTour = async (req, res) => {
    const { fav_id, cusId, tourId } = req.body;
    console.log("Adding favourite tour:", fav_id, cusId, tourId);
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input("fav_id", sql.NVarChar, fav_id)
            .input("cusId", sql.NVarChar, cusId)
            .input("tourId", sql.NVarChar, tourId)
            .query(`
                INSERT INTO Favorite_Tour (fav_id, cus_id, tour_id, created_at) 
                VALUES (@fav_id, @cusId, @tourId, GETDATE())
            `);
            
        res.json({ message: "Tour added to favorites successfully" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
}

const removeFavoriteTour = async (req, res) => {
    const favId = req.params.id;
    console.log("Param:", req.params);
    try {
        const pool = await getPool();
        await pool.request()
            .input("favId", sql.NVarChar, favId)
            .query(`DELETE FROM Favorite_Tour WHERE fav_id = @favId`);
        res.json({ message: "Favorite tour deleted successfully" });
        console.log("Favorite tour deleted successfully", favId);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
}


module.exports = {
    getFavoriteTours,
    addFavoriteTour,
    removeFavoriteTour
};