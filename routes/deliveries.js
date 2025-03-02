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
  const { area_id, delivery_slot, scheduled_dates, name, email, phone_number, address, quantity } = req.body;

  // Validation for required fields
  if (!area_id || !delivery_slot || !scheduled_dates || !name || !email || !phone_number || !address || !quantity) {
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
          status: 'Pending',
          quantity
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

// Get all deliveries
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: No user ID found' });
    }

    const deliveries = await db('deliveries')
      .where({ user_id: req.user.id })
      .orderBy('scheduled_date', 'asc');

    res.status(200).json(deliveries);
  } catch (err) {
    console.error('Error fetching deliveries:', err);
    res.status(500).json({ error: 'Error fetching deliveries' });
  }
});

// Get delivery by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const delivery = await db('deliveries').where({ id }).first();

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    res.status(200).json(delivery);
  } catch (err) {
    console.error('Error fetching delivery:', err);
    res.status(500).json({ error: 'Error fetching delivery' });
  }
});

// Update delivery by ID
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { address, delivery_slot, scheduled_dates, quantity } = req.body;

  // Validation
  if (!address || !delivery_slot || !scheduled_dates || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const delivery = await db('deliveries').where({ id }).first();

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    if (delivery.status !== 'Pending') {
      return res.status(400).json({ error: 'Only pending deliveries can be updated' });
    }

    // Update delivery
    await db('deliveries')
      .where({ id })
      .update({
        address,
        delivery_slot,
        scheduled_date: scheduled_dates[0], // Assuming single-date updates
        quantity,
        updated_at: db.fn.now()
      });

    res.status(200).json({ message: 'Delivery updated successfully' });

  } catch (err) {
    console.error('Error updating delivery:', err);
    res.status(500).json({ error: 'Error updating delivery' });
  }
});

// DELETE delivery by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const delivery = await db('deliveries').where({ id }).first();

      if (!delivery) {
          return res.status(404).json({ error: 'Delivery not found' });
      }

      if (delivery.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized to cancel this delivery' });
      }

      if (delivery.status !== 'Pending') {
          return res.status(400).json({ error: 'Only pending deliveries can be canceled' });
      }

      await db('deliveries').where({ id }).del();
      res.status(200).json({ message: 'Delivery canceled successfully' });
  } catch (err) {
      console.error('Error canceling delivery:', err);
      res.status(500).json({ error: 'Error canceling delivery' });
  }
});

module.exports = router;


