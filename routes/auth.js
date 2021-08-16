const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const collectUserData = require('../controllers/auth/collectUserData');
const getAccessToken = require('../controllers/auth/getAccessToken');
const getMe = require('../controllers/auth/getMe');
const loginUser = require('../controllers/auth/loginUser');
const registerUser = require('../controllers/auth/registerUser');
const revokeSessionToken = require('../controllers/auth/revokeSessionToken');
const updateMe = require('../controllers/auth/updateMe');
const verifyAccessToken = require('../controllers/auth/verifyAccessToken');
const verifySessionToken = require('../controllers/auth/verifySessionToken');
const { protectUserAuth, validateUserSession } = require('../middlewares/auth');
const router = express.Router();

// Rate limit an IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 20,
});

// Rate limit an IP
const updateUserLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 20,
});

// Rate limit an IP
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 40,
});

// Rate limit an IP
const revokeSessionTokenLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 20,
});

// Rate limit an IP
const getAccessTokenLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 50,
});

// Rate limit an IP
const verifyTokenLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 150,
});

router.route('/register').post(
  registerLimiter,
  body('name', 'Please provide a valid name')
    .isAlpha()
    .withMessage('Name can only contain alphabets')
    .isLength({ min: 2 })
    .withMessage('Name needs to contain atleast 2 characters'),
  body('nickname', 'Please provide a valid nickname')
    .isLength({
      min: 5,
      max: 25,
    })
    .withMessage('The nickname needs to be atleast 5 characters')
    .isAlphanumeric()
    .withMessage('Nickname can only contain alphabets & digits'),
  body('email', 'Please provide a valid email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('given_name', 'Please provide valid value for the first name')
    .isLength({
      min: 2,
    })
    .withMessage('First name should be atleast 2 characters')
    .isAlpha()
    .withMessage('First name can only contain alphabets'),
  body('family_name', 'Please provide a valid value for the last name')
    .isLength({
      min: 1,
    })
    .isAlpha()
    .withMessage('Last name can only contain alphabets'),
  body('password', 'Please provide a valid password')
    .isStrongPassword({ minLength: 8 })
    .withMessage('Please provide a strong password with minimum 8 characters'),
  registerUser
);

router
  .route('/login')
  .post(
    loginLimiter,
    body('email', 'Please provide a valid email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password', 'Please provide a valid password')
      .isLength({ min: 1 })
      .withMessage('Please provide a password'),
    loginUser
  );

router.route('/onboard').post(
  registerLimiter,
  validateUserSession,
  body('name', 'Please provide a valid name')
    .isAlpha()
    .withMessage('Name can only contain alphabets')
    .isLength({ min: 2 })
    .withMessage('Name needs to contain atleast 2 characters'),
  body('nickname', 'Please provide a valid nickname')
    .isLength({
      min: 5,
      max: 25,
    })
    .withMessage('The nickname needs to be atleast 5 characters')
    .isAlphanumeric()
    .withMessage('Nickname can only contain alphabets & digits'),

  body('given_name', 'Please provide valid value for the first name')
    .isLength({
      min: 2,
    })
    .withMessage('First name should be atleast 2 characters')
    .isAlpha()
    .withMessage('First name can only contain alphabets'),
  body('family_name', 'Please provide a valid value for the last name')
    .isLength({
      min: 1,
    })
    .isAlpha()
    .withMessage('Last name can only contain alphabets'),
  collectUserData
);

router
  .route('/revoke/sessionToken')
  .post(revokeSessionTokenLimiter, protectUserAuth, revokeSessionToken);

router
  .route('/verify/sessionToken')
  .post(verifyTokenLimiter, validateUserSession, verifySessionToken);

router
  .route('/verify/accessToken')
  .post(verifyTokenLimiter, protectUserAuth, verifyAccessToken);

router
  .route('/me')
  .get(verifyTokenLimiter, protectUserAuth, getMe)
  .put(
    updateUserLimiter,
    protectUserAuth,
    body('name', 'Please provide a valid name')
      .isAlpha()
      .withMessage('Name can only contain alphabets')
      .isLength({ min: 2 })
      .withMessage('Name needs to contain atleast 2 characters'),
    body('nickname', 'Please provide a valid nickname')
      .isLength({
        min: 5,
        max: 25,
      })
      .withMessage('The nickname needs to be atleast 5 characters')
      .isAlphanumeric()
      .withMessage('Nickname can only contain alphabets & digits'),

    body('given_name', 'Please provide valid value for the first name')
      .isLength({
        min: 2,
      })
      .withMessage('First name should be atleast 2 characters')
      .isAlpha()
      .withMessage('First name can only contain alphabets'),
    body('family_name', 'Please provide a valid value for the last name')
      .isLength({
        min: 1,
      })
      .isAlpha()
      .withMessage('Last name can only contain alphabets'),
    updateMe
  );

router
  .route('/accessToken')
  .post(getAccessTokenLimiter, validateUserSession, getAccessToken);

module.exports = router;
