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
 */
router.get('/browse', ensureLoggedIn, (req, res) => {
  const sql = `
    SELECT car_listings.*, users.fullName as ownerName 
    FROM car_listings 
    JOIN users ON car_listings.ownerId = users.id
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.send("Error retrieving car listings.");
    }
    res.render('browseCars', { listings: rows });
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
router.get('/book/:id', (req, res) => {
  const id = Number(req.params.id);
  const listing = carListings.find(listing => listing.id === id);
  if (!listing) {
    return res.send("Listing not found.");
  }
  res.render('bookingForm', { listing });
});

/**
 * POST /booking/book/:id
 * Processes the booking form.
 * Expects form fields: renterId, bookingPeriod.
 * Checks if the car is already booked and, if not, confirms the booking.
 */
router.post('/book/:id', (req, res) => {
  const id = Number(req.params.id);
  const { renterId, bookingPeriod } = req.body;
  const listing = carListings.find(listing => listing.id === id);
  if (!listing) {
    return res.send("Listing not found.");
  }

  if (listing.isBooked) {
    return res.send("This car is already booked for the selected period.");
  }

  const booking = new Booking(listing, renterId, bookingPeriod);

  const observer = {
    update: (messageText) => {
      const notification = new Message("System", renterId, messageText);
      messagesData.push(notification);
      console.log("Notification sent:", messageText);
    }
  };
  booking.addObserver(observer);

  booking.confirmBooking();

  listing.isBooked = true;

  notificationSubject.notifyObservers(`Your booking for "${listing.model}" on ${bookingPeriod} is confirmed!`, req.session.user.id);
  notificationSubject.notifyObservers(`Your car "${listing.model}" has been booked on ${bookingPeriod}.`, listing.ownerId);

  res.send(`Booking confirmed for ${listing.model}. Booking period: ${bookingPeriod}`);
});

module.exports = router;
