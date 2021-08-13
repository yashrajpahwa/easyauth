const express = require('express');
const router = express.Router({ mergeParams: true });

const auth = require('./auth');

router.use(`/auth`, auth);

module.exports = router;
