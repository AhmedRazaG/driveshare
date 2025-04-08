// routes/booking.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');

// In-memory booking storage for demo purposes
let bookings = [];

// A dummy observer that simulates user notification
class UserNotification {
  update(message) {
    console.log("Notification:", message);
  }
}

router.get('/book/:listingId', (req, res) => {
  // Render a booking page (in a real app, load the full listing details)
  res.render('booking', { listingId: req.params.listingId });
});

router.post('/book/:listingId', (req, res) => {
  const { renterId, bookingPeriod } = req.body;
  // For simplicity, assume the listing details come from a lookup (this example uses a dummy listing)
  const listing = { id: req.params.listingId, model: "Car Model " + req.params.listingId };
  const booking = new Booking(listing, renterId, bookingPeriod);
  
  // Add an observer to receive notifications
  const userNotification = new UserNotification();
  booking.addObserver(userNotification);
  
  // Confirm the booking; this notifies the observer(s)
  booking.confirmBooking();
  bookings.push(booking);
  res.send("Booking successful for " + listing.model);
});

module.exports = router;
