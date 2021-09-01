const express = require('express');
const { body } = require('express-validator');
const registerClient = require('../controllers/client/registerClient');
const { protectUserAuth } = require('../middlewares/auth');
const router = express.Router();

router
  .route('/')
  .post(
    protectUserAuth,
    body('name', 'Please provide a valid client name')
      .isLength({ min: 4 })
      .withMessage('Client name needs to contain atleast 4 characters'),
    body('enabled', 'Please provide a valid value for enabled')
      .isBoolean()
      .withMessage('Enabled needs to be a boolean'),
    registerClient
  );

module.exports = router;
