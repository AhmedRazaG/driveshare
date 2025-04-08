// routes/passwordRecovery.js
const express = require('express');
const router = express.Router();
const { SecurityHandler, validateSecurityChain } = require('../models/passwordRecovery');

// For demonstration, we use a fixed set of security questions and expected answers.
// In a real application, these should be retrieved for the user who is recovering their password.
const securityChain = [
  new SecurityHandler("What is your favorite color?", "blue"),
  new SecurityHandler("What is your mother's maiden name?", "smith"),
  new SecurityHandler("What city were you born in?", "new york")
];

/**
 * GET /password/recover
 * Renders a form displaying the three security questions.
 */
router.get('/recover', (req, res) => {
  // Send the questions to the view.
  const questions = securityChain.map(handler => handler.question);
  res.render('recover', { questions });
});

/**
 * POST /password/recover
 * Processes the security questions answers.
 * Expects the following fields in req.body: answer1, answer2, answer3.
 */
router.post('/recover', (req, res) => {
  const { answer1, answer2, answer3 } = req.body;
  const userAnswers = [answer1, answer2, answer3];
  
  // Validate the answers using our chain-of-responsibility helper.
  if (validateSecurityChain(userAnswers, securityChain)) {
    res.send("Security questions verified. You may now reset your password.");
  } else {
    res.send("Security answers incorrect. Please try again.");
  }
});

module.exports = router;
