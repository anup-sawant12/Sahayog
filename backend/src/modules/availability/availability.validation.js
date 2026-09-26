const { z } = require('zod');

const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const timeSchema = z
  .string({ required_error: 'Time is required' })
  .trim()
  .regex(timeRegex, { message: 'Time must be in 24-hour HH:mm format (e.g. 09:00, 17:30)' });

const createAvailabilitySchema = z
  .object({
    dayOfWeek: z.enum(DAYS_OF_WEEK, {
      errorMap: () => ({
        message: 'dayOfWeek must be one of: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY',
      }),
    }),
    startTime: timeSchema,
    endTime: timeSchema,
    isAvailable: z.boolean().optional().default(true),
  })
  .strict({ message: 'Unknown fields are not allowed' })
  .refine((data) => data.startTime < data.endTime, {
    message: 'startTime must be earlier than endTime',
    path: ['startTime'],
  });

const updateAvailabilitySchema = z
  .object({
    dayOfWeek: z
      .enum(DAYS_OF_WEEK, {
        errorMap: () => ({
          message: 'dayOfWeek must be one of: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY',
        }),
      })
      .optional(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional(),
    isAvailable: z.boolean().optional(),
  })
  .strict({ message: 'Unknown fields are not allowed' })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.startTime < data.endTime;
      }
      return true;
    },
    {
      message: 'startTime must be earlier than endTime',
      path: ['startTime'],
    }
  );

module.exports = {
  DAYS_OF_WEEK,
  createAvailabilitySchema,
  updateAvailabilitySchema,
};
