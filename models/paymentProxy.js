// models/paymentProxy.js
const db = require('../db/database');
const { notificationSubject } = require('./notificationSubject');

/**
 * PaymentProxy class implements the Proxy Pattern for payment processing
 * It acts as a surrogate for a real payment system, handling secure communication
 * and transactions between the application and the payment system.
 */
class PaymentProxy {
  /**
   * Process a payment from a renter to a car owner
   * @param {number} renterId - The ID of the renter making the payment
   * @param {number} ownerId - The ID of the car owner receiving the payment
   * @param {number} amount - The amount to be paid
   * @param {string} bookingId - The ID of the booking associated with this payment
   * @param {string} carDetails - Details about the car being rented
   * @returns {Promise<Object>} - Result of the payment processing
   */
  processPayment(renterId, ownerId, amount, bookingId, carDetails) {
    return new Promise((resolve, reject) => {
      // Check if renter has sufficient balance
      db.get('SELECT balance FROM users WHERE id = ?', [renterId], (err, renter) => {
        if (err) {
          console.error('Error checking renter balance:', err);
          return reject({ success: false, message: 'Error processing payment' });
        }

        if (!renter || renter.balance < amount) {
          return reject({ success: false, message: 'Insufficient balance' });
        }

        // Begin transaction
        db.run('BEGIN TRANSACTION', (err) => {
          if (err) {
            console.error('Error beginning transaction:', err);
            return reject({ success: false, message: 'Error processing payment' });
          }

          // Deduct amount from renter
          db.run('UPDATE users SET balance = balance - ? WHERE id = ?', 
            [amount, renterId], 
            function(err) {
              if (err) {
                console.error('Error deducting from renter:', err);
                return db.run('ROLLBACK', () => {
                  reject({ success: false, message: 'Error processing payment' });
                });
              }

              // Add amount to owner
              db.run('UPDATE users SET balance = balance + ? WHERE id = ?', 
                [amount, ownerId], 
                function(err) {
                  if (err) {
                    console.error('Error adding to owner:', err);
                    return db.run('ROLLBACK', () => {
                      reject({ success: false, message: 'Error processing payment' });
                    });
                  }

                  // Record the transaction
                  db.run(
                    `INSERT INTO transactions (renterId, ownerId, amount, bookingId, createdAt)
                     VALUES (?, ?, ?, ?, datetime('now'))`,
                    [renterId, ownerId, amount, bookingId],
                    function(err) {
                      if (err) {
                        console.error('Error recording transaction:', err);
                        return db.run('ROLLBACK', () => {
                          reject({ success: false, message: 'Error processing payment' });
                        });
                      }

                      // Commit transaction
                      db.run('COMMIT', (err) => {
                        if (err) {
                          console.error('Error committing transaction:', err);
                          return db.run('ROLLBACK', () => {
                            reject({ success: false, message: 'Error processing payment' });
                          });
                        }

                        // Send notifications
                        this.sendPaymentNotifications(renterId, ownerId, amount, carDetails);

                        resolve({ 
                          success: true, 
                          message: 'Payment processed successfully',
                          transactionId: this.lastID
                        });
                      }.bind(this));
                    }.bind(this)
                  );
                }
              );
            }
          );
        });
      });
    });
  }

  /**
   * Send notifications to both renter and owner about the payment
   * @param {number} renterId - The ID of the renter
   * @param {number} ownerId - The ID of the owner
   * @param {number} amount - The amount paid
   * @param {string} carDetails - Details about the car
   */
  sendPaymentNotifications(renterId, ownerId, amount, carDetails) {
    // Get user details for notifications
    db.all('SELECT id, email, fullName FROM users WHERE id IN (?, ?)', 
      [renterId, ownerId], 
      (err, users) => {
        if (err) {
          console.error('Error getting user details for notifications:', err);
          return;
        }

        const renter = users.find(u => u.id === renterId);
        const owner = users.find(u => u.id === ownerId);

        if (!renter || !owner) {
          console.error('Could not find user details for notifications');
          return;
        }

        // Notify renter
        notificationSubject.notifyObservers(renterId, {
          type: 'payment_sent',
          message: `You have paid $${amount.toFixed(2)} for ${carDetails}`,
          link: '/bookings'
        });

        // Notify owner
        notificationSubject.notifyObservers(ownerId, {
          type: 'payment_received',
          message: `You have received $${amount.toFixed(2)} for ${carDetails} from ${renter.fullName}`,
          link: '/bookings'
        });
      }
    );
  }
}

// Export a singleton instance
const paymentProxy = new PaymentProxy();
module.exports = { paymentProxy };
