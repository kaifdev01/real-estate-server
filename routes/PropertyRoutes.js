const express = require('express');
const router = express.Router();
const Property = require('../models/property');
const { upload } = require('../config/CloudinaryConfig');

// Add a new property
router.post('/add', upload.array('images'), async (req, res) => {
    try {
        const images = req.files.map(file => file.path);
        const { city, phase, plotNumber, price, description } = req.body;

        const newProperty = new Property({
            city,
            phase,
            plotNumber,
            price,
            description,
            images
        });

        const savedProperty = await newProperty.save();
        res.status(201).json(savedProperty);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add property' });
        console.log(error)
    }
});

// Get all properties
router.get('/', async (req, res) => {
    try {
        const { city, phase, plotNumber } = req.query;
        const query = {};

        if (city) query.city = { $regex: city, $options: 'i' };
        if (phase) query.phase = { $regex: phase, $options: 'i' };
        if (plotNumber) query.plotNumber = { $regex: plotNumber, $options: 'i' };

        const properties = await Property.find(query);
        res.json(properties);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
});

module.exports = router;