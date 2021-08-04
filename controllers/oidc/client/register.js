const { validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');
const { nanoid } = require('nanoid');
const asyncHandler = require('../../../middlewares/async');
const ErrorResponse = require('../../../utils/errorResponse');
const mongoUtil = require('../../../utils/mongoUtil');
const SuccessResponse = require('../../../utils/successResponse');

const registerClient = asyncHandler(async (req, res, next) => {
  const { accessTokenPayload } = req;
  if (!accessTokenPayload.isDeveloper) {
    return res
      .status(401)
      .json(new ErrorResponse('Only developers can access this route', res));
  }
  const { redirect_uris, client_name, client_uri } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorComb = Object.values(errors)[1].map((err) => err.msg);
    return res.status(400).json(new ErrorResponse(errorComb.join(', '), res));
  }
  const clientDetails = {
    redirect_uris,
    client_name,
    client_secret: nanoid(21),
    client_uri,
    logo_uri: null,
    token_endpoint_auth_method: 'client_secret_basic',
    owner: ObjectId(accessTokenPayload._id),
  };
  const collection = mongoUtil.getDB().collection('clients');
  const response = await collection.insertOne(clientDetails);
  return res.status(201).json(
    new SuccessResponse(res, 'A new client has been registered', {
      redirect_uris,
      client_name,
      client_uri,
      logo_uri: null,
      token_endpoint_auth_method: 'client_secret_basic',
      client_secret: clientDetails.client_secret,
      client_id: response.insertedId,
      owner: accessTokenPayload._id,
    })
  );
});

module.exports = registerClient;
