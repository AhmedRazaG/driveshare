// models/message.js
/**
 * The Message class represents an in-app message or notification.
 */
class Message {
    /**
     * Constructor for a Message.
     * @param {number|string} senderId - The user ID of the sender.
     * @param {number|string} receiverId - The user ID of the recipient.
     * @param {string} content - The content of the message.
     */
    constructor(senderId, receiverId, content) {
      // Generate a simple unique ID based on timestamp.
      this.id = Date.now() + "-" + Math.floor(Math.random() * 1000);
      this.senderId = senderId;
      this.receiverId = receiverId;
      this.content = content;
      this.timestamp = new Date();
    }
  }
  
  module.exports = Message;
  