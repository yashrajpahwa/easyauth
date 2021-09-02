const { ObjectId } = require('bson');
const { validationResult } = require('express-validator');
const asyncHandler = require('../../middlewares/async');
const ErrorResponse = require('../../utils/errorResponse');
const mongoUtil = require('../../utils/mongoUtil');
const SuccessResponse = require('../../utils/successResponse');

const registerClient = asyncHandler(async (req, res, next) => {
  const { accessTokenPayload } = req;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorComb = Object.values(errors)[1].map((err) => err.msg);
    return res.status(400).json(new ErrorResponse(errorComb.join(', '), res));
  }
  const { name, enabled } = req.body;
  const newClient = {
    name,
    owner: ObjectId(accessTokenPayload._id),
    enabled,
  };
  const collection = mongoUtil.getDB().collection('clients');
  await collection.insertOne(newClient);
  res
    .status(201)
    .json(new SuccessResponse(res, 'Client has been registered', newClient));
});

module.exports = registerClient;
