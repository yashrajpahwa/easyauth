const asyncHandler = require('../../middlewares/async');
const SuccessResponse = require('../../utils/successResponse');
const getUserDetails = require('../../utils/getUserDetails');

// @desc Get user info
// @route POST /api/v1/auth/me
// @access private (requires token)
const getMe = asyncHandler(async (req, res, next) => {
  const tokenPayload = req.accessTokenPayload;
  const userDetails = await getUserDetails(tokenPayload._id);
  return res.status(200).json(new SuccessResponse(res, null, userDetails));
});

module.exports = getMe;
