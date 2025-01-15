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

// Helper function to generate all dates in a range
function generateDateRange(startDate, endDate) {
  const dateArray = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    dateArray.push(new Date(currentDate).toISOString().split('T')[0]); // Format: YYYY-MM-DD
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateArray;
}

// Schedule a delivery (for logged-in and guest users)
router.post('/', authenticateToken, async (req, res) => {
  const { area_id, delivery_slot, scheduled_dates, name, email, phone_number, address } = req.body;

  // Validation for required fields
  if (!area_id || !delivery_slot || !scheduled_dates || !name || !email || !phone_number || !address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    let userId = req.user ? req.user.id : null;

    // Insert guest user if not logged in
    if (!userId) {
      let existingUser = await db('users').where({ email }).first();
    
      if (existingUser) {
        userId = existingUser.id;  // Use existing user ID
      } else {
        const [guestId] = await db('users').insert({
          name,
          email,
          phone_number,
          password_hash: '',  // No password for guest users
          role: 'guest'
        });
        userId = guestId;
      }
    }

    
    const [startDate, endDate] = scheduled_dates;
    const fullDateRange = generateDateRange(startDate, endDate);

    
    const deliveryPromises = fullDateRange.map(date =>
      delivery_slot.map(async (slot) => {
        
        if (!['Morning', 'Evening'].includes(slot)) {
          throw new Error(`Invalid delivery slot: ${slot}`);
        }

        await db('deliveries').insert({
          user_id: userId,
          area_id,
          delivery_slot: slot,      // One slot per row
          scheduled_date: date,     // One date per row
          address: address,
          status: 'Pending'
        });
      })
    );

    await Promise.all(deliveryPromises.flat());

    res.status(201).json({ message: 'Delivery scheduled successfully' });
  } catch (err) {
    console.error('Error scheduling delivery:', err);
    res.status(500).json({ error: 'Error scheduling delivery' });
  }
});

module.exports = router;


