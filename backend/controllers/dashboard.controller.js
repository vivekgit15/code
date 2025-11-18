const Product = require('../models/product.model');
const Inventory = require('../models/inventory.model');
const Transaction = require('../models/transaction.model');

/**
 * @desc Get overall dashboard analytics
 * @route GET /api/dashboard/summary
 */
const getDashboardSummary = async (req, res) => {
  try {
    // Total Products
    const totalProducts = await Product.countDocuments();

    // Total IN and OUT quantities from Transaction model
    const totalInAgg = await Transaction.aggregate([
      { $match: { type: 'IN' } },
      { $group: { _id: null, totalIn: { $sum: '$quantity' } } },
    ]);

    const totalOutAgg = await Transaction.aggregate([
      { $match: { type: 'OUT' } },
      { $group: { _id: null, totalOut: { $sum: '$quantity' } } },
    ]);

    const totalIn = totalInAgg[0]?.totalIn || 0;
    const totalOut = totalOutAgg[0]?.totalOut || 0;

    // Calculate total current stock (sum of all inventory quantities)
    const totalStockAgg = await Inventory.aggregate([
      { $group: { _id: null, totalStock: { $sum: '$quantity' } } },
    ]);
    const totalStock = totalStockAgg[0]?.totalStock || 0;

    // Calculate total stock value (pricePerUnit * quantity via product lookup)
    const totalStockValueAgg = await Inventory.aggregate([
      {
        $lookup: {
          from: 'products', // must match collection name in MongoDB
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: {
              $multiply: ['$quantity', '$productDetails.pricePerUnit'],
            },
          },
        },
      },
    ]);

    const totalStockValue = totalStockValueAgg[0]?.totalValue || 0;

    const summary = {
      totalProducts,
      totalIn,
      totalOut,
      totalStock,
      totalStockValue,
    };

    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard analytics',
      error: error.message,
    });
  }
};

/**
 * @desc Get product-wise stock summary (aggregated from inventory)
 * @route GET /api/dashboard/product-summary
 */
const getProductStockSummary = async (req, res) => {
  try {
    const productSummary = await Inventory.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$productDetails._id',
          name: { $first: '$productDetails.name' },
          materialGrade: { $first: '$productDetails.materialGrade' },
          type: { $first: '$productDetails.type' },
          pricePerUnit: { $first: '$productDetails.pricePerUnit' },
          totalQuantity: { $sum: '$quantity' },
          totalValue: {
            $sum: {
              $multiply: ['$quantity', '$productDetails.pricePerUnit'],
            },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
    ]);

    res.json({
      success: true,
      count: productSummary.length,
      data: productSummary,
    });
  } catch (error) {
    console.error('Error fetching product summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product summary',
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardSummary,
  getProductStockSummary,
};
