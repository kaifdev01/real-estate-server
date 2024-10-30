const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const PropertyRoutes = require("./routes/PropertyRoutes")
const AuthRoutes = require('./routes/AuthRoutes');
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


mongoose
    .connect("mongodb+srv://admin:admin@cluster0.qergu.mongodb.net/")
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Basic Route
app.get('/', (req, res) => {
    res.send('Welcome to the Real Estate API');
});

app.use('/api/properties', PropertyRoutes);
app.use('/api/auth', AuthRoutes);


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
