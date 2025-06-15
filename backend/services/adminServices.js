// backend/services/adminServices.js
// @author: Nguyễn Khắc Bảo : N22DCCN006 : n22dccn006@student.ptithcm.edu.vn

const { sql, getPool } = require("../config/db"); // Lấy kết nối DB và module mssql :contentReference[oaicite:0]{index=0}&#8203;:contentReference[oaicite:1]{index=1}
const ERROR_MESSAGES = require("../utils/errorConstants"); // Thông điệp lỗi chung :contentReference[oaicite:2]{index=2}&#8203;:contentReference[oaicite:3]{index=3}
const dbConfig = require('../config/db');  
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Lấy số liệu tổng quan cho dashboard
const getOverviewStats = async () => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM Booking)          AS totalBookings,
        (SELECT ISNULL(SUM(amount), 0) FROM Payments 
         WHERE payment_status = 'COMPLETED' 
         AND YEAR(created_at) = YEAR(GETDATE())) AS totalRevenue,
        (SELECT COUNT(*) FROM Customer WHERE cus_status='active')         AS totalCustomers,
        (SELECT COUNT(*) FROM Tour)             AS totalTours
    `);
    return result.recordset[0];
  } catch (error) {
    console.error("Lỗi khi lấy số liệu tổng quan:", error);
    throw new Error(ERROR_MESSAGES.API.SERVER_ERROR.message);
  }
};

// Hàm lấy thông tin của chi nhánh
const getBranch = async ()=>{
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT branch_id, branch_name FROM Branch;
    `);
    return result.recordset;
  }catch (error){
    console.error("Lỗi khi lấy tên của chi nhánh");
    throw new Error(ERROR_MESSAGES.API.SERVER_ERROR.message);
  }
};

// Hàm cập nhật trạng thái tour tự động
const updateTourStatus = async () => {
  try {
    const pool = await getPool();

    // Cập nhật tour sắp khởi hành
    await pool.request().query(`
      UPDATE Tour
      SET status = 'upcoming'
      WHERE start_date > GETDATE()
        AND start_date <= DATEADD(DAY, 7, GETDATE())
        AND status NOT IN ('inactive', 'reject');
    `);
    
    // Cập nhật tour đang diễn ra
    await pool.request().query(`
      UPDATE Tour
      SET status = 'ongoing'
      WHERE start_date <= GETDATE() AND end_date >= GETDATE() AND status = 'upcoming'
    `);
    
    // Cập nhật tour đã kết thúc
    await pool.request().query(`
      UPDATE Tour
      SET status = 'completed'
      WHERE end_date < GETDATE() AND status = 'ongoing'
    `);

    console.log('Đã cập nhật trạng thái tour thành công');
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái tour:', error);
    throw new Error(`Không thể cập nhật trạng thái tour: ${error.message}`);
  }
};

