const { GoogleGenAI } = require('@google/genai');

// Initialize the GenAI client with the API key from environment variables
// Note: We use the GoogleGenAI class from the new SDK
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('CRITICAL: GEMINI_API_KEY is not set in the environment variables.');
}

const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a response using the Gemini model.
 * @param {string} userMessage - The message from the user.
 * @param {string} language - The preferred language for the response.
 * @returns {Promise<string>} The generated response.
 */
async function generateResponse(userMessage, language = 'English') {
  try {
    const systemInstruction = `You are the official 'FIFA 26 Smart Guide' assistant for the FIFA World Cup 2026.
Your primary role is to assist fans with stadium operations, navigation, accessibility, and general tournament information.
You must be helpful, concise, and friendly.
Always prioritize inclusivity and accessibility in your answers (e.g., suggesting accessible routes).
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
