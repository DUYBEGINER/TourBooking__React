// services/authService.js
require('dotenv').config();
const bcrypt = require("bcrypt");
const { sql, getPool } = require("../config/db");
const { generateAccessToken } = require("../middlewares/jwt");
const { v4: uuidv4 } = require("uuid");
const ERROR_MESSAGES = require("../utils/errorConstants");

const saltRounds = 10;

// Hàm xác thực mật khẩu
const verifyPassword = async (password, hashedPassword) => {
  // Nếu hashedPassword là Buffer (varbinary từ DB), chuyển thành chuỗi
  console.log("Đang xác thực mật khẩu...");
  const hashedPasswordString = Buffer.isBuffer(hashedPassword)
      ? hashedPassword.toString("utf8")
      : hashedPassword;
  return await bcrypt.compare(password, hashedPasswordString);
};


// Hàm lấy vai trò từ role_id
const getRoleById = async (roleId) => {
  console.log("Đang lấy vai trò từ role_id...");
  const pool = await getPool();
  const roleQuery = await pool
    .request()
    .input("roleId", sql.Int, roleId)
    .query("SELECT role_name FROM Employee_Role WHERE role_id = @roleId");

  const role = roleQuery.recordset[0]?.role_name;
  if (!role) throw new Error(`Không tìm thấy vai trò cho role_id: ${roleId}`);
  console.log("Lấy vai trò thành công:", role);
  return role;
};

//Hàm Hash password
const hashPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  // Chuyển đổi hashedPassword thành Buffer
  const hashedBuffer = Buffer.from(hashedPassword, "utf8");
  return hashedBuffer;
}


// Hàm lấy thông tin user (cho endpoint /api/auth/me)
const getUserInfor = async (userId, role) => {
  try {
    const pool = await getPool();
    let user;

    if (role === "customer") {
      console.log("Đang lấy thông tin từ bảng Customer...");
      const result = await pool
        .request()
        .input("userId", sql.VarChar, userId)
        .query("SELECT * FROM Customer WHERE cus_id = @userId AND cus_status = 'active'");
      user = result.recordset[0];
      if (!user) throw new Error("Không tìm thấy user trong bảng Customer");
      console.log("Đã tìm thấy user!");
      return {
        id: user.cus_id,
        name: user.fullname,
        email: user.email,
        phone: user.phone,
        role: "customer",
        birthday: user.birthday,
        address: user.address,
        avatar: user.pi_url,
      };
    } else {
      console.log("Đang lấy thông tin từ bảng Employee...");
      const result = await pool
        .request()
        .input("userId", sql.VarChar, userId)
        .query("SELECT * FROM Employee WHERE emp_id = @userId AND em_status = 'active'");
      user = result.recordset[0];

      var branch_name = await pool
        .request()
        .input("branchId", sql.Int, user.branch_id)
        .query("SELECT branch_name FROM Branch WHERE branch_id = @branchId");
      branch_name = branch_name.recordset[0]?.branch_name || "Không xác định";

      if (!user) throw new Error("Không tìm thấy user trong bảng Employee");
      const roleName = await getRoleById(user.role_id);
      console.log("Đã tìm thấy user!");
      return {
        id: user.emp_id,
        name: user.fullname,
        email: user.email,
        phone: user.phone,
        role: roleName,
        address: user.address,
        avatar: user.pi_url,
        branch_id: user.branch_id,
        branch_name: branch_name || "Không xác định",
      };
    }
    
  } catch (error) {
    console.error("Lỗi khi lấy thông tin user:", error.message);
    throw new Error(error.message || "Lỗi server");
  }
};

// Hàm đăng nhập
const loginUser = async (email, password) => {
    if (!email || !password) {
      return {error: ERROR_MESSAGES.AUTH.LOGIN_FAILED}
    }
    ///Tạo kết nối đến database
    console.log("Đang kết nối đến database...");
    const pool = await getPool();

    // Hàm tìm kiếm người dùng trong bảng
    const checkUser = async (table, idField, roleField = null) => {
      console.log(`Đang kiểm tra trong bảng ${table}...`);
      const result = await pool
        .request()
        .input("email", sql.VarChar, email)
        .query(`SELECT * FROM ${table} WHERE email = @email`);
      const user = result.recordset[0];

      if(!user) return null;
      

      // K.Bao: Điều kiện tài khoản phải không bị khoá
      const statusField = table === "Customer" ? user.cus_status : user.em_status;
      if (statusField !== "active") {
        return { error: ERROR_MESSAGES.AUTH.ACCOUNT_INACTIVE };
      }
      //Kiểm tra mật khẩu
      const matchPassword = await verifyPassword(password, user.password);
      if (!matchPassword) {
        console.log("Mật khẩu không khớp!");
        return {error: ERROR_MESSAGES.AUTH.LOGIN_FAILED}
      }
      console.log("Xác thực mật khẩu thành công!")
      const role = roleField ? await getRoleById(user[roleField]) : "customer";
      return {
        id: user[idField],
        role: role,
      }
    }

    let user = await checkUser("Customer", "cus_id", null) || 
              await checkUser("Employee", "emp_id", "role_id");

    if(user?.error) return {error: user.error} 

    if(!user){
      console.log("Không tìm thấy user trong cả hai bảng!");
      return {error: ERROR_MESSAGES.AUTH.LOGIN_FAILED }
    }

    if (user) {
      const userInfor = await getUserInfor(user.id, user.role);
      const token = generateAccessToken({ userId: user.id, role: user.role}); // Tạo token cho người dùng
     return {
        token: token, 
        userInfor: userInfor
     }
    }
};


