const jwt = require("jsonwebtoken");

//Cái này để trong env mới đúng
const JWT_SECRET = "f9J@1c$hX72L!b6Zq*9T&dA7vE0mNpR#";

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
};

const verifyToken = (token) => {
  console.log("Verifying token:", token);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = { generateToken, verifyToken, JWT_SECRET };