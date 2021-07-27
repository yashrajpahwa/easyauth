const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // log to console for developer
  if (process.env.NODE_ENV === 'development') {
    console.log(err);
  }

  if (error.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 400;
  }

  if (error.name === 'TokenExpiredError') {
    error.message = 'Token has expired';
    error.statusCode = 400;
  }

  res
    .status(error.statusCode || 500)
    .json(new ErrorResponse(error.message || 'Server Error', res));
};

module.exports = errorHandler;
