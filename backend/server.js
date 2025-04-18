const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

const tourRoutes = require("./routes/tourRoutes");
const authRoutes = require("./routes/authRoutes");
const supportRoutes = require("./routes/supportRoutes");

app.use(cors());
app.use(express.json());

//Sử dụng các Route
app.use("/tours", tourRoutes);
app.use("/auth", authRoutes);
app.use("/api", supportRoutes); // Thêm route cho support

app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});

