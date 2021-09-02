const express = require('express');
const { body, query } = require('express-validator');
const getClients = require('../controllers/client/getClients');
const registerClient = require('../controllers/client/registerClient');
const updateClient = require('../controllers/client/updateClient');
const { protectUserAuth, developersOnly } = require('../middlewares/auth');
const router = express.Router();

router
  .route('/')
  .get(protectUserAuth, developersOnly, getClients)
  .post(
    protectUserAuth,
    developersOnly,
    body('name', 'Please provide a valid client name')
      .isLength({ min: 4 })
      .withMessage('Client name needs to contain atleast 4 characters'),
    body('enabled', 'Please provide a valid value for enabled')
      .isBoolean()
      .withMessage('Enabled needs to be a boolean'),
    registerClient
  )
  .put(
    protectUserAuth,
    developersOnly,
    query('id', 'Please enter a valid value for id').isLength({ min: 6 }),
    body('name', 'Please provide a valid client name')
      .isLength({ min: 4 })
      .withMessage('Client name needs to contain atleast 4 characters'),
    body('enabled', 'Please provide a valid value for enabled')
      .isBoolean()
      .withMessage('Enabled needs to be a boolean'),
    updateClient
  );

module.exports = router;