// Hàm đăng ký

const registerUser = async (fullname, email, password, phone, birthday) => {
    if (!fullname || !email || !password || !phone || !birthday) {
      return {error: ERROR_MESSAGES.AUTH.REGISTRATION_FAILED}
    }
    try {
        console.log("Bắt đầu quá trình đăng ký với dữ liệu:", { fullname, email, phone, birthday });

        if (!fullname || !email || !password || !phone || !birthday) {
            console.log("Thiếu thông tin bắt buộc:", { fullname, email, phone, birthday });
            return {error: ERROR_MESSAGES.AUTH.REGISTRATION_FAILED}
        }

        console.log("Đang kết nối database...");
        const pool = await getPool();
        console.log("Kết nối database thành công");

        //CODE KIỂM TRA EMAIL NÀY CHƯA TỐI ƯU SẼ SỬA LẠI SAU!!!!!
        // Kiểm tra email đã tồn tại trong bảng customer
        console.log("Đang kiểm tra email trong bảng Customer...")
        const emailCheck = await pool
            .request()
            .input("email", sql.VarChar, email)
            .query("SELECT cus_id FROM Customer WHERE email = @email");

        if (emailCheck.recordset.length > 0) {
            console.log("Email đã tồn tại trong bảng Customer");
            return {error: ERROR_MESSAGES.AUTH.REGISTRATION_FAILED}
        }

        // Kiểm tra email đã tồn tại trong bảng employee
        console.log("Đang kiểm tra email trong bảng Employee...")
        const emailCheckEmp = await pool
            .request()
            .input("email", sql.VarChar, email)
            .query("SELECT emp_id FROM Employee WHERE email = @email");
        if (emailCheckEmp.recordset.length > 0) {
            console.log("Email đã tồn tại trong bảng Employee");
            return {error: ERROR_MESSAGES.AUTH.REGISTRATION_FAILED}
        }

        // Tạo cus_id mới bằng uuid
        const cusID = uuidv4().replace(/-/g, "").slice(0, 10);
        console.log("Đã tạo cusID:", cusID);

        // Băm mật khẩu
        console.log("Đang băm mật khẩu...");
        const hashedPassword = await hashPassword(password);
        console.log("Băm mật khẩu thành công");

        console.log("Đang thêm customer mới...");
        //Thêm customer mới
        const insertResult = await pool
            .request()
            .input("cusID", sql.VarChar, cusID)
            .input("fullname", sql.NVarChar, fullname)
            .input("email", sql.NVarChar, email)
            .input("password", sql.VarBinary, hashedPassword)
            .input("phone", sql.NVarChar, phone)
            .input("birthday", sql.Date, birthday)
            .query(
                "INSERT INTO Customer (cus_id, fullname, email, password, phone, birthday, cus_status) VALUES (@cusID, @fullname, @email, @password, @phone, @birthday, 'active')"
            );
        console.log("Thêm customer thành công:", insertResult);

        console.log("Đang lấy thông tin user...");
        const userInfor = await getUserInfor(cusID, "customer");
        console.log("Lấy thông tin user thành công:", userInfor);

        console.log("Đang tạo token...");
        const token = generateAccessToken({ userId: cusID, role: "customer" });
        console.log("Tạo token thành công");

        return {
            token: token,
            userInfor: userInfor,
            message: "Đăng ký thành công",
        };
    } catch (error) {
        console.error("Lỗi chi tiết trong quá trình đăng ký:", error);
        console.error("Stack trace:", error.stack);
        return {error: ERROR_MESSAGES.API.SERVER_ERROR};
    }
};

module.exports = { loginUser, registerUser, getUserInfor };