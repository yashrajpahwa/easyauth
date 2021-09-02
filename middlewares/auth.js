const verifyToken = require('../utils/verifyToken');
const asyncHandler = require('./async');
const fs = require('fs');
const getCookies = require('../utils/getCookies');
const DeveloperOnlyError = require('../classes/DeveloperOnlyError');
const sessionAccessTokenPublicKey = fs.readFileSync(
  'config/sessionAccessTokenKeys/public.key'
);

exports.protectUserAuth = asyncHandler(async (req, res, next) => {
  let accessToken;
  let sessionToken;

  const cookies = getCookies(req);

  if (req.headers.authorization) {
    accessToken = req.headers.authorization.split(' ')[1];
  } else if (cookies.accessToken) {
    accessToken = cookies.accessToken;
  }

  if (req.headers.session) {
    sessionToken = req.headers.session;
  } else if (cookies.sessionToken) {
    sessionToken = cookies.sessionToken;
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

  const cookies = getCookies(req);
  if (req.headers.session) {
    sessionToken = req.headers.session;
  } else if (cookies.sessionToken) {
    sessionToken = cookies.sessionToken;
  }

  if (!sessionToken) {
    return next({ name: 'NoSessionToken' });
  }
  req.sessionToken = sessionToken;
  next();
});

exports.developersOnly = asyncHandler(async (req, res, next) => {
  const { accessTokenPayload } = req;
  if (!accessTokenPayload) {
    throw new Error('Payload is undefined');
  }
  if (accessTokenPayload.isDeveloper !== true) {
    throw new DeveloperOnlyError('Only developers can access this route');
  }
  next();
});
