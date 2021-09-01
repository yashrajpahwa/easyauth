const { ObjectId } = require('bson');
const { nanoid } = require('nanoid');
const asyncHandler = require('../../middlewares/async');

//@ts-check
const registerClient = asyncHandler(async (req, res, next) => {
  const { client_name, contacts } = req.body;
  const client_secret = nanoid();
  const newClient = {
    client_name,
    client_secret,
  };
});
