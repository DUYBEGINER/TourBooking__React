const vnpayConfig = {
  vnp_TmnCode: '3WE8ZLFM', // Terminal ID từ thông tin bạn cung cấp
  vnp_HashSecret: 'RB6ZXCA2SAJEN29WMBOFRUGP5HNTOKBG', // Secret Key từ thông tin bạn cung cấp
  vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', // URL thanh toán test
  vnp_Api: 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
  vnp_ReturnUrl: 'http://localhost:3002/api/payment/vnpay-return', // URL return về backend để xử lý
  vnp_IpnUrl: 'http://localhost:3002/api/payment/vnpay-ipn', // URL IPN callback
  vnp_Version: '2.0.0',
  vnp_Command: 'pay',
  vnp_CurrCode: 'VND',
  vnp_Locale: 'vn',
  
  // Environment settings
  isTestEnvironment: process.env.NODE_ENV !== 'production',
  allowTestSignatureBypass: true // Allow test transactions even with signature mismatch
};

module.exports = vnpayConfig; 