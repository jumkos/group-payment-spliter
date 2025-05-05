const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// GET /api/history
router.get('/', async (req, res) => {
  try {
    const { 
      sortBy = 'createdAt', 
      order = 'desc',
      page = 1,
      limit = 10,
      name,
      startDate,
      endDate 
    } = req.query;

    const sortOrder = order === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    // Build filter query
    let query = {};
    
    // Add name filter (case-insensitive)
    if (name) {
      query['orders.name'] = { $regex: name, $options: 'i' };
    }

    // Add date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    // Fetch paginated results
    const history = await Order.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      history,
      pagination: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// POST /api/history
router.post('/', async (req, res) => {
  try {
    const { orders, subtotal, deliveryFee, totalDiscount } = req.body;
    
    const newOrder = new Order({
      orders,
      subtotal,
      deliveryFee,
      totalDiscount,
      createdAt: new Date()
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save order to history' });
  }
});

// DELETE /api/history
router.delete('/', async (req, res) => {
  try {
    await Order.deleteMany({});
    res.json({ message: 'History cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

module.exports = router;