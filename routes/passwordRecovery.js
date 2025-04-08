// routes/passwordRecovery.js
const express = require('express');
const router = express.Router();
const SecurityHandler = require('../models/passwordRecovery');

// Set up a chain (in practice, retrieve the user’s actual questions/answers)
const securityChain = (() => {
  const handler1 = new SecurityHandler("What is your favorite color?", "blue");
  const handler2 = new SecurityHandler("What is your mother's maiden name?", "smith");
  const handler3 = new SecurityHandler("What city were you born in?", "new york");
  handler1.setNext(handler2).setNext(handler3);
  return handler1;
})();

router.get('/recover', (req, res) => {
  res.render('recover');
});

router.post('/recover', (req, res) => {
  // For simplicity, assume a single answer from the form.
  const userResponse = req.body.response;
  const result = securityChain.handle(userResponse);
  if(result) {
    res.send("Identity verified. You may reset your password.");
  } else {
    res.send("Security answers incorrect.");
  }
});

module.exports = router;
