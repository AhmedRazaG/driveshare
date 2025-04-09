// models/carListingsData.js
// This array now contains some dummy car listings.
let carListings = [
  {
    id: 1623456789012,
    ownerId: 1,
    model: "Toyota Camry",
    year: 2019,
    mileage: 30000,
    availability: "Mon-Fri, 8AM-8PM",
    pickupLocation: "New York",
    rentalPrice: 50,
    isBooked: false
  },
  {
    id: 1623456789013,
    ownerId: 2,
    model: "Honda Civic",
    year: 2020,
    mileage: 20000,
    availability: "Weekends, 10AM-6PM",
    pickupLocation: "Los Angeles",
    rentalPrice: 60,
    isBooked: false
  }
];
module.exports = carListings;
