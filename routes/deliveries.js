const express = require('express');
const router = express.Router();
const db = require('../db/knex');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT (optional for guests)
function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  
  if (!token) {
    req.user = null;  // No token = guest user
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;  // Invalid token = treat as guest
    } else {
      req.user = user;  // Valid token = logged-in user
    }
    next();
  });
}

// Schedule a delivery (for logged-in and guest users)
router.post('/', authenticateToken, async (req, res) => {
  const { area_id, delivery_slot, scheduled_date, name, email, phone_number } = req.body;

  try {
    let userId = req.user ? req.user.id : null;

    // If user is not logged in, store guest info in the users table
    if (!userId) {
      if (!name || !email || !phone_number) {
        return res.status(400).json({ error: 'Guest users must provide name, email, and phone number' });
      }

      const [guestId] = await db('users').insert({
        name,
        email,
        phone_number,
        password_hash: ''  // No password for guest users
      });

      userId = guestId;
    }

    // Insert delivery request
    await db('deliveries').insert({
      user_id: userId,
      area_id,
      delivery_slot,
      scheduled_date,
      status: 'Pending'
    });

    res.status(201).json({ message: 'Delivery scheduled successfully' });
  } catch (err) {
    console.error('Error scheduling delivery:', err);
    res.status(500).json({ error: 'Error scheduling delivery' });
  }
});

// Get delivery history (only for logged-in users)
router.get('/', authenticateToken, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Login required to view deliveries' });
  }

  try {
    const deliveries = await db('deliveries')
      .where({ user_id: req.user.id })
      .join('areas', 'deliveries.area_id', 'areas.id')
      .select('deliveries.*', 'areas.name as area_name');

    res.json(deliveries);
  } catch (err) {
    console.error('Error fetching deliveries:', err);
    res.status(500).json({ error: 'Error fetching deliveries' });
  }
});

module.exports = router;
