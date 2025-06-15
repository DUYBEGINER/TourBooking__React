const {sql, getPool} = require("../config/db");

const getCustomer = async (req, res) => {
    let pool;
    try {
        pool = await getPool();
        const { name } = req.query; // Lấy tham số name từ query string
        console.log("Name filter:", name);

        let query = "SELECT * FROM Customer WHERE cus_status = 'active'";
        const request = pool.request(); // Tạo request mới

        if (name) {
            query += " AND fullname LIKE @fullname";
            request.input("fullname", sql.NVarChar, `%${name}%`); // Chỉ gắn tham số nếu dùng
        }

        const result = await request.query(query); // Thực thi query
        // console.log("Query result:", result);
        return res.json(result.recordset);
    } catch (error) {
        console.error("Error fetching customers:", error);
        return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};


const getCustomerById = async (req, res) => {
    try {
        const pool = await getPool();
        const cusId = req.params.id; // Lấy ID từ tham số URL
        console.log("Customer ID:", cusId);

        const result = await pool.request()
            .input("cusId", sql.NVarChar, cusId)
            .query("SELECT * FROM Customer WHERE cus_id = @cusId AND cus_status = 'active'");

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy khách hàng" });
        }

        console.log("Query result:", result);
        return res.json(result.recordset[0]); // Trả về khách hàng đầu tiên
    }catch(error) {
        console.error("Error fetching customer by ID:", error);
        return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};




const getAvatar = async (req, res) => {
    const cusId = req.params.id;
    try{
        const pool = await getPool();
        const result = await pool.request()
            .input("cusId", sql.NVarChar, cusId)
            .query("SELECT pi_url FROM Customer WHERE cus_id = @cusId");
        res.json(result.recordset);
    }
    catch(error){
        res.status(500).json({message: "Lỗi server", error});
    }
}

const updateCustomer = async (req, res) => {
    try{
        console.log("req.body: ", req.body);
        const cusId = req.params.id;
        const { name, phone, address } = req.body;

        const pool = await getPool();
        let query = `
        UPDATE Customer 
        SET fullname = @name, phone = @phone, address = @address
        `;
        const request = pool.request()
        .input("cusId", sql.NVarChar, cusId)
        .input("name", sql.NVarChar, name)
        .input("phone", sql.NVarChar, phone)
        .input("address", sql.NVarChar, address);
        
        // Nếu có file ảnh mới, thêm trường pi_url vào query
        if (req.file) {
            const imagePath = req.file.path;
            query += `, pi_url = @image`;
            request.input("image", sql.NVarChar, imagePath);
            console.log("imagePath: ", imagePath);
        }
        query += ` WHERE cus_id = @cusId`;
        const result = await request.query(query);

        res.json(result.recordset);
    }catch(error){
        res.status(500).json({message: "Lỗi server", error});
    }
}


const blockCustomer = async (req, res) => {
    console.log("blockCustomer!")
    try{
        const cusId = req.params.id;
        const pool = await getPool();
        const result = await pool.request()
            .input("cusId", sql.NVarChar, cusId)
            .query("UPDATE Customer SET cus_status = 'inactive' WHERE cus_id = @cusId"); 
        res.status(200).json({ message: `Đã khóa khách hàng ${cusId}` });
    }catch(error){
        console.error("Error blocking customer:", error);
        res.status(500).json({message: "Lỗi server khi khóa khách hàng", error});
    }

}


const blockBatchCustomer = async (req, res) => {
    console.log("blockBatchCustomer!")
    try{
        const { ids } = req.body;
        console.log("Customer IDs: ", ids);
        const pool = await getPool();
        const transaction = pool.transaction();
        await transaction.begin();
        const customerIdsString = ids.map(id => `'${id}'`).join(',');
        const result = await transaction.request()
            .input('customerIds', sql.NVarChar, customerIdsString)
            .query(`UPDATE Customer SET cus_status='inactive' WHERE cus_id IN (${customerIdsString})`);  //Chưa bảo mật SQL Injection
        await transaction.commit();
        return res.status(200).json({ message: `Đã khóa ${result.rowsAffected[0]} khách hàng thành công` });
    }catch (error){
        console.error("Error blocking customer:", error);
        res.status(500).json({message: "Lỗi server khi khóa khách hàng", error});
    }
}


const deleteCustomer = async (req, res) => {
    try{
        const cusId = req.params.id;
        const pool = await getPool();
        const result = await pool.request()
            .input("cusId", sql.NVarChar, cusId)
            .query("DELETE FROM Customer WHERE cus_id = @cusId");
        if (result.rowsAffected[0] > 0) {
            res.status(200).json({ message: "Xóa khách hàng thành công" });
        } else {
            res.status(404).json({ message: "Không tìm thấy khách hàng" });
        }
    }
    catch(error){
        console.error("Error deleting customer:", error);
        res.status(500).json({message: "Lỗi server khi xóa khách hàng", error: error.message});
    }
}

const deleteBatchCustomer = async (req, res) => {
    try{
        const {ids} = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "Danh sách ID không hợp lệ" });
        }
        
        const pool = await getPool();
        
        // Xây dựng câu truy vấn với các tham số
        const request = pool.request();
        const placeholders = ids.map((_, index) => `@cusId${index}`).join(',');
        const query = `DELETE FROM Customer WHERE cus_id IN (${placeholders})`;

        // Thêm các tham số vào request
        ids.forEach((id, index) => {
            request.input(`cusId${index}`, sql.NVarChar, id);
        });
        
        // Thực hiện truy vấn
        const result = await request.query(query);
        const deletedCount = result.rowsAffected[0];
        
        if (deletedCount === ids.length) {
            return res.status(200).json({
                message: `Đã xóa thành công ${deletedCount} khách hàng`,
                deletedCount,
                failed: [],
            });
        } else {
            return res.status(207).json({
                message: `Đã xóa ${deletedCount} trên tổng số ${ids.length} khách hàng`,
                deletedCount,
                failed: ids.length - deletedCount,
            });
        }
    }
    catch(error){
        console.error("Error batch deleting customers:", error);
        res.status(500).json({message: "Lỗi server khi xóa nhiều khách hàng", error: error.message});
    }
}


module.exports = {
    getCustomer,
    getCustomerById,
    blockCustomer,
    blockBatchCustomer,
    deleteBatchCustomer,
    deleteCustomer,
    getAvatar, 
    updateCustomer
}
