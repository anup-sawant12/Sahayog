const skillRepository = require('./skill.repository');
const { ApiError } = require('../../core/middleware/error.middleware');

const getSkills = async () => {
  return skillRepository.getActiveSkills();
};

const getMySkills = async (userId) => {
  // 1. Find the worker profile using userId
  const profile = await skillRepository.findWorkerProfileByUserId(userId);
  if (!profile) {
    throw ApiError.notFound('Worker profile not found');
  }

  // 2. Return all skills belonging to that worker
  return skillRepository.getWorkerSkills(profile.id);
};

const addSkill = async (userId, data) => {
  // 1. Find the worker profile using userId
  const profile = await skillRepository.findWorkerProfileByUserId(userId);
  if (!profile) {
    throw ApiError.notFound('Worker profile not found');
  }

  // 2. Verify the requested skill exists
  const skill = await skillRepository.findSkillById(data.skillId);
  if (!skill) {
    throw ApiError.notFound('Skill not found');
  }

  // 3. Verify the skill is active
  if (!skill.isActive) {
    throw ApiError.badRequest('Skill is not available');
  }

  // 4. Check whether the worker already has this skill
  const existingWorkerSkill = await skillRepository.findWorkerSkill(
    profile.id,
    data.skillId
  );
  if (existingWorkerSkill) {
    throw ApiError.conflict('Skill already added to your profile');
  }

  // 5. Create WorkerSkill
  return skillRepository.createWorkerSkill(profile.id, data.skillId, data.level);
};

const updateMySkill = async (userId, workerSkillId, data) => {
  // 1. Find the worker profile using userId
  const profile = await skillRepository.findWorkerProfileByUserId(userId);
  if (!profile) {
    throw ApiError.notFound('Worker profile not found');
  }

  // 2. Find the WorkerSkill using workerSkillId
  const workerSkill = await skillRepository.findWorkerSkillById(workerSkillId);
  if (!workerSkill) {
    throw ApiError.notFound('Worker skill not found');
  }

  // 3. Verify the WorkerSkill belongs to the authenticated worker
  if (workerSkill.workerProfileId !== profile.id) {
    throw ApiError.forbidden('Access denied');
  }

  // 4. Update only the level
  return skillRepository.updateWorkerSkill(workerSkillId, data.level);
};

const removeMySkill = async (userId, workerSkillId) => {
  // 1. Find worker profile using userId
  const profile = await skillRepository.findWorkerProfileByUserId(userId);
  if (!profile) {
    throw ApiError.notFound('Worker profile not found');
  }

  // 2. Find WorkerSkill using workerSkillId
  const workerSkill = await skillRepository.findWorkerSkillById(workerSkillId);
  if (!workerSkill) {
    throw ApiError.notFound('Worker skill not found');
  }

  // 3. Verify it belongs to the authenticated worker
  if (workerSkill.workerProfileId !== profile.id) {
    throw ApiError.forbidden('Access denied');
  }

  // 4. Delete the WorkerSkill
  await skillRepository.deleteWorkerSkill(workerSkillId);

  return true;
};

module.exports = {
  getSkills,
  getMySkills,
  addSkill,
  updateMySkill,
  removeMySkill,
};
