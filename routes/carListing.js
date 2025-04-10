// routes/carListing.js
const express = require('express');
const router = express.Router();
const db = require('../db/database');
const notificationSubject = require('../models/notificationSubject');

// Middleware: ensure that the user is logged in.
function ensureLoggedIn(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
}

// GET /car/create – Render the "Host Your Car" page.
router.get('/create', ensureLoggedIn, (req, res) => {
  res.render('createCarListing');
});

// ✅ POST /car/create – Process new car listing with proper number parsing
router.post('/create', ensureLoggedIn, (req, res) => {
  const { model, year, mileage, availability, pickupLocation, rentalPrice } = req.body;
  const ownerId = req.session.user.id;

  // Convert numeric fields
  const yearNum = parseInt(year);
  const mileageNum = parseInt(mileage);
  const rentalPriceNum = parseFloat(rentalPrice);

  const sql = `INSERT INTO car_listings 
      (ownerId, model, year, mileage, availability, pickupLocation, rentalPrice)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const params = [ownerId, model, yearNum, mileageNum, availability, pickupLocation, rentalPriceNum];

  db.run(sql, params, function(err) {
    if (err) {
      console.error("Create Listing Error:", err.message);
      return res.send("Error creating car listing.");
    }
    
    // Send notification to the user about successful car listing creation
    notificationSubject.notifyObservers(`Your car listing for ${model} (${yearNum}) has been created successfully.`, ownerId);
    
    res.redirect('/car/mylistings');
  });
});

// GET /car/mylistings – Show listings owned by the logged-in user.
router.get('/mylistings', ensureLoggedIn, (req, res) => {
  const ownerId = req.session.user.id;
  const sql = "SELECT * FROM car_listings WHERE ownerId = ?";
  db.all(sql, [ownerId], (err, listings) => {
    if (err) {
      console.error(err.message);
      return res.send("Error fetching your listings.");
    }
    res.render('myListings', { listings, user: req.session.user });
  });
});

// ✅ GET /car/edit/:id – Render full edit form for a specific listing
router.get('/edit/:id', ensureLoggedIn, (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM car_listings WHERE id = ? AND ownerId = ?";
  db.get(sql, [id, req.session.user.id], (err, listing) => {
    if (err || !listing) {
      return res.send("Listing not found or you are not authorized.");
    }
    res.render('editCarListing', { listing });
  });
});

// ✅ POST /car/edit/:id – Process edit of a listing.
router.post('/edit/:id', ensureLoggedIn, (req, res) => {
  const id = req.params.id;
  const { model, year, mileage, availability, pickupLocation, rentalPrice } = req.body;
  
  // Convert numeric fields
  const yearNum = parseInt(year);
  const mileageNum = parseInt(mileage);
  const rentalPriceNum = parseFloat(rentalPrice);
  
  const sql = "UPDATE car_listings SET model = ?, year = ?, mileage = ?, availability = ?, pickupLocation = ?, rentalPrice = ? WHERE id = ? AND ownerId = ?";
  db.run(sql, [model, yearNum, mileageNum, availability, pickupLocation, rentalPriceNum, id, req.session.user.id], function(err) {
    if (err) {
      console.error(err.message);
      return res.send("Error updating listing.");
    }
    
    // Send notification about the edit
    notificationSubject.notifyObservers(`Your car listing for ${model} (${yearNum}) has been updated successfully.`, req.session.user.id);
    
    res.redirect('/car/mylistings');
  });
});

// GET /car/delete/:id – Delete a listing if not booked.
router.get('/delete/:id', ensureLoggedIn, (req, res) => {
  const id = req.params.id;
  // First, check if there is any active booking for this listing.
  const sqlCheck = "SELECT COUNT(*) AS count FROM bookings WHERE listingId = ?";
  db.get(sqlCheck, [id], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.send("Error checking booking status.");
    }
    if (row.count > 0) {
      return res.send("Cannot delete listing because it has active bookings. You can cancel bookings instead.");
    } else {
      // Get the car details before deleting for the notification
      const sqlGetDetails = "SELECT model, year FROM car_listings WHERE id = ? AND ownerId = ?";
      db.get(sqlGetDetails, [id, req.session.user.id], (err, carDetails) => {
        if (err) {
          console.error(err.message);
          return res.send("Error getting car details.");
        }
        
        const sqlDelete = "DELETE FROM car_listings WHERE id = ? AND ownerId = ?";
        db.run(sqlDelete, [id, req.session.user.id], function(err) {
          if (err) {
            console.error(err.message);
            return res.send("Error deleting listing.");
          }
          
          // Send notification about the deletion
          if (carDetails) {
            notificationSubject.notifyObservers(`Your car listing for ${carDetails.model} (${carDetails.year}) has been deleted.`, req.session.user.id);
          }
          
          res.redirect('/car/mylistings');
        });
      });
    }
  });
});

// (Optional) Route to delete/cancel bookings for a listing
router.get('/deleteBookings/:id', ensureLoggedIn, (req, res) => {
  const listingId = req.params.id;
  const sqlDeleteBookings = "DELETE FROM bookings WHERE listingId = ?";
  db.run(sqlDeleteBookings, [listingId], function(err) {
    if (err) {
      console.error(err.message);
      return res.send("Error deleting bookings.");
    }
    const sqlUpdate = "UPDATE car_listings SET isBooked = 0 WHERE id = ?";
    db.run(sqlUpdate, [listingId], function(err) {
      if (err) {
        console.error(err.message);
        return res.send("Error updating listing status.");
      }
      res.redirect('/car/mylistings');
    });
  });
});

module.exports = router;