//routes/notifications.js
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /notifications – List notifications for the logged in user.
router.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  const userId = req.session.user.id;
  const sql = "SELECT * FROM notifications WHERE uid = ? ORDER BY datetime DESC";
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.send("Error retrieving notifications.");
    }
    res.render('notifications', { notifications: rows });
  });
});

module.exports = router;
