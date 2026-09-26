const { z } = require('zod');

const skillLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

const addWorkerSkillSchema = z
  .object({
    skillId: z
      .string({ required_error: 'skillId is required' })
      .trim()
      .min(1, 'skillId cannot be empty'),
    level: z.enum(skillLevels, {
      message: 'level must be one of: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT',
    }),
  })
  .strict({ message: 'Unknown fields are not allowed' });

const updateWorkerSkillSchema = z
  .object({
    level: z.enum(skillLevels, {
      message: 'level must be one of: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT',
    }),
  })
  .strict({ message: 'Unknown fields are not allowed' });

module.exports = {
  addWorkerSkillSchema,
  updateWorkerSkillSchema,
};
