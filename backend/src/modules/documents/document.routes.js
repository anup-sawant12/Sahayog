const express = require('express');
const router = express.Router();
const documentController = require('./document.controller');
const { authenticate } = require('../../core/middleware/auth.middleware');
const { authorize } = require('../../core/middleware/role.middleware');
const { uploadDocumentMiddleware } = require('./upload.middleware');

// All worker document routes require authentication and WORKER role
router.use(authenticate, authorize('WORKER'));

// 1. GET /api/worker/documents - List worker's uploaded documents
router.get('/', documentController.getMyDocuments);

// 2. GET /api/worker/documents/:id/view - Stream/view worker's document file inline
router.get('/:id/view', documentController.viewDocumentFile);

// 3. GET /api/worker/documents/:id/download - Download worker's document file as attachment
router.get('/:id/download', documentController.downloadDocumentFile);

// Backward-compatibility: GET /api/worker/documents/:id/file
router.get('/:id/file', documentController.viewDocumentFile);

// 4. GET /api/worker/documents/:id - Get single document detail
router.get('/:id', documentController.getDocumentById);

// 5. POST /api/worker/documents - Upload or replace document
router.post('/', uploadDocumentMiddleware, documentController.uploadDocument);

// 6. DELETE /api/worker/documents/:id - Delete worker's own document
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
