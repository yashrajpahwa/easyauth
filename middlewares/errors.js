const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // log to console for developer
  if (process.env.NODE_ENV === 'development') {
    console.log(err);
  }
  if (error.name === 'TokenRevokedError') {
    error.message = 'Token has been revoked by the user';
    error.statusCode = 401;
  }
  if (error.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  }

  if (error.name === 'TokenExpiredError') {
    error.message = 'Token has expired';
    error.statusCode = 401;
  }

  if (error.name === 'OnboardingIncomplete') {
    error.message = 'Please complete the onboarding to proceed';
    error.statusCode = 403;
  }

  res
    .status(error.statusCode || 500)
    .json(new ErrorResponse(error.message || res.sentry, res));
};

module.exports = errorHandler;
