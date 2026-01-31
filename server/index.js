// connect frontend and database
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dbURI = process.env.MONGO_URI || "mongodb://localhost:27017/taskdb";

console.log('Connecting to MongoDB at:', dbURI);

const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');

const app = express();
app.use(express.json());
app.use(cors()); // Allow all origins for debugging

// Connect to MongoDB
mongoose
  .connect(dbURI)
  .then(() => console.log('Mongo connected'))
  .catch((err) => console.error('Mongo connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// --- FIXED LISTEN ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API running on port ${PORT} and accessible publicly`);
});
