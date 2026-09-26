const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const documentRepository = require('./document.repository');
const { ApiError } = require('../../core/middleware/error.middleware');
const { VALID_DOCUMENT_TYPES } = require('./document.validation');

const UPLOADS_ROOT = path.resolve(__dirname, '../../../uploads');

// ==========================================
// STORAGE SERVICE LAYER
// ==========================================

/**
 * Saves uploaded file to the platform storage service (Cloudflare R2 / disk storage)
 * Generates storageKey with format:
 * workers/{workerProfileId}/documents/{unique-id}-{safe-file-name}
 */
const saveFileToStorage = async (workerProfileId, file) => {
  const sanitizedOriginal = (file.originalname || 'document')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase();

  const uniqueId = crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
    : `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  const storageKey = `workers/${workerProfileId}/documents/${uniqueId}-${sanitizedOriginal}`;
  const fullPath = path.join(UPLOADS_ROOT, storageKey);
  const dirPath = path.dirname(fullPath);

  await fs.promises.mkdir(dirPath, { recursive: true });
  await fs.promises.writeFile(fullPath, file.buffer);

  return {
    storageKey,
    fileName: sanitizedOriginal,
    mimeType: file.mimetype,
    fileSize: file.size,
    fullPath,
  };
};

/**
 * Retrieves physical file from storage using storageKey
 */
const getFileFromStorage = async (storageKey) => {
  if (!storageKey) return null;
  const fullPath = path.join(UPLOADS_ROOT, storageKey);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  return {
    filePath: fullPath,
    exists: true,
  };
};

/**
 * Safely removes a file from storage using storageKey
 */
const deleteFileFromStorage = async (storageKey) => {
  if (!storageKey) return;
  try {
    const fullPath = path.join(UPLOADS_ROOT, storageKey);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('[Document Storage] Could not delete file:', err.message);
      throw err;
    }
  }
};

/**
 * Resolves WorkerProfile for a user
 */
const resolveWorkerProfile = async (userId) => {
  const profile = await documentRepository.findWorkerProfileByUserId(userId);
  if (!profile) {
    throw ApiError.notFound('Worker profile not found for the authenticated user');
  }
  return profile;
};

// ==========================================
// WORKER OPERATIONS
// ==========================================

const getWorkerDocuments = async (userId) => {
  const profile = await resolveWorkerProfile(userId);
  return documentRepository.getDocumentsByWorkerProfileId(profile.id);
};

const getWorkerDocumentById = async (userId, documentId) => {
  const profile = await resolveWorkerProfile(userId);
  const document = await documentRepository.getDocumentById(documentId);

  if (!document) {
    throw ApiError.notFound('Document not found');
  }

  if (document.workerProfileId !== profile.id) {
    throw ApiError.forbidden('Access denied: You do not have permission to view this document');
  }

  // Do not expose storageKey to client
  const { storageKey, ...safeDoc } = document;
  return safeDoc;
};

const uploadWorkerDocument = async (userId, { documentType, file }) => {
  const profile = await resolveWorkerProfile(userId);

  if (!VALID_DOCUMENT_TYPES.includes(documentType)) {
    throw ApiError.badRequest(
      `Invalid documentType. Must be one of: ${VALID_DOCUMENT_TYPES.join(', ')}`
    );
  }

  // Check if document of this type already exists for this worker profile
  const existingDoc = await documentRepository.getDocumentByWorkerProfileAndType(
    profile.id,
    documentType
  );

  if (existingDoc) {
    // If rejected, allow replacement
    if (existingDoc.verificationStatus === 'REJECTED') {
      if (existingDoc.workerProfileId !== profile.id) {
        throw ApiError.forbidden('Access denied: You do not own this document');
      }

      // Delete old file from storage
      if (existingDoc.storageKey) {
        try {
          await deleteFileFromStorage(existingDoc.storageKey);
        } catch (err) {
          console.warn('[Document Storage] Could not delete old file on replacement:', err.message);
        }
      }

      // Save new file to storage
      const savedFile = await saveFileToStorage(profile.id, file);

      // Update document record in database
      const updated = await documentRepository.updateDocument(existingDoc.id, {
        fileName: savedFile.fileName,
        storageKey: savedFile.storageKey,
        mimeType: savedFile.mimeType,
        fileSize: savedFile.fileSize,
        verificationStatus: 'PENDING',
        rejectionReason: null,
        verifiedAt: null,
      });

      return updated;
    }

    // Otherwise, document already exists and is PENDING or VERIFIED
    throw ApiError.conflict(
      `A document of type "${documentType}" has already been uploaded and is currently ${existingDoc.verificationStatus.toLowerCase()}.`
    );
  }

  // Create fresh document
  const savedFile = await saveFileToStorage(profile.id, file);

  const newDoc = await documentRepository.createDocument({
    workerProfileId: profile.id,
    documentType,
    fileName: savedFile.fileName,
    storageKey: savedFile.storageKey,
    mimeType: savedFile.mimeType,
    fileSize: savedFile.fileSize,
  });

  return newDoc;
};

const deleteWorkerDocument = async (userId, documentId) => {
  const profile = await resolveWorkerProfile(userId);
  const document = await documentRepository.getDocumentById(documentId);

  if (!document) {
    throw ApiError.notFound('Document not found');
  }

  if (document.workerProfileId !== profile.id) {
    throw ApiError.forbidden('Access denied: You do not own this document');
  }

  // Delete actual object from storage
  await deleteFileFromStorage(document.storageKey);

  // Delete database record
  await documentRepository.deleteDocument(documentId);

  return true;
};

const getDocumentFileForWorker = async (userId, documentId) => {
  const profile = await resolveWorkerProfile(userId);
  const document = await documentRepository.getDocumentById(documentId);

  if (!document) {
    throw ApiError.notFound('Document not found');
  }

  if (document.workerProfileId !== profile.id) {
    throw ApiError.forbidden('Access denied: You do not own this document');
  }

  const fileInfo = await getFileFromStorage(document.storageKey);
  if (!fileInfo || !fileInfo.exists) {
    throw ApiError.notFound('Physical document file not found in storage');
  }

  return {
    filePath: fileInfo.filePath,
    fileName: document.fileName,
    mimeType: document.mimeType,
    fileSize: document.fileSize,
  };
};

// ==========================================
// ADMIN OPERATIONS
// ==========================================

const getAdminDocuments = async (queryParams) => {
  const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const { documents, total } = await documentRepository.getAdminDocuments({
    verificationStatus: queryParams.verificationStatus,
    documentType: queryParams.documentType,
    search: queryParams.search,
    skip,
    take: limit,
  });

  const formattedDocuments = documents.map((doc) => ({
    id: doc.id,
    documentType: doc.documentType,
    fileName: doc.fileName,
    mimeType: doc.mimeType,
    fileSize: doc.fileSize,
    verificationStatus: doc.verificationStatus,
    rejectionReason: doc.rejectionReason,
    verifiedAt: doc.verifiedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    worker: {
      workerProfileId: doc.workerProfile?.id,
      userId: doc.workerProfile?.user?.id,
      name: doc.workerProfile?.user?.name || 'Unknown Worker',
      email: doc.workerProfile?.user?.email || '',
      phone: doc.workerProfile?.user?.phone || '',
      workerVerificationStatus: doc.workerProfile?.verificationStatus,
    },
  }));

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    documents: formattedDocuments,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

const getAdminDocumentById = async (documentId) => {
  const document = await documentRepository.getAdminDocumentById(documentId);
  if (!document) {
    throw ApiError.notFound('Document not found');
  }

  return {
    id: document.id,
    documentType: document.documentType,
    fileName: document.fileName,
    mimeType: document.mimeType,
    fileSize: document.fileSize,
    verificationStatus: document.verificationStatus,
    rejectionReason: document.rejectionReason,
    verifiedAt: document.verifiedAt,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    worker: {
      workerProfileId: document.workerProfile?.id,
      userId: document.workerProfile?.user?.id,
      name: document.workerProfile?.user?.name,
      email: document.workerProfile?.user?.email,
      phone: document.workerProfile?.user?.phone,
      status: document.workerProfile?.user?.status,
      createdAt: document.workerProfile?.user?.createdAt,
      lastLoginAt: document.workerProfile?.user?.lastLoginAt,
      bio: document.workerProfile?.bio,
      experienceYears: document.workerProfile?.experienceYears,
      workerVerificationStatus: document.workerProfile?.verificationStatus,
    },
  };
};

const getAdminDocumentStats = async () => {
  return documentRepository.getAdminDocumentStats();
};

const verifyAdminDocument = async (documentId) => {
  const document = await documentRepository.getDocumentById(documentId);
  if (!document) {
    throw ApiError.notFound('Document not found');
  }

  const updated = await documentRepository.verifyDocument(documentId);

  return {
    id: updated.id,
    documentType: updated.documentType,
    fileName: updated.fileName,
    verificationStatus: updated.verificationStatus,
    verifiedAt: updated.verifiedAt,
    rejectionReason: updated.rejectionReason,
  };
};

const rejectAdminDocument = async (documentId, rejectionReason) => {
  if (!rejectionReason || !rejectionReason.trim()) {
    throw ApiError.badRequest('Rejection reason is required');
  }

  const document = await documentRepository.getDocumentById(documentId);
  if (!document) {
    throw ApiError.notFound('Document not found');
  }

  const updated = await documentRepository.rejectDocument(
    documentId,
    rejectionReason.trim()
  );

  return {
    id: updated.id,
    documentType: updated.documentType,
    fileName: updated.fileName,
    verificationStatus: updated.verificationStatus,
    verifiedAt: updated.verifiedAt,
    rejectionReason: updated.rejectionReason,
  };
};

const getDocumentFileForAdmin = async (documentId) => {
  const document = await documentRepository.getDocumentById(documentId);
  if (!document) {
    throw ApiError.notFound('Document not found');
  }

  const fileInfo = await getFileFromStorage(document.storageKey);
  if (!fileInfo || !fileInfo.exists) {
    throw ApiError.notFound('Physical document file not found in storage');
  }

  return {
    filePath: fileInfo.filePath,
    fileName: document.fileName,
    mimeType: document.mimeType,
    fileSize: document.fileSize,
  };
};

module.exports = {
  saveFileToStorage,
  getFileFromStorage,
  deleteFileFromStorage,
  getWorkerDocuments,
  getWorkerDocumentById,
  uploadWorkerDocument,
  deleteWorkerDocument,
  getDocumentFileForWorker,
  getAdminDocuments,
  getAdminDocumentById,
  getAdminDocumentStats,
  verifyAdminDocument,
  rejectAdminDocument,
  getDocumentFileForAdmin,
};
