const { validationResult } = require('express-validator');
const asyncHandler = require('../../middlewares/async');
const ErrorResponse = require('../../utils/errorResponse');
const SuccessResponse = require('../../utils/successResponse');
const verifyToken = require('../../utils/verifyToken');
const getUserDetails = require('../../utils/getUserDetails');
const fs = require('fs');
const sessionAccessTokenPublicKey = fs.readFileSync(
  'config/sessionAccessTokenKeys/public.key'
);

// @desc Get user info
// @route POST /api/v1/auth/me
// @access private (requires token)
const getMe = asyncHandler(async (req, res, next) => {
  const tokenPayload = req.accessTokenPayload;
  const userDetails = await getUserDetails(tokenPayload._id);
  return res.status(200).json(new SuccessResponse(res, null, userDetails));
});

module.exports = getMe;
