const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getAllTransactions,
  getTransactionsByInventory,
} = require('../controllers/transaction.controller');

// POST /api/transactions
router.post('/', createTransaction);

// GET /api/transactions
router.get('/', getAllTransactions);

// GET /api/transactions/inventory/:inventoryId
router.get('/inventory/:inventoryId', getTransactionsByInventory);

module.exports = router;
