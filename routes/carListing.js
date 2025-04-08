// routes/carListing.js
const express = require('express');
const router = express.Router();
const { CarListingBuilder } = require('../models/carListingBuilder');

// In-memory storage for demo purposes
// In production, replace with a persistent database.
const carListings = require('../models/carListingsData');


/**
 * GET /car/list
 * Renders a page that displays all available car listings.
 */
router.get('/list', (req, res) => {
  res.render('carListing', { listings: carListings });
});

/**
 * GET /car/create
 * Renders a form to create a new car listing.
 */
router.get('/create', (req, res) => {
  res.render('createCarListing');
});

/**
 * POST /car/create
 * Processes the car listing creation form.
 * Expects: ownerId, model, year, mileage, availability, pickupLocation, rentalPrice.
 */
router.post('/create', (req, res) => {
  const { ownerId, model, year, mileage, availability, pickupLocation, rentalPrice } = req.body;

  // Create a new builder for this owner.
  const builder = new CarListingBuilder(ownerId);
  
  // Build the car listing object.
  let listing = builder.setModel(model)
                       .setYear(year)
                       .setMileage(mileage)
                       .setAvailability(availability)
                       .setPickupLocation(pickupLocation)
                       .setRentalPrice(rentalPrice)
                       .build();
  
  // Generate a unique ID; here we use current timestamp as a simple unique ID.
  listing.id = Date.now();
  
  // Add the new listing to our array.
  carListings.push(listing);
  res.redirect('/car/list');
});

/**
 * GET /car/edit/:id
 * Renders a form for editing (updating) an existing car listing.
 * Only availability and rental price are updated in this example.
 */
router.get('/edit/:id', (req, res) => {
  const id = Number(req.params.id);
  const listing = carListings.find(l => l.id === id);
  if (!listing) {
    return res.send("Listing not found.");
  }
  res.render('editCarListing', { listing });
});

/**
 * POST /car/edit/:id
 * Processes the update form for a specific car listing.
 * Expects: availability, rentalPrice.
 */
router.post('/edit/:id', (req, res) => {
  const id = Number(req.params.id);
  let listing = carListings.find(l => l.id === id);
  if (!listing) {
    return res.send("Listing not found.");
  }
  
  // In production, you might also check if the car is currently booked before updating.
  if (listing.isBooked) {
    return res.send("This listing is currently booked and cannot be updated.");
  }
  
  // Update only availability and rental price.
  const { availability, rentalPrice } = req.body;
  listing.availability = availability;
  listing.rentalPrice = rentalPrice;
  
  res.redirect('/car/list');
});

module.exports = router;
