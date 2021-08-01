const { validationResult } = require('express-validator');
const asyncHandler = require('../../middlewares/async');
const ErrorResponse = require('../../utils/errorResponse');
const mongoUtil = require('../../utils/mongoUtil');
const SuccessResponse = require('../../utils/successResponse');
const { hash } = require('argon2');

// @desc Register new user
// @route POST /api/v1/auth/register
// @access public
const registerUser = asyncHandler(async (req, res, next) => {
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

module.exports = registerUser;
