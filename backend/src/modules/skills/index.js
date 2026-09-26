const skillRoutes = require('./skill.routes');
const skillController = require('./skill.controller');
const skillService = require('./skill.service');
const skillRepository = require('./skill.repository');

module.exports = {
  skillRoutes,
  skillController,
  skillService,
  skillRepository,
};
