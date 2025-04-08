// public/js/mediator.js
class Mediator {
    constructor() {
      this.components = {};
    }
    
    register(name, component) {
      this.components[name] = component;
    }
    
    notify(sender, event, data) {
      console.log("Mediator received:", event, "from", sender, "with data", data);
      if(event === "bookingMade" && this.components['messaging']) {
        this.components['messaging'].displayNotification("A new booking has been made.");
      }
    }
  }
  
  const mediator = new Mediator();
  
  // Example booking component
  class BookingComponent {
    constructor(mediator) {
      this.mediator = mediator;
      mediator.register('booking', this);
    }
    
    bookCar(details) {
      console.log("Booking car with details:", details);
      this.mediator.notify('booking', 'bookingMade', details);
    }
  }
  
  // Example messaging component
  class MessagingComponent {
    constructor(mediator) {
      this.mediator = mediator;
      mediator.register('messaging', this);
    }
    
    displayNotification(message) {
      console.log("Notification:", message);
      // You could update the UI here to display notifications
    }
  }
  
  // Initialize components
  const bookingComp = new BookingComponent(mediator);
  const messagingComp = new MessagingComponent(mediator);
  
  // Example usage (you can trigger this from UI events)
  // bookingComp.bookCar({ carId: 1, user: 'John Doe' });
  