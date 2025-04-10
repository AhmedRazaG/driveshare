// routes/messaging.js
const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { notificationSubject } = require('../models/notificationSubject');

// Middleware to ensure user is logged in
const ensureLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
};

// Apply middleware to all routes
router.use(ensureLoggedIn);

/**
 * GET /messaging
 * Redirects to the inbox
 */
router.get('/', (req, res) => {
  res.redirect('/messaging/inbox');
});

/**
 * GET /messaging/inbox
 * Shows the user's message inbox
 */
router.get('/inbox', (req, res) => {
  const sql = `
    SELECT m.*, 
      s.email as sender_email, 
      r.email as receiver_email,
      CASE WHEN m.readAt IS NULL THEN 1 ELSE 0 END as is_unread
    FROM messages m
    JOIN users s ON m.senderId = s.id
    JOIN users r ON m.receiverId = r.id
    WHERE m.receiverId = ?
    ORDER BY m.createdAt DESC
  `;
  
  db.all(sql, [req.session.user.id], (err, messages) => {
    if (err) {
      console.error('Error fetching messages:', err);
      return res.render('messaging/inbox', { 
        messages: [],
        user: req.session.user,
        error: 'Failed to load messages. Please try again later.'
      });
    }
    
    res.render('messaging/inbox', { 
      messages,
      user: req.session.user,
      error: req.query.error
    });
  });
});

/**
 * GET /messaging/compose
 * Shows the message composition form
 */
router.get('/compose', (req, res) => {
  res.render('messaging/compose', {
    user: req.session.user,
    recipient: req.query.to || '',
    message: req.query.message || '',
    error: req.query.error
  });
});

/**
 * POST /messaging/send
 * Sends a new message
 */
router.post('/send', (req, res) => {
  const { recipient, message } = req.body;
  
  // Validate input
  if (!recipient || !message) {
    return res.render('messaging/compose', {
      user: req.session.user,
      recipient,
      message,
      error: 'Recipient email and message are required'
    });
  }

  // Get recipient user
  db.get('SELECT id FROM users WHERE email = ?', [recipient], (err, recipientUser) => {
    if (err) {
      console.error('Error finding recipient:', err);
      return res.render('messaging/compose', {
        user: req.session.user,
        recipient,
        message,
        error: 'Failed to send message. Please try again later.'
      });
    }

    if (!recipientUser) {
      return res.render('messaging/compose', {
        user: req.session.user,
        recipient,
        message,
        error: 'Recipient not found'
      });
    }

    const recipientId = recipientUser.id;

    // Insert message
    db.run(
      `INSERT INTO messages (senderId, receiverId, message, createdAt)
       VALUES (?, ?, ?, datetime('now'))`,
      [req.session.user.id, recipientId, message],
      function(err) {
        if (err) {
          console.error('Error sending message:', err);
          return res.render('messaging/compose', {
            user: req.session.user,
            recipient,
            message,
            error: 'Failed to send message. Please try again later.'
          });
        }

        // Send notification to recipient
        try {
          if (notificationSubject && typeof notificationSubject.notifyObservers === 'function') {
            notificationSubject.notifyObservers(recipientId, {
              type: 'new_message',
              message: `You have received a new message from ${req.session.user.email}`,
              link: '/messaging/inbox'
            });
          }
        } catch (notificationError) {
          console.error('Error sending notification:', notificationError);
          // Continue with success response even if notification fails
        }

        res.redirect('/messaging/inbox?success=Message sent successfully');
      }
    );
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
      return res.render('messaging/inbox', { 
        messages: [],
        error: "Error retrieving message. Please try again."
      });
    }
    if (!message) {
      return res.render('messaging/inbox', { 
        messages: [],
        error: "Message not found."
      });
    }

    // Mark as read if receiver is viewing
    if (message.receiverId === userId && !message.readAt) {
      const updateSql = "UPDATE messages SET readAt = datetime('now') WHERE id = ?";
      db.run(updateSql, [messageId]);
    }

    res.render('messaging/view', { message });
  });
});

// Mark message as read
router.post('/read/:id', (req, res) => {
  db.run(
    'UPDATE messages SET readAt = datetime("now") WHERE id = ? AND receiverId = ?',
    [req.params.id, req.session.user.id],
    function(err) {
      if (err) {
        console.error('Error marking message as read:', err);
        return res.status(500).json({ error: 'Failed to mark message as read' });
      }
      res.json({ success: true });
    }
  );
});

// Delete message
router.post('/delete/:id', (req, res) => {
  db.run(
    'DELETE FROM messages WHERE id = ? AND (senderId = ? OR receiverId = ?)',
    [req.params.id, req.session.user.id, req.session.user.id],
    function(err) {
      if (err) {
        console.error('Error deleting message:', err);
        return res.redirect('/messaging/inbox?error=Failed to delete message');
      }
      res.redirect('/messaging/inbox?success=Message deleted successfully');
    }
  );
});

module.exports = router;