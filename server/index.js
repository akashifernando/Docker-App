//connect frontend and database
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');

const app = express();
app.use(express.json());
app.use(cors()); // Allow all origins for debugging

console.log('Connecting to MongoDB at:', process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Mongo connected'))
  .catch((err) => console.error('Mongo connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(process.env.PORT || 5000, () =>
  console.log(`API on ${process.env.PORT || 5000}`)
);
