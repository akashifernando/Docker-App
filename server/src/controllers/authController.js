const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Response = require('../utility/Response');

exports.register = async (req, res) => {
    const { username, password } = req.body; // Spring Boot UserRequest only has username/password
    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(200).json(Response.error(400, 'User already exists')); // Matches Spring Boot behavior often to return 200 with error code in body, but let's stick to status codes slightly. Actually, SB example returns ResponseEntity.ok(service...), so it might wrap errors. Let's make it robust.
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            password: hashedPassword,
            role: 'USER'
        });
        await user.save();

        const payload = { userId: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Return the response structure
        const responseData = {
            token,
            role: user.role,
            expirationTime: '1h' // Mocking standard expiration info if needed
        };

        res.json(Response.ok(responseData, "User registered successfully"));

    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json(Response.error(500, `Server error: ${err.message}`));
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt for:', username);
    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found');
            return res.status(200).json(Response.error(404, 'User not found'));
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);
        if (!isMatch) {
            return res.status(200).json(Response.error(400, 'Invalid credentials'));
        }

        const payload = { userId: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        const responseData = {
            token,
            role: user.role,
            expirationTime: '24h'
        };

        res.json(Response.ok(responseData, "Login successful"));
    } catch (err) {
        console.error(err.message);
        res.status(500).json(Response.error(500, 'Server error'));
    }
};
