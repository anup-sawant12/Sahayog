const express = require('express');
const router = express.Router();
const adminDocumentController = require('./admin-document.controller');
const { authenticate } = require('../../core/middleware/auth.middleware');
const { authorize } = require('../../core/middleware/role.middleware');
const { validate } = require('../../core/middleware/validation.middleware');
const { rejectDocumentSchema } = require('./document.validation');

// All admin document routes require authentication and Admin roles
// (COOPERATIVE_ADMIN, FEDERATION_ADMIN, SUPER_ADMIN, and ADMIN)
router.use(
  authenticate,
  authorize('COOPERATIVE_ADMIN', 'FEDERATION_ADMIN', 'SUPER_ADMIN', 'ADMIN')
);

// 1. GET /api/admin/documents - List worker documents with search, filters, pagination
router.get('/', adminDocumentController.getDocuments);

// 2. GET /api/admin/documents/stats - Document summary statistics (must be before /:id)
router.get('/stats', adminDocumentController.getDocumentStats);

// 3. GET /api/admin/documents/:id/file - Stream document file for admin preview
router.get('/:id/file', adminDocumentController.viewDocumentFile);

// 4. GET /api/admin/documents/:id - Single document review details
router.get('/:id', adminDocumentController.getDocumentById);

// 5. PATCH /api/admin/documents/:id/verify - Approve and verify document
router.patch('/:id/verify', adminDocumentController.verifyDocument);

// 6. PATCH /api/admin/documents/:id/reject - Reject document with required reason
router.patch(
  '/:id/reject',
  validate(rejectDocumentSchema),
  adminDocumentController.rejectDocument
);

module.exports = router;
