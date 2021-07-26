const { validationResult } = require('express-validator');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const mongoUtil = require('../utils/mongoUtil');
const argon2 = require('argon2');
const SuccessResponse = require('../utils/successResponse');
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const fs = require('fs');
const sessionTokenPrivateKey = fs.readFileSync(
  'config/sessionTokenKeys/private.key'
);
const sessionTokenPublicKey = fs.readFileSync(
  'config/sessionTokenKeys/public.key'
);

// @desc Register new user
// @route POST /api/v1/auth/register
// @access public
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { name, nickname, email, given_name, family_name, password } = req.body;
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
  const hashedPassword = await argon2.hash(password);
  const emailHash = md5(email); // md5 hash email
  const newUser = {
    name,
    nickname,
    picture: `https://secure.gravatar.com/avatar/${emailHash}`,
    email,
    email_verified: false,
    given_name,
    family_name,
    password: hashedPassword,
    isDeveloper: false,
  };
  const insertedUser = await collection.insertOne(newUser);
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
  const isPassword = await argon2.verify(user.password, password);
  if (!isPassword) {
    return res.status(401).json(new ErrorResponse('Invalid credentials', res));
  }
  jwt.sign(
    { hello: 'world' },
    sessionTokenPrivateKey,
    {
      algorithm: 'RS256',
      expiresIn: '1d',
    },
    function (err, token) {
      if (err)
        return res.status(500).json(new ErrorResponse('Server Error', res));
      else
        return res.status(200).json(
          new SuccessResponse(res, 'You are logged in', {
            token,
          })
        );
    }
  );
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
  await jwt.verify(
    token,
    sessionTokenPublicKey,
    {
      algorithms: 'RS256',
    },
    function (err, payload) {
      const getPayload = () => {
        const rp = returnPayload || false;
        if (err) return;
        if (rp === true && payload) return { payload };
        if (!rp || rp === false) return null;
      };
      if (err)
        return res
          .status(500)
          .json(new ErrorResponse(`Couldn't verify token`, res));
      else
        return res
          .status(200)
          .json(new SuccessResponse(res, 'Token is valid', getPayload()));
    }
  );
});
