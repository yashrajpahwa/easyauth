const { validationResult } = require('express-validator');
const asyncHandler = require('../../middlewares/async');
const ErrorResponse = require('../../utils/errorResponse');
const mongoUtil = require('../../utils/mongoUtil');
const SuccessResponse = require('../../utils/successResponse');
const md5 = require('md5');
const { ObjectId } = require('mongodb');
const verifySessionToken = require('../../utils/verifySessionToken');

// @desc Collect user data when the user logs in to the app the first time
// @route POST /api/v1/auth/onboard
// @access a user who has logged in the first time
const collectUserData = asyncHandler(async (req, res, next) => {
  const { name, nickname, given_name, family_name } = req.body;
  const { sessionToken } = req;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorComb = Object.values(errors)[1].map((err) => err.msg);
    return res.status(400).json(new ErrorResponse(errorComb.join(', '), res));
  }
  const tokenPayload = await verifySessionToken(sessionToken);
  const collection = mongoUtil.getDB().collection('userDetails');
  const userDetails = await collection.findOne({
    _id: ObjectId(tokenPayload._id),
  });
  if (userDetails) {
    return res
      .status(400)
      .json(new ErrorResponse('User details are already present', res));
  }

  const emailHash = md5(tokenPayload.email); // md5 hash email
  const newUserDetails = {
    _id: ObjectId(tokenPayload._id),
    name,
    nickname,
    picture: `https://secure.gravatar.com/avatar/${emailHash}`,
    email: tokenPayload.email,
    email_verified: false,
    given_name,
    family_name,
    isDeveloper: false,
  };
  const insertedDetails = await collection.insertOne(newUserDetails);
  return res
    .status(201)
    .json(new SuccessResponse(res, 'Updated user details', insertedDetails));
});

module.exports = collectUserData;
