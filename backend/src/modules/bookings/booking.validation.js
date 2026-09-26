const { z } = require('zod');

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const createBookingSchema = z
  .object({
    serviceRequestId: z
      .string({ required_error: 'Service request ID is required' })
      .trim()
      .min(1, 'Service request ID cannot be empty'),
    workerProfileId: z
      .string({ required_error: 'Worker profile ID is required' })
      .trim()
      .min(1, 'Worker profile ID cannot be empty'),
    workerServiceId: z
      .string({ required_error: 'Worker service ID is required' })
      .trim()
      .min(1, 'Worker service ID cannot be empty'),
    scheduledDate: z
      .string({ required_error: 'Scheduled date is required' })
      .refine(
        (val) => {
          const parsed = new Date(val);
          if (isNaN(parsed.getTime())) return false;
          const today = new Date();
          today.setUTCHours(0, 0, 0, 0);
          const schedDate = new Date(val);
          schedDate.setUTCHours(0, 0, 0, 0);
          return schedDate >= today;
        },
        { message: 'Scheduled date must be a valid date and cannot be in the past' }
      ),
    scheduledTime: z
      .string({ required_error: 'Scheduled time is required' })
      .trim()
      .regex(timeRegex, { message: 'Scheduled time must be in HH:mm 24-hour format' }),
    customerNotes: z
      .string()
      .trim()
      .max(1000, 'Customer notes cannot exceed 1000 characters')
      .nullable()
      .optional(),
  })
  .strict({ message: 'Unknown fields are not allowed' });

const cancelBookingSchema = z
  .object({
    cancellationReason: z
      .string()
      .trim()
      .max(500, 'Cancellation reason cannot exceed 500 characters')
      .nullable()
      .optional(),
  })
  .strict({ message: 'Unknown fields are not allowed' });

const rejectBookingSchema = z
  .object({
    cancellationReason: z
      .string()
      .trim()
      .max(500, 'Rejection reason cannot exceed 500 characters')
      .nullable()
      .optional(),
  })
  .strict({ message: 'Unknown fields are not allowed' });

const bookingListQuerySchema = z
  .object({
    status: z
      .enum(['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED'], {
        errorMap: () => ({ message: 'Status must be one of: PENDING, CONFIRMED, REJECTED, CANCELLED, COMPLETED' }),
      })
      .optional(),
  })
  .optional();

module.exports = {
  createBookingSchema,
  cancelBookingSchema,
  rejectBookingSchema,
  bookingListQuerySchema,
};
