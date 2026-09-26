const matchingRoutes = require('./matching.routes');
const matchingController = require('./matching.controller');
const matchingService = require('./matching.service');
const matchingRepository = require('./matching.repository');
const matchingEngine = require('./matching.engine');

module.exports = {
  matchingRoutes,
  matchingController,
  matchingService,
  matchingRepository,
  matchingEngine,
};
