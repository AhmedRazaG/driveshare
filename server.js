// server.js
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

// Middleware Setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Set EJS as templating engine.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import routes.
const authRoutes = require('./routes/auth');
const carListingRoutes = require('./routes/carListing');
const bookingRoutes = require('./routes/booking');
const messagingRoutes = require('./routes/messaging');

// Use the routes.
app.use('/auth', authRoutes);
app.use('/car', carListingRoutes);
app.use('/booking', bookingRoutes);
app.use('/messaging', messagingRoutes);

// Basic pages.
app.get('/', (req, res) => { res.render('index'); });
app.get('/dashboard', (req, res) => { res.render('dashboard'); });

// Start the server.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Server started on port ${PORT}`); });
