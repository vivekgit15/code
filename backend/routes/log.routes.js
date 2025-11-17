// routes/log.routes.js
const express = require('express');
const router = express.Router();
const { getAllLogs, getLogsByUser } = require('../controllers/log.controller');

// GET /api/logs?page=1&limit=50
router.get('/', getAllLogs);

// GET /api/logs/user/:userId
router.get('/user/:userId', getLogsByUser);

module.exports = router;
