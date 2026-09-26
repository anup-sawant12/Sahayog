const { ApiError } = require('../../core/middleware/error.middleware');

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Pure Node.js multipart/form-data parser (dependency-free)
 */
const parseMultipart = (req) => {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'] || '';
    const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    if (!match) {
      return reject(ApiError.badRequest('Invalid multipart boundary in Content-Type header'));
    }

    const boundary = match[1] || match[2];
    const boundaryBuffer = Buffer.from(`--${boundary}`);
    const chunks = [];

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('end', () => {
      try {
        const fullBuffer = Buffer.concat(chunks);
        const parts = [];
        let start = 0;

        while (true) {
          const idx = fullBuffer.indexOf(boundaryBuffer, start);
          if (idx === -1) break;

          if (start > 0) {
            // Include from previous boundary to this one (excluding leading CRLF)
            let partData = fullBuffer.subarray(start, idx);
            if (partData.length >= 2 && partData[partData.length - 2] === 13 && partData[partData.length - 1] === 10) {
              partData = partData.subarray(0, partData.length - 2);
            }
            parts.push(partData);
          }

          start = idx + boundaryBuffer.length;
          // Check for trailing '--'
          if (fullBuffer[start] === 45 && fullBuffer[start + 1] === 45) {
            break;
          }
          // Skip CRLF after boundary
          if (fullBuffer[start] === 13 && fullBuffer[start + 1] === 10) {
            start += 2;
          }
        }

        const fields = {};
        let file = null;

        for (const part of parts) {
          // Find double CRLF separating headers and body
          let headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
          let delimLength = 4;
          if (headerEnd === -1) {
            headerEnd = part.indexOf(Buffer.from('\n\n'));
            delimLength = 2;
          }
          if (headerEnd === -1) continue;

          const headerStr = part.subarray(0, headerEnd).toString('utf8');
          const bodyBuffer = part.subarray(headerEnd + delimLength);

          const dispMatch = headerStr.match(/content-disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]+)")?/i);
          if (!dispMatch) continue;

          const fieldName = dispMatch[1];
          const filename = dispMatch[2];

          if (filename) {
            const typeMatch = headerStr.match(/content-type:\s*([^\r\n;]+)/i);
            const mimeType = typeMatch ? typeMatch[1].trim().toLowerCase() : 'application/octet-stream';

            file = {
              originalname: filename,
              mimetype: mimeType,
              buffer: bodyBuffer,
              size: bodyBuffer.length,
            };
          } else {
            fields[fieldName] = bodyBuffer.toString('utf8').trim();
          }
        }

        resolve({ fields, file });
      } catch (err) {
        reject(err);
      }
    });
  });
};

/**
 * Middleware that handles both multipart/form-data and application/json file uploads
 */
const uploadDocumentMiddleware = async (req, res, next) => {
  try {
    const contentType = req.headers['content-type'] || '';

    if (contentType.includes('multipart/form-data')) {
      const { fields, file } = await parseMultipart(req);
      req.body = { ...req.body, ...fields };
      req.file = file;
    } else if (req.body) {
      // JSON upload support:
      // Accepts req.body = { documentType, file: { originalname, name, mimetype, type, base64, dataUrl, buffer } }
      // Or req.body = { documentType, fileName, mimeType, fileSize, fileData }
      let rawFile = req.body.file;

      if (!rawFile && req.body.fileData) {
        rawFile = {
          name: req.body.fileName,
          type: req.body.mimeType,
          base64: req.body.fileData,
          size: req.body.fileSize,
        };
      }

      if (rawFile) {
        let buffer;
        let mimeType = rawFile.type || rawFile.mimetype || 'application/octet-stream';
        let originalname = rawFile.name || rawFile.originalname || rawFile.fileName || 'document.pdf';

        if (typeof rawFile === 'string' && rawFile.startsWith('data:')) {
          // Data URL format: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
          const match = rawFile.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            mimeType = match[1].toLowerCase();
            buffer = Buffer.from(match[2], 'base64');
          } else {
            buffer = Buffer.from(rawFile, 'utf8');
          }
        } else if (rawFile.base64) {
          const cleanBase64 = rawFile.base64.replace(/^data:[^;]+;base64,/, '');
          buffer = Buffer.from(cleanBase64, 'base64');
        } else if (Buffer.isBuffer(rawFile.buffer)) {
          buffer = rawFile.buffer;
        } else if (rawFile.buffer && typeof rawFile.buffer === 'string') {
          buffer = Buffer.from(rawFile.buffer, 'base64');
        }

        if (buffer) {
          req.file = {
            originalname,
            mimetype: mimeType.toLowerCase(),
            buffer,
            size: buffer.length,
          };
        }
      }
    }

    // 1. Validate file presence
    if (!req.file || !req.file.buffer || req.file.buffer.length === 0) {
      throw ApiError.badRequest('File is required. Please attach a valid PDF or image file.');
    }

    // 2. Validate MIME type
    const normalizedMime = req.file.mimetype.toLowerCase();
    const isAllowedMime = ALLOWED_MIME_TYPES.includes(normalizedMime);

    // Fallback: check file extension if mimetype was detected generically
    const ext = (req.file.originalname.split('.').pop() || '').toLowerCase();
    const validExts = ['pdf', 'jpg', 'jpeg', 'png'];

    if (!isAllowedMime && !validExts.includes(ext)) {
      throw ApiError.badRequest(
        `Invalid file type "${req.file.mimetype}". Allowed types are: PDF, JPG, JPEG, PNG.`
      );
    }

    // Correct MIME type if needed based on extension
    if (ext === 'pdf') req.file.mimetype = 'application/pdf';
    else if (ext === 'jpg' || ext === 'jpeg') req.file.mimetype = 'image/jpeg';
    else if (ext === 'png') req.file.mimetype = 'image/png';

    // 3. Validate file size
    if (req.file.size > MAX_FILE_SIZE) {
      throw ApiError.badRequest(
        `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocumentMiddleware,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
};
