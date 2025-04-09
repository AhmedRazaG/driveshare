// models/messagesData.js
// Sample in-memory messages for demonstration purposes.
let messages = [
    {
      id: 'dummy-1',
      senderId: "System",
      receiverId: "1",
      content: "Welcome to DriveShare! Your account is active.",
      timestamp: new Date("2025-04-01T10:00:00")
    },
    {
      id: 'dummy-2',
      senderId: "User2",
      receiverId: "1",
      content: "Your booking has been confirmed.",
      timestamp: new Date("2025-04-02T12:30:00")
    }
  ];
  module.exports = messages;
  