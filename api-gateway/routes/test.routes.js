const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');

// Proxy configuration for test routes
const testProxy = createProxyMiddleware({
  target: process.env.BACKEND_URL || 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: {
    '^/api/test': '/api/test',
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 [TEST] Proxying: ${req.method} ${req.originalUrl} -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    console.error(`❌ [TEST] Proxy error:`, err);
    res.status(500).json({
      success: false,
      error: 'Test service temporarily unavailable'
    });
  }
});

// Apply proxy to all test routes
router.use('*', testProxy);

module.exports = router;