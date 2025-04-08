// routes/payment.js
const express = require('express');
const router = express.Router();
const PaymentProxy = require('../models/paymentProxy');
// Import Message model and in-memory messages store to simulate notifications.
const Message = require('../models/message');
const messagesData = require('../models/messagesData');

/**
 * GET /payment/pay
 * Renders a payment form. For demo purposes, we use a fixed amount.
 */
router.get('/pay', (req, res) => {
  // Example fixed amount; in a complete application this would come from order details.
  let amount = 100;
  res.render('payment', { amount });
});

/**
 * POST /payment/pay
 * Processes a payment using the PaymentProxy.
 * Expects:
 *    - amount: The amount to pay.
 *    - renterId: The ID of the user making the payment.
 *    - ownerId: The ID of the car owner receiving the payment.
 */
router.post('/pay', (req, res) => {
  const { amount, renterId, ownerId } = req.body;
  
  // Use PaymentProxy to process the payment.
  const paymentProxy = new PaymentProxy();
  const success = paymentProxy.processPayment(amount);
  
  if (success) {
    // Create notifications for both owner and renter.
    // Here we simulate a system notification by creating messages.
    let ownerNotification = new Message(
      "PaymentSystem",
      ownerId,
      `Payment of $${amount} received for your rental car.`
    );
    let renterNotification = new Message(
      "PaymentSystem",
      renterId,
      `Payment of $${amount} processed successfully.`
    );
    messagesData.push(ownerNotification, renterNotification);
    res.send(`Payment successful. $${amount} has been processed for your rental.`);
  } else {
    res.send("Payment failed. Please try again.");
  }
});

module.exports = router;
