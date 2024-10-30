const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    city: { type: String, required: true },
    phase: { type: String, required: true },
    plotNumber: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    images: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Property', propertySchema);