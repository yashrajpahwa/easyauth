const ErrorResponse = require('../utils/errorResponse');
const mongoUtil = require('../utils/mongoUtil');

const useMongo = (req, res, next) => {
  if (!mongoUtil.getDB()) {
    res.json(new ErrorResponse('Connecting to network', res));
  } else {
    req.mdb = mongoUtil.getDB();
    next();
  }
};

module.exports = useMongo;
