const express = require('express');
const router = express.Router();
const {
    getPromotion,
    createPromotion,
    blockPromotion,
    blockBatchPromotion,
    updatePromotion,
    updatePromotionStatus,
    checkPromoCode,
    applyPromoToBooking
} = require('../controller/promotionController');


router.get('/', getPromotion);
router.post('/',  createPromotion)
router.put('/update/:promotionId', updatePromotion);
router.put('/block/:promotionId', blockPromotion);
router.put('/block_batch', blockBatchPromotion);

// Routes cho mã giảm giá
router.get('/check/:code', checkPromoCode);
router.post('/apply', applyPromoToBooking);

module.exports = router;