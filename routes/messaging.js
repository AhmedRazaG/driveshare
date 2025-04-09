// routes/messaging.js
const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const messagesData = require('../models/messagesData');
const notificationSubject = require('../models/notificationSubject');

// GET /messaging – Display the inbox (list of messages)
router.get('/', (req, res) => {
  res.render('inbox', { messages: messagesData });
});

// GET /messaging/compose – Render the compose message form.
router.get('/compose', (req, res) => {
  res.render('composeMessage');
});

// POST /messaging/compose – Process composing a new message.
router.post('/compose', (req, res) => {
  const { senderId, receiverId, content } = req.body;
  if (!senderId || !receiverId || !content) {
    return res.send("All fields are required.");
  }
  const newMessage = new Message(senderId, receiverId, content);
  messagesData.push(newMessage);

  notificationSubject.notifyObservers(`You have received a new message from ${senderId}.`, receiverId);

  res.redirect('/messaging');
});

module.exports = router;
