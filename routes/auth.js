const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/knex');

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await db('users').where({ email }).first();

    if (user && user.password_hash) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
      // Convert guest to registered user
      await db('users')
        .where({ email })
        .update({
          password_hash: hashedPassword,
          role: 'registered',
          updated_at: new Date()
        });
    } else {
      // Create a new user
      await db('users').insert({
        email,
        password_hash: hashedPassword,
        role: 'registered'
      });
    }

    res.status(201).json({ message: 'Account created successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await db('users').where({ email }).first();

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

module.exports = router;
