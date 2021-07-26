class SuccessResponse {
  constructor(res, message, data) {
    this.message = message;
    this.statusCode = res.statusCode;
    this.data = data || null;
    this.error = null;
  }
}

module.exports = SuccessResponse;
