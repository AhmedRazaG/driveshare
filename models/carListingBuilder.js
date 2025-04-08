// models/carListingBuilder.js
class CarListing {
  constructor(builder) {
    this.ownerId = builder.ownerId;
    this.model = builder.model;
    this.year = builder.year;
    this.mileage = builder.mileage;
    this.availability = builder.availability; // e.g., availability calendar as a string or object
    this.pickupLocation = builder.pickupLocation;
    this.rentalPrice = builder.rentalPrice;
  }
}

class CarListingBuilder {
  constructor(ownerId) {
    this.ownerId = ownerId;
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
  build() {
    return new CarListing(this);
  }
}

module.exports = { CarListing, CarListingBuilder };