// Lấy thông tin chi tiết chi nhánh theo ID
const getBranchDetail = async (branchId, year = new Date().getFullYear()) => {
  try {
    // Gọi updateTourStatus trước để cập nhật trạng thái tour
    await updateTourStatus();
    
    const pool = await getPool();
    
    // Query thông tin chi nhánh
    const branchQuery = `
      SELECT branch_id, branch_name, address, phone
      FROM Branch 
      WHERE branch_id = @branchId
    `;
    const branchResult = await pool
      .request()
      .input('branchId', branchId)
      .query(branchQuery);
    
    if (!branchResult.recordset || branchResult.recordset.length === 0) {
      throw new Error('Không tìm thấy chi nhánh');
    }
    
    const branch = branchResult.recordset[0];
    
    // Query doanh thu theo tháng trong năm được chọn
    const monthlyRevenueQuery = `
      SELECT 
        MONTH(p.created_at) as month,
        SUM(p.amount) as revenue
      FROM Payments p
      INNER JOIN Booking b ON p.booking_id = b.booking_id
      INNER JOIN Tour t ON b.tour_id = t.tour_id
      WHERE t.branch_id = @branchId 
        AND p.payment_status = 'COMPLETED'
        AND YEAR(p.created_at) = @year
      GROUP BY MONTH(p.created_at)
      ORDER BY MONTH(p.created_at)
    `;
    
    const monthlyResult = await pool
      .request()
      .input('branchId', branchId)
      .input('year', year)
      .query(monthlyRevenueQuery);
    
    // Tạo mảng 12 tháng với giá trị mặc định là 0
    const monthlyRevenue = new Array(12).fill(0);
    monthlyResult.recordset.forEach(row => {
      monthlyRevenue[row.month - 1] = row.revenue || 0;
    });
    
    // Query thống kê tour theo trạng thái (không phụ thuộc năm)
    const tourStatsQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM Tour 
      WHERE branch_id = @branchId
      GROUP BY status
    `;
    
    const tourStatsResult = await pool
      .request()
      .input('branchId', branchId)
      .query(tourStatsQuery);
    
    const tourStats = {};
    tourStatsResult.recordset.forEach(row => {
      tourStats[row.status] = row.count;
    });
    
    // Query thống kê booking theo năm
    const bookingStatsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(total_price) as totalRevenue
      FROM Booking b
      INNER JOIN Tour t ON b.tour_id = t.tour_id
      WHERE t.branch_id = @branchId 
        AND YEAR(b.booking_date) = @year
    `;
    
    const bookingStatsResult = await pool
      .request()
      .input('branchId', branchId)
      .input('year', year)
      .query(bookingStatsQuery);
    
    const bookingStats = bookingStatsResult.recordset[0] || { total: 0, totalRevenue: 0 };
    
    // Query danh sách các năm có dữ liệu
    const availableYearsQuery = `
      SELECT DISTINCT YEAR(p.created_at) as year
      FROM Payments p
      INNER JOIN Booking b ON p.booking_id = b.booking_id
      INNER JOIN Tour t ON b.tour_id = t.tour_id
      WHERE t.branch_id = @branchId 
        AND p.payment_status = 'COMPLETED'
      ORDER BY year DESC
    `;
    
    const yearResult = await pool
      .request()
      .input('branchId', branchId)
      .query(availableYearsQuery);
    
    const availableYears = yearResult.recordset.map(row => row.year);
    // Thêm năm hiện tại nếu chưa có
    const currentYear = new Date().getFullYear();
    if (!availableYears.includes(currentYear)) {
      availableYears.unshift(currentYear);
    }
    
    // Query thống kê nhân viên
    const employeeStatsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN em_status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN em_status = 'inactive' THEN 1 ELSE 0 END) as locked
      FROM Employee 
      WHERE branch_id = @branchId
    `;
    
    const employeeStatsResult = await pool
      .request()
      .input('branchId', branchId)
      .query(employeeStatsQuery);
    
    const employeeStats = employeeStatsResult.recordset[0] || { total: 0, active: 0, locked: 0 };
    
    return {
      ...branch,
      monthlyRevenue,
      months: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
      tourStats,
      bookingStats,
      employeeStats,
      availableYears,
      selectedYear: year
    };
  } catch (error) {
    console.error('Lỗi trong getBranchDetail:', error);
    throw new Error(`Không thể lấy thông tin chi tiết chi nhánh: ${error.message}`);
  }
};

// Lấy số tour theo từng chi nhánh
async function getBranchStats() {
  try {
      let pool = await sql.connect(dbConfig);

      // Debug: Kiểm tra dữ liệu payments
      const debugPayments = await pool.request().query(`
        SELECT COUNT(*) as total_payments,
               COUNT(CASE WHEN payment_status = 'COMPLETED' THEN 1 END) as completed_payments,
               COUNT(CASE WHEN YEAR(created_at) = YEAR(GETDATE()) THEN 1 END) as current_year_payments
        FROM Payments
      `);
      console.log('Debug Payments:', debugPayments.recordset[0]);

      // Debug: Kiểm tra dữ liệu branches
      const debugBranches = await pool.request().query(`
        SELECT COUNT(*) as total_branches FROM Branch
      `);
      console.log('Debug Branches:', debugBranches.recordset[0]);

      // Thống kê chi nhánh (Doanh thu, Tăng trưởng, Tỷ lệ hủy, Tổng số tour)
      const branchStats = await pool.request()
          .query(`
              WITH BranchRevenue AS (
                  -- Doanh thu năm hiện tại của mỗi chi nhánh
                  SELECT 
                      B.branch_id,
                      B.branch_name,
                      COALESCE(SUM(P.amount), 0) AS current_revenue
                  FROM Branch B
                  LEFT JOIN Tour T ON B.branch_id = T.branch_id
                  LEFT JOIN Booking Bk ON T.tour_id = Bk.tour_id
                  LEFT JOIN Payments P ON Bk.booking_id = P.booking_id 
                      AND P.payment_status = 'COMPLETED'
                      AND YEAR(P.created_at) = YEAR(GETDATE())
                  GROUP BY B.branch_id, B.branch_name
              ),
              PreviousRevenue AS (
                  -- Doanh thu năm trước của mỗi chi nhánh
                  SELECT 
                      B.branch_id,
                      COALESCE(SUM(P.amount), 0) AS previous_revenue
                  FROM Branch B
                  LEFT JOIN Tour T ON B.branch_id = T.branch_id
                  LEFT JOIN Booking Bk ON T.tour_id = Bk.tour_id
                  LEFT JOIN Payments P ON Bk.booking_id = P.booking_id 
                      AND P.payment_status = 'COMPLETED'
                      AND YEAR(P.created_at) = YEAR(GETDATE()) - 1
                  GROUP BY B.branch_id
              ),
              CancellationStats AS (
                  -- Tỷ lệ hủy của mỗi chi nhánh
                  SELECT 
                      B.branch_id,
                      COUNT(CASE WHEN Bk.status = 'canceled' THEN 1 END) AS canceled_count,
                      COUNT(Bk.booking_id) AS total_bookings
                  FROM Branch B
                  LEFT JOIN Tour T ON B.branch_id = T.branch_id
                  LEFT JOIN Booking Bk ON T.tour_id = Bk.tour_id
                  GROUP BY B.branch_id
              ),
              TourCount AS (
                  -- Tổng số tour của mỗi chi nhánh
                  SELECT 
                      B.branch_id,
                      COUNT(T.tour_id) AS total_tours
                  FROM Branch B
                  LEFT JOIN Tour T ON B.branch_id = T.branch_id
                  GROUP BY B.branch_id
              )
              SELECT 
                  BR.branch_id,
                  BR.branch_name,
                  BR.current_revenue AS revenue,
                  'active' AS status,
                  CASE 
                      WHEN PR.previous_revenue = 0 THEN 0
                      ELSE ROUND(((BR.current_revenue - PR.previous_revenue) * 100.0 / PR.previous_revenue), 2)
                  END AS growth_percentage,
                  CASE 
                      WHEN CS.total_bookings = 0 THEN 0
                      ELSE ROUND((CS.canceled_count * 100.0 / CS.total_bookings), 2)
                  END AS cancellation_rate,
                  TC.total_tours
              FROM BranchRevenue BR
              LEFT JOIN PreviousRevenue PR ON BR.branch_id = PR.branch_id
              LEFT JOIN CancellationStats CS ON BR.branch_id = CS.branch_id
              LEFT JOIN TourCount TC ON BR.branch_id = TC.branch_id
              ORDER BY BR.branch_id;
          `);
      
      console.log('Branch Stats Debug:', JSON.stringify(branchStats.recordset, null, 2));
      return branchStats.recordset;
  } catch (error) {
      console.error('Lỗi khi lấy thống kê chi nhánh:', error);
      throw new Error('Không thể lấy thống kê chi nhánh');
  } finally {
      //sql.close();
  }
}

// Lấy dữ liệu biểu đồ tỷ lệ tour hoàn thành / chưa khởi hành
const getTourChartData = async () => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        COUNT(CASE WHEN end_date < GETDATE() AND status = 'completed' THEN 1 END) AS completed,
        COUNT(CASE WHEN start_date > GETDATE() AND status = 'active' THEN 1 END) AS pending
      FROM Tour
    `);
    
    const data = result.recordset[0];
    return {
      completed: data.completed || 0,
      pending: data.pending || 0
    };
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu biểu đồ tour:", error);
    throw new Error(ERROR_MESSAGES.API.SERVER_ERROR.message);
  }
};

