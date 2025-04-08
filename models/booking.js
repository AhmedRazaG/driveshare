// models/booking.js
class Booking {
  /**
   * Constructs a Booking.
   * @param {object} listing - The car listing that is being booked.
   * @param {number|string} renterId - The id of the renter.
   * @param {string} bookingPeriod - The booking period (as a simple string, e.g. "2025-05-01 to 2025-05-07").
   */
  constructor(listing, renterId, bookingPeriod) {
    this.listing = listing;
    this.renterId = renterId;
    this.bookingPeriod = bookingPeriod;
    this.observers = [];
  }

  /**
   * Registers an observer.
   * @param {object} observer - An observer with an update(message) method.
   */
  addObserver(observer) {
    this.observers.push(observer);
  }

  /**
   * Notifies all registered observers with a message.
   * @param {string} message 
   */
  notifyObservers(message) {
    this.observers.forEach(observer => observer.update(message));
  }

  /**
   * Confirms the booking and notifies the observers.
   */
  confirmBooking() {
    // In a complete implementation, add more logic (e.g. verify dates, payment, etc.)
    this.notifyObservers(`Booking confirmed for ${this.listing.model} for renter ${this.renterId}.`);
  }
}

module.exports = Booking;
