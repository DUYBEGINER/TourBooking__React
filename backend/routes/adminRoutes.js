// routes/adminRoutes.js
const express = require('express');

const {
  getOverviewStats,
  getBranchStats,
  getTourChartData,
  getRecentTransactions,
  getEmployeesByPageAndStatus,
  getToursByStatusAndPage,
  approveTourById,
  rejectTourById,
  lockEmployeesByIds,
  getBranch,
  createBranch,
  getBranchDetail,
  createEmployee,
  getEmployeeById,
  unlockEmployeesByIds,
  updateEmployee,
  updateTourStatus
} = require('../services/adminServices');
const router = express.Router();

// 1. Tổng quan
router.get('/overview', async (req, res) => {
  try {
    const data = await getOverviewStats();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Chi nhánh
router.get('/branches', async (req, res) => {
  try {
    const list = await getBranchStats();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Dữ liệu biểu đồ
router.get('/chart', async (req, res) => {
  try {
    const chart = await getTourChartData();
    res.json(chart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Giao dịch gần đây
router.get('/transactions', async (req, res) => {
  try {
    const tx = await getRecentTransactions();
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Liệt kê nhân viên theo điều kiện 
router.get('/employeeFilter', async (req, res) => {
  const { page, pageSize } = req.query;
  try {
    const data = await getEmployeesByPageAndStatus(Number(page), Number(pageSize));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Lấy thông tin các chi nhánh
router.get('/getBranch', async (req, res) => {
  try {
    const data = await getBranch();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 7. Lấy danh sách tour theo trạng thái và phân trang
router.get('/tours', async (req, res) => {
  try {
    // page và pageSize truyền vào query string
    const page     = parseInt(req.query.page, 10)     || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    //const status   = req.query.status || 'active';

    const { tours, total } = await getToursByStatusAndPage( page, pageSize);
    res.json({ tours, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Duyệt tour
router.put('/tours/:id/approve', async (req, res) => {
  const tourId = req.params.id;
  try {
    await approveTourById(tourId);
    res.json({ message: 'Duyệt tour thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Từ chối tour
router.put('/tours/:id/reject', async (req, res) => {
  const tourId = req.params.id;
  try {
    await rejectTourById(tourId);
    res.json({ message: 'Từ chối tour thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Khóa nhân viên
router.put('/employees/lock', async (req, res) => {
  const { ids } = req.body;
  try {
    const count = await lockEmployeesByIds(ids);
    res.json({ message: `Đã khóa ${count} nhân viên thành công` });
  } catch (err) {
    console.error("Lỗi khi khóa nhân viên:", err);
    res.status(500).json({ error: err.message });
  }
});

// Mở khoá tài khoản nhân viên
router.put('/employees/unlock', async (req, res) => {
  const { ids } = req.body;
  try {
    const count = await unlockEmployeesByIds(ids);
    res.json({ message: `Đã mở khoá ${count} nhân viên thành công` });
  } catch (err) {
    console.error("Lỗi khi mở khoá nhân viên:", err);
    res.status(500).json({ error: err.message });
  }
});

// router.put('/employees/:id/unlock', async (req, res) => {
//   const emp_id = req.params.id;
//   try {
//     await unlockEmployeeById(emp_id);
//     res.json({ message: 'Mở khoá tài khoản nhân viên thành công' });
//   } catch (err) {
//     console.error("Lỗi khi mở khoá nhân viên:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// Thêm chi nhánh mới
router.post('/branches', async (req, res) => {
  try {
    const { branch_name, address, phone } = req.body;
    await createBranch({ branch_name, address, phone });
    res.status(201).json({ message: 'Tạo chi nhánh thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/employees', async (req, res) => {
  try {
    const { fullname, email, password, phone, address, role_id, branch_id } = req.body;
    // Kiểm tra trùng email, hash password, tạo emp_id, hire_day, em_status
    await createEmployee({ fullname, email, password, phone, address, role_id, branch_id });
    res.status(201).json({ message: 'Tạo nhân viên thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/employees/:id", async (req, res) => {
  try {
    const data = await getEmployeeById(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/branches/:id", async (req, res) => {
  try {
    const branchId = req.params.id;
    const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();
    const data = await getBranchDetail(branchId, year);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/employees/update/:id", async (req, res) => {
  const emp_id = req.params.id;
  const { fullname, email, password, phone, address, role_id, branch_id } = req.body;
  try {
    await updateEmployee(emp_id, { fullname, email, password, phone, address, role_id, branch_id });
    res.json({ message: 'Cập nhật thông tin nhân viên thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Cập nhật trạng thái tour tự động
router.put('/tours/update-status', async (req, res) => {
  try {
    await updateTourStatus();
    res.json({ message: 'Cập nhật trạng thái tour thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
