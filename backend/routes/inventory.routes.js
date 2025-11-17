const express = require("express");
const {
  addInventory,
  getAllInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
  getInventoryBalance,
  getInventoryByProduct,
} = require("../controllers/inventory.controller");

const router = express.Router();

// --- Main Routes ---
// POST /api/inventory/
router.post("/", addInventory);
// GET /api/inventory/
router.get("/", getAllInventory);

// --- Specific Routes (MUST come before dynamic /:id routes) ---

// GET /api/inventory/product/:productId
// This is the corrected route:
router.get("/product/:productId", getInventoryByProduct);

// GET /api/inventory/:id/balance
// This one should also come before /:id
router.get("/balance/:id", getInventoryBalance);

// --- Dynamic ID Routes (MUST come last) ---
// GET /api/inventory/:id
router.get("/:id", getInventoryById);
// PUT /api/inventory/:id
router.put("/:id", updateInventory);
// DELETE /api/inventory/:id
router.delete("/:id", deleteInventory);

module.exports = router;