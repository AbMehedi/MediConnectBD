const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/config');

// Initialize Gemini AI
const genAI = config.gemini.apiKey ? new GoogleGenerativeAI(config.gemini.apiKey) : null;

/**
 * Analyze symptoms using Gemini AI
 */
const analyzeSymptoms = async (symptoms) => {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `You are a medical AI assistant for MediConnect BD, a healthcare platform in Bangladesh. 
Analyze the following symptoms and provide a JSON response with:
1. specialist: The medical specialist to consult (e.g., "Cardiologist", "General Physician")
2. urgency: Level of urgency ("high", "medium", "low")
3. advice: Brief advice for the patient (2-3 sentences)
4. possibleConditions: Array of possible conditions (max 3)

Symptoms: ${symptoms}

Respond ONLY with valid JSON, no other text.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Invalid AI response format');
  } catch (error) {
    console.error('Gemini AI error:', error);
    throw error;
  }
};

/**
 * Chat with AI assistant
 */
const chatWithAI = async (message, conversationHistory = []) => {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const systemPrompt = `You are MediBot, a friendly medical AI assistant for MediConnect BD. 
You help patients in Bangladesh with:
- General health questions
- Understanding symptoms
- Finding appropriate specialists
- Booking appointments guidance
- Health tips

Be concise, friendly, and always recommend consulting a doctor for serious concerns.`;

  const fullPrompt = conversationHistory.length > 0
    ? `${systemPrompt}\n\nConversation history:\n${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n\nUser: ${message}\nAssistant:`
    : `${systemPrompt}\n\nUser: ${message}\nAssistant:`;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI chat error:', error);
    throw error;
  }
};

module.exports = {
  analyzeSymptoms,
  chatWithAI
};
