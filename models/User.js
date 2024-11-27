const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String, required: false },
    otpExpiry: { type: Date, required: false },
    role: { type: String, required: true, enum: ['user', 'admin'], default: 'user' } // Add role field
});


module.exports = mongoose.model('User', userSchema);