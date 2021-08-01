const fs = require('fs');
const mongoUtil = require('./mongoUtil');
const { verify } = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const sessionTokenPublicKey = fs.readFileSync(
  'config/sessionTokenKeys/public.key'
);

const tokenRevokedError = {
  name: 'TokenRevokedError',
  message: 'token revoked',
};

const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_PORT);

const verifySessionToken = (token, sessionTokenRevokes) =>
  new Promise((resolve, reject) => {
    verify(
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
            const userAuthDetailsKey = `userAuthDetails_${payload._id}`;
            redis.get(userAuthDetailsKey, async (err, res) => {
              if (res && err === null) {
                const formattedRes = JSON.parse(res);
                if (
                  payload.sessionTokenRevokes !==
                  formattedRes.sessionTokenRevokes
                )
                  reject(tokenRevokedError);
                if (
                  payload.sessionTokenRevokes ===
                  formattedRes.sessionTokenRevokes
                )
                  resolve(payload);
              } else if (!res || err) {
                const collection = mongoUtil.getDB().collection('users');
                const user = await collection.findOne({
                  _id: ObjectId(payload._id),
                });
                redis.setex(
                  userAuthDetailsKey,
                  7200,
                  JSON.stringify({
                    _id: user._id,
                    sessionTokenRevokes: user.sessionTokenRevokes,
                    email: user.email,
                  }),
                  (err, res) => {
                    if (err) console.error(err);
                  }
                );
                if (payload.sessionTokenRevokes !== user.sessionTokenRevokes)
                  reject(tokenRevokedError);
                if (payload.sessionTokenRevokes === user.sessionTokenRevokes)
                  resolve(payload);
              }
            });
          }
        }
      }
    );
  });

module.exports = verifySessionToken;
