// db/database.js
const sqlite3 = require('sqlite3').verbose();
const DBSOURCE = "db.sqlite";

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error("Error opening database: " + err.message);
  } else {
    console.log("Connected to the SQLite database.");

    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT,
      email TEXT UNIQUE,
      password TEXT,
      balance REAL DEFAULT 0,
      securityAnswer1 TEXT,
      securityAnswer2 TEXT,
      securityAnswer3 TEXT
    )`, (err) => { if (err) console.error(err.message); });

    // Car listings table (availability stored as JSON array of dates)
    db.run(`CREATE TABLE IF NOT EXISTS car_listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ownerId INTEGER,
      model TEXT,
      year INTEGER,
      mileage INTEGER,
      availability TEXT,
      pickupLocation TEXT,
      rentalPrice REAL,
      isBooked INTEGER DEFAULT 0,
      FOREIGN KEY(ownerId) REFERENCES users(id)
    )`, (err) => { if (err) console.error(err.message); });

    // Bookings table – storing one booking date per record.
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listingId INTEGER,
      renterId INTEGER,
      bookingDate TEXT,
      FOREIGN KEY(listingId) REFERENCES car_listings(id),
      FOREIGN KEY(renterId) REFERENCES users(id)
    )`, (err) => { if (err) console.error(err.message); });

    // Messages table
    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      senderId INTEGER,
      receiverId INTEGER,
      content TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(senderId) REFERENCES users(id),
      FOREIGN KEY(receiverId) REFERENCES users(id)
    )`, (err) => { if (err) console.error(err.message); });

    // Notifications table for storing observer notifications
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uid INTEGER,
      notification TEXT,
      datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(uid) REFERENCES users(id)
    )`, (err) => { if (err) console.error("Error creating notifications table: " + err.message); });
  }
});

module.exports = db;
