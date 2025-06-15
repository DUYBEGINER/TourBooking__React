const crypto = require('crypto');
const https = require('https');
const { v4: uuidv4 } = require('uuid');
const momoConfig = require('../config/momo');

class MoMoUtils {
  // Generate unique reference ID using UUID v4
  static generateReferenceId() {
    return uuidv4();
  }

  // Generate unique order ID for MoMo
  static generateOrderId() {
    return momoConfig.partnerCode + new Date().getTime();
  }

  // Create HMAC SHA256 signature for MoMo API
  static createSignature(rawSignature) {
    return crypto.createHmac('sha256', momoConfig.secretKey)
      .update(rawSignature)
      .digest('hex');
  }

  // Build raw signature string for MoMo API
  static buildRawSignature(params) {
    const {
      accessKey, amount, extraData, ipnUrl, orderId, 
      orderInfo, partnerCode, redirectUrl, requestId, requestType
    } = params;
    
    return `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  }

  // Create MoMo payment using real API
  static async createPayment(paymentData) {
    return new Promise((resolve, reject) => {
      try {
        const { amount, orderInfo, orderId, extraData = '' } = paymentData;
        
        const requestId = orderId;
        
        // Build raw signature
        const rawSignature = this.buildRawSignature({
          accessKey: momoConfig.accessKey,
          amount: amount.toString(),
          extraData,
          ipnUrl: momoConfig.ipnUrl,
          orderId,
          orderInfo,
          partnerCode: momoConfig.partnerCode,
          redirectUrl: momoConfig.returnUrl,
          requestId,
          requestType: momoConfig.requestType
        });
        
        console.log('📝 MoMo Raw Signature:', rawSignature);
        
        // Create signature
        const signature = this.createSignature(rawSignature);
        console.log('🔐 MoMo Signature:', signature);
        
        // Prepare request body
        const requestBody = JSON.stringify({
          partnerCode: momoConfig.partnerCode,
          partnerName: momoConfig.partnerName,
          storeId: momoConfig.storeId,
          requestId,
          amount: amount.toString(),
          orderId,
          orderInfo,
          redirectUrl: momoConfig.returnUrl,
          ipnUrl: momoConfig.ipnUrl,
          lang: momoConfig.lang,
          requestType: momoConfig.requestType,
          autoCapture: momoConfig.autoCapture,
          extraData,
          orderGroupId: '',
          signature
        });
        
        console.log('📤 MoMo Request Body:', requestBody);
        
        // Configure HTTPS request
        const options = {
          hostname: 'test-payment.momo.vn',
          port: 443,
          path: momoConfig.api.create,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
          }
        };
        
        // Send request to MoMo
        const req = https.request(options, (res) => {
          console.log(`📊 MoMo Response Status: ${res.statusCode}`);
          
          let responseBody = '';
          
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            responseBody += chunk;
          });
          
          res.on('end', () => {
            try {
              const response = JSON.parse(responseBody);
              console.log('📥 MoMo Response:', response);
              
              if (response.resultCode === 0) {
                // Success
                resolve({
                  success: true,
                  orderId,
                  requestId,
                  amount,
                  payUrl: response.payUrl,
                  qrCodeUrl: response.qrCodeUrl,
                  deeplink: response.deeplink,
                  resultCode: response.resultCode,
                  message: response.message || 'Tạo thanh toán MoMo thành công'
                });
              } else {
                // Error from MoMo
                reject(new Error(`MoMo Error ${response.resultCode}: ${response.message}`));
              }
            } catch (parseError) {
              console.error('❌ Error parsing MoMo response:', parseError);
              reject(new Error('Lỗi phân tích phản hồi từ MoMo'));
            }
          });
        });
        
        req.on('error', (error) => {
          console.error('❌ MoMo Request Error:', error);
          reject(new Error(`Lỗi kết nối MoMo: ${error.message}`));
        });
        
        // Send the request
        console.log('🚀 Sending MoMo payment request...');
        req.write(requestBody);
        req.end();
        
      } catch (error) {
        console.error('❌ Error in createPayment:', error);
        reject(new Error(`Lỗi tạo thanh toán MoMo: ${error.message}`));
      }
    });
  }

  // Query payment status using MoMo API
  static async queryPayment(orderId) {
    return new Promise((resolve, reject) => {
      try {
        const requestId = orderId;
        
        // Build raw signature for query
        const rawSignature = `accessKey=${momoConfig.accessKey}&orderId=${orderId}&partnerCode=${momoConfig.partnerCode}&requestId=${requestId}`;
        const signature = this.createSignature(rawSignature);
        
        const requestBody = JSON.stringify({
          partnerCode: momoConfig.partnerCode,
          requestId,
          orderId,
          lang: momoConfig.lang,
          signature
        });
        
        const options = {
          hostname: 'test-payment.momo.vn',
          port: 443,
          path: momoConfig.api.query,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
          }
        };
        
        const req = https.request(options, (res) => {
          let responseBody = '';
          
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            responseBody += chunk;
          });
          
          res.on('end', () => {
            try {
              const response = JSON.parse(responseBody);
              console.log('📥 MoMo Query Response:', response);
              resolve(response);
            } catch (parseError) {
              reject(new Error('Lỗi phân tích phản hồi truy vấn MoMo'));
            }
          });
        });
        
        req.on('error', (error) => {
          reject(new Error(`Lỗi truy vấn MoMo: ${error.message}`));
        });
        
        req.write(requestBody);
        req.end();
        
      } catch (error) {
        reject(new Error(`Lỗi truy vấn thanh toán MoMo: ${error.message}`));
      }
    });
  }

  // Format currency display
  static formatCurrency(amount, currency = 'VND') {
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Get MoMo error messages
  static getMoMoErrorMessage(resultCode) {
    const errorMessages = {
      0: 'Giao dịch thành công',
      9000: 'Giao dịch được khởi tạo, chờ người dùng xác nhận thanh toán',
      8000: 'Giao dịch đang được xử lý',
      7000: 'Trừ tiền thành công. Giao dịch bị các lỗi khác',
      9001: 'Giao dịch thất bại do tài khoản người dùng không đủ số dư',
      9002: 'Giao dịch thất bại do số tiền vượt quá hạn mức thanh toán hàng ngày của người dùng',
      9003: 'Giao dịch bị từ chối bởi người dùng',
      9004: 'Giao dịch thất bại do số tiền vượt quá hạn mức thanh toán mỗi lần của người dùng',
      9005: 'Giao dịch thất bại do url hoặc QR code đã hết hạn',
      9006: 'Giao dịch thất bại do người dùng đã hủy thanh toán',
      1000: 'Giao dịch thất bại do lỗi hệ thống',
      1001: 'Giao dịch thất bại do sai thông tin',
      1002: 'Giao dịch thất bại do orderId đã tồn tại',
      1003: 'Giao dịch thất bại do số tiền không hợp lệ',
      1004: 'Giao dịch thất bại do thông tin thanh toán không hợp lệ',
      1005: 'Giao dịch thất bại do email không hợp lệ',
      1006: 'Giao dịch thất bại do phone không hợp lệ',
      1007: 'Giao dịch thất bại do lỗi thông tin giao dịch',
      2001: 'Giao dịch thất bại do sai chữ ký (signature)',
      2002: 'Giao dịch thất bại do sai định dạng dữ liệu',
      2003: 'Giao dịch thất bại do sai accessKey',
      2004: 'Giao dịch thất bại do sai secretKey',
      2005: 'Giao dịch thất bại do sai partnerCode',
      2006: 'Giao dịch thất bại do IP không được phép truy cập'
    };
    
    return errorMessages[resultCode] || `Lỗi không xác định (${resultCode})`;
  }

  // Debug function for logging
  static debugLog(message, data = null) {
    if (momoConfig.environment === 'test') {
      console.log(`🔍 MoMo Debug: ${message}`);
      if (data) {
        console.log('   Data:', data);
      }
    }
  }
}

module.exports = MoMoUtils; 