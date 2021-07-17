class ErrorResponse {
  constructor(message, statusCode) {
    this.statusCode = statusCode;
    this.data = null;
    this.error = message;
  }
}

module.exports = ErrorResponse;
