'use strict';

/**
 * Direct unit tests for aiService.js
 * Tests cache hit, cache miss, and error propagation paths.
 */

// Mock @google/genai BEFORE any require of aiService
const mockGenerateContent = jest.fn();

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent }
  }))
}));

// Now require aiService — it will get our mock
const aiService = require('../src/services/aiService');

describe('aiService', () => {
  beforeEach(() => {
    mockGenerateContent.mockClear();
    // Clear the internal cache between tests
    aiService._cache.clear();
  });

  describe('generateResponse — cache miss (fresh call)', () => {
    it('should call the Gemini API and return the response text', async () => {
      mockGenerateContent.mockResolvedValueOnce({ text: 'Welcome to FIFA 26!' });

      const result = await aiService.generateResponse('Hello', 'English');

      expect(result).toBe('Welcome to FIFA 26!');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should store the result in the cache after a fresh API call', async () => {
      mockGenerateContent.mockResolvedValueOnce({ text: 'Cached reply' });

      await aiService.generateResponse('What time is kickoff?', 'English');

      const key = 'English:what time is kickoff?';
      expect(aiService._cache.has(key)).toBe(true);
      expect(aiService._cache.get(key).value).toBe('Cached reply');
    });

    it('should return fallback text when response.text is falsy', async () => {
      mockGenerateContent.mockResolvedValueOnce({ text: null });

      const result = await aiService.generateResponse('What?', 'English');

      expect(result).toBe(
        'I am sorry, but I could not generate a response at this time. Please try again.'
      );
    });
  });

  describe('generateResponse — cache hit (repeated query)', () => {
    it('should return cached value and NOT call the Gemini API again', async () => {
      mockGenerateContent.mockResolvedValueOnce({ text: 'First response' });

      // First call — cache miss
      const first = await aiService.generateResponse('Where is gate A?', 'English');
      // Second call — same message/language, should hit cache
      const second = await aiService.generateResponse('Where is gate A?', 'English');

      expect(first).toBe('First response');
      expect(second).toBe('First response');
      // Gemini should only have been called once
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should treat the same query in different languages as separate cache keys', async () => {
      mockGenerateContent
        .mockResolvedValueOnce({ text: 'English answer' })
        .mockResolvedValueOnce({ text: 'Respuesta en Español' });

      await aiService.generateResponse('Hello', 'English');
      await aiService.generateResponse('Hello', 'Spanish');

      // Two different cache keys → two API calls
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });
  });

  describe('generateResponse — error path', () => {
    it('should rethrow the original error when Gemini API fails', async () => {
      const apiError = new Error('API quota exceeded');
      mockGenerateContent.mockRejectedValueOnce(apiError);

      await expect(aiService.generateResponse('Hi', 'English')).rejects.toThrow(
        'API quota exceeded'
      );
    });
  });
});
