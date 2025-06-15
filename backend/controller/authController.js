const {loginUser, registerUser, getUserInfor} = require("../services/authService");
const ERROR_MESSAGES = require("../utils/errorConstants");
const { generateAccessToken } = require("../middlewares/jwt");

const login = async (req, res) => {
    try{
        const { email, password } = req.body;
        console.log("Đang đăng nhập với email:", email, "và mật khẩu:", password);
        const user = await loginUser(email, password);
        //Nếu có lỗi trong quá trình đăng nhập
        if (user?.error) {
            return res.status(401).json({
                code: user.error.code,
                message: user.error.message
            });
        }
        //Nếu không có lỗi, trả về thông tin người dùng
        const token = user.token;
        const userInfor = user.userInfor;
        //Trả về token trong cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            sameSite: 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });
        //Trả về thông tin người dùng
        console.log("Thông tin người dùng:", userInfor);
        return res.status(200).json({
            user: userInfor,
            message: "Đăng nhập thành công",
        });
    } catch (error) {
        console.error("Lỗi đăng nhập:", error.message);
        return res.status(500).json({
            code: ERROR_MESSAGES.API.SERVER_ERROR.code,
            message: ERROR_MESSAGES.API.SERVER_ERROR.message
        });
    }
};


const register = async (req, res) => {
    try{
        const { fullname, email, password, phone, birthday } = req.body;
        const user = await registerUser(fullname, email, password, phone, birthday);

        //Nếu có lỗi trong quá trình đăng ký
        if (user?.error) {
            return res.status(400).json({
                code: user.error.code,
                message: user.error.message
            });
        }

        const token = user.token;
        const userInfor = user.userInfor;
        res.cookie('jwt', token, {
            httpOnly: true,
            sameSite: 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });
        // Nếu không có lỗi, trả về thông tin người dùng
        return res.status(201).json({
            user: userInfor,
            message: "Đăng ký thành công"
        });
    }catch(error){
        console.error("Lỗi đăng ký:", error.message);
        return res.status(500).json({
            code: ERROR_MESSAGES.API.SERVER_ERROR.code,
            message: ERROR_MESSAGES.API.SERVER_ERROR.message
        });
    }
    
}

const logout = async (req, res) => {
    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'Lax',
        path: '/',
    });
    res.json({ message: 'Đăng xuất thành công' });
}


const getUser = async (req, res) => {
    try {
        const { userId, role } = req.user; // Lấy từ authMiddleware
        
        console.log("user after midleware: ", req.user)
        const user = await getUserInfor(userId, role);
        console.log("user after getUserInfor: ", user)
        return res.status(200).json({
            user: user,
            message: "Lấy thông tin người dùng thành công",
        });
      } catch (error) {
        return res.status(500).json({
          code: ERROR_MESSAGES.API.SERVER_ERROR.code,
          message: error.message || ERROR_MESSAGES.API.SERVER_ERROR.message,
        });
      }
}


module.exports ={
    login, register, logout, getUser
}