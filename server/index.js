//connect frontend and database
require('dotenv').config();
const express = require('express');
const cors=require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use (cors())
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Mongo connected'))
  .catch(console.error);

app.listen(process.env.PORT || 5000, () =>
  console.log(`API on ${process.env.PORT || 5000}`)
);
