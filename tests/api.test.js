'use strict';

const request = require('supertest');
const app = require('../src/app');
const aiService = require('../src/services/aiService');

// Mock the AI service to avoid actual API calls during tests
jest.mock('../src/services/aiService');

describe('API Routes & Middlewares', () => {
  
  describe('GET /api/crowd-data', () => {
    it('should return simulated crowd data with a timestamp', async () => {
      const res = await request(app).get('/api/crowd-data');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBeTruthy();
      
      const firstGate = res.body.data[0];
      expect(firstGate).toHaveProperty('gate');
      expect(firstGate).toHaveProperty('crowdLevel');
      expect(firstGate).toHaveProperty('estimatedWaitTime');
    });
  });

  describe('GET /api/eco-transit', () => {
    it('should return simulated eco-transit data', async () => {
      const res = await request(app).get('/api/eco-transit');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBeTruthy();
      
      const transit = res.body.data[0];
      expect(transit).toHaveProperty('type');
      expect(transit).toHaveProperty('status');
      expect(transit).toHaveProperty('co2Saved');
    });
  });

  describe('POST /api/chat', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return a reply for a valid message', async () => {
      const mockReply = "Hello! I am your eco-friendly assistant.";
      aiService.generateResponse.mockResolvedValue(mockReply);

      const res = await request(app)
        .post('/api/chat')
        .send({ message: 'Hi there', language: 'English' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('reply', mockReply);
      expect(aiService.generateResponse).toHaveBeenCalledWith('Hi there', 'English');
    });

    it('should trigger error handler (400) if message is missing', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ language: 'English' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'Invalid or missing message parameter.');
    });
    
    it('should trigger error handler (500) on AI service failure', async () => {
      aiService.generateResponse.mockRejectedValue(new Error('API failure'));

      const res = await request(app)
        .post('/api/chat')
        .send({ message: 'Hi there' });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error', 'API failure');
    });
  });

  describe('Fallback Route', () => {
    it('should return index.html for unknown routes (SPA fallback)', async () => {
      const res = await request(app).get('/some-random-route');
      expect(res.statusCode).toEqual(200);
      expect(res.headers['content-type']).toMatch(/html/);
    });
  });

});
