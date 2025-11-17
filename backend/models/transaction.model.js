const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['IN', 'OUT'],
    },
    quantity: {
      type: Number,
      required: true,
    },
    remarks: String,
    // lotNumber field removed from here
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
