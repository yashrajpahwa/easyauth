const express = require('express');
const router = express.Router({ mergeParams: true });

const auth = require('./auth');
const client = require('./client');

router.use(`/auth`, auth);
router.use(`/client`, client);

module.exports = router;
