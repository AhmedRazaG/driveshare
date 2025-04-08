// models/carListingBuilder.js

// CarListing represents the car listing details.
class CarListing {
  constructor(builder) {
    this.id = builder.id; // Unique identifier (assigned in the route)
    this.ownerId = builder.ownerId;
    this.model = builder.model;
    this.year = builder.year;
    this.mileage = builder.mileage;
    this.availability = builder.availability; // e.g., availability calendar (as a string or object)
    this.pickupLocation = builder.pickupLocation;
    this.rentalPrice = builder.rentalPrice;
    this.isBooked = builder.isBooked; // Boolean flag to prevent double booking
  }
}

// CarListingBuilder builds CarListing instances.
class CarListingBuilder {
  constructor(ownerId) {
    this.ownerId = ownerId;
    this.isBooked = false; // default booking status
  }
  setModel(model) {
    this.model = model;
    return this;
  }
  setYear(year) {
    this.year = year;
    return this;
  }
  setMileage(mileage) {
    this.mileage = mileage;
    return this;
  }
  setAvailability(availability) {
    this.availability = availability;
    return this;
  }
  setPickupLocation(location) {
    this.pickupLocation = location;
    return this;
  }
  setRentalPrice(price) {
    this.rentalPrice = price;
    return this;
  }
  // Optionally add methods for further customization.

  // build creates a new CarListing instance.
  build() {
    return new CarListing(this);
  }
}

module.exports = { CarListing, CarListingBuilder };
