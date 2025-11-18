const Product = require("../models/product.model");
const Inventory = require("../models/inventory.model");
const { addLog } = require("./log.controller"); 

// Extract user info safely (Clerk-compatible)
const getUserFromReq = (req) => {
  const userId =
    req.headers["x-user-id"] ||
    req?.auth?.userId ||
    req?.user?.id ||
    "unknown";

  const userEmail =
    req.headers["x-user-email"] ||
    req?.auth?.tokenClaims?.email ||
    req?.user?.email ||
    "unknown@clerk.app";

  return { userId, userEmail };
};

/**
 * @desc Create a new product
 * @route POST /api/products
 */
const createProduct = async (req, res) => {
  const { userId, userEmail } = getUserFromReq(req);
  try {
    const body = req.body;

    // validation + duplicates
    if (typeof body.pricePerUnit === "string") body.pricePerUnit = parseFloat(body.pricePerUnit);
    const existingProduct = await Product.findOne({
      name: body.name.trim(),
      materialGrade: body.materialGrade.trim(),
      type: body.type.trim(),
    });
    if (existingProduct) {
      await addLog({
        userId,
        userEmail,
        action: "Product Creation Failed - Duplicate Entry",
        entityType: "Product",
        details: body,
        ip: req.ip,
      });
      return res.status(400).json({
        success: false,
        message: "Duplicate product entry",
      });
    }

    const newProduct = await Product.create(body);

    await addLog({
      userId,
      userEmail,
      action: "Product Created",
      entityType: "Product",
      entityId: newProduct._id,
      details: body,
      ip: req.ip,
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    // Catch validation errors & include full info
    await addLog({
      userId,
      userEmail,
      action: "Product Creation Error",
      entityType: "Product",
      details: {
        message: error.message,
        body: req.body,
      },
      ip: req.ip,
    });

    res.status(400).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

/**
 * @desc Get all products
 * @route GET /api/products
 */
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    await addLog({
      action: "Fetch Products Error",
      entityType: "Product",
      details: { error: error.message },
    });
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

/**
 * @desc Get single product by ID
 * @route GET /api/products/:id
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      await addLog({
        action: "Product Not Found",
        entityType: "Product",
        entityId: req.params.id,
      });
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

/**
 * @desc Update product
 * @route PUT /api/products/:id
 */
const updateProduct = async (req, res) => {
  const { userId, userEmail } = getUserFromReq(req);
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      await addLog({
        userId,
        userEmail,
        action: "Product Update Failed - Not Found",
        entityType: "Product",
        entityId: req.params.id,
        ip: req.ip,
      });
      return res.status(404).json({ message: "Product not found" });
    }

    await addLog({
      userId,
      userEmail,
      action: "Product Updated",
      entityType: "Product",
      entityId: updated._id,
      details: req.body,
      ip: req.ip,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    await addLog({
      userId,
      userEmail,
      action: "Product Update Error",
      entityType: "Product",
      entityId: req.params.id, // always include attempted id
      details: { error: error.message, body: req.body },
      ip: req.ip,
    });
    res.status(400).json({ success: false, message: error.message });
  }
};


/**
 * @desc Delete product (only if no inventory exists)
 * @route DELETE /api/products/:id
 */
const deleteProduct = async (req, res) => {
  try {
    const { userId, userEmail } = getUserFromReq(req);

    const existingInventory = await Inventory.findOne({ product: req.params.id });
    if (existingInventory) {
      await addLog({
        userId,
        userEmail,
        action: "Product Deletion Blocked <br> Inventory Exists",
        entityType: "Product",
        entityId: req.params.id,
        ip: req.ip,
      });
      return res.status(400).json({
        message: "Cannot delete product. Inventory exists for this product.",
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      await addLog({
        userId,
        userEmail,
        action: "Product Deletion Failed - Not Found",
        entityType: "Product",
        entityId: req.params.id,
        ip: req.ip,
      });
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    await addLog({
      userId,
      userEmail,
      action: "Product Deleted",
      entityType: "Product",
      entityId: product._id,
      details: { name: product.name },
      ip: req.ip,
    });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    await addLog({
      action: "Product Deletion Error",
      entityType: "Product",
      details: { error: error.message },
    });
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
