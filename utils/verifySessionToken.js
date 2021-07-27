const jwt = require('jsonwebtoken');
const fs = require('fs');
const mongoUtil = require('./mongoUtil');
const { ObjectId } = require('mongodb');
const sessionTokenPublicKey = fs.readFileSync(
  'config/sessionTokenKeys/public.key'
);

const tokenRevokedError = {
  name: 'TokenRevokedError',
  message: 'token revoked',
};

const verifySessionToken = (token, sessionTokenRevokes) =>
  new Promise((resolve, reject) => {
    jwt.verify(
      token,
      sessionTokenPublicKey,
      { algorithms: 'RS256' },
      async (err, payload) => {
        if (sessionTokenRevokes) {
          if (payload.sessionTokenRevokes !== sessionTokenRevokes)
            reject(tokenRevokedError);
          if (!err && payload) resolve(payload);
          if (err) reject(err);
        } else if (!sessionTokenRevokes) {
          if (err) reject(err);
          else if (!err && payload) {
            const collection = mongoUtil.getDB().collection('users');
            const user = await collection.findOne({
              _id: ObjectId(payload._id),
            });
            if (payload.sessionTokenRevokes !== user.sessionTokenRevokes)
              reject(tokenRevokedError);
            if (payload.sessionTokenRevokes === user.sessionTokenRevokes)
              resolve(payload);
          }
        }
      }
    );
  });

module.exports = verifySessionToken;
