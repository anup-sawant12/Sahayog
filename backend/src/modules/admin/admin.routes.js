const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { authenticate } = require('../../core/middleware/auth.middleware');
const { authorize } = require('../../core/middleware/role.middleware');
const { validate } = require('../../core/middleware/validation.middleware');
const {
  updateUserStatusSchema,
  createSkillSchema,
  updateSkillSchema,
  toggleSkillSchema,
} = require('./admin.validation');

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Dashboard Overview
router.get('/dashboard', adminController.getDashboardStats);

// Workers Management
router.get('/workers', adminController.getWorkers);
router.get('/workers/:id', adminController.getWorkerById);
router.patch('/workers/:id/approve', adminController.approveWorker);
router.patch('/workers/:id/reject', adminController.rejectWorker);

// Users Management
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', validate(updateUserStatusSchema), adminController.updateUserStatus);

// Bookings Monitoring
router.get('/bookings', adminController.getBookings);

// Service Requests Monitoring
router.get('/service-requests', adminController.getServiceRequests);

// Platform Skills Management
router.get('/skills', adminController.getSkills);
router.get('/services', adminController.getSkills);
router.post('/skills', validate(createSkillSchema), adminController.createSkill);
router.patch('/skills/:id', validate(updateSkillSchema), adminController.updateSkill);
router.patch('/skills/:id/toggle', validate(toggleSkillSchema), adminController.toggleSkillStatus);

module.exports = router;
