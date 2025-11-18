const mongoose = require('mongoose');

const nameRegex = /^[A-Za-z0-9\s\-\/\.]+$/;

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      match: [nameRegex, 'Invalid product name'],
    },
    materialGrade: {
      type: String,
      required: [true, 'Material grade is required'],
      trim: true,
      match: [nameRegex, 'Invalid material grade'],
    },
    type: {
      type: String,
      required: [true, 'Product type is required'],
      trim: true,
      match: [nameRegex, 'Invalid type '],
    },
    thickness: Number,
    diameter: Number,
    length: Number,
    width: Number,
    unit: {
      type: String,
      enum: {
        values: ['KG', 'METER', 'FEET', 'MM', 'METRIC TON', 'QUINTAL', 'PIECES'],
        message: 'Invalid unit type',
      },
      required: [true, 'Unit is required'],
    },
    pricePerUnit: { type: Number, required: [true, 'Price per unit is required'] , min: [1, 'Price per unit must be at least ₹1'],
      max: [1000000, 'Price per unit cannot exceed ₹10,00,000'],},
    weightPerUnit: { type: Number, required: [true, 'Weight per unit is required'] , min: [1, 'Price per unit must be at least ₹1'],
      max: [1000000, 'Price per unit cannot exceed ₹10,00,000'],},
    brand: {
      type: String,
      trim: true,
      match: [nameRegex, 'Invalid Brand'],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
