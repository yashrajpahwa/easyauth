const { verify } = require('jsonwebtoken');

const verifyToken = (token, publicKey) =>
  new Promise((resolve, reject) => {
    verify(token, publicKey, { algorithms: 'RS256' }, (err, payload) => {
      if (err) reject(err);
      if (!err) resolve(payload);
    });
  });

module.exports = verifyToken;
