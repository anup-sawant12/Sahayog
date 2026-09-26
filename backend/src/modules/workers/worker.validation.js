const { z } = require('zod');

const createWorkerProfileSchema = z
  .object({
    bio: z
      .string()
      .trim()
      .max(1000, 'Bio must not exceed 1000 characters')
      .optional(),
    experienceYears: z
      .number({ invalid_type_error: 'Experience years must be a number' })
      .int('Experience years must be an integer')
      .min(0, 'Experience years cannot be negative')
      .max(60, 'Experience years cannot exceed 60')
      .optional(),
    profilePhotoUrl: z
      .string()
      .trim()
      .url('Profile photo must be a valid URL')
      .optional()
      .or(z.literal('')),
  })
  .strict({ message: 'Unknown fields are not allowed' });

const updateWorkerProfileSchema = z
  .object({
    bio: z
      .string()
      .trim()
      .max(1000, 'Bio must not exceed 1000 characters')
      .optional(),
    experienceYears: z
      .number({ invalid_type_error: 'Experience years must be a number' })
      .int('Experience years must be an integer')
      .min(0, 'Experience years cannot be negative')
      .max(60, 'Experience years cannot exceed 60')
      .optional(),
    profilePhotoUrl: z
      .string()
      .trim()
      .url('Profile photo must be a valid URL')
      .optional()
      .or(z.literal('')),
  })
  .strict({ message: 'Unknown fields are not allowed' })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field (bio, experienceYears, or profilePhotoUrl) must be provided for update' }
  );

module.exports = {
  createWorkerProfileSchema,
  updateWorkerProfileSchema,
};
