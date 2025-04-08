// models/booking.js
class Booking {
  constructor(listing, renterId, bookingPeriod) {
    this.listing = listing;
    this.renterId = renterId;
    this.bookingPeriod = bookingPeriod;
    this.observers = [];
  }

  addObserver(observer) {
    this.observers.push(observer);
  }

  notifyObservers(message) {
    this.observers.forEach(obs => obs.update(message));
  }

  confirmBooking() {
    // Booking confirmation logic
    this.notifyObservers("Booking confirmed for " + this.listing.model);
  }
}

module.exports = Booking;
