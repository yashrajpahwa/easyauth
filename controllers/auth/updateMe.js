const { ObjectId } = require('bson');
const asyncHandler = require('../../middlewares/async');
const mongoUtil = require('../../utils/mongoUtil');
const SuccessResponse = require('../../utils/successResponse');

const updateMe = asyncHandler(async (req, res, next) => {
  const { accessTokenPayload } = req;
  const { name, nickname, given_name, family_name } = req.body;
  const newUser = {
    name,
    nickname,
    given_name,
    family_name,
  };
  const collection = mongoUtil.getDB().collection('userDetails');
  await collection.updateOne(
    { _id: ObjectId(accessTokenPayload._id) },
    { $set: newUser },
    { merge: true }
  );
  res
    .status(204)
    .json(new SuccessResponse(res, 'User updated successfully', null));
});

module.exports = updateMe;
