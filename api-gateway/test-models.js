const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyC9Vu0rg1EQ3b6kfhrSeS-3kXB56s9ej-8');

async function testModels() {
  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-1.5-pro', 
    'gemini-pro',
    'gemini-1.0-pro'
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Testing model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Hello, test message');
      const response = await result.response;
      console.log(`✅ ${modelName} works!`);
      console.log(`Response: ${response.text().substring(0, 50)}...`);
      break; // Use the first working model
    } catch (error) {
      console.log(`❌ ${modelName} failed: ${error.message}`);
    }
  }
}

testModels();