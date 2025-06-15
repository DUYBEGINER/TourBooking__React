const express = require("express");
const router = express.Router();
const authController = require('../controller/authController');
const googleAuthController = require('../controller/google-auth-Controller');

const {authMiddleware} = require('../middlewares/authMiddlewares');

//config route
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/google/login', googleAuthController.loginGoogle);
router.get('/google-user', googleAuthController.getGoogleUserInfo);
router.post('/register', authController.register);
router.get('/user', authMiddleware, authController.getUser);


module.exports = router;