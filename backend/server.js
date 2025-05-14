const express = require("express");
const cors = require("cors");
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 5000;

const tourRoutes = require("./routes/tourRoutes");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const tourPriceRoutes = require("./routes/tourPriceRoutes");
const promotionRoutes = require("./routes/promotionRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const customerSupportRoutes = require("./routes/customerSupportRoutes");
const consultantSupportRoutes = require("./routes/consultantSupportRoutes");
const chatRoutes = require("./routes/chatRoutes");

app.use(cors());
app.use(express.json());
// // Khởi tạo client Gemini
// const genAI = new GoogleGenerativeAI('AIzaSyCbAKE5aON2k_ewwfnqggE7dp2-p-Nqsc8');
// const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
// // Endpoint nhận câu hỏi từ frontend
// app.post('/api/chat', async (req, res) => {
//   try {
//     const { query } = req.body;
//     if (!query) {
//       return res.status(400).json({ error: 'Query is required' });
//     }

//     // Gọi API của chatbot Python
//     const chatbotResponse = await axios.post('http://localhost:8000/chat', { query });
//     const context = chatbotResponse.data.response;
//     console.log('Context:', context);
//     // Nếu không tìm thấy FAQ, trả về ngay thông báo
//     if (context.startsWith('Xin lỗi')) {
//       return res.json({ response: context });
//     }

//     // Gọi Gemini để tạo câu trả lời tự nhiên
//     const prompt = `
//       Bạn là một trợ lý ảo tư vấn du lịch thân thiện và chuyên nghiệp. 
//       Dựa trên thông tin tour du lịch được cung cấp trong context dưới đây, 
//       hãy trả lời câu hỏi của người dùng một cách tự nhiên, ngắn gọn, và đúng trọng tâm. 
//       Chỉ sử dụng thông tin từ context, không thêm chi tiết ngoài thông tin đã cho. 
//       Nếu phù hợp, hãy mời người dùng hỏi thêm để nhận hỗ trợ chi tiết hơn.

//       Context:
//       ${context}
//     `;
//     const result = await model.generateContent(prompt);
//     const responseText = result.response.text();

//     return res.json({ response: responseText });
//   } catch (error) {
//     console.error('Error:', error.message);
//     return res.status(500).json({ error: 'Something went wrong' });
//   }
// });
// Phục vụ file tĩnh từ thư mục uploads
app.use('/uploads', express.static('uploads'));

//Sử dụng các Route
app.use("/chat", chatRoutes);
app.use("/tours", tourRoutes);
app.use("/promotions", promotionRoutes);
app.use("/auth", authRoutes);
app.use("/customers", customerRoutes);
app.use("/tour-price", tourPriceRoutes);
app.use("/schedule", scheduleRoutes);
app.use("/api", customerSupportRoutes); // Thêm route cho support
app.use("/api", consultantSupportRoutes);
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});

