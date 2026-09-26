const { z } = require('zod');

const dateSchema = z.preprocess(
  (arg) => {
    if (arg === null || arg === undefined || arg === '') return undefined;
    if (typeof arg === 'string' || arg instanceof Date) {
      const d = new Date(arg);
      return isNaN(d.getTime()) ? arg : d;
    }
    return arg;
  },
  z.date({
    required_error: 'issueDate is required',
    invalid_type_error: 'issueDate must be a valid date',
  })
);

const optionalDateSchema = z.preprocess(
  (arg) => {
    if (arg === null || arg === undefined || arg === '') return null;
    if (typeof arg === 'string' || arg instanceof Date) {
      const d = new Date(arg);
      return isNaN(d.getTime()) ? arg : d;
    }
    return arg;
  },
  z.date({ invalid_type_error: 'expiryDate must be a valid date' }).nullable().optional()
);

const optionalUrlSchema = z.preprocess(
  (arg) => {
    if (arg === null || arg === undefined || arg === '') return null;
    return arg;
  },
  z
    .string()
    .trim()
    .url({ message: 'documentUrl must be a valid URL' })
    .nullable()
    .optional()
);

const optionalStringSchema = z.preprocess(
  (arg) => {
    if (arg === null || arg === undefined || arg === '') return null;
    return typeof arg === 'string' ? arg.trim() : arg;
  },
  z
    .string()
    .max(100, 'certificateNumber cannot exceed 100 characters')
    .nullable()
    .optional()
);

const createCertificationSchema = z
  .object({
    name: z
      .string({ required_error: 'Certification name is required' })
      .trim()
      .min(2, 'Certification name must be at least 2 characters')
      .max(100, 'Certification name cannot exceed 100 characters'),
    issuingOrganization: z
      .string({ required_error: 'Issuing organization is required' })
      .trim()
      .min(2, 'Issuing organization must be at least 2 characters')
      .max(100, 'Issuing organization cannot exceed 100 characters'),
    certificateNumber: optionalStringSchema,
    issueDate: dateSchema,
    expiryDate: optionalDateSchema,
    documentUrl: optionalUrlSchema,
  })
  .strict({ message: 'Unknown fields are not allowed' })
  .refine(
    (data) => {
      const now = new Date();
      return data.issueDate <= now;
    },
    {
      message: 'issueDate cannot be in the future',
      path: ['issueDate'],
    }
  )
  .refine(
    (data) => {
      if (data.expiryDate && data.issueDate) {
        return data.expiryDate >= data.issueDate;
      }
      return true;
    },
    {
      message: 'expiryDate cannot be earlier than issueDate',
      path: ['expiryDate'],
    }
  );

const updateCertificationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Certification name must be at least 2 characters')
      .max(100, 'Certification name cannot exceed 100 characters')
      .optional(),
    issuingOrganization: z
      .string()
      .trim()
      .min(2, 'Issuing organization must be at least 2 characters')
      .max(100, 'Issuing organization cannot exceed 100 characters')
      .optional(),
    certificateNumber: optionalStringSchema,
    issueDate: optionalDateSchema,
    expiryDate: optionalDateSchema,
    documentUrl: optionalUrlSchema,
  })
  .strict({ message: 'Unknown fields are not allowed' })
  .refine(
    (data) => {
      if (data.issueDate) {
        const now = new Date();
        return data.issueDate <= now;
      }
      return true;
    },
    {
      message: 'issueDate cannot be in the future',
      path: ['issueDate'],
    }
  )
  .refine(
    (data) => {
      if (data.expiryDate && data.issueDate) {
        return data.expiryDate >= data.issueDate;
      }
      return true;
    },
    {
      message: 'expiryDate cannot be earlier than issueDate',
      path: ['expiryDate'],
    }
  );

module.exports = {
  createCertificationSchema,
  updateCertificationSchema,
};
