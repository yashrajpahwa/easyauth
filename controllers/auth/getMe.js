const { validationResult } = require('express-validator');
const asyncHandler = require('../../middlewares/async');
const ErrorResponse = require('../../utils/errorResponse');
const mongoUtil = require('../../utils/mongoUtil');
const SuccessResponse = require('../../utils/successResponse');
const { ObjectId } = require('mongodb');
const verifySessionToken = require('../../utils/verifySessionToken');
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_PORT);

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
  const userInfoKey = `userInfo_${tokenPayload._id}`;
  const collection = mongoUtil.getDB().collection('userDetails');

  redis.get(userInfoKey, async (err, data) => {
    if (err !== null) console.error(err);
    if (data && err === null) {
      return res
        .status(200)
        .json(new SuccessResponse(res, 'User data', JSON.parse(data)));
    } else if (!data && err === null) {
      const userDetails = await collection.findOne({
        _id: ObjectId(tokenPayload._id),
      });
      if (!userDetails) {
        return res
          .status(404)
          .json(
            new ErrorResponse(
              'No user data found, please complete the onboarding',
              res
            )
          );
      }
      redis.setex(
        userInfoKey,
        7200,
        JSON.stringify(userDetails),
        (err, response) => {
          if (err) console.error(err);
        }
      );
      return res
        .status(200)
        .json(new SuccessResponse(res, 'User data', userDetails));
    }
  });
});

module.exports = getMe;
