const {sql, getPool} = require("../config/db");
const { v4: uuidv4 } = require("uuid");

//Hàm cập nhật trạng thái khuyến mãi trước khi lấy dữ liệu
const updatePromotionStatus = async (transaction) => {
    try {
        //Cập nhật tour đã lên lịch (chưa diễn ra)
        await transaction.request().query(`
            UPDATE Promotion SET status = 'active' 
            WHERE start_date <= GETDATE() AND end_date >= GETDATE() AND status = 'scheduled'`);
        
        //Cập nhật tour đã hết hạn
        await transaction.request().query(`
            UPDATE Promotion SET status = 'expired' 
            WHERE end_date < GETDATE() AND status = 'active'`);

        await transaction.request().query(`
            UPDATE Promotion SET status = 'scheduled'
            WHERE start_date > GETDATE() AND status NOT IN ('inactive')`);

        console.log("Khuyến mãi đã được cập nhật trạng thái mới thành công");
    }catch (error) {
        console.error("Lỗi khi cập nhật trạng thái khuyến mãi:", error.message);
        throw new Error("Lỗi khi cập nhật trạng thái khuyến mãi");
    }
}


const getPromotion = async (req, res) => {

    let transaction;
    try {
        const { status, promo_name } = req.query; // Lấy tham số status từ query string
        console.log("Status filter: ",  req.query);
        // Xây dựng câu query động
       

        const pool = await getPool();
        transaction = pool.transaction();
        await transaction.begin();
        
        let query = "SELECT * FROM Promotion WHERE 1=1";
        const request = transaction.request();

        // Thêm điều kiện lọc
        if (status) {
            if (status === 'all') {
                query += " AND status IN ('active', 'scheduled', 'expired')";
            }else{
                query += " AND status = @status";
                request.input("status", sql.NVarChar, status);
            }
        }

        if (promo_name) {
            query += " AND promo_name LIKE @promo_name"; // Filter theo promo_name
            request.input("promo_name", sql.NVarChar, `%${promo_name}%`);
        }
        // if (code) {
        //     query += " AND code LIKE @code";
        //     request.input("code", sql.NVarChar, `%${code}%`);
        // }
        await updatePromotionStatus(transaction);

       // Thực hiện query
        const result = await request.query(query);
        console.log("Query result:", result);
        await transaction.commit();
        return res.json(result.recordset);
    } catch (error) {
        // Rollback transaction nếu có lỗi
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Lỗi khi rollback transaction:', rollbackError.message);
            }
        }
        console.error('Lỗi khi lấy danh sách khuyến mãi:', error.message, error.stack);
        return res.status(500).json({ error: 'Lỗi server khi lấy danh sách khuyến mãi' });
    }
}

const createPromotion = async (req, res) => {
    
    try {
        const {promo_id, promo_name, code, discount_percentage, start_date, end_date, max_use } = req.body;
        // Kiểm tra dữ liệu đầu vào
        if (!promo_id || !promo_name || !code || !discount_percentage || !start_date || !end_date || !max_use) {
            return res.status(400).json({ error: "Tất cả các trường là bắt buộc" });
        }
        if (discount_percentage <= 0 || discount_percentage > 100) {
            return res.status(400).json({ error: "Phần trăm giảm giá phải từ 0 đến 100" });
        }
        if (new Date(start_date) > new Date(end_date)) {
            return res.status(400).json({ error: "Ngày bắt đầu phải trước ngày kết thúc" });
        }
        if (max_use <= 0) {
            return res.status(400).json({ error: "Số lần sử dụng tối đa phải lớn hơn 0" });
        }
        
        // Xác định trạng thái dựa trên ngày
        let status;
        const currentDate = new Date();
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (startDate <= currentDate && endDate >= currentDate) {
            status = 'active';
        } else if (endDate < currentDate) {
            status = 'expired';
        } else if (startDate > currentDate) {
            status = 'scheduled';
        }

        console.log(status)
        const pool = await getPool();
        await pool.request()
            .input('promo_id', sql.VarChar, promo_id)
            .input('promo_name', sql.NVarChar, promo_name)
            .input('code', sql.VarChar, code)
            .input('discount_percentage', sql.Decimal(5, 2), discount_percentage)
            .input('start_date', sql.Date, start_date)
            .input('end_date', sql.Date, end_date)
            .input('max_use', sql.Int, max_use)
            .input('status', sql.VarChar, status)
            .query("INSERT INTO Promotion (promo_id, promo_name, code, discount_percentage, start_date, end_date, max_use, status) VALUES (@promo_id, @promo_name, @code, @discount_percentage, @start_date, @end_date, @max_use, @status)");
        return res.status(201).json({ message: "Khuyến mãi đã được thêm thành công" });
    } catch (error) {
        return res.status(500).json({ error: error.message  });
    }
}

