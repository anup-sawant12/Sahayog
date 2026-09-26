const express = require('express');
const router = express.Router();
const skillController = require('./skill.controller');
const { authenticate } = require('../../core/middleware/auth.middleware');
const { authorize } = require('../../core/middleware/role.middleware');
const { validate } = require('../../core/middleware/validation.middleware');
const {
  addWorkerSkillSchema,
  updateWorkerSkillSchema,
} = require('./skill.validation');

// Public skill catalog (does NOT require authentication)
router.get('/skills', skillController.getSkills);

// Worker skill management (requires authenticate & authorize('WORKER'))
router.get(
  '/workers/skills',
  authenticate,
  authorize('WORKER'),
  skillController.getMySkills
);

router.post(
  '/workers/skills',
  authenticate,
  authorize('WORKER'),
  validate(addWorkerSkillSchema),
  skillController.addSkill
);

router.patch(
  '/workers/skills/:id',
  authenticate,
  authorize('WORKER'),
  validate(updateWorkerSkillSchema),
  skillController.updateMySkill
);

router.delete(
  '/workers/skills/:id',
  authenticate,
  authorize('WORKER'),
  skillController.removeMySkill
);

module.exports = router;
