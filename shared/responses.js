const { HTTP_STATUS, MESSAGES } = require('./constants');

/**
 * Success response helper
 */
const successResponse = (data, message = MESSAGES.SUCCESS) => {
  return {
    success: true,
    message,
    data
  };
};

/**
 * Error response helper
 */
const errorResponse = (message = MESSAGES.SERVER_ERROR, errors = null) => {
  const response = {
    success: false,
    error: message
  };
  
  if (errors) {
    response.details = errors;
  }
  
  return response;
};

/**
 * Paginated response helper
 */
const paginatedResponse = (data, page, limit, total) => {
  return {
    success: true,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse
};
