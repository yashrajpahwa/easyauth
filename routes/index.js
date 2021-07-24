const express = require('express');
const router = express.Router({ mergeParams: true });

const client = require('./client');
const auth = require('./auth');

// API V1 Routes
router.use(`/client`, client);
router.use(`/auth`, auth);

module.exports = router;
