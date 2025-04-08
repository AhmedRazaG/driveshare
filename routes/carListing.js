// routes/carListing.js
const express = require('express');
const router = express.Router();
const { CarListingBuilder } = require('../models/carListingBuilder');

// In-memory storage for demo purposes
let carListings = [];

router.get('/list', (req, res) => {
  res.render('carListing', { listings: carListings });
});

router.get('/create', (req, res) => {
  res.render('createCarListing');
});

router.post('/create', (req, res) => {
  const { ownerId, model, year, mileage, availability, pickupLocation, rentalPrice } = req.body;
  const builder = new CarListingBuilder(ownerId);
  const listing = builder.setModel(model)
                         .setYear(year)
                         .setMileage(mileage)
                         .setAvailability(availability)
                         .setPickupLocation(pickupLocation)
                         .setRentalPrice(rentalPrice)
                         .build();
  carListings.push(listing);
  res.redirect('/car/list');
});

module.exports = router;
