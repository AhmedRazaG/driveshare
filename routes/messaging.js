// routes/messaging.js
const express = require('express');
const router = express.Router();
const db = require('../db/database');
const notificationSubject = require('../models/notificationSubject');

// Middleware: ensure that the user is logged in
function ensureLoggedIn(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
}

/**
 * GET /messaging
 * Shows the user's message inbox
 */
router.get('/', ensureLoggedIn, (req, res) => {
  const userId = req.session.user.id;
  const sql = `
    SELECT m.*, 
           sender.fullName as senderName,
           receiver.fullName as receiverName
    FROM messages m
    JOIN users sender ON m.senderId = sender.id
    JOIN users receiver ON m.receiverId = receiver.id
    WHERE m.senderId = ? OR m.receiverId = ?
    ORDER BY m.createdAt DESC
  `;
  
  db.all(sql, [userId, userId], (err, messages) => {
    if (err) {
      console.error(err.message);
      return res.send("Error retrieving messages.");
    }
    res.render('messaging/inbox', { messages });
  });
});

/**
 * GET /messaging/compose
 * Shows the message composition form
 */
router.get('/compose', ensureLoggedIn, (req, res) => {
  const { to } = req.query;
  res.render('messaging/compose', { to });
});

/**
 * POST /messaging/send
 * Sends a new message
 */
router.post('/send', ensureLoggedIn, (req, res) => {
  const { to, subject, message } = req.body;
  const senderId = req.session.user.id;
  const senderName = req.session.user.fullName;

  // First, find the receiver's ID by email
  const findUserSql = "SELECT id, fullName FROM users WHERE email = ?";
  db.get(findUserSql, [to], (err, receiver) => {
    if (err) {
      console.error(err.message);
      return res.send("Error finding recipient.");
    }
    if (!receiver) {
      return res.send("Recipient not found.");
    }

    // Insert the message
    const insertSql = `
      INSERT INTO messages (senderId, receiverId, subject, message, createdAt)
      VALUES (?, ?, ?, ?, datetime('now'))
    `;
    
    db.run(insertSql, [senderId, receiver.id, subject, message], function(err) {
      if (err) {
        console.error(err.message);
        return res.send("Error sending message.");
      }

      // Send notification to the receiver
      notificationSubject.notifyObservers(
        `New message from ${senderName}: ${subject}`,
        receiver.id
      );

      res.redirect('/messaging');
    });
  });
});

/**
 * GET /messaging/view/:id
 * Shows a specific message
 */
router.get('/view/:id', ensureLoggedIn, (req, res) => {
  const messageId = req.params.id;
  const userId = req.session.user.id;

  const sql = `
    SELECT m.*, 
           sender.fullName as senderName,
           sender.email as senderEmail,
           receiver.fullName as receiverName,
           receiver.email as receiverEmail
    FROM messages m
    JOIN users sender ON m.senderId = sender.id
    JOIN users receiver ON m.receiverId = receiver.id
    WHERE m.id = ? AND (m.senderId = ? OR m.receiverId = ?)
  `;

  db.get(sql, [messageId, userId, userId], (err, message) => {
    if (err) {
      console.error(err.message);
      return res.send("Error retrieving message.");
    }
    if (!message) {
      return res.send("Message not found.");
    }

    // Mark as read if receiver is viewing
    if (message.receiverId === userId && !message.readAt) {
      const updateSql = "UPDATE messages SET readAt = datetime('now') WHERE id = ?";
      db.run(updateSql, [messageId]);
    }

    res.render('messaging/view', { message });
  });
});

module.exports = router;
