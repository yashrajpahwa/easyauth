const express = require('express');
const { body } = require('express-validator');
const collectUserData = require('../controllers/auth/collectUserData');
const getAccessToken = require('../controllers/auth/getAccessToken');
const getMe = require('../controllers/auth/getMe');
const loginUser = require('../controllers/auth/loginUser');
const registerUser = require('../controllers/auth/registerUser');
const revokeSessionToken = require('../controllers/auth/revokeSessionToken');
const verifyAccessToken = require('../controllers/auth/verifyAccessToken');
const verifySessionToken = require('../controllers/auth/verifySessionToken');
const { protectUserAuth } = require('../middlewares/auth');
const router = express.Router();

router.route('/register').post(
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
  collectUserData
);

router.route('/revoke/session-token').post(protectUserAuth, revokeSessionToken);

router.route('/verify/session-token').post(protectUserAuth, verifySessionToken);

router.route('/verify/access-token').post(protectUserAuth, verifyAccessToken);

router.route('/me').post(protectUserAuth, getMe);

router.route('/access-token').post(protectUserAuth, getAccessToken);

module.exports = router;
