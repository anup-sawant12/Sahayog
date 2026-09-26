class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details = null) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message, details = null) {
    return new ApiError(409, message, details);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }
}

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
};

const errorHandler = (err, req, res, next) => {
  // Handle Zod validation errors
  if (err.name === 'ZodError' || Array.isArray(err.issues)) {
    const formattedErrors = (err.issues || []).map((issue) => ({
      field: issue.path.join('.') || 'body',
      message: issue.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }

  // Handle known operational API errors
  if (err instanceof ApiError || (err.statusCode && err.isOperational)) {
    const response = {
      success: false,
      message: err.message,
    };
    if (err.details) {
      response.errors = err.details;
    }
    return res.status(err.statusCode).json(response);
  }

  // Handle Prisma unique constraint violation fallback (P2002)
  if (err.code === 'P2002') {
    const target = Array.isArray(err.meta?.target)
      ? err.meta.target.join(', ')
      : err.meta?.target || 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${target} already exists`,
    });
  }

  // Generic/Unexpected server errors: log server-side, never expose secrets or DB internals
  console.error('[Unhandled Error]:', err.message);

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

module.exports = {
  ApiError,
  notFoundHandler,
  errorHandler,
};
