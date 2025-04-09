
const db = require('../db/database');

class NotificationSubject {
  constructor() {
    this.observers = [];
  }
  
  // Register an observer (optional for real-time updates)
  registerObserver(observer) {
    this.observers.push(observer);
  }
  
  // Remove an observer
  removeObserver(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }
  
  // Notify observers and insert into notifications table
  notifyObservers(notification, uid) {
    // Insert notification into the DB.
    const sql = "INSERT INTO notifications (uid, notification) VALUES (?, ?)";
    db.run(sql, [uid, notification], function(err) {
      if (err) {
        console.error("Error inserting notification:", err.message);
      } else {
        console.log(`Notification sent to user ${uid}: ${notification}`);
      }
    });
    
    // Optionally notify real-time observers.
    this.observers.forEach(observer => observer.update && observer.update(uid, notification));
  }
}

module.exports = new NotificationSubject();
