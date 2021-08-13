const Redis = require('ioredis');
const { ObjectId } = require('mongodb');
const mongoUtil = require('./mongoUtil');
const redisPort = parseInt(process.env.REDIS_PORT);
const redis = new Redis(redisPort);

const getUserDetails = (userId) => {
  const onboardingIncompleteError = { name: 'OnboardingIncomplete' };
  const userInfoKey = `userInfo_${userId}`;
  const collection = mongoUtil.getDB().collection('userDetails');
  return new Promise((resolve, reject) => {
    redis.get(userInfoKey, async (err, data) => {
      if (err !== null) console.error(err);
      if (data && err === null) {
        resolve(JSON.parse(data));
      } else if (!data && err === null) {
        try {
          const userDetails = await collection.findOne({
            _id: ObjectId(userId),
          });
          if (!userDetails) {
            reject(onboardingIncompleteError);
          }
          redis.setex(
            userInfoKey,
            10800,
            JSON.stringify(userDetails),
            (err, response) => {
              if (err) console.error(err);
            }
          );
          resolve(userDetails);
        } catch (error) {
          if (error) reject(error);
        }
      }
    });
  });
};

module.exports = getUserDetails;
