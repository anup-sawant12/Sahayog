const fs = require('fs');
const documentService = require('./document.service');
const { ApiError } = require('../../core/middleware/error.middleware');

const getDocuments = async (req, res, next) => {
  try {
    const result = await documentService.getAdminDocuments(req.query);

    return res.status(200).json({
      success: true,
      message: 'Worker documents retrieved successfully',
      data: result.documents,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getDocumentStats = async (req, res, next) => {
  try {
    const stats = await documentService.getAdminDocumentStats();

    return res.status(200).json({
      success: true,
      message: 'Document statistics retrieved successfully',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

const getDocumentById = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const document = await documentService.getAdminDocumentById(documentId);

    return res.status(200).json({
      success: true,
      message: 'Document details retrieved successfully',
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

const verifyDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const verifiedDoc = await documentService.verifyAdminDocument(documentId);

    return res.status(200).json({
      success: true,
      message: 'Document verified successfully',
      data: verifiedDoc,
    });
  } catch (error) {
    next(error);
  }
};

const rejectDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      throw ApiError.badRequest('rejectionReason is required');
    }

    const rejectedDoc = await documentService.rejectAdminDocument(
      documentId,
      rejectionReason
    );

    return res.status(200).json({
      success: true,
      message: 'Document rejected',
      data: rejectedDoc,
    });
  } catch (error) {
    next(error);
  }
};

const viewDocumentFile = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const fileInfo = await documentService.getDocumentFileForAdmin(documentId);

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
  getDocuments,
  getDocumentStats,
  getDocumentById,
  verifyDocument,
  rejectDocument,
  viewDocumentFile,
};
