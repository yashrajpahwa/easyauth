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
  const { sessionToken } = req;
  const sessionTokenPayload = await verifySessionToken(sessionToken);
  let userDetails = await getUserDetails(sessionTokenPayload._id);
  const accessToken = await signToken(
    userDetails,
    sessionAccessTokenPrivateKey,
    '15m'
  );
  return res
    .status(200)
    .cookie('accessToken', accessToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 15 * 60 * 1000),
    })
    .json(new SuccessResponse(res, null, accessToken));
});

module.exports = getAccessToken;
