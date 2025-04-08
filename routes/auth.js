// routes/auth.js
const express = require('express');
const router = express.Router();
const sessionManager = require('../models/sessionManager');

// Simulated user “database”
let users = [];

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', (req, res) => {
  const { email, password, securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2, securityQuestion3, securityAnswer3 } = req.body;
  // Add simple validation as needed
  const newUser = { 
    id: users.length + 1,
    email,
    password,
    securityQuestions: [
      { question: securityQuestion1, answer: securityAnswer1 },
      { question: securityQuestion2, answer: securityAnswer2 },
      { question: securityQuestion3, answer: securityAnswer3 }
    ]
  };
  users.push(newUser);
  res.redirect('/auth/login');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    const sessionId = sessionManager.createSession(user.id);
    // In a production app, set a secure cookie with the session id
    res.redirect('/dashboard?session=' + sessionId);
  } else {
    res.send("Invalid credentials");
  }
});

module.exports = router;
