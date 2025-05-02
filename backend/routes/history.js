const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// GET /api/history
router.get('/', async (req, res) => {
  try {
    const { sortBy = 'createdAt', order = 'desc' } = req.query;
    const sortOrder = order === 'asc' ? 1 : -1;

    const history = await Order.find().sort({ [sortBy]: sortOrder });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;