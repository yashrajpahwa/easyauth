const { validationResult } = require('express-validator');
const asyncHandler = require('../../middlewares/async');
const getUserDetails = require('../../utils/getUserDetails');
const signToken = require('../../utils/signToken');
const SuccessResponse = require('../../utils/successResponse');
const fs = require('fs');
const verifySessionToken = require('../../utils/verifySessionToken');
const sessionAccessTokenPrivateKey = fs.readFileSync(
  'config/sessionAccessTokenKeys/private.key'
);

const getAccessToken = asyncHandler(async (req, res, next) => {
  const { sessionToken } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorComb = Object.values(errors)[1].map((err) => err.msg);
    return res.status(400).json(new ErrorResponse(errorComb.join(', '), res));
  }
  const sessionTokenPayload = await verifySessionToken(sessionToken);
  let userDetails = await getUserDetails(sessionTokenPayload._id);
  const accessToken = await signToken(
    userDetails,
    sessionAccessTokenPrivateKey,
    '15m'
  );
  return res.status(200).json(new SuccessResponse(res, null, accessToken));
});

module.exports = getAccessToken;
