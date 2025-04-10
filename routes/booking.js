// routes/booking.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const carListings = require('../models/carListingsData');
const db = require('../db/database');

// Import the message model and messages data store
const Message = require('../models/message');
const messagesData = require('../models/messagesData');
const notificationSubject = require('../models/notificationSubject');

// Middleware to ensure the user is logged in
const ensureLoggedIn = (req, res, next) => {
  if (!req.session.user) return res.redirect('/auth/login');
  next();
};

/**
 * GET /booking/browse
 * Fetches car listings from the database and renders the browseCars.ejs page.
 * Supports filtering by location, model, and date.
 */
router.get('/browse', ensureLoggedIn, (req, res) => {
  const { location, model, date } = req.query;
  
  let sql = `
    SELECT car_listings.*, users.fullName as ownerName 
    FROM car_listings 
    JOIN users ON car_listings.ownerId = users.id
    WHERE 1=1
  `;
  
  const params = [];
  
  // Add location filter if provided
  if (location) {
    sql += ` AND LOWER(car_listings.pickupLocation) LIKE LOWER(?)`;
    params.push(`%${location}%`);
  }
  
  // Add model filter if provided
  if (model) {
    sql += ` AND LOWER(car_listings.model) LIKE LOWER(?)`;
    params.push(`%${model}%`);
  }
  
  // Add date filter if provided
  if (date) {
    sql += ` AND car_listings.availability LIKE ?`;
    params.push(`%${date}%`);
  }
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.send("Error retrieving car listings.");
    }
    res.render('browseCars', { 
      listings: rows,
      searchParams: { location, model, date }
    });
  });
});

/**
 * GET /booking/search
 * Renders a search form for available car listings.
 */
router.get('/search', (req, res) => {
  res.render('searchBooking');
});

/**
 * POST /booking/search
 * Processes the search form and redirects to the search results.
 * Expects form fields: location, startDate, endDate
 */
router.post('/search', (req, res) => {
  const { location, startDate, endDate } = req.body;
  res.redirect(
    '/booking/results?location=' +
      encodeURIComponent(location) +
      '&startDate=' +
      encodeURIComponent(startDate) +
      '&endDate=' +
      encodeURIComponent(endDate)
  );
});

/**
 * GET /booking/results
 * Filters the car listings based on the search query and displays the results.
 */
router.get('/results', (req, res) => {
  const { location, startDate, endDate } = req.query;
  const results = carListings.filter(listing =>
    listing.pickupLocation.toLowerCase().includes(location.toLowerCase())
  );
  res.render('bookingResults', { listings: results, location, startDate, endDate });
});

/**
 * GET /booking/book/:id
 * Renders the booking form for a selected car listing.
 */
router.get('/book/:id', ensureLoggedIn, (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT car_listings.*, users.fullName as ownerName 
    FROM car_listings 
    JOIN users ON car_listings.ownerId = users.id
    WHERE car_listings.id = ?
  `;
  
  db.get(sql, [id], (err, listing) => {
    if (err) {
      console.error(err.message);
      return res.send("Error retrieving car listing.");
    }
    if (!listing) {
      return res.send("Listing not found.");
    }
    res.render('bookingForm', { listing });
  });
});

/**
 * POST /booking/book/:id
 * Processes a booking for a car listing.
 */
router.post('/book/:id', ensureLoggedIn, (req, res) => {
  const id = req.params.id;
  const { startDate, endDate } = req.body;
  const renterId = req.session.user.id;
  
  // First, check if the car is available for the requested dates
  const checkSql = `
    SELECT * FROM car_listings 
    WHERE id = ? AND availability LIKE ? AND availability LIKE ?
  `;
  
  db.get(checkSql, [id, `%${startDate}%`, `%${endDate}%`], (err, listing) => {
    if (err) {
      console.error(err.message);
      return res.send("Error checking availability.");
    }
    if (!listing) {
      return res.send("Car is not available for the selected dates.");
    }
    
    // Create the booking
    const bookingSql = `
      INSERT INTO bookings (listingId, renterId, startDate, endDate, status)
      VALUES (?, ?, ?, ?, 'confirmed')
    `;
    
    db.run(bookingSql, [id, renterId, startDate, endDate], function(err) {
      if (err) {
        console.error(err.message);
        return res.send("Error creating booking.");
      }
      
      // Update car availability
      const updateSql = `
        UPDATE car_listings 
        SET isBooked = 1 
        WHERE id = ?
      `;
      
      db.run(updateSql, [id], function(err) {
        if (err) {
          console.error(err.message);
          return res.send("Error updating car availability.");
        }
        
        res.redirect('/booking/confirmation/' + this.lastID);
      });
    });
  });
});

module.exports = router;
