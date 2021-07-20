class ErrorResponse {
  constructor(message, statusCode) {
    this.statusCode = statusCode;
    this.data = null;
    this.error = message;
    this.message = null;
  }
}

module.exports = ErrorResponse;
