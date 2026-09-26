const { z } = require('zod');

const pincodeRegex = /^[1-9]\d{5}$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const createServiceRequestSchema = z
  .object({
    serviceName: z
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
    requestedDate: z
      .string({ required_error: 'Requested date is required' })
      .refine(
        (val) => {
          const parsed = new Date(val);
          if (isNaN(parsed.getTime())) return false;
          // Verify date is not in the past (yesterday or earlier)
          const today = new Date();
          today.setUTCHours(0, 0, 0, 0);
          const reqDate = new Date(val);
          reqDate.setUTCHours(0, 0, 0, 0);
          return reqDate >= today;
        },
        { message: 'Requested date must be a valid date and cannot be in the past' }
      ),
    requestedTime: z
      .string({ required_error: 'Requested time is required' })
      .trim()
      .regex(timeRegex, { message: 'Requested time must be in HH:mm 24-hour format' }),
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
  })
  .strict({ message: 'Unknown fields are not allowed' })
  .refine(
    (data) => {
      const hasLat = data.latitude !== null && data.latitude !== undefined;
      const hasLng = data.longitude !== null && data.longitude !== undefined;
      return (hasLat && hasLng) || (!hasLat && !hasLng);
    },
    { message: 'Both latitude and longitude must be provided together if coordinates are used' }
  );

module.exports = {
  createServiceRequestSchema,
};
