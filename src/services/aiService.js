'use strict';

const { GoogleGenAI } = require('@google/genai');

/**
 * Initialize the Google Gemini AI client
 */
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('CRITICAL: GEMINI_API_KEY is not set in the environment variables.');
}
const ai = new GoogleGenAI({ apiKey });

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 min

/**
 * Generates a response using the Gemini model.
 * 
 * @param {string} userMessage - The query from the fan.
 * @param {string} language - The preferred output language.
 * @returns {Promise<string>} The generated response tailored to FIFA World Cup 2026.
 */
async function generateResponse(userMessage, language = 'English') {
  try {
    const key = `${language}:${userMessage.toLowerCase().trim()}`;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      return cached.value;
    }

    const systemInstruction = `You are the official 'FIFA 26 Smart Guide' assistant for the FIFA World Cup 2026.
Your primary role is to assist fans with stadium operations, navigation, accessibility, transportation, sustainability, and general tournament information.
You must be helpful, concise, and friendly, providing real-time operational intelligence where applicable.
Always prioritize inclusivity and accessibility. When asked about transportation, highlight eco-friendly and sustainable transit options.
The user wants the response in ${language}. If the language is not English, ensure your response is accurately translated into ${language}.
Keep responses brief (max 2-3 short paragraphs) to ensure readability on mobile devices in a crowded stadium.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                role: 'user',
                parts: [{ text: userMessage }]
            }
        ],
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 500,
        }
    });

    if (response.text) {
        cache.set(key, { value: response.text, time: Date.now() });
        return response.text;
    } else {
        return 'I am sorry, but I could not generate a response at this time. Please try again.';
    }
    
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to communicate with AI service.');
  }
}

module.exports = {
  generateResponse
};
