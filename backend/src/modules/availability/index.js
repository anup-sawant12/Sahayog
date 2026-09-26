const availabilityRoutes = require('./availability.routes');
const availabilityController = require('./availability.controller');
const availabilityService = require('./availability.service');
const availabilityRepository = require('./availability.repository');

module.exports = {
  availabilityRoutes,
  availabilityController,
  availabilityService,
  availabilityRepository,
};
