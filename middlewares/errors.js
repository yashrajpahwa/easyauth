const DeveloperOnlyError = require('../classes/DeveloperOnlyError');
const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  const isDev = process.env.NODE_ENV === 'development';

  error.message = err.message;

  // log to console for developer
  if (isDev) {
    console.error(err);
  }
  if (error.name === 'TokenRevokedError') {
    error.message = 'Token has been revoked by the user';
    error.statusCode = 401;
  }
  if (error.name === 'NoAccessToken') {
    error.message = 'Please provide an access token';
    error.statusCode = 400;
  }

  if (error.name === 'NoSessionToken') {
    error.message = 'Please provide a session token';
    error.statusCode = 400;
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

  if (err instanceof DeveloperOnlyError) {
    error.message = 'This route can only be accessed by developers';
    error.statusCode = 401;
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    if (!isDev) console.error(err);
    error.message = 'Invalid syntax in body';
    error.statusCode = 400;
  }

  res
    .status(error.statusCode || 500)
    .json(new ErrorResponse(error.message || res.sentry, res));
};

module.exports = errorHandler;
