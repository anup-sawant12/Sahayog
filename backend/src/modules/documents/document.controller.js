const fs = require('fs');
const documentService = require('./document.service');
const { ApiError } = require('../../core/middleware/error.middleware');

const getMyDocuments = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const documents = await documentService.getWorkerDocuments(userId);

    return res.status(200).json({
      success: true,
      message: 'Worker documents retrieved successfully',
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

const getDocumentById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const documentId = req.params.id;
    const document = await documentService.getWorkerDocumentById(userId, documentId);

    return res.status(200).json({
      success: true,
      message: 'Document retrieved successfully',
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

const uploadDocument = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { documentType } = req.body;
    const file = req.file;

    if (!documentType) {
      throw ApiError.badRequest('documentType is required');
    }

    if (!file) {
      throw ApiError.badRequest('file is required');
    }

    const document = await documentService.uploadWorkerDocument(userId, {
      documentType,
      file,
    });

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully and queued for verification',
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const documentId = req.params.id;

    await documentService.deleteWorkerDocument(userId, documentId);

    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/worker/documents/:id/view
 * Returns physical file with inline Content-Disposition for browser preview
 */
const viewDocumentFile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const documentId = req.params.id;

    const fileInfo = await documentService.getDocumentFileForWorker(userId, documentId);

    res.setHeader('Content-Type', fileInfo.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${fileInfo.fileName}"`);

    const stream = fs.createReadStream(fileInfo.filePath);
    stream.on('error', (err) => next(err));
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/worker/documents/:id/download
 * Returns physical file with attachment Content-Disposition for downloading
 */
const downloadDocumentFile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const documentId = req.params.id;

    const fileInfo = await documentService.getDocumentFileForWorker(userId, documentId);

    res.setHeader('Content-Type', fileInfo.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.fileName}"`);

    const stream = fs.createReadStream(fileInfo.filePath);
    stream.on('error', (err) => next(err));
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyDocuments,
  getDocumentById,
  uploadDocument,
  deleteDocument,
  viewDocumentFile,
  downloadDocumentFile,
};
