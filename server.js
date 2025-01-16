const express = require('express');
const cors = require('cors');
const app = express();

const authRoutes = require('./routes/auth');
const deliveryRoutes = require('./routes/deliveries');
const areaRoutes = require('./routes/areas');
const dashboardRoutes = require('./routes/dashboard');

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/deliveries', deliveryRoutes); 
app.use('/api/areas', areaRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

