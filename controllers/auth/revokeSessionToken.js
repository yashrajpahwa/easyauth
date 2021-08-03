const { validationResult } = require('express-validator');
const asyncHandler = require('../../middlewares/async');
const ErrorResponse = require('../../utils/errorResponse');
const mongoUtil = require('../../utils/mongoUtil');
const SuccessResponse = require('../../utils/successResponse');
const fs = require('fs');
const { ObjectId } = require('mongodb');
const verifySessionToken = require('../../utils/verifySessionToken');
const Redis = require('ioredis');
const signToken = require('../../utils/signToken');
const redis = new Redis(process.env.REDIS_PORT);
const sessionTokenPrivateKey = fs.readFileSync(
  'config/sessionTokenKeys/private.key'
);

// @desc Revoke session token for a user
// @route POST /api/v1/auth/session/revoke
// @access private (requires token)
const revokeSessionToken = asyncHandler(async (req, res, next) => {
  const { sessionToken } = req;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorComb = Object.values(errors)[1].map((err) => err.msg);
    return res.status(400).json(new ErrorResponse(errorComb.join(', '), res));
  }

  const verifiedToken = await verifySessionToken(sessionToken);
  const redisKey = `userAuthDetails_${verifiedToken._id}`;
  const collection = mongoUtil.getDB().collection('users');
  const user = await collection.findOne({ _id: ObjectId(verifiedToken._id) });
  const updatedUser = await collection.updateOne(
    { _id: ObjectId(verifiedToken._id) },
    { $set: { sessionTokenRevokes: user.sessionTokenRevokes + 1 } },
    { merge: true }
  );
  redis.expire(redisKey, 0, (err, data) => {
    if (err) console.error(err);
  });
  const refreshedToken = await signToken(
    {
      _id: user._id,
      sessionTokenRevokes: user.sessionTokenRevokes + 1,
      email: user.email,
    },
    sessionTokenPrivateKey
  );
  return res.status(201).json(
    new SuccessResponse(res, 'Token has been revoked', {
      newToken: refreshedToken,
      updatedUser,
    })
  );
});

module.exports = revokeSessionToken;
