const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // log to console for developer
  if (process.env.NODE_ENV === 'development') {
    console.log(err);
  }

  res
    .status(error.statusCode || 500)
    .json(new ErrorResponse(error.message || 'Server Error', res.statusCode));
};

module.exports = errorHandler;
