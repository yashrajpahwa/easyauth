const { validationResult } = require('express-validator');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const mongoUtil = require('../utils/mongoUtil');
const argon2 = require('argon2');
const SuccessResponse = require('../utils/successResponse');
const md5 = require('md5');

// @desc Register new user
// @route POST /api/v1/auth/register
// @access public
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { name, username, email, given_name, family_name, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorComb = Object.values(errors)[1].map((err) => err.msg);
    return res.status(400).json(new ErrorResponse(errorComb.join(', '), 400));
  }
  let hashedPassword;
  try {
    hashedPassword = await argon2.hash(password);
  } catch (error) {
    return res.status(500).json(new ErrorResponse('Server Error', 500));
  }
  const emailHash = md5(email); // md5 hash email
  const newUser = {
    name,
    username,
    picture: `https://secure.gravatar.com/avatar/${emailHash}`,
    email,
    email_verified: false,
    given_name,
    family_name,
    password: hashedPassword,
    isDeveloper: false,
  };
  // const collection = mongoUtil.getDB().collection('users');
  res.status(201).send(new SuccessResponse('new user route', 201, newUser));
});
