const workerRoutes = require('./worker.routes');
const workerController = require('./worker.controller');
const workerService = require('./worker.service');
const workerRepository = require('./worker.repository');

module.exports = {
  workerRoutes,
  workerController,
  workerService,
  workerRepository,
};
