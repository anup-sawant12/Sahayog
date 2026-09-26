const { z } = require('zod');

const VALID_DOCUMENT_TYPES = [
  'IDENTITY_PROOF',
  'PAN_CARD',
  'ADDRESS_PROOF',
  'TRADE_CERTIFICATE',
  'POLICE_VERIFICATION',
];

const VALID_VERIFICATION_STATUSES = ['PENDING', 'VERIFIED', 'REJECTED'];

const documentTypeSchema = z.enum(VALID_DOCUMENT_TYPES, {
  errorMap: () => ({
    message: `documentType must be one of: ${VALID_DOCUMENT_TYPES.join(', ')}`,
  }),
});

const uploadDocumentBodySchema = z.object({
  documentType: documentTypeSchema,
});

const rejectDocumentSchema = z.object({
  rejectionReason: z
    .string({ required_error: 'rejectionReason is required' })
    .trim()
    .min(2, 'rejectionReason must be at least 2 characters')
    .max(500, 'rejectionReason cannot exceed 500 characters'),
});

const adminDocumentQuerySchema = z.object({
  verificationStatus: z.string().optional(),
  documentType: z.string().optional(),
  search: z.string().optional(),
  page: z.preprocess((val) => (val ? parseInt(val, 10) : 1), z.number().int().min(1).default(1)),
  limit: z.preprocess((val) => (val ? parseInt(val, 10) : 20), z.number().int().min(1).max(100).default(20)),
});

module.exports = {
  VALID_DOCUMENT_TYPES,
  VALID_VERIFICATION_STATUSES,
  documentTypeSchema,
  uploadDocumentBodySchema,
  rejectDocumentSchema,
  adminDocumentQuerySchema,
};
