// db/database.js
const sqlite3 = require('sqlite3').verbose();
const DBSOURCE = "db.sqlite";

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error("Error opening database: " + err.message);
  } else {
    console.log("Connected to the SQLite database.");

    // Users table remains as before.
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

    // Update car_listings table: store availability as a JSON string.
    db.run(`CREATE TABLE IF NOT EXISTS car_listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ownerId INTEGER,
      model TEXT,
      year INTEGER,
      mileage INTEGER,
      availability TEXT,  -- JSON encoded array of dates (e.g., ["2025-05-01", "2025-05-02"])
      pickupLocation TEXT,
      rentalPrice REAL,
      isBooked INTEGER DEFAULT 0,
      FOREIGN KEY(ownerId) REFERENCES users(id)
    )`, (err) => { if (err) console.error(err.message); });

    // Bookings table for booking records.
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listingId INTEGER,
      renterId INTEGER,
      bookingDate TEXT,  -- The specific day that is booked (YYYY-MM-DD)
      FOREIGN KEY(listingId) REFERENCES car_listings(id),
      FOREIGN KEY(renterId) REFERENCES users(id)
    )`, (err) => { if (err) console.error(err.message); });

    // Messages table remains as before.
    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      senderId INTEGER,
      receiverId INTEGER,
      content TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(senderId) REFERENCES users(id),
      FOREIGN KEY(receiverId) REFERENCES users(id)
    )`, (err) => { if (err) console.error(err.message); });
  }
});

module.exports = db;
