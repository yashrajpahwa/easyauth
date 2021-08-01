const { validationResult } = require('express-validator');
const asyncHandler = require('../../middlewares/async');
const ErrorResponse = require('../../utils/errorResponse');
const mongoUtil = require('../../utils/mongoUtil');
const SuccessResponse = require('../../utils/successResponse');
const fs = require('fs');
const signToken = require('../../utils/signToken');
const { verify } = require('argon2');
const sessionTokenPrivateKey = fs.readFileSync(
  'config/sessionTokenKeys/private.key'
);

// @desc Get session/refresh and access token for a user
// @route POST /api/v1/auth/login
// @access public
const loginUser = asyncHandler(async (req, res, next) => {
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

module.exports = loginUser;
