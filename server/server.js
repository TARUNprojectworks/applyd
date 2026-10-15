// Entry point of the backend: sets up Express, middleware, routes and the DB connection
require('dotenv').config(); // loads MONGO_URI, JWT_SECRET, PORT from .env into process.env
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

const app = express();

// CORS lets the React app (different origin/port) call this API.
// If CLIENT_URL is set we only allow that origin, otherwise allow all (local dev).
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));

// Parses JSON request bodies into req.body
app.use(express.json());

// Simple health check route
app.get('/', (req, res) => {
  res.json({ message: 'Applyd API is running' });
});

// Mount route groups
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);

// Any route not matched above
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Central error handler: catches errors passed with next(err)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start listening for requests
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
