const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    lotNumber: { type: String, required: true },
    heatNumber: {type:String , required:true},
    location: String,
    safetyStockLevel:Number,
    batchNumber:{type:String , required:true},
    quantity: { type: Number, default: 0 },
     isDeleted:{
      type: Boolean,
      default: false,
    },
  },
 
  { timestamps: true }
);

// ensure the exported model name matches the populate('Inventory')
module.exports = mongoose.model("Inventory", inventorySchema);
