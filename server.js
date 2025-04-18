//server.js
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

// Use body-parser middleware for parsing form data.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Set up sessions (this stores session data in memory; for production, consider a persistent store)
app.use(session({
  secret: 'your secret key here',
  resave: false,
  saveUninitialized: true
}));

// Set EJS as the templating engine.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to add notification count to all views
app.use((req, res, next) => {
  if (req.session.user) {
    const db = require('./db/database');
    const sql = "SELECT COUNT(*) as count FROM notifications WHERE uid = ?";
    db.get(sql, [req.session.user.id], (err, row) => {
      if (err) {
        console.error("Error getting notification count:", err.message);
        res.locals.notificationCount = 0;
      } else {
        res.locals.notificationCount = row ? row.count : 0;
      }
      next();
    });
  } else {
    res.locals.notificationCount = 0;
    next();
  }
});

// Import route files.
const authRoutes = require('./routes/auth');
const carListingRoutes = require('./routes/carListing');
const bookingRoutes = require('./routes/booking');
const messagingRoutes = require('./routes/messaging');
const paymentRoutes = require('./routes/payment');
const passwordRecoveryRoutes = require('./routes/passwordRecovery');
const notificationsRoutes = require('./routes/notifications');

// Use the routes.
app.use('/auth', authRoutes);
app.use('/car', carListingRoutes);
app.use('/booking', bookingRoutes);
app.use('/messaging', messagingRoutes);
app.use('/payment', paymentRoutes);
app.use('/password', passwordRecoveryRoutes);
app.use('/notifications', notificationsRoutes);

// Dashboard route: show personalized content.
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  res.render('dashboard', { user: req.session.user });
});

// Default route.
app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { 
  console.log(`Server started on port ${PORT}`);
});
