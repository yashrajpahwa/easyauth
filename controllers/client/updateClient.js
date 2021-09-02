const { ObjectId } = require('bson');
const { validationResult } = require('express-validator');
const asyncHandler = require('../../middlewares/async');
const ErrorResponse = require('../../utils/errorResponse');
const mongoUtil = require('../../utils/mongoUtil');
const SuccessResponse = require('../../utils/successResponse');

const updateClient = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorComb = Object.values(errors)[1].map((err) => err.msg);
    return res.status(400).json(new ErrorResponse(errorComb.join(', '), res));
  }
  const { id } = req.query;
  const { accessTokenPayload } = req;

  const { name, enabled } = req.body;
  const updatedClient = {
    name,
    enabled,
  };
  const collection = mongoUtil.getDB().collection('clients');

  const client = await collection.findOne({
    _id: ObjectId(id),
    owner: ObjectId(accessTokenPayload._id),
  });
  if (client === null) {
    return res
      .status(404)
      .json(new ErrorResponse('No client found with the ID', res));
  }

  const updatedCollection = await collection.updateOne(
    { _id: ObjectId(id), owner: ObjectId(accessTokenPayload._id) },
    { $set: updatedClient },
    {}
  );

  return res
    .status(200)
    .json(
      new SuccessResponse(res, 'Client has been updated', updatedCollection)
    );
});

module.exports = updateClient;
