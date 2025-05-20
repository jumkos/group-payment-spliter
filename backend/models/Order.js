const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  discountShare: {
    type: Number,
    required: true,
    default: 0
  },
  finalOwed: {
    type: Number,
    required: true
  },
  paid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  }
});

const orderSchema = new mongoose.Schema({
  orders: [orderItemSchema],
  deliveryFee: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  totalDiscount: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate the total amount paid
orderSchema.methods.getTotalPaid = function() {
  return this.orders.reduce((sum, person) => 
    sum + (person.paid ? person.finalOwed : 0), 0
  );
};

// Calculate the remaining amount to be paid
orderSchema.methods.getRemainingAmount = function() {
  const total = this.orders.reduce((sum, person) => sum + person.finalOwed, 0);
  return total - this.getTotalPaid();
};

// Update payment status for a person
orderSchema.methods.updatePaymentStatus = function(personName, isPaid) {
  const person = this.orders.find(p => p.name === personName);
  if (person) {
    person.paid = isPaid;
    person.paidAt = isPaid ? new Date() : null;
  }
  this.updatedAt = new Date();
};

// Pre-save middleware to update timestamps
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Order', orderSchema);