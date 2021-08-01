const { validationResult } = require('express-validator');
const asyncHandler = require('../../middlewares/async');
const ErrorResponse = require('../../utils/errorResponse');
const SuccessResponse = require('../../utils/successResponse');
const verifySessionToken = require('../../utils/verifySessionToken');
const getUserDetails = require('../../utils/getUserDetails');

// @desc Get user info
// @route POST /api/v1/auth/me
// @access private (requires token)
const getMe = asyncHandler(async (req, res, next) => {
  const { token } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorComb = Object.values(errors)[1].map((err) => err.msg);
    return res.status(400).json(new ErrorResponse(errorComb.join(', '), res));
  }
  const tokenPayload = await verifySessionToken(token);
  const userDetails = await getUserDetails(tokenPayload._id);
  return res.status(200).json(new SuccessResponse(res, null, userDetails));
});

module.exports = getMe;