// Lấy 5 giao dịch gần nhất (từ bảng Payments - chỉ những giao dịch đã hoàn thành)
const getRecentTransactions = async () => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT TOP 5
        p.payment_id,
        c.fullname       AS customerName,
        c.phone,
        b.tour_id        AS tourCode,
        p.created_at     AS time,
        p.amount,
        p.payment_status AS status
      FROM Payments p
      INNER JOIN Booking b ON p.booking_id = b.booking_id
      INNER JOIN Customer c ON b.cus_id = c.cus_id
      WHERE p.payment_status = 'COMPLETED'
      ORDER BY p.created_at DESC
    `);
    return result.recordset;
  } catch (error) {
    console.error("Lỗi khi lấy giao dịch gần đây:", error);
    throw new Error(ERROR_MESSAGES.API.SERVER_ERROR.message);
  }
};

// Lấy nhân viên phân trang + lọc status
const getEmployeesByPageAndStatus = async (page, pageSize) => {
  const pool = await getPool();
  const offset = (page - 1) * pageSize;

  const result = await pool.request()
    .input("offset", offset)
    .input("pageSize", pageSize)
    .query(`
      SELECT 
      e.emp_id,
      e.fullname,
      e.role_id,
      e.email,
      e.phone,
      e.address,
      e.em_status,
      e.branch_id,
      r.role_name,
      b.branch_name
      FROM Employee e
      LEFT JOIN Branch b
        ON e.branch_id = b.branch_id
      LEFT JOIN Employee_Role r
         ON e.role_id = r.role_id  
      ORDER BY e.emp_id
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);

  return {
    employees: result.recordset,
    total: result.recordset[0]
  };
};

