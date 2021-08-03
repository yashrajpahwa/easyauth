const verifyToken = require('../utils/verifyToken');
const asyncHandler = require('./async');
const fs = require('fs');
const sessionAccessTokenPublicKey = fs.readFileSync(
  'config/sessionAccessTokenKeys/public.key'
);

exports.protectUserAuth = asyncHandler(async (req, res, next) => {
  let accessToken;
  let sessionToken;

  if (req.headers.authorization) {
    accessToken = req.headers.authorization.split(' ')[1];
  }

  if (req.headers.session) {
    sessionToken = req.headers.session;
  }

  if (!accessToken) {
    return next({ name: 'NoAccessToken' });
  }

  if (!sessionToken) {
    return next({ name: 'NoSessionToken' });
  }

  req.accessToken = accessToken;
  req.sessionToken = sessionToken;
  req.accessTokenPayload = await verifyToken(
    accessToken,
    sessionAccessTokenPublicKey
  );

  next();
});

exports.validateUserSession = asyncHandler(async (req, res, next) => {
  let sessionToken;
  if (req.headers.session) {
    sessionToken = req.headers.session;
  }
  if (!sessionToken) {
    return next({ name: 'NoSessionToken' });
  }
  req.sessionToken = sessionToken;
  next();
});
