const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/knex');

router.post('/register', async (req, res) => {
  const { name, email, phone_number, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const [user] = await db('users').insert({
      name,
      email,
      phone_number,
      password_hash: hashedPassword,
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await db('users').where({ email }).first();

  if (user && await bcrypt.compare(password, user.password_hash)) {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } else {
    res.status(400).json({ error: 'Invalid credentials' });
  }
});

module.exports = router;
