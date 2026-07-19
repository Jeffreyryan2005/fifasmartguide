const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// GenAI Chat Endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, language } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing message parameter.' });
    }

    const response = await aiService.generateResponse(message, language || 'English');
    res.json({ reply: response });
  } catch (error) {
    console.error('Error in /chat endpoint:', error);
    res.status(500).json({ error: 'Failed to process request. Please try again later.' });
  }
});

// Crowd Management Data Endpoint (Simulated)
router.get('/crowd-data', (req, res) => {
  // Simulating real-time data for different gates
  const gates = ['Gate A (North)', 'Gate B (East)', 'Gate C (South)', 'Gate D (West)'];
  const data = gates.map(gate => ({
    gate,
    crowdLevel: Math.floor(Math.random() * 100), // Percentage (0-100)
    estimatedWaitTime: Math.floor(Math.random() * 30) // Minutes (0-30)
  }));
  
  res.json({ timestamp: new Date().toISOString(), data });
});

module.exports = router;
