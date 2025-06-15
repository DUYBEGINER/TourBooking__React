const express = require("express");
const router = express.Router();

const { getHistoryBooking } = require("../controller/historyBookingController");

router.get("/history", getHistoryBooking);

module.exports = router;
