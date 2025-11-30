const axios = require('axios');
const config = require('../config/config');

/**
 * Proxy request to backend service
 */
const proxyToBackend = async (req, res, path, method = null) => {
  try {
    const requestMethod = method || req.method;
    const url = `${config.backend.url}${path || req.path}`;
    
    const axiosConfig = {
      method: requestMethod,
      url: url,
      headers: {
        ...req.headers,
        host: new URL(config.backend.url).host
      },
      params: req.query,
      timeout: 30000
    };

    // Add body for POST, PUT, PATCH
    if (['POST', 'PUT', 'PATCH'].includes(requestMethod.toUpperCase())) {
      axiosConfig.data = req.body;
    }

    const response = await axios(axiosConfig);
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Backend proxy error:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        success: false,
        error: 'Backend service unavailable'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to connect to backend service'
      });
    }
  }
};

module.exports = {
  proxyToBackend
};
