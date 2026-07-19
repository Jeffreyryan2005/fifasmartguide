'use strict';

/**
 * Service for handling structured data (simulating a DB or IoT source)
 */

/**
 * Retrieves simulated crowd data for stadium gates.
 * @returns {Array} List of gate objects with crowd levels and wait times.
 */
function getCrowdData() {
  const gates = ['Gate A (North)', 'Gate B (East)', 'Gate C (South)', 'Gate D (West)'];
  return gates.map(gate => ({
    gate,
    crowdLevel: Math.floor(Math.random() * 100),
    estimatedWaitTime: Math.floor(Math.random() * 30)
  }));
}

/**
 * Retrieves simulated eco-transit options.
 * @returns {Array} List of transit objects.
 */
function getEcoTransitData() {
  return [
    { type: 'Electric Bus (Line 42)', status: 'Arriving in 5 mins', co2Saved: '15kg' },
    { type: 'Metro (Green Line)', status: 'Arriving in 12 mins', co2Saved: '30kg' },
    { type: 'Shared E-Bikes', status: '45 available nearby', co2Saved: '100% Zero Emissions' }
  ];
}

/**
 * Retrieves wayfinding instructions for a specific seat section.
 * @param {string} section - The seat section identifier.
 * @returns {Object} Wayfinding data.
 */
function getWayfindingData(section) {
  const normalized = section.toUpperCase().trim();
  const routes = {
    'A1': { description: 'Take the North ramp, level 2, turn left.', accessible: true },
    'B2': { description: 'Enter East gate, use elevator 3 to level 4.', accessible: true },
    'C3': { description: 'South gate entrance, straight ahead past the food court.', accessible: false }
  };
  
  return routes[normalized] || { description: 'Route information unavailable for this section.', accessible: false };
}

module.exports = {
  getCrowdData,
  getEcoTransitData,
  getWayfindingData
};
