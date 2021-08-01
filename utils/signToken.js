const { sign } = require('jsonwebtoken');

const signToken = async (payload, privateKey, expiresIn) => {
  const expire = expiresIn || '30d';
  return new Promise((resolve, reject) => {
    sign(
      payload,
      privateKey,
      {
        algorithm: 'RS256',
        expiresIn: expire,
      },
      (err, token) => {
        if (err) reject(err);
        if (!err) resolve(token);
      }
    );
  });
};

module.exports = signToken;
