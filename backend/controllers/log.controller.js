// controllers/log.controller.js
const Log = require('../models/log.model');

const addLog = async ({ userId = 'unknown', userEmail, action, entityType, entityId = null, details = {}, ip = '' }) => {
  try {
    const entry = await Log.create({
      userId,
      userEmail,
      action,
      entityType,
      entityId,
      details,
      ip,
    });
   
    return entry;
  } catch (err) {
    // Swallow logging errors so they don't break main flows, but print server side
    console.error('Failed to write activity log:', err);
    return null;
  }
};

// Controller endpoints to read logs (admin UI)
const getAllLogs = async (req, res) => {
  try {
    // simple pagination / filtering
    const { page = 1, limit = 50, userId, entityType } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (entityType) filter.entityType = entityType;

    const skip = (Number(page) - 1) * Number(limit);

    const [data, total] = await Promise.all([
      Log.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Log.countDocuments(filter),
    ]);

    res.json({ success: true, count: total, page: Number(page), data });
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch logs' });
  }
};

const getLogsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const logs = await Log.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    console.error('Error fetching user logs:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch logs for user' });
  }
};

module.exports = {
  addLog,
  getAllLogs,
  getLogsByUser,
};
