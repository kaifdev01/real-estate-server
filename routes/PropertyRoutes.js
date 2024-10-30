const express = require('express');
const router = express.Router();
const Property = require('../models/property');
const { upload } = require('../config/CloudinaryConfig');
const jwt = require("jsonwebtoken")

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
router.put('/update/:id', authenticateToken, async (req, res) => {
    try {

        const updatedProperty = await Property.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedProperty);
    } catch (error) {
        console.error('Update Error:', error);
        res.status(500).json({ error: 'Failed to update property' });
    }
});
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await Property.findByIdAndDelete(req.params.id);
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete property' });
    }
});

module.exports = router;