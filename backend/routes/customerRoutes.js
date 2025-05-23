const express = require("express");
const router = express.Router();
const {getCustomer, deleteBatchCustomer, deleteCustomer, getAvatar, updateCustomer} = require("../controller/customerController");
const upload = require("../middlewares/upload");

const {authMiddleware, restrictTo } = require('../middlewares/authMiddlewares');

router.get("/", authMiddleware, restrictTo('Sales'), getCustomer);
router.get("/:id", getAvatar);
router.delete("/batch-delete", deleteBatchCustomer);    
router.delete("/:id", deleteCustomer);
router.put("/update/:id", upload.single("image"), updateCustomer);

module.exports = router;