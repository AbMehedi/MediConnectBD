const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyC9Vu0rg1EQ3b6kfhrSeS-3kXB56s9ej-8');

async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log('Available models:');
    models.forEach(model => {
      console.log(`- ${model.name} (${model.supportedGenerationMethods?.join(', ') || 'N/A'})`);
    });
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listModels();