const { ObjectId } = require('bson');
const asyncHandler = require('../../middlewares/async');
const mongoUtil = require('../../utils/mongoUtil');
const SuccessResponse = require('../../utils/successResponse');

const getClients = asyncHandler(async (req, res, next) => {
  const { accessTokenPayload } = req;
  const clientsFilter = {
    owner: ObjectId(accessTokenPayload._id),
  };
  const clients = await mongoUtil.findMany('clients', clientsFilter);
  return res.status(200).json(new SuccessResponse(res, null, clients));
});

module.exports = getClients;