// Lấy thông tin nhân viên theo ID
const getEmployeeById = async (emp_id) => {
  const pool = await getPool();
  const result = await pool.request()
    .input("emp_id", sql.VarChar, emp_id)
    .query(`SELECT * FROM Employee WHERE emp_id = @emp_id`);
  return result.recordset[0];
};

// Lấy danh sách tour theo trạng thái và phân trang
const getToursByStatusAndPage = async ( page, pageSize) => {
  const status = 'pending'; // Trạng thái tour mặc định là 'active'
  try {
    const pool = await getPool();
    const offset = (page - 1) * pageSize;

    // 1) Lấy dữ liệu
    const result = await pool.request()
      .input('status', sql.NVarChar, status)
      .input('offset', sql.Int, offset)
      .input('pageSize', sql.Int, pageSize)
      .query(`
        SELECT *
        FROM Tour
        WHERE status = @status
        ORDER BY created_at DESC
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
      `);

    // 2) Lấy tổng
    const countRes = await pool.request()
      .input('status', sql.NVarChar, status)
      .query(`SELECT COUNT(*) AS total FROM Tour WHERE status = @status`);

    const total = countRes.recordset[0].total;
    const tours = result.recordset;
    return { tours, total };
  } catch (err) {
    console.error('Lỗi getToursByStatusAndPage:', err);
    throw err;
  }
};

// Duyệt tour theo ID
const approveTourById = async (tourId) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('tourId', sql.NVarChar, tourId)
      .query(`
        UPDATE Tour
        SET status = 'active'
        WHERE tour_id = @tourId
      `);
    if (result.rowsAffected[0] === 0) {
      throw new Error('Không tìm thấy tour để duyệt');
    }
    return;
  } catch (err) {
    console.error('Lỗi khi duyệt tour:', err);
    throw err;
  }
};

// Từ chối tour theo ID
const rejectTourById = async (tourId) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('tourId', sql.NVarChar, tourId)
      .query(`
        UPDATE Tour
        SET status = 'reject'
        WHERE tour_id = @tourId
      `);
    if (result.rowsAffected[0] === 0) {
      throw new Error('Không tìm thấy tour để từ chối');
    }
    return;
  } catch (err) {
    console.error('Lỗi khi từ chối tour:', err);
    throw err;
  }
};

