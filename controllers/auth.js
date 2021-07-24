const { validationResult } = require('express-validator');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const mongoUtil = require('../utils/mongoUtil');
const SuccessResponse = require('../utils/successResponse');

// @desc Register new user
// @route POST /api/v1/auth/register
// @access public
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { name, username, email, given_name, family_name, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorComb = Object.values(errors)[1].map((err) => err.msg);
    res.json(new ErrorResponse(errorComb.join(', '), 400));
  } else {
    const hashedPassword = password; // Setup using bcrypt
    const emailHash = email; // Setup md5 hash
    const newUser = {
      name,
      username,
      picture: `https://www.gravatar.com/${emailHash}`,
      email,
      email_verified: false,
      given_name,
      family_name,
      password: hashedPassword,
      isDeveloper: false,
    };
    // const collection = mongoUtil.getDB().collection('users');
    res.send(new SuccessResponse('new user route'));
  }
});
