'use strict';

const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

/**
 * @route POST /api/chat
 * @desc Generates a response using the Gemini AI service.
 * @access Public
 */
router.post('/chat', async (req, res, next) => {
  try {
    const { message, language } = req.body;
    
    if (!message || typeof message !== 'string') {
      const error = new Error('Invalid or missing message parameter.');
      error.status = 400;
      throw error;
    }

    const response = await aiService.generateResponse(message, language || 'English');
    res.json({ success: true, reply: response });
  } catch (error) {
    next(error); // Pass to global error handler
  }
});

/**
 * @route GET /api/crowd-data
 * @desc Returns simulated real-time data for stadium gates.
 * @access Public
 */
router.get('/crowd-data', (req, res) => {
  const gates = ['Gate A (North)', 'Gate B (East)', 'Gate C (South)', 'Gate D (West)'];
  const data = gates.map(gate => ({
    gate,
    crowdLevel: Math.floor(Math.random() * 100), // Percentage (0-100)
    estimatedWaitTime: Math.floor(Math.random() * 30) // Minutes (0-30)
  }));
  
  res.json({ success: true, timestamp: new Date().toISOString(), data });
});

/**
 * @route GET /api/eco-transit
 * @desc Returns simulated real-time eco-friendly transport schedules (Sustainability feature).
 * @access Public
 */
router.get('/eco-transit', (req, res) => {
  const transitOptions = [
    { type: 'Electric Bus (Line 42)', status: 'Arriving in 5 mins', co2Saved: '15kg' },
    { type: 'Metro (Green Line)', status: 'Arriving in 12 mins', co2Saved: '30kg' },
    { type: 'Shared E-Bikes', status: '45 available nearby', co2Saved: '100% Zero Emissions' }
  ];
  
  res.json({ success: true, timestamp: new Date().toISOString(), data: transitOptions });
});

module.exports = router;

