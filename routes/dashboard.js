const express = require('express');
const router = express.Router();
const db = require('../db/knex');
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token.' });
        }

        req.user = user;
        next();
    });
}

// Get all deliveries for the logged-in user
router.get('/my-deliveries', authenticateToken, async (req, res) => {
    try {
        const deliveries = await db('deliveries').where({ user_id: req.user.id });
        res.status(200).json(deliveries);
    } catch (err) {
        console.error('Error fetching deliveries:', err);
        res.status(500).json({ error: 'Failed to fetch deliveries' });
    }
});

module.exports = router;
