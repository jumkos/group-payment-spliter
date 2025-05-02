const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const itemsRouter = require('./routes/items');
app.use('/api/items', itemsRouter);

// Import the calculate route
const calculateRouter = require('./routes/calculate');

// Add the calculate route
app.use('/api/calculate', calculateRouter);

// Import the history route
const historyRouter = require('./routes/history');

// Add the history route
app.use('/api/history', historyRouter);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

// Basic route
app.get('/', (req, res) => {
  res.send('MEVN Stack App Backend');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});