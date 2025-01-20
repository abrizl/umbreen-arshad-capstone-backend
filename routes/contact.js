const express = require('express');
const router = express.Router();
const db = require('../db/knex'); // Adjust according to your database setup

// POST route to handle contact form submission
router.post('/contact-us', async (req, res) => {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    try {
        // Save the contact message to the database
        await db('contact_messages').insert({
            name,
            email,
            phone: phone || null, // Optional
            message,
            created_at: new Date()
        });

        res.status(201).json({ message: 'Your message has been received!' });
    } catch (error) {
        console.error('Error saving contact message:', error);
        res.status(500).json({ error: 'Failed to save your message. Please try again later.' });
    }
});

module.exports = router;
