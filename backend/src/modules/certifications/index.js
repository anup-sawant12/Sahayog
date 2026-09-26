const certificationRoutes = require('./certification.routes');
const certificationController = require('./certification.controller');
const certificationService = require('./certification.service');
const certificationRepository = require('./certification.repository');

module.exports = {
  certificationRoutes,
  certificationController,
  certificationService,
  certificationRepository,
};
