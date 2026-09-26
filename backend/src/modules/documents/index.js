const workerDocumentRoutes = require('./document.routes');
const adminDocumentRoutes = require('./admin-document.routes');
const documentService = require('./document.service');
const documentRepository = require('./document.repository');

module.exports = {
  workerDocumentRoutes,
  adminDocumentRoutes,
  documentService,
  documentRepository,
};
