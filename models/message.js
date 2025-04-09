// models/message.js
class Message {
  constructor(senderId, receiverId, content) {
    this.id = Date.now();  // simple unique id based on time
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.content = content;
    this.timestamp = new Date();
  }
}

module.exports = Message;
