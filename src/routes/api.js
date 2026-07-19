'use strict';

const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const dataService = require('../services/dataService');

const ALLOWED_LANGUAGES = ['English', 'Spanish', 'French', 'Arabic', 'Portuguese'];

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

    if (message.length > 500) {
      const error = new Error('Message too long (max 500 characters).');
      error.status = 400;
      throw error;
    }

    const requestedLang = language || 'English';
    if (!ALLOWED_LANGUAGES.includes(requestedLang)) {
      const error = new Error('Unsupported language selected.');
      error.status = 400;
      throw error;
    }

    const response = await aiService.generateResponse(message, requestedLang);
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
  const data = dataService.getCrowdData();
  res.json({ success: true, timestamp: new Date().toISOString(), data });
});

/**
 * @route GET /api/eco-transit
 * @desc Returns simulated real-time eco-friendly transport schedules.
 * @access Public
 */
router.get('/eco-transit', (req, res) => {
  const data = dataService.getEcoTransitData();
  res.json({ success: true, timestamp: new Date().toISOString(), data });
});

/**
 * @route GET /api/wayfinding/:seatSection
 * @desc Returns accessible route info for a specific seat section.
 * @access Public
 */
router.get('/wayfinding/:seatSection', (req, res) => {
  const { seatSection } = req.params;
  const data = dataService.getWayfindingData(seatSection);
  res.json({ success: true, data });
});

module.exports = router;

