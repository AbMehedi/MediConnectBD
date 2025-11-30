const NodeCache = require('node-cache');
const config = require('../config/config');

// Initialize cache with default TTL
const cache = new NodeCache({ 
  stdTTL: config.cache.ttl,
  checkperiod: 120 
});

/**
 * Cache middleware for GET requests
 */
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      console.log(`Cache HIT: ${key}`);
      return res.json(cachedResponse);
    }

    console.log(`Cache MISS: ${key}`);
    
    // Store original res.json
    const originalJson = res.json.bind(res);
    
    // Override res.json
    res.json = (body) => {
      cache.set(key, body, duration || config.cache.ttl);
      return originalJson(body);
    };

    next();
  };
};

/**
 * Clear cache for specific pattern
 */
const clearCache = (pattern) => {
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => key.includes(pattern));
  
  matchingKeys.forEach(key => {
    cache.del(key);
  });
  
  console.log(`Cleared ${matchingKeys.length} cache entries matching: ${pattern}`);
};

/**
 * Clear all cache
 */
const clearAllCache = () => {
  cache.flushAll();
  console.log('All cache cleared');
};

module.exports = {
  cache,
  cacheMiddleware,
  clearCache,
  clearAllCache
};
