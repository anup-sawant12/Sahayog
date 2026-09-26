const prisma = require('../../config/database');

const safeWorkerDocumentSelect = {
  id: true,
  workerProfileId: true,
  documentType: true,
  fileName: true,
  mimeType: true,
  fileSize: true,
  verificationStatus: true,
  rejectionReason: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
};

const findWorkerProfileByUserId = async (userId) => {
  return prisma.workerProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      verificationStatus: true,
    },
  });
};

const getDocumentsByWorkerProfileId = async (workerProfileId) => {
  return prisma.workerDocument.findMany({
    where: { workerProfileId },
    select: safeWorkerDocumentSelect,
    orderBy: { createdAt: 'desc' },
  });
};

const getDocumentById = async (id) => {
  return prisma.workerDocument.findUnique({
    where: { id },
  });
};

const getDocumentByWorkerProfileAndType = async (workerProfileId, documentType) => {
  return prisma.workerDocument.findUnique({
    where: {
      workerProfileId_documentType: {
        workerProfileId,
        documentType,
      },
    },
  });
};

const createDocument = async (data) => {
  return prisma.workerDocument.create({
    data: {
      workerProfileId: data.workerProfileId,
      documentType: data.documentType,
      fileName: data.fileName,
      storageKey: data.storageKey,
      mimeType: data.mimeType,
      fileSize: data.fileSize,
      verificationStatus: 'PENDING',
      rejectionReason: null,
      verifiedAt: null,
    },
    select: safeWorkerDocumentSelect,
  });
};

const updateDocument = async (id, data) => {
  return prisma.workerDocument.update({
    where: { id },
    data,
    select: safeWorkerDocumentSelect,
  });
};

const deleteDocument = async (id) => {
  return prisma.workerDocument.delete({
    where: { id },
  });
};

const getAdminDocuments = async ({ verificationStatus, documentType, search, skip = 0, take = 20 } = {}) => {
  const where = {};

  if (verificationStatus && verificationStatus !== 'ALL') {
    where.verificationStatus = verificationStatus;
  }

  if (documentType && documentType !== 'ALL') {
    where.documentType = documentType;
  }

  if (search && search.trim()) {
    const term = search.trim();
    where.workerProfile = {
      user: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
          { phone: { contains: term, mode: 'insensitive' } },
        ],
      },
    };
  }

  const [documents, total] = await Promise.all([
    prisma.workerDocument.findMany({
      where,
      skip: Number(skip) || 0,
      take: Math.min(Number(take) || 20, 100),
      orderBy: { createdAt: 'desc' },
      include: {
        workerProfile: {
          select: {
            id: true,
            userId: true,
            verificationStatus: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                status: true,
              },
            },
          },
        },
      },
    }),
    prisma.workerDocument.count({ where }),
  ]);

  return { documents, total };
};

const getAdminDocumentById = async (id) => {
  return prisma.workerDocument.findUnique({
    where: { id },
    include: {
      workerProfile: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              status: true,
              createdAt: true,
              lastLoginAt: true,
            },
          },
        },
      },
    },
  });
};

const getAdminDocumentStats = async () => {
  const [total, pending, verified, rejected, groupedByType] = await Promise.all([
    prisma.workerDocument.count(),
    prisma.workerDocument.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.workerDocument.count({ where: { verificationStatus: 'VERIFIED' } }),
    prisma.workerDocument.count({ where: { verificationStatus: 'REJECTED' } }),
    prisma.workerDocument.groupBy({
      by: ['documentType'],
      _count: { _all: true },
    }),
  ]);

  const byType = {};
  for (const item of groupedByType) {
    byType[item.documentType] = item._count._all;
  }

  return {
    total,
    pending,
    verified,
    rejected,
    byType,
  };
};

const verifyDocument = async (id) => {
  return prisma.workerDocument.update({
    where: { id },
    data: {
      verificationStatus: 'VERIFIED',
      rejectionReason: null,
      verifiedAt: new Date(),
    },
    include: {
      workerProfile: {
        select: {
          id: true,
          userId: true,
          verificationStatus: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
  });
};

const rejectDocument = async (id, rejectionReason) => {
  return prisma.workerDocument.update({
    where: { id },
    data: {
      verificationStatus: 'REJECTED',
      rejectionReason,
      verifiedAt: null,
    },
    include: {
      workerProfile: {
        select: {
          id: true,
          userId: true,
          verificationStatus: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
  });
};

module.exports = {
  safeWorkerDocumentSelect,
  findWorkerProfileByUserId,
  getDocumentsByWorkerProfileId,
  getDocumentById,
  getDocumentByWorkerProfileAndType,
  createDocument,
  updateDocument,
  deleteDocument,
  getAdminDocuments,
  getAdminDocumentById,
  getAdminDocumentStats,
  verifyDocument,
  rejectDocument,
};
