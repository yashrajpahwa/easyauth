class SuccessResponse {
  constructor(message, statusCode, data) {
    this.message = message;
    this.statusCode = statusCode || 200;
    this.data = data || null;
    this.error = null;
  }
}

module.exports = SuccessResponse;
