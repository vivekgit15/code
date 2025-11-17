
const Log = require('../models/log.model');

const createLog = async ({ action, product, quantity, lotNumber, remarks, user }) => {
  try {
    await Log.create({
      action,
      product,
      quantity,
      lotNumber,
      remarks,
      user,
    });
  } catch (err) {
    console.error('Error creating log:', err.message);
  }
};

module.exports = createLog;
