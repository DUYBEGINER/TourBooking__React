const express = require('express');
const router = express.Router();
const {getOTP, verifyOTP, resetPassword} = require('../controller/resetPasswordController');

router.post('/',  getOTP);
router.post('/verify', verifyOTP);
router.post('/reset', resetPassword);

module.exports = router;