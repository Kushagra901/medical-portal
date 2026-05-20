const express = require('express');
const router = express.Router();
const { refreshTokens } = require('../controllers/refreshController');

router.post('/refresh', refreshTokens);

module.exports = router;
