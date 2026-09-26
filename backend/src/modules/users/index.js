const userRoutes = require('./user.routes');
const userController = require('./user.controller');
const userService = require('./user.service');
const userRepository = require('./user.repository');

module.exports = {
  userRoutes,
  userController,
  userService,
  userRepository,
};
