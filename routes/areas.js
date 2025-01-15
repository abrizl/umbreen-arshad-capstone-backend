const express = require('express');
const router = express.Router();
const db = require('../db/knex');

router.get('/cities', async (req, res) => {
    try {
        const cities = await db('cities').select('*');
        res.json(cities);
      } catch (err) {
        res.status(500).json({ error: 'Error fetching cities' });
      }
});

// Fetch areas by city ID
router.get('/:cityId/areas', async (req, res) => {
    const { cityId } = req.params;

    try {
        const areas = await db('areas')
            .where({ city_id: cityId })
            .select('*');

        res.json(areas);
    } catch (err) {
        console.error('Error fetching areas:', err);
        res.status(500).json({ error: 'Error fetching areas' });
    }
});

module.exports = router;