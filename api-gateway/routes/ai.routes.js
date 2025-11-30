const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/common');
const { aiLimiter } = require('../middleware/rateLimiter');
const { cacheMiddleware } = require('../middleware/cache');
const { analyzeSymptoms, chatWithAI } = require('../services/aiService');

/**
 * Analyze Symptoms
 * POST /api/ai/analyze-symptoms
 */
router.post('/analyze-symptoms',
  aiLimiter,
  optionalAuth,
  [
    body('symptoms').trim().isLength({ min: 10 }).withMessage('Please provide detailed symptoms (minimum 10 characters)')
  ],
  validate,
  async (req, res) => {
    try {
      const { symptoms } = req.body;
      
      console.log(`AI Analysis request from ${req.user?.email || 'anonymous'}: ${symptoms.substring(0, 50)}...`);
      
      const analysis = await analyzeSymptoms(symptoms);
      
      // Log to backend if user is authenticated
      if (req.user) {
        const axios = require('axios');
        const config = require('../config/config');
        
        try {
          await axios.post(`${config.backend.url}/api/ai-logs`, {
            userId: req.user.id,
            symptoms,
            analysis,
            timestamp: new Date()
          }, {
            headers: { 'Authorization': req.headers.authorization }
          });
        } catch (logError) {
          console.error('Failed to log AI analysis:', logError.message);
        }
      }
      
      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('AI analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'AI analysis service temporarily unavailable',
        message: error.message
      });
    }
  }
);

/**
 * Chat with AI
 * POST /api/ai/chat
 */
router.post('/chat',
  aiLimiter,
  optionalAuth,
  [
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('conversationHistory').optional().isArray().withMessage('Conversation history must be an array')
  ],
  validate,
  async (req, res) => {
    try {
      const { message, conversationHistory = [] } = req.body;
      
      console.log(`AI Chat request from ${req.user?.email || 'anonymous'}`);
      
      const response = await chatWithAI(message, conversationHistory);
      
      res.json({
        success: true,
        data: {
          message: response,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('AI chat error:', error);
      res.status(500).json({
        success: false,
        error: 'AI chat service temporarily unavailable'
      });
    }
  }
);

/**
 * Get AI Service Status
 * GET /api/ai/status
 */
router.get('/status', cacheMiddleware(60), (req, res) => {
  const config = require('../config/config');
  
  res.json({
    success: true,
    data: {
      available: !!config.gemini.apiKey && config.gemini.apiKey !== 'PLACEHOLDER_API_KEY',
      model: 'gemini-2.0-flash-exp',
      features: ['symptom-analysis', 'chat']
    }
  });
});

module.exports = router;
