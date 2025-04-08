// routes/booking.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
// Import the shared car listings array from our data store.
const carListings = require('../models/carListingsData');

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
  // In a more complex system, you would also use startDate/endDate to filter availability.
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
  // For simplicity, we filter by the pickup location.
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

  // Prevent booking if the listing is already booked.
  if (listing.isBooked) {
    return res.send("This car is already booked for the selected period.");
  }
  
  // Create a new booking instance.
  const booking = new Booking(listing, renterId, bookingPeriod);
  
  // For demonstration, we add a simple observer that logs notifications.
  const observer = {
    update: (message) => console.log("Notification:", message)
  };
  booking.addObserver(observer);
  
  // Confirm the booking, which also notifies the observer.
  booking.confirmBooking();
  
  // Mark the listing as booked.
  listing.isBooked = true;
  
  res.send(`Booking confirmed for ${listing.model}. Booking period: ${bookingPeriod}`);
});

module.exports = router;
