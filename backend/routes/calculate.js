const express = require('express');
const router = express.Router();

const roundUpToNearest100 = (value) => Math.ceil(value / 100) * 100;

// POST /api/calculate
router.post('/', (req, res) => {
  const { people, deliveryFee, discount } = req.body;

  if (!people || !Array.isArray(people) || people.length === 0) {
    return res.status(400).json({ error: 'Invalid people data' });
  }

  const subtotal = people.reduce((sum, person) => sum + person.amount, 0);
  if (subtotal === 0) {
    return res.status(400).json({ error: 'Subtotal cannot be zero' });
  }

  const totalPeople = people.length;
  const results = people.map(person => {
    const discountShare = (person.amount / subtotal) * discount;
    const deliveryShare = deliveryFee / totalPeople;
    const finalOwed = roundUpToNearest100(person.amount - discountShare + deliveryShare);

    return {
      name: person.name,
      amount: person.amount,
      discountShare: roundUpToNearest100(discountShare),
      finalOwed
    };
  });

  const totalBefore = subtotal + deliveryFee;
  let totalAfter = results.reduce((sum, person) => sum + person.finalOwed, 0);
  const totalToDeliveryService = subtotal + deliveryFee - discount;

  // Adjust discount shares to ensure Total After does not exceed Total to Delivery Service
  let adjustmentNeeded = totalAfter - totalToDeliveryService;
  while (adjustmentNeeded > 0) {
    const randomIndex = Math.floor(Math.random() * results.length);
    const person = results[randomIndex];
    const adjustment = Math.min(adjustmentNeeded, 100); // Adjust by Rp100 increments

    person.discountShare += adjustment;
    person.finalOwed -= adjustment;
    adjustmentNeeded -= adjustment;
  }

  totalAfter = results.reduce((sum, person) => sum + person.finalOwed, 0);

  res.json({
    totalBefore,
    totalAfter,
    totalToDeliveryService,
    results
  });
});

module.exports = router;