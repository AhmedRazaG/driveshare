// routes/auth.js
const express = require('express');
const router = express.Router();
const sessionManager = require('../models/sessionManager');

// For this demonstration we will use an in-memory array to store user data.
// In a production app, replace this with database queries.
let users = [];

/**
 * GET /auth/register
 * Render the registration page.
 */
router.get('/register', (req, res) => {
  res.render('register');
});

/**
 * POST /auth/register
 * Process the user registration.
 * Expects the following fields in req.body:
 *  - email, password,
 *  - securityQuestion1, securityAnswer1,
 *  - securityQuestion2, securityAnswer2,
 *  - securityQuestion3, securityAnswer3
 */
router.post('/register', (req, res) => {
  const {
    email,
    password,
    securityQuestion1,
    securityAnswer1,
    securityQuestion2,
    securityAnswer2,
    securityQuestion3,
    securityAnswer3,
  } = req.body;

  // Basic validation (you can extend this)
  if (!email || !password || !securityQuestion1 || !securityAnswer1 ||
      !securityQuestion2 || !securityAnswer2 || !securityQuestion3 || !securityAnswer3) {
    return res.send("All fields are required.");
  }

  // Create a new user object
  const newUser = {
    id: users.length + 1,  // simple numeric ID; in production use UUID or auto‐generated id from DB.
    email,
    // IMPORTANT: In production, NEVER store plain text passwords.
    password,
    securityQuestions: [
      { question: securityQuestion1, answer: securityAnswer1 },
      { question: securityQuestion2, answer: securityAnswer2 },
      { question: securityQuestion3, answer: securityAnswer3 },
    ]
  };

  // Store the user in our in-memory “database”
  users.push(newUser);
  console.log("Registered users:", users); // for debugging

  // Redirect the user to the login page
  res.redirect('/auth/login');
});

/**
 * GET /auth/login
 * Render the login page.
 */
router.get('/login', (req, res) => {
  res.render('login');
});

/**
 * POST /auth/login
 * Process user login.
 * Expects: email, password
 * If authentication passes, creates a session.
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Look up the user
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    // Create a session for the authenticated user using the session manager (Singleton)
    const sessionId = sessionManager.createSession(user.id);
    // For a real app, you would set this session id as a secure HTTP-only cookie
    res.redirect('/dashboard?session=' + sessionId);
  } else {
    // For simplicity, we send a basic response. In production, redirect back with an error.
    res.send("Invalid email or password. Please try again.");
  }
});

module.exports = router;
