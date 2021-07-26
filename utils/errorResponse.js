class ErrorResponse {
  constructor(message, res) {
    this.statusCode = res.statusCode;
    this.data = null;
    this.error = message;
    this.message = null;
  }
}

module.exports = ErrorResponse;
