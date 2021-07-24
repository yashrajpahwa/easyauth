const asyncHandler = require('../middlewares/async');
const SuccessResponse = require('../utils/successResponse');

// @desc Get client
// @route GET /api/v1/client
// @access private (user level)
exports.getClients = asyncHandler(async (req, res, next) => {
  res.send(new SuccessResponse('route works'));
});
