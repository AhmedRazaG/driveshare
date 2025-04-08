// routes/messaging.js
const express = require('express');
const router = express.Router();
const Message = require('../models/message');
// Global in-memory messages store.
const messagesData = require('../models/messagesData');

/**
 * GET /messaging
 * Renders a page displaying all messages in the system.
 * In a real application, filter messages for the logged-in user.
 */
router.get('/', (req, res) => {
  res.render('messaging', { messages: messagesData });
});

/**
 * GET /messaging/compose
 * Renders a form for composing a new message.
 */
router.get('/compose', (req, res) => {
  res.render('composeMessage');
});

/**
 * POST /messaging/compose
 * Processes the new message form.
 * Expects the following fields in req.body:
 * - senderId, receiverId, content.
 */
router.post('/compose', (req, res) => {
  const { senderId, receiverId, content } = req.body;
  
  // Simple validation: ensure all fields are present.
  if (!senderId || !receiverId || !content) {
    return res.send("All fields are required.");
  }
  
  // Create a new message instance.
  const newMessage = new Message(senderId, receiverId, content);
  
  // Store the message in the in-memory store.
  messagesData.push(newMessage);
  
  // Redirect to the messaging inbox.
  res.redirect('/messaging');
});

module.exports = router;
