const path = require('path');
const fs = require('fs');
const documentRepository = require('./document.repository');
const { ApiError } = require('../../core/middleware/error.middleware');
const { VALID_DOCUMENT_TYPES } = require('./document.validation');

const UPLOADS_ROOT = path.resolve(__dirname, '../../../uploads');

/**
 * Saves uploaded file buffer to local disk storage
 */
const saveFileToDisk = async (workerProfileId, documentType, file) => {
  const sanitizedOriginal = (file.originalname || 'document')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase();

  const timestamp = Date.now();
  const storageRelativePath = path.join(
    'workers',
    workerProfileId,
    documentType.toLowerCase(),
    `${timestamp}-${sanitizedOriginal}`
  );

  const fullPath = path.join(UPLOADS_ROOT, storageRelativePath);
  const dirPath = path.dirname(fullPath);

  await fs.promises.mkdir(dirPath, { recursive: true });
  await fs.promises.writeFile(fullPath, file.buffer);

  // Normalize storageKey with forward slashes
  const storageKey = storageRelativePath.replace(/\\/g, '/');

  return {
    storageKey,
    fileName: sanitizedOriginal,
    mimeType: file.mimetype,
    fileSize: file.size,
    fullPath,
  };
};

/**
 * Safely removes a file from local disk
 */
const deleteFileFromDisk = async (storageKey) => {
  if (!storageKey) return;
  try {
    const fullPath = path.join(UPLOADS_ROOT, storageKey);
    await fs.promises.unlink(fullPath);
  } catch (err) {
    // Ignore ENOENT (file not found on disk)
    if (err.code !== 'ENOENT') {
      console.error('[Document Storage] Could not delete file:', err.message);
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

  if (!document || document.workerProfileId !== profile.id) {
    throw ApiError.notFound('Document not found or access denied');
  }

  // Do not expose storageKey
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
      const savedFile = await saveFileToDisk(profile.id, documentType, file);

      // Clean up old file asynchronously
      deleteFileFromDisk(existingDoc.storageKey).catch(() => {});

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
  const savedFile = await saveFileToDisk(profile.id, documentType, file);

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

  if (!document || document.workerProfileId !== profile.id) {
    throw ApiError.notFound('Document not found or access denied');
  }

  // Delete from disk and database
  await deleteFileFromDisk(document.storageKey);
  await documentRepository.deleteDocument(documentId);

  return true;
};

const getDocumentFileForWorker = async (userId, documentId) => {
  const profile = await resolveWorkerProfile(userId);
  const document = await documentRepository.getDocumentById(documentId);

  if (!document || document.workerProfileId !== profile.id) {
    throw ApiError.notFound('Document not found or access denied');
  }

  const fullPath = path.join(UPLOADS_ROOT, document.storageKey);
  return {
    filePath: fullPath,
    fileName: document.fileName,
    mimeType: document.mimeType,
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

  const fullPath = path.join(UPLOADS_ROOT, document.storageKey);
  return {
    filePath: fullPath,
    fileName: document.fileName,
    mimeType: document.mimeType,
  };
};

module.exports = {
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
