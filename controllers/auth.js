const { validationResult } = require('express-validator');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const mongoUtil = require('../utils/mongoUtil');
const SuccessResponse = require('../utils/successResponse');
const md5 = require('md5');
const fs = require('fs');
const { ObjectId } = require('mongodb');
const verifySessionToken = require('../utils/verifySessionToken');
const Redis = require('ioredis');
const signToken = require('../utils/signToken');
const { hash, verify } = require('argon2');
const redis = new Redis(process.env.REDIS_PORT);
const sessionTokenPrivateKey = fs.readFileSync(
  'config/sessionTokenKeys/private.key'
);
// @desc Register new user
// @route POST /api/v1/auth/register
// @access public
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorComb = Object.values(errors)[1].map((err) => err.msg);
    return res.status(400).json(new ErrorResponse(errorComb.join(', '), res));
  }
  const collection = mongoUtil.getDB().collection('users');
  const user = await collection.findOne({ email });
  if (user) {
    return res
      .status(400)
      .send(
        new ErrorResponse('A user with the same email already exists', res)
      );
  }
  const hashedPassword = await hash(password);
  const newUserAuth = {
    email,
    password: hashedPassword,
    sessionTokenRevokes: 0,
  };
  const insertedUser = await collection.insertOne(newUserAuth);
  return res
    .status(201)
    .send(
      new SuccessResponse(res, 'A new user has been registered', insertedUser)
    );
});

// @desc Get session token for a user
// @route POST /api/v1/auth/login
// @access public
exports.getSessionToken = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorComb = Object.values(errors)[1].map((err) => err.msg);
    return res.status(400).json(new ErrorResponse(errorComb.join(', '), res));
  }
  const collection = mongoUtil.getDB().collection('users');
  const user = await collection.findOne({ email });
  if (!user) {
    return res.status(401).send(new ErrorResponse('Invalid credentials', res));
  }
  const isPassword = await verify(user.password, password);
  if (!isPassword) {
    return res.status(401).json(new ErrorResponse('Invalid credentials', res));
  }
  const sessionTokenPayload = {
    _id: user._id,
    sessionTokenRevokes: user.sessionTokenRevokes,
    email: user.email,
  };
  const sessionToken = await signToken(
    sessionTokenPayload,
    sessionTokenPrivateKey
  );
  return res.status(200).json(
    new SuccessResponse(res, 'You are logged in', {
      token: sessionToken,
    })
  );
});

// @desc Get user data when the user logs in to the app the first time
// @route POST /api/v1/auth/onboard
// @access a user who has logged in the first time
exports.getUserData = asyncHandler(async (req, res, next) => {
  const { name, nickname, given_name, family_name, token } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorComb = Object.values(errors)[1].map((err) => err.msg);
    return res.status(400).json(new ErrorResponse(errorComb.join(', '), res));
  }
  const tokenPayload = await verifySessionToken(token);
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

// @desc Get user info
// @route POST /api/v1/auth/me
// @access private (requires token)
exports.getUser = asyncHandler(async (req, res, next) => {
  const { token } = req.body;
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

// @desc Verify session token for a user
// @route POST /api/v1/auth/session/verify
// @access public (requires token)
exports.verifySessionToken = asyncHandler(async (req, res, next) => {
  const { token, returnPayload } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorComb = Object.values(errors)[1].map((err) => err.msg);
    return res.status(400).json(new ErrorResponse(errorComb.join(', '), res));
  }

  const verifiedToken = await verifySessionToken(token);
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

// @desc Revoke session token for a user
// @route POST /api/v1/auth/session/revoke
// @access private (requires token)
exports.revokeSessionToken = asyncHandler(async (req, res, next) => {
  const { token } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorComb = Object.values(errors)[1].map((err) => err.msg);
    return res.status(400).json(new ErrorResponse(errorComb.join(', '), res));
  }

  const verifiedToken = await verifySessionToken(token);
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
