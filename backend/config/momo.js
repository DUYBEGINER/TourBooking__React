const momoConfig = {
  // MoMo production/test environment configuration
  environment: 'test', // 'test' or 'production'
  baseUrl: 'https://test-payment.momo.vn',
  
  // Test credentials from MoMo documentation
  accessKey: 'F8BBA842ECF85',
  secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
  partnerCode: 'MOMO',
  partnerName: 'Test',
  storeId: 'MomoTestStore',
  
  // API endpoints
  api: {
    create: '/v2/gateway/api/create',
    query: '/v2/gateway/api/query',
    refund: '/v2/gateway/api/refund'
  },
  
  // Callback URLs
  callbackHost: process.env.MOMO_CALLBACK_HOST || 'http://localhost:3001',
  returnUrl: process.env.MOMO_RETURN_URL || 'http://localhost:3001/api/payment/momo-return',
  ipnUrl: process.env.MOMO_IPN_URL || 'http://localhost:3001/api/payment/momo-ipn',
  
  // Default values
  currency: 'VND',
  timeout: 30000, // 30 seconds
  requestType: 'payWithMethod',
  autoCapture: true,
  lang: 'vi',
  
  // Test webhook URL (you can use webhook.site for testing)
  webhookUrl: 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b'
};

module.exports = momoConfig; 