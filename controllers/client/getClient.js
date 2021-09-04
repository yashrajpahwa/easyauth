const { ObjectId } = require('bson');
const { validationResult } = require('express-validator');
const asyncHandler = require('../../middlewares/async');
const ErrorResponse = require('../../utils/errorResponse');
const mongoUtil = require('../../utils/mongoUtil');
const SuccessResponse = require('../../utils/successResponse');

const getClient = asyncHandler(async (req, res, next) => {
  const { accessTokenPayload } = req;
  const { id } = req.params;
  if (!id) {
    res
      .status(400)
      .json(new ErrorResponse('Please enter a valid value for ID', res));
  }
  const clientsFilter = {
    _id: ObjectId(id),
    owner: ObjectId(accessTokenPayload._id),
  };
  const clients = await mongoUtil.findMany('clients', clientsFilter);
  return res.status(200).json(new SuccessResponse(res, null, clients));
});

module.exports = getClient;
