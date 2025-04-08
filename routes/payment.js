// routes/payment.js
const express = require('express');
const router = express.Router();
const PaymentProxy = require('../models/paymentProxy');

router.get('/pay', (req, res) => {
  res.render('payment', { amount: 100 }); // Example fixed amount
});

router.post('/pay', (req, res) => {
  const { amount } = req.body;
  const paymentProxy = new PaymentProxy();
  const success = paymentProxy.processPayment(amount);
  if(success) {
    res.send("Payment successful. Your balance has been updated.");
  } else {
    res.send("Payment failed.");
  }
});

module.exports = router;
