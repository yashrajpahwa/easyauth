class SuccessResponse {
  constructor(message, statusCode, data) {
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
    this.error = null;
  }
}

module.exports = SuccessResponse;
