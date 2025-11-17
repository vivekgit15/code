const Transaction = require('../models/transaction.model');
const Inventory = require('../models/inventory.model');
const Product = require('../models/product.model');
const { addLog } = require('./log.controller'); 

// helper: safely extract user info from request
const getUserFromReq = (req) => {
  const userId =
    req?.auth?.userId ||
    req?.user?.id ||
    req.headers['x-user-id'] ||
    'unknown';
  const userEmail =
    req?.auth?.tokenClaims?.email ||
    req?.user?.email ||
    req.headers['x-user-email'] ||
    undefined;
  return { userId, userEmail };
};

/**
 * @desc Add new transaction (IN or OUT)
 * @route POST /api/transactions
 */
const createTransaction = async (req, res) => {
  try {
    const { inventory, type, quantity, lotNumber, remarks } = req.body;
    const { userId, userEmail } = getUserFromReq(req);

    // Check if inventory exists
    const existingInventory = await Inventory.findById(inventory);
    if (!existingInventory) {
      await addLog({
        userId,
        userEmail,
        action: 'Transaction Failed - Inventory Not Found',
        entityType: 'Transaction',
        entityId: inventory,
        details: req.body,
        ip: req.ip,
      });
      return res
        .status(404)
        .json({ success: false, message: 'Inventory not found' });
    }

    // Convert to number if string
    const qty = parseFloat(quantity);

    if (type === 'IN') {
      existingInventory.quantity += qty;
    } else if (type === 'OUT') {
      if (existingInventory.quantity < qty) {
        await addLog({
          userId,
          userEmail,
          action: 'Transaction Failed - Insufficient Stock',
          entityType: 'Transaction',
          entityId: existingInventory._id,
          details: {
            requestedQty: qty,
            availableQty: existingInventory.quantity,
          },
          ip: req.ip,
        });
        return res
          .status(400)
          .json({ success: false, message: 'Not enough stock for dispatch' });
      }
      existingInventory.quantity -= qty;
    } else {
      await addLog({
        userId,
        userEmail,
        action: 'Transaction Failed - Invalid Type',
        entityType: 'Transaction',
        details: { providedType: type },
        ip: req.ip,
      });
      return res
        .status(400)
        .json({ success: false, message: 'Invalid transaction type' });
    }

    await existingInventory.save();

    // Create transaction record
    const newTransaction = await Transaction.create({
      inventory,
      type,
      quantity: qty,
      lotNumber,
      remarks,
    });

    // ✅ Log successful transaction
    await addLog({
      userId,
      userEmail,
      action: `Transaction ${type}`,
      entityType: 'Transaction',
      entityId: newTransaction._id,
      details: {
        inventoryId: inventory,
        type,
        quantity: qty,
        lotNumber,
        remarks,
      },
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      message: `Transaction (${type}) recorded successfully`,
      data: newTransaction,
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    await addLog({
      action: 'Transaction Error',
      entityType: 'Transaction',
      details: { error: error.message },
    });
    res.status(500).json({
      success: false,
      message: 'Failed to record transaction',
      error: error.message,
    });
  }
};

/**
 * @desc Get all transactions
 * @route GET /api/transactions
 */
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate({
        path: 'inventory',
        model: 'Inventory',
        populate: {
          path: 'product',
          model: 'Product',
        },
      })
      .sort({ createdAt: -1 });

    return res.json({ data: transactions });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Get transactions by inventory ID
 * @route GET /api/transactions/inventory/:inventoryId
 */
const getTransactionsByInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const transactions = await Transaction.find({
      inventory: inventoryId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error('Error fetching inventory transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions for inventory',
      error: error.message,
    });
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionsByInventory,
};
