const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orders: [
    {
      name: { type: String, required: true },
      amount: { type: Number, required: true },
      discountShare: { type: Number, required: true },
      finalOwed: { type: Number, required: true }
    }
  ],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  totalDiscount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);