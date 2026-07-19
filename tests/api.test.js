const request = require('supertest');
const app = require('../server');
const aiService = require('../src/services/aiService');

// Mock the AI service to avoid actual API calls during tests
jest.mock('../src/services/aiService');

describe('API Routes', () => {
  
  describe('GET /api/crowd-data', () => {
    it('should return simulated crowd data with a timestamp', async () => {
      const res = await request(app).get('/api/crowd-data');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBeTruthy();
      expect(res.body.data.length).toBeGreaterThan(0);
      
      // Check structure of first item
      const firstGate = res.body.data[0];
      expect(firstGate).toHaveProperty('gate');
      expect(firstGate).toHaveProperty('crowdLevel');
      expect(firstGate).toHaveProperty('estimatedWaitTime');
    });
  });

  describe('POST /api/chat', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return a reply for a valid message', async () => {
      // Setup mock implementation
      const mockReply = "Hello! I am your assistant.";
      aiService.generateResponse.mockResolvedValue(mockReply);

      const res = await request(app)
        .post('/api/chat')
        .send({ message: 'Hi there', language: 'English' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('reply', mockReply);
      expect(aiService.generateResponse).toHaveBeenCalledWith('Hi there', 'English');
    });

    it('should default to English if language is not provided', async () => {
      const mockReply = "Hello!";
      aiService.generateResponse.mockResolvedValue(mockReply);

      const res = await request(app)
        .post('/api/chat')
        .send({ message: 'Hi there' });

      expect(res.statusCode).toEqual(200);
      expect(aiService.generateResponse).toHaveBeenCalledWith('Hi there', 'English');
    });

    it('should return 400 if message is missing', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ language: 'English' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
    
    it('should handle AI service errors gracefully', async () => {
      aiService.generateResponse.mockRejectedValue(new Error('API failure'));

      const res = await request(app)
        .post('/api/chat')
        .send({ message: 'Hi there' });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('error');
    });
  });
});
