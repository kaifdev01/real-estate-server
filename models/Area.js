const mongoose = require('mongoose');
const AreaSchema = new mongoose.Schema({
    name: { type: String, required: true },
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true }
});

module.exports = mongoose.model('Area', AreaSchema);