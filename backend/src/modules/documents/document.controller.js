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

const viewDocumentFile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const documentId = req.params.id;

    const fileInfo = await documentService.getDocumentFileForWorker(userId, documentId);

    if (!fs.existsSync(fileInfo.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Physical document file not found on disk',
      });
    }

    res.setHeader('Content-Type', fileInfo.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${fileInfo.fileName}"`);

    const stream = fs.createReadStream(fileInfo.filePath);
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
};
