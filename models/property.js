const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    city: { type: String, required: true },
    phase: { type: String, required: true },
    plotNumber: { type: String, required: true },
    price: { type: Number, required: true },
    propertyType: {
        type: String,
        enum: ['Commercial', 'Residential'], // Allows only "Commercial" or "Residential"
        required: true,
        default: 'Residential'
    },
    description: { type: String, required: true, },
    images: { type: [String], default: [], required: true },
    number: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Property', propertySchema);
