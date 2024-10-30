const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const router = express.Router();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    service: 'Gmail',
    auth: {
        user: "kaifm9096@gmail.com",
        pass: "mazswritugtyypdl"
    }
});



router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to register' });
        console.log(error)
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({ id: user._id }, "789kaif", { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to login' });
        console.log(error)
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Generate OTP and set expiry time
        const otp = crypto.randomInt(100000, 999999).toString();
        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10-minute expiry
        await user.save();

        // Send OTP email
        await transporter.sendMail({
            from: "kaifm9096@gmail.com",
            to: user.email,
            subject: 'Your OTP for Password Reset',
            text: `Your OTP is: ${otp}`
        });

        res.json({ message: 'OTP sent to email' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send OTP' });
        console.log(error)
    }
});


router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Update password and clear OTP
        user.password = await bcrypt.hash(newPassword, 10);
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset password' });

    }
});

module.exports = router; 