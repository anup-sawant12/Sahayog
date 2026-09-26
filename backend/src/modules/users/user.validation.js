const { z } = require('zod');

const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .optional(),
    email: z
      .string()
      .trim()
      .email('Invalid email format')
      .toLowerCase()
      .optional(),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, 'Phone number must be a valid 10-digit Indian phone number')
      .optional(),
  })
  .strict({ message: 'Unknown fields are not allowed' })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field (name, email, or phone) must be provided for update' }
  );

module.exports = {
  updateProfileSchema,
};