// Khóa nhân viên theo danh sách ID
const lockEmployeesByIds = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Danh sách IDs không hợp lệ");
  }
  const pool = await getPool();
  const request = pool.request();
  // Tạo tham số động: @id0,@id1,...
  const placeholders = ids.map((_, i) => `@id${i}`).join(",");
  ids.forEach((id, i) => {
    request.input(`id${i}`, sql.VarChar, id);
  });
  const result = await request.query(`
    UPDATE Employee
    SET em_status = 'inactive'
    WHERE emp_id IN (${placeholders})
  `);
  // rowsAffected[0] = số dòng bị update
  return result.rowsAffected[0];
};

// Khóa nhân viên theo danh sách ID
const unlockEmployeesByIds = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Danh sách IDs không hợp lệ");
  }
  const pool = await getPool();
  const request = pool.request();
  // Tạo tham số động: @id0,@id1,...
  const placeholders = ids.map((_, i) => `@id${i}`).join(",");
  ids.forEach((id, i) => {
    request.input(`id${i}`, sql.VarChar, id);
  });
  const result = await request.query(`
    UPDATE Employee
    SET em_status = 'active'
    WHERE emp_id IN (${placeholders})
  `);
  // rowsAffected[0] = số dòng bị update
  return result.rowsAffected[0];
};

// Thêm chi nhánh mới
const createBranch = async ({ branch_name, address, phone }) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('branch_name', sql.NVarChar, branch_name)
      .input('address', sql.NVarChar, address)
      .input('phone', sql.VarChar, phone)
      .query(`INSERT INTO Branch (branch_name, address, phone) VALUES (@branch_name, @address, @phone)`);
  } catch (error) {
    console.error('Lỗi khi thêm chi nhánh mới:', error);
    
    throw new Error(error.message || 'Không thể thêm chi nhánh mới');
  }
};

const createEmployee = async ({ fullname, email, password, phone, address, role_id, branch_id }) => {
  const emp_id = uuidv4().replace(/-/g, "").slice(0, 10);
  const hire_day = new Date().toISOString().slice(0, 10);
  const em_status = 'active';
  const hashedPassword =Buffer.from( await hashPassword(password)); // dùng bcrypt
  const pool = await getPool();
  await pool.request()
    .input('emp_id', sql.VarChar, emp_id)
    .input('branch_id', sql.Int, branch_id)
    .input('fullname', sql.NVarChar, fullname)
    .input('email', sql.NVarChar, email)
    .input('password', sql.VarBinary, hashedPassword)
    .input('phone', sql.NVarChar, phone)
    .input('address', sql.NVarChar, address)
    .input('role_id', sql.Int, role_id)
    .input('hire_day', sql.Date, hire_day)
    .input('em_status', sql.NVarChar, em_status)
    .query(`INSERT INTO Employee (emp_id, branch_id, fullname, email, password, phone, address, role_id, hire_day, em_status)
            VALUES (@emp_id, @branch_id, @fullname, @email, @password, @phone, @address, @role_id, @hire_day, @em_status)`);
};

// Update thông tin nhân viên 
const updateEmployee = async (emp_id, { fullname, email, password, phone, address, role_id, branch_id }) => {
  const hashedPassword = Buffer.from(await hashPassword(password));
  const pool = await getPool();
  await pool.request()
    .input('emp_id', sql.VarChar, emp_id)
    .input('fullname', sql.NVarChar, fullname)
    .input('email', sql.NVarChar, email)
    .input('password', sql.VarBinary, hashedPassword)
    .input('phone', sql.NVarChar, phone)
    .input('address', sql.NVarChar, address)
    .input('role_id', sql.Int, role_id)
    .input('branch_id', sql.Int, branch_id)
    .query(`UPDATE Employee
            SET fullname = @fullname, email = @email, password = @password, phone = @phone, address = @address, role_id = @role_id, branch_id = @branch_id
            WHERE emp_id = @emp_id`);
};

module.exports = {
  approveTourById,
  rejectTourById,
  getOverviewStats,
  getBranchStats,
  getTourChartData,
  getRecentTransactions,
  getEmployeesByPageAndStatus,
  getBranch,
  getToursByStatusAndPage,
  createBranch,
  createEmployee,
  lockEmployeesByIds,
  getBranchDetail,
  getEmployeeById,
  unlockEmployeesByIds,
  updateEmployee,
  updateTourStatus
};