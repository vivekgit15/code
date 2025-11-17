// models/log.model.js
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    userId: { type: String, default: 'unknown' }, // Clerk user id or any identifier
    userEmail: { type: String }, // optional human email if you want to store
    action: { type: String, required: true }, // e.g. "Product Created"
    entityType: { type: String }, // e.g. "Product", "Inventory", "Transaction", "Auth"
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null }, // optional reference id
    details: { type: mongoose.Schema.Types.Mixed }, // object/string with extra info
    
  },
  { timestamps: true }
);

// logSchema.set("toJSON", {
//   transform: (doc, ret) => {
//     if (typeof ret.details === "object")
//       ret.details = Object.entries(ret.details)
//         .map(([k, v]) => `${k}: ${v}`)
//         .join(" | ");
//     return ret;
//   },
// });

module.exports = mongoose.model('ActivityLog', logSchema);