const blockPromotion = async (req, res) => {
    try {
        const { promotionId } = req.params;
        const pool = await getPool();
        const result = await pool.request()
            .input('promotionId', sql.NVarChar, promotionId)
            .query("UPDATE Promotion SET status='inactive' WHERE promo_id = @promotionId");

        return res.status(200).json({ message: "Khuyến mãi đã được chặn thành công" });
    } catch (error) {
        return res.status(500).json({ error: error.message  });
    }
}


const blockBatchPromotion= async (req, res) => {
    let transaction;
    try{
        const { ids } = req.body;
        console.log("Promotion IDs: ", ids);
        const pool = await getPool();
        transaction = pool.transaction();
        await transaction.begin();
        const promotionIdsString = ids.map(id => `'${id}'`).join(',');
        const result = await transaction.request()
            .input('promotionIds', sql.NVarChar, promotionIdsString)
            .query(`UPDATE Promotion SET status='inactive' WHERE promo_id IN (${promotionIdsString})`);  //Chưa bảo mật SQL Injection
        await transaction.commit();
        return res.status(200).json({ message: `Đã tạm ngưng ${result.rowsAffected[0]} khuyến mãi thành công` });
    } catch(error){
        console.error("Lỗi khi khóa khuyến mãi:", error);
        if (transaction) {
            await transaction.rollback();
        }
        return res.status(500).json({ error: error.message });
    }

}



