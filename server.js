// server.js
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

<<<<<<< Updated upstream
// Middleware
=======
// Middleware Setup
>>>>>>> Stashed changes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import authentication routes (and other routes later)
const authRoutes = require('./routes/auth');

// Use routes (other route modules will be added later)
app.use('/auth', authRoutes);

// Render the homepage and dashboard
app.get('/', (req, res) => {
  res.render('index');
});
app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
