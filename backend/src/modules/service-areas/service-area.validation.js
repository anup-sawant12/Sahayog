const { z } = require('zod');

const pincodeRegex = /^[1-9]\d{5}$/;

const createServiceAreaSchema = z
  .object({
    city: z
      .string({ required_error: 'City is required' })
      .trim()
      .min(2, 'City must be at least 2 characters')
      .max(100, 'City cannot exceed 100 characters'),
    area: z
      .string({ required_error: 'Area is required' })
      .trim()
      .min(2, 'Area must be at least 2 characters')
      .max(100, 'Area cannot exceed 100 characters'),
    pincode: z
      .string({ required_error: 'Pincode is required' })
      .trim()
      .regex(pincodeRegex, { message: 'Pincode must be exactly 6 digits in valid Indian format' }),
    latitude: z
      .number({ invalid_type_error: 'Latitude must be a number' })
      .min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90')
      .nullable()
      .optional(),
    longitude: z
      .number({ invalid_type_error: 'Longitude must be a number' })
      .min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180')
      .nullable()
      .optional(),
    serviceRadiusKm: z
      .number({ invalid_type_error: 'Service radius must be a number' })
      .min(1, 'Service radius must be at least 1 km')
      .max(100, 'Service radius cannot exceed 100 km')
      .optional()
      .default(10),
    isPrimary: z.boolean().optional().default(false),
  })
  .strict({ message: 'Unknown fields are not allowed' });

const updateServiceAreaSchema = z
  .object({
    city: z
      .string()
      .trim()
      .min(2, 'City must be at least 2 characters')
      .max(100, 'City cannot exceed 100 characters')
      .optional(),
    area: z
      .string()
      .trim()
      .min(2, 'Area must be at least 2 characters')
      .max(100, 'Area cannot exceed 100 characters')
      .optional(),
    pincode: z
      .string()
      .trim()
      .regex(pincodeRegex, { message: 'Pincode must be exactly 6 digits in valid Indian format' })
      .optional(),
    latitude: z
      .number({ invalid_type_error: 'Latitude must be a number' })
      .min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90')
      .nullable()
      .optional(),
    longitude: z
      .number({ invalid_type_error: 'Longitude must be a number' })
      .min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180')
      .nullable()
      .optional(),
    serviceRadiusKm: z
      .number({ invalid_type_error: 'Service radius must be a number' })
      .min(1, 'Service radius must be at least 1 km')
      .max(100, 'Service radius cannot exceed 100 km')
      .optional(),
    isPrimary: z.boolean().optional(),
  })
  .strict({ message: 'Unknown fields are not allowed' });

module.exports = {
  createServiceAreaSchema,
  updateServiceAreaSchema,
};