const updatePromotion = async (req, res) => {
    try {
        const { promotionId } = req.params;
        const {  promo_name, code, discount_percentage, start_date, end_date, max_use } = req.body;
        console.log("Promotion ID: ", promotionId);
        console.log("Promotion data: ", req.body);
        const pool = await getPool();
        const result = await pool.request()
            .input('promotionId', sql.VarChar, promotionId)
            .input('promo_name', sql.NVarChar, promo_name)
            .input('code', sql.VarChar, code)
            .input('discount_percentage', sql.Decimal(5, 2), discount_percentage)
            .input('start_date', sql.Date, start_date)
            .input('end_date', sql.Date, end_date)
            .input('max_use', sql.Int, max_use)
            .query("UPDATE Promotion SET promo_name = @promo_name, code = @code, discount_percentage = @discount_percentage, start_date = @start_date, end_date = @end_date, max_use = @max_use WHERE promo_id = @promotionId");
        return res.status(200).json({ message: "Khuyến mãi đã được cập nhật thành công" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// Kiểm tra mã giảm giá hợp lệ
const checkPromoCode = async (req, res) => {
  try {
    const { code } = req.params;
    const pool = await getPool();
    
    const result = await pool.request()
      .input("code", sql.VarChar, code)
      .query(`
        SELECT promo_id, code, promo_name, discount_percentage, start_date, end_date, max_use, status
        FROM Promotion 
        WHERE code = @code AND status = 'active'
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Mã giảm giá không tồn tại hoặc đã hết hạn" 
      });
    }

    const promotion = result.recordset[0];
    const currentDate = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);

    // Kiểm tra thời gian hiệu lực
    if (currentDate < startDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Mã giảm giá chưa có hiệu lực" 
      });
    }

    if (currentDate > endDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Mã giảm giá đã hết hạn" 
      });
    }

    // Kiểm tra số lần sử dụng
    const usageResult = await pool.request()
      .input("promo_id", sql.VarChar, promotion.promo_id)
      .query(`
        SELECT COUNT(*) as used_count 
        FROM Booking_Promotion 
        WHERE promo_id = @promo_id
      `);

    const usedCount = usageResult.recordset[0].used_count;
    if (usedCount >= promotion.max_use) {
      return res.status(400).json({ 
        success: false, 
        message: "Mã giảm giá đã hết lượt sử dụng" 
      });
    }

    // Mã giảm giá hợp lệ
    return res.status(200).json({
      success: true,
      message: "Mã giảm giá hợp lệ",
      data: {
        promo_id: promotion.promo_id,
        code: promotion.code,
        description: promotion.promo_name,
        discount_percentage: promotion.discount_percentage,
        remaining_uses: promotion.max_use - usedCount
      }
    });

  } catch (error) {
    console.error("Lỗi khi kiểm tra mã giảm giá:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Lỗi server khi kiểm tra mã giảm giá" 
    });
  }
};

// Áp dụng mã giảm giá cho booking
const applyPromoToBooking = async (req, res) => {
  try {
    const { booking_id, promo_id } = req.body;
    
    if (!booking_id || !promo_id) {
      return res.status(400).json({ 
        success: false, 
        message: "Thiếu thông tin booking_id hoặc promo_id" 
      });
    }

    const pool = await getPool();
    const transaction = pool.transaction();

    try {
      await transaction.begin();

      // Kiểm tra booking tồn tại
      const bookingResult = await transaction.request()
        .input("booking_id", sql.VarChar, booking_id)
        .query("SELECT * FROM Booking WHERE booking_id = @booking_id");

      if (bookingResult.recordset.length === 0) {
        await transaction.rollback();
        return res.status(404).json({ 
          success: false, 
          message: "Booking không tồn tại" 
        });
      }

      const booking = bookingResult.recordset[0];

      // Kiểm tra promotion tồn tại và hợp lệ
      const promoResult = await transaction.request()
        .input("promo_id", sql.VarChar, promo_id)
        .query("SELECT * FROM Promotion WHERE promo_id = @promo_id AND status = 'active'");

      if (promoResult.recordset.length === 0) {
        await transaction.rollback();
        return res.status(404).json({ 
          success: false, 
          message: "Mã giảm giá không tồn tại" 
        });
      }

      const promotion = promoResult.recordset[0];

      // Kiểm tra xem booking đã áp dụng promotion này chưa
      const existingPromoResult = await transaction.request()
        .input("booking_id", sql.VarChar, booking_id)
        .input("promo_id", sql.VarChar, promo_id)
        .query("SELECT * FROM Booking_Promotion WHERE booking_id = @booking_id AND promo_id = @promo_id");

      if (existingPromoResult.recordset.length > 0) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false, 
          message: "Mã giảm giá đã được áp dụng cho booking này" 
        });
      }

      // Tính toán giá mới
      const originalPrice = booking.total_price;
      const discountAmount = (originalPrice * promotion.discount_percentage) / 100;
      const newPrice = originalPrice - discountAmount;

      // Cập nhật giá booking
      await transaction.request()
        .input("booking_id", sql.VarChar, booking_id)
        .input("new_price", sql.Decimal(15, 2), newPrice)
        .query("UPDATE Booking SET total_price = @new_price WHERE booking_id = @booking_id");

      // Thêm record vào Booking_Promotion
      const bookingPromoId = uuidv4().replace(/-/g, "").slice(0, 10);
      await transaction.request()
        .input("id", sql.VarChar, bookingPromoId)
        .input("booking_id", sql.VarChar, booking_id)
        .input("promo_id", sql.VarChar, promo_id)
        .query("INSERT INTO Booking_Promotion (id, booking_id, promo_id) VALUES (@id, @booking_id, @promo_id)");

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: "Áp dụng mã giảm giá thành công",
        data: {
          original_price: originalPrice,
          discount_amount: discountAmount,
          new_price: newPrice,
          discount_percentage: promotion.discount_percentage
        }
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error("Lỗi khi áp dụng mã giảm giá:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Lỗi server khi áp dụng mã giảm giá" 
    });
  }
};

module.exports = {
    getPromotion,
    createPromotion,
    blockPromotion,
    blockBatchPromotion,
    updatePromotion,
    updatePromotionStatus,
    checkPromoCode,
    applyPromoToBooking
}