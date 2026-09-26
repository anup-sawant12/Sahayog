const { z } = require('zod');

const updateUserStatusSchema = z
  .object({
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED'], {
      required_error: 'Status is required',
      invalid_type_error: 'Status must be ACTIVE, INACTIVE, or SUSPENDED',
    }),
  })
  .strict();

const createSkillSchema = z
  .object({
    name: z
      .string({ required_error: 'Skill name is required' })
      .trim()
      .min(2, 'Skill name must be at least 2 characters')
      .max(100, 'Skill name cannot exceed 100 characters'),
    category: z.string().trim().optional(),
    description: z
      .string()
      .trim()
      .max(500, 'Description cannot exceed 500 characters')
      .nullable()
      .optional(),
  })
  .passthrough();

const updateSkillSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Skill name must be at least 2 characters')
      .max(100, 'Skill name cannot exceed 100 characters')
      .optional(),
    category: z.string().trim().optional(),
    description: z
      .string()
      .trim()
      .max(500, 'Description cannot exceed 500 characters')
      .nullable()
      .optional(),
    isActive: z.boolean().optional(),
  })
  .passthrough();

const toggleSkillSchema = z
  .object({
    isActive: z.boolean({ required_error: 'isActive boolean flag is required' }),
  })
  .strict();

module.exports = {
  updateUserStatusSchema,
  createSkillSchema,
  updateSkillSchema,
  toggleSkillSchema,
};
