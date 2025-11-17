const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getProductStockSummary,
} = require('../controllers/dashboard.controller');

// Overall dashboard summary
router.get('/summary', getDashboardSummary);

// Product-wise stock table
router.get('/product-summary', getProductStockSummary);

module.exports = router;
