const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /auth/register – Render the registration page.
router.get('/register', (req, res) => {
  res.render('register');
});

// POST /auth/register – Process registration.
router.post('/register', (req, res) => {
  const { fullName, email, password, confirmPassword, securityAnswer1, securityAnswer2, securityAnswer3 } = req.body;
  if (!fullName || !email || !password || !confirmPassword || !securityAnswer1 || !securityAnswer2 || !securityAnswer3) {
    return res.send("All fields are required.");
  }
  if (password !== confirmPassword) {
    return res.send("Passwords do not match.");
  }
  const sql = `INSERT INTO users (fullName, email, password, securityAnswer1, securityAnswer2, securityAnswer3)
               VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [fullName, email, password, securityAnswer1, securityAnswer2, securityAnswer3];
  db.run(sql, params, function(err) {
    if (err) {
      console.error(err.message);
      return res.send("Registration failed. The email might already be in use.");
    } else {
      res.redirect('/auth/login');
    }
  });
});

// GET /auth/login – Render the login page.
router.get('/login', (req, res) => {
  res.render('login');
});

// POST /auth/login – Process login.
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.get(sql, [email, password], (err, user) => {
    if (err) {
      console.error(err.message);
      return res.send("Login error.");
    }
    if (user) {
      // Save user info in the session.
      req.session.user = {
        id: user.id,
        fullName: user.fullName,
        email: user.email
      };
      res.redirect('/dashboard');
    } else {
      res.send("Invalid email or password.");
    }
  });
});

// GET /auth/logout – Process logout.
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/auth/login');
});

module.exports = router;
