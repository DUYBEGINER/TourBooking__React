require('dotenv').config();
const { sql, getPool } = require("../config/db");
const {generateAccessToken, generateRefreshToken} = require('../middlewares/jwt');
const {getUserInfor} = require("../services/authService");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const { OAuth2Client } = require('google-auth-library');

const clientId = process.env.GOOGLE_CLIENT_AUTH_ID;
const client = new OAuth2Client(clientId);

// function decodeJWT(token) {

//         let base64Url = token.split(".")[1];
//         let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//         let jsonPayload = decodeURIComponent(
//           atob(base64)
//             .split("")
//             .map(function (c) {
//               return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
//             })
//             .join("")
//         );
//         return JSON.parse(jsonPayload);
//       }

async function verifyToken(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: clientId,  // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
        console.log("Token xác thực thành công, thông tin user:", payload);
        return payload;
    } catch (error) {
        throw new Error('Invalid token');
    }
}

const getGoogleUserInfo = async (req, res) => {
   console.log("get success");
    return "success";
}

const loginGoogle = async (req, res) => {
    const { token } = req.body;
    console.log("data token:", token);
    if(!token) {
        return res.status(400).json({
            message: "Missing token"
        })
    }

    try {
        // Xác thực token và lấy thông tin người dùng
        console.log("Đang xác thực token Google...");
        const payload = await verifyToken(token);
        
        const pool = await getPool();
        // Kiểm tra xem người dùng đã tồn tại trong cơ sở dữ liệu chưa
        console.log("Đang kiểm tra người dùng trong cơ sở dữ liệu...");
        const account = await pool
            .request()
            .input('email', sql.VarChar, payload['email'])
            .query('SELECT * FROM Customer WHERE email = @email');

        //Nếu người dùng đã tồn tại, trả về thông tin và token để đăng nhập
        if( account.recordset.length > 0) {
            console.log("Người dùng đã tồn tại trong cơ sở dữ liệu.");
            // Người dùng đã tồn tại, có thể tạo phiên làm việc hoặc trả về thông tin người dùng
            const user = account.recordset[0];

            // Tạo token cho người dùng
            const token = generateAccessToken({ userId: user.cus_id, role: 'customer' });
             //Trả về token trong cookie
            res.cookie('jwt', token, {
                httpOnly: true,
                sameSite: 'Lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/',
            });
            //Trả về thông tin người dùng
            return res.status(200).json({
                message: "Đăng nhập thành công",
                user: {
                    id: user.cus_id,
                    name: user.fullname,
                    email: user.email,
                    phone: user.phone,
                    role: "customer",
                    birthday: user.birthday,
                    address: user.address,
                    avatar: user.pi_url,
                }
            });
        }
        else{
            var cusID = uuidv4().replace(/-/g, "").slice(0, 10);
            console.log("Đã tạo cusID:", cusID);

            // Người dùng chưa tồn tại, tiến hành đăng ký lấy id làm mật khẩu
            const hashedPassword = await bcrypt.hash(cusID, 10);
            const hashedBuffer = Buffer.from(hashedPassword, "utf8");

            const registResult = await pool
                .request()
                .input('cusID', sql.VarChar, cusID)
                .input('fullname', sql.NVarChar, payload['name'])
                .input("password", sql.VarBinary, hashedBuffer)
                .input('email', sql.VarChar, payload['email'])
                .input('phone', sql.VarChar, null)
                .input('birthday', sql.Date, null)
                .query(`
                    INSERT INTO Customer (cus_id, fullname, password, email, phone, birthday, cus_status)
                    VALUES (@cusID, @fullname, @password, @email, @phone, @birthday, 'active');
                `);
            console.log("Đã thêm người dùng mới vào cơ sở dữ liệu:", registResult);
            const userInfor = await getUserInfor(cusID, "customer");
            console.log("Lấy thông tin user thành công:", userInfor);
            console.log("Đang tạo token...");
            const token = generateAccessToken({ userId: cusID, role: "customer" });
            console.log("Tạo token thành công");
            res.cookie('jwt', token, {
                httpOnly: true,
                sameSite: 'Lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/',
            });     
             // Nếu không có lỗi, trả về thông tin người dùng
            return res.status(201).json({
                token: token,
                user: userInfor,
                message: "Đăng ký thành công"
            });
        }

    } catch (error) {
        return res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
}

module.exports = {
    loginGoogle,
    getGoogleUserInfo
}