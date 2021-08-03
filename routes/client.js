const express = require('express');
const { body } = require('express-validator');
const registerClient = require('../controllers/oidc/client/register');
const { protectUserAuth } = require('../middlewares/auth');
const router = express.Router();

router
  .route('/')
  .post(
    protectUserAuth,
    body('redirect_uris', 'Please provide valid uris')
      .isArray({ min: 1 })
      .withMessage('Redirect uris need to be an array')
      .isURL(),
    body('client_name', 'Please provide a valid client name')
      .isAlphanumeric()
      .withMessage('The client name can only be alphanumeric'),
    body('client_uri', 'Please provide a valid client uri')
      .isURL()
      .withMessage('Client uri needs to be a url'),
    registerClient
  );

module.exports = router;
