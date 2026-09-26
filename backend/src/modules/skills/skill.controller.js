const skillService = require('./skill.service');

const getSkills = async (req, res, next) => {
  try {
    const skills = await skillService.getSkills();

    return res.status(200).json({
      success: true,
      message: 'Skills fetched successfully',
      data: {
        skills,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMySkills = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const skills = await skillService.getMySkills(userId);

    return res.status(200).json({
      success: true,
      message: 'Worker skills fetched successfully',
      data: {
        skills,
      },
    });
  } catch (error) {
    next(error);
  }
};

const addSkill = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const skill = await skillService.addSkill(userId, req.body);

    return res.status(201).json({
      success: true,
      message: 'Skill added successfully',
      data: {
        skill,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateMySkill = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const workerSkillId = req.params.id;
    const skill = await skillService.updateMySkill(userId, workerSkillId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      data: {
        skill,
      },
    });
  } catch (error) {
    next(error);
  }
};

const removeMySkill = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const workerSkillId = req.params.id;
    await skillService.removeMySkill(userId, workerSkillId);

    return res.status(200).json({
      success: true,
      message: 'Skill removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSkills,
  getMySkills,
  addSkill,
  updateMySkill,
  removeMySkill,
};
