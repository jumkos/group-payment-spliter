const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Helper function to round to nearest 100
const roundTo100 = (num) => Math.round(num / 100) * 100;

router.post('/', async (req, res) => {
  try {
    const { orders, deliveryFee = 0, totalDiscount = 0 } = req.body;
    
    // Calculate subtotal before discount
    const subtotal = orders.reduce((sum, order) => sum + order.amount, 0);
    
    // Calculate each person's share of the discount proportionally
    const processedOrders = orders.map(order => {
      const discountShare = roundTo100((order.amount / subtotal) * totalDiscount);
      const deliveryShare = roundTo100(deliveryFee / orders.length);
      const finalOwed = roundTo100(order.amount - discountShare + deliveryShare);
      
      return {
        name: order.name,
        amount: order.amount,
        discountShare,
        finalOwed,
        paid: false
      };
    });

    // Create new order record
    const order = new Order({
      orders: processedOrders,
      deliveryFee,
      totalDiscount,
      subtotal
    });

    await order.save();

    // Return the processed order details
    res.json({
      success: true,
      data: {
        id: order._id,
        orders: processedOrders,
        deliveryFee,
        totalDiscount,
        subtotal,
        totalPaid: order.getTotalPaid(),
        remainingAmount: order.getRemainingAmount()
      }
    });
  } catch (error) {
    console.error('Calculate error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process order calculation'
    });
  }
});

// Update payment status
router.patch('/:orderId/payment', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { personName, isPaid } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    order.updatePaymentStatus(personName, isPaid);
    await order.save();

    res.json({
      success: true,
      data: {
        totalPaid: order.getTotalPaid(),
        remainingAmount: order.getRemainingAmount()
      }
    });
  } catch (error) {
    console.error('Payment update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update payment status'
    });
  }
});

// Get calculation result by ID
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: order._id,
        orders: order.orders,
        deliveryFee: order.deliveryFee,
        totalDiscount: order.totalDiscount,
        subtotal: order.subtotal,
        totalPaid: order.getTotalPaid(),
        remainingAmount: order.getRemainingAmount()
      }
    });
  } catch (error) {
    console.error('Get calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve calculation result'
    });
  }
});

module.exports = router;