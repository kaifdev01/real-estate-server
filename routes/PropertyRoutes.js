const express = require('express');
const router = express.Router();
const Property = require('../models/property');
const { upload } = require('../config/CloudinaryConfig');
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, "789kaif", (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Add a new property
router.post('/add', authenticateToken, upload.array('images'), async (req, res) => {
    try {
        const images = req.files.map(file => file.path);
        const { city, phase, plotNumber, price, description, propertyType, number } = req.body;

        const newProperty = new Property({
            city,
            phase,
            plotNumber,
            price,
            propertyType,
            description,
            number, // Include the phone number field
            images
        });

        const savedProperty = await newProperty.save();
        res.status(201).json(savedProperty);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add property' });
        console.log(error);
    }
});

// Get all properties with optional filters
router.get('/', async (req, res) => {
    try {
        const { city, phase, plotNumber, price, propertyType, number } = req.query;
        const query = {};

        if (city) query.city = { $regex: city, $options: 'i' };
        if (phase) query.phase = { $regex: phase, $options: 'i' };
        if (plotNumber) query.plotNumber = { $regex: plotNumber, $options: 'i' };
        if (price) query.price = { $lte: parseFloat(price) };
        if (propertyType) query.propertyType = propertyType; // Filter by propertyType
        if (number) query.number = { $regex: number, $options: 'i' }; // Filter by phone number

        const properties = await Property.find(query).sort({ price: -1 }); // Sort by price in descending order
        res.json(properties);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
});

// Get a property by ID
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ message: 'Property not found' });
        res.json(property);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch property details' });
    }
});

// Update a property by ID
router.put('/update/:id', authenticateToken, upload.array('images'), async (req, res) => {
    try {
        const updatedData = {
            city: req.body.city,
            phase: req.body.phase,
            plotNumber: req.body.plotNumber,
            price: req.body.price,
            description: req.body.description,
            propertyType: req.body.propertyType, // Update propertyType
            number: req.body.number // Update the phone number
        };

        // If new images are uploaded, add them to `updatedData`
        if (req.files && req.files.length > 0) {
            updatedData.images = req.files.map(file => file.path);
        }

        const updatedProperty = await Property.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true }
        );

        if (!updatedProperty) return res.status(404).json({ message: 'Property not found' });
        res.json(updatedProperty);
    } catch (error) {
        console.error('Update Error:', error);
        res.status(500).json({ error: 'Failed to update property' });
    }
});

// Delete a property by ID
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await Property.findByIdAndDelete(req.params.id);
        res.status(200).json("Property deleted successfully");
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete property' });
    }
});

module.exports = router;
