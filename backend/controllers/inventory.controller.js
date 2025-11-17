const Inventory = require("../models/inventory.model");
const Product = require("../models/product.model");
const Transaction = require("../models/transaction.model");
const { addLog } = require("./log.controller"); // ✅ Import logger

// 🔹 Helper to extract user info from request
const getUserFromReq = (req) => {
  const userId =
    req?.auth?.userId ||
    req?.user?.id ||
    req.headers["x-user-id"] ||
    "unknown";
  const userEmail =
    req?.auth?.tokenClaims?.email ||
    req?.user?.email ||
    req.headers["x-user-email"] ||
    undefined;
  return { userId, userEmail };
};

// ✅ Helper: Calculate available balance for a single inventory
const calculateBalance = async (inventoryId) => {
  const transactions = await Transaction.find({ inventory: inventoryId });
  let balance = 0;
  transactions.forEach((transaction) => {
    if (transaction.type === "IN") balance += transaction.quantity;
    else if (transaction.type === "OUT") balance -= transaction.quantity;
  });
  return balance;
};

// @desc    Add new inventory (linked to product)
// @route   POST /api/inventory
const addInventory = async (req, res) => {
  try {
    const { product, lotNumber, batchNumber, heatNumber } = req.body;
    const { userId, userEmail } = getUserFromReq(req);

    const existingProduct = await Product.findById(product);
    if (!existingProduct) {
      await addLog({
        userId,
        userEmail,
        action: "Inventory Creation Failed - Product Not Found",
        entityType: "Inventory",
        details: { product },
        ip: req.ip,
      });
      return res.status(404).json({ message: "Product not found" });
    }

    const existingInventory = await Inventory.findOne({
      product,
      lotNumber,
      batchNumber,
      heatNumber,
    });

    if (existingInventory) {
      await addLog({
        userId,
        userEmail,
        action: "Inventory Creation Failed - Duplicate Entry",
        entityType: "Inventory",
        details: req.body,
        ip: req.ip,
      });
      return res.status(400).json({
        message:
          "Inventory with the same Product, Lot, Batch, and Heat number already exists.",
      });
    }

    const inventory = await Inventory.create(req.body);

    await addLog({
      userId,
      userEmail,
      action: "Inventory Created",
      entityType: "Inventory",
      entityId: inventory._id,
      details: req.body,
      ip: req.ip,
    });

    res.status(201).json({
      message: "Inventory added successfully",
      inventory,
    });
  } catch (error) {
    console.error("Error adding inventory:", error);
    await addLog({
      action: "Inventory Creation Error",
      entityType: "Inventory",
      details: { error: error.message },
    });
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all inventory lots (with product + availableQuantity)
// @route   GET /api/inventory
const getAllInventory = async (req, res) => {
  try {
    const inventories = await Inventory.find({ isDeleted: false })
      .populate("product", "name materialGrade type pricePerUnit unit")
      .sort({ createdAt: -1 });

    const inventoryWithBalance = await Promise.all(
      inventories.map(async (inv) => {
        const availableQuantity = await calculateBalance(inv._id);
        return { ...inv.toObject(), availableQuantity };
      })
    );

    res.status(200).json({ success: true, data: inventoryWithBalance });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    await addLog({
      action: "Fetch All Inventory Error",
      entityType: "Inventory",
      details: { error: error.message },
    });
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get single inventory by ID (with availableQuantity)
// @route   GET /api/inventory/:id
const getInventoryById = async (req, res) => {
  try {
    const inv = await Inventory.findById(req.params.id).populate(
      "product",
      "name materialGrade type pricePerUnit unit"
    );

    if (!inv) {
      await addLog({
        action: "Inventory Not Found",
        entityType: "Inventory",
        entityId: req.params.id,
      });
      return res.status(404).json({ message: "Inventory not found" });
    }

    const availableQuantity = await calculateBalance(inv._id);
    res.status(200).json({ ...inv.toObject(), availableQuantity });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update inventory (quantity, location, etc.)
// @route   PUT /api/inventory/:id
const updateInventory = async (req, res) => {
  try {
    const { userId, userEmail } = getUserFromReq(req);

    const updated = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) {
      await addLog({
        userId,
        userEmail,
        action: "Inventory Update Failed - Not Found",
        entityType: "Inventory",
        entityId: req.params.id,
        ip: req.ip,
      });
      return res.status(404).json({ message: "Inventory not found" });
    }

    await addLog({
      userId,
      userEmail,
      action: "Inventory Updated",
      entityType: "Inventory",
      entityId: updated._id,
      details: req.body,
      ip: req.ip,
    });

    res.status(200).json({
      message: "Inventory updated successfully",
      inventory: updated,
    });
  } catch (error) {
    await addLog({
      action: "Inventory Update Error",
      entityType: "Inventory",
      details: { error: error.message },
    });
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Soft delete inventory
// @route   DELETE /api/inventory/:id
// @desc    Soft delete inventory only if quantity = 0
// @route   DELETE /api/inventory/:id
const deleteInventory = async (req, res) => {
  try {
    const { userId, userEmail } = getUserFromReq(req);

    // 1️⃣ Fetch inventory
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      await addLog({
        userId,
        userEmail,
        action: "Inventory Delete Failed - Not Found",
        entityType: "Inventory",
        entityId: req.params.id,
        ip: req.ip,
      });
      return res.status(404).json({ message: "Inventory not found" });
    }

    // 2️⃣ Calculate current available quantity (via transactions)
    const availableQuantity = await calculateBalance(inventory._id);

    // 3️⃣ Block deletion if stock is not zero
    if (availableQuantity > 0) {
      await addLog({
        userId,
        userEmail,
        action: "Inventory Delete Blocked - Quantity Remaining",
        entityType: "Inventory",
        entityId: inventory._id,
        details: { availableQuantity },
        ip: req.ip,
      });

      return res.status(400).json({
        success: false,
        message: `Cannot delete inventory. ${availableQuantity} units are still available.`,
      });
    }

    // 4️⃣ Proceed to soft delete
    const deletedInventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    await addLog({
      userId,
      userEmail,
      action: "Inventory Soft Deleted",
      entityType: "Inventory",
      entityId: deletedInventory._id,
      details: { availableQuantity },
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Inventory deleted successfully (quantity = 0)",
    });
  } catch (error) {
    console.error("Error deleting inventory:", error);
    await addLog({
      action: "Inventory Delete Error",
      entityType: "Inventory",
      details: { error: error.message },
    });
    res.status(500).json({
      success: false,
      message: "Error deleting inventory",
    });
  }
};

// @desc    Get balance for a specific inventory
// @route   GET /api/inventory/balance/:id
const getInventoryBalance = async (req, res) => {
  try {
    const balance = await calculateBalance(req.params.id);
    res.json({ balance });
  } catch (error) {
    console.error("Error calculating inventory balance:", error);
    res.status(500).json({ message: "Failed to calculate inventory balance" });
  }
};

// @desc    Get inventory by product (with availableQuantity)
// @route   GET /api/inventory/product/:productId
const getInventoryByProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const inventories = await Inventory.find({ product: productId }).sort({
      createdAt: -1,
    });

    const inventoryWithBalance = await Promise.all(
      inventories.map(async (inv) => {
        const availableQuantity = await calculateBalance(inv._id);
        return { ...inv.toObject(), availableQuantity };
      })
    );

    res.status(200).json({
      success: true,
      count: inventoryWithBalance.length,
      data: inventoryWithBalance,
    });
  } catch (error) {
    console.error("Error fetching inventory by product:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  addInventory,
  getAllInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
  getInventoryBalance,
  getInventoryByProduct,
};
