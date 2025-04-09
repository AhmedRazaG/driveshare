// routes/passwordRecovery.js
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /password/recover – Render the password recovery form with static questions.
router.get('/recover', (req, res) => {
  // These questions are hard-coded for demo purposes.
  const questions = [
    "What is your favorite color?",
    "What is your mother's maiden name?",
    "What city were you born in?"
  ];
  res.render('recover', { questions });
});

// POST /password/recover – Process the recovery data.
router.post('/recover', (req, res) => {
  const { email, answer1, answer2, answer3 } = req.body;
  
  if (!email || !answer1 || !answer2 || !answer3) {
    return res.send("All fields are required.");
  }
  
  // Query for the user using their email.
  const sql = "SELECT * FROM users WHERE email = ?";
  db.get(sql, [email], (err, user) => {
    if (err) {
      console.error(err.message);
      return res.send("Error retrieving user.");
    }
    if (!user) {
      return res.send("No user found with that email.");
    }
    
    // Helper function to compare answers case-insensitively.
    function answersMatch(given, stored) {
      return given.trim().toLowerCase() === stored.trim().toLowerCase();
    }
    
    if (
      answersMatch(answer1, user.securityAnswer1) &&
      answersMatch(answer2, user.securityAnswer2) &&
      answersMatch(answer3, user.securityAnswer3)
    ) {
      res.send(`Your password is: ${user.password}`);
    } else {
      res.send("Security answers incorrect. Please try again.");
    }
  });
});

module.exports = router;
