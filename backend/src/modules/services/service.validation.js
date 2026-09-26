const { z } = require('zod');

const PRICING_UNITS = ['FIXED', 'HOURLY', 'DAILY'];
const SERVICE_STATUSES = ['ACTIVE', 'INACTIVE'];

const createServiceSchema = z
  .object({
    name: z
      .string({ required_error: 'Service name is required' })
      .trim()
      .min(2, 'Service name must be at least 2 characters')
      .max(150, 'Service name cannot exceed 150 characters'),
    category: z
      .string({ required_error: 'Category is required' })
      .trim()
      .min(2, 'Category must be at least 2 characters')
      .max(100, 'Category cannot exceed 100 characters'),
    description: z
      .string()
      .trim()
      .max(1000, 'Description cannot exceed 1000 characters')
      .nullable()
      .optional(),
    price: z
      .number({ required_error: 'Price is required', invalid_type_error: 'Price must be a number' })
      .positive('Price must be greater than zero')
      .max(1000000, 'Price cannot exceed 1,000,000'),
    pricingUnit: z
      .enum(PRICING_UNITS, {
        errorMap: () => ({ message: 'Pricing unit must be one of: FIXED, HOURLY, DAILY' }),
      })
      .optional()
      .default('FIXED'),
    durationMinutes: z
      .number({ invalid_type_error: 'Duration must be a number' })
      .int('Duration must be a whole number of minutes')
      .positive('Duration must be greater than zero')
      .max(10080, 'Duration cannot exceed 10,080 minutes (1 week)')
      .nullable()
      .optional(),
    status: z
      .enum(SERVICE_STATUSES, {
        errorMap: () => ({ message: 'Status must be either ACTIVE or INACTIVE' }),
      })
      .optional()
      .default('ACTIVE'),
  })
  .strict({ message: 'Unknown fields are not allowed' });

const updateServiceSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Service name must be at least 2 characters')
      .max(150, 'Service name cannot exceed 150 characters')
      .optional(),
    category: z
      .string()
      .trim()
      .min(2, 'Category must be at least 2 characters')
      .max(100, 'Category cannot exceed 100 characters')
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, 'Description cannot exceed 1000 characters')
      .nullable()
      .optional(),
    price: z
      .number({ invalid_type_error: 'Price must be a number' })
      .positive('Price must be greater than zero')
      .max(1000000, 'Price cannot exceed 1,000,000')
      .optional(),
    pricingUnit: z
      .enum(PRICING_UNITS, {
        errorMap: () => ({ message: 'Pricing unit must be one of: FIXED, HOURLY, DAILY' }),
      })
      .optional(),
    durationMinutes: z
      .number({ invalid_type_error: 'Duration must be a number' })
      .int('Duration must be a whole number of minutes')
      .positive('Duration must be greater than zero')
      .max(10080, 'Duration cannot exceed 10,080 minutes (1 week)')
      .nullable()
      .optional(),
    status: z
      .enum(SERVICE_STATUSES, {
        errorMap: () => ({ message: 'Status must be either ACTIVE or INACTIVE' }),
      })
      .optional(),
  })
  .strict({ message: 'Unknown fields are not allowed' })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  );

module.exports = {
  createServiceSchema,
  updateServiceSchema,
  PRICING_UNITS,
  SERVICE_STATUSES,
};
