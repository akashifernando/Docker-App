//connect frontend and database
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/taskdb";

console.log('Connecting to MongoDB at:', dbURI);

mongoose
  .connect(dbURI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
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
