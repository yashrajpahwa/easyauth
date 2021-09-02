const { ObjectId } = require('bson');
const { validationResult } = require('express-validator');
const asyncHandler = require('../../middlewares/async');
const ErrorResponse = require('../../utils/errorResponse');
const mongoUtil = require('../../utils/mongoUtil');
const SuccessResponse = require('../../utils/successResponse');

const getClients = asyncHandler(async (req, res, next) => {
  const { accessTokenPayload } = req;
  const clientsFilter = {
    owner: ObjectId(accessTokenPayload._id),
  };
  const collection = mongoUtil.getDB().collection('clients');
  const clients = await collection.find(clientsFilter);
  if ((await clients.count()) === 0) {
    return res
      .status(404)
      .json(new SuccessResponse(res, 'No clients found', null));
  }
  let clientsArray = [];
  await clients.forEach((c) => clientsArray.push(c));
  return res.status(200).json(new SuccessResponse(res, null, clientsArray));
});

module.exports = getClients;
