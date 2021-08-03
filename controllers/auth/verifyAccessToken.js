const { validationResult } = require('express-validator');
const asyncHandler = require('../../middlewares/async');
const ErrorResponse = require('../../utils/errorResponse');
const SuccessResponse = require('../../utils/successResponse');
const verifyToken = require('../../utils/verifyToken');
const fs = require('fs');
const sessionAccessTokenPublicKey = fs.readFileSync(
  'config/sessionAccessTokenKeys/public.key'
);

// @desc Verify session token for a user
// @route POST /api/v1/auth/access-token/verify
// @access public (requires token)
const verifyAccessToken = asyncHandler(async (req, res, next) => {
  const { returnPayload } = req.body;
  const { accessToken } = req;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorComb = Object.values(errors)[1].map((err) => err.msg);
    return res.status(400).json(new ErrorResponse(errorComb.join(', '), res));
  }

  const verifiedToken = await verifyToken(
    accessToken,
    sessionAccessTokenPublicKey
  );
  const getPayload = () => {
    const rp = returnPayload || false;
    if (rp === true)
      return {
        token: verifiedToken,
      };
    if (!rp || rp === false) return null;
  };
  return res
    .status(200)
    .json(new SuccessResponse(res, 'Token is valid', getPayload()));
});

module.exports = verifyAccessToken;
