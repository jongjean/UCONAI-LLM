require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db.js'); // Database connection

const app = express();
const PORT = process.env.PORT || 4040;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files for uploaded images (served under /api for Caddy proxying)
app.use('/api/uploads', express.static('/home/ucon/esg_data/uploads'));

// Serve Frontend Files (Volatile Deployment Folder)
app.use(express.static('/var/www/esg'));

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'ESG API Server is running', port: PORT });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/partners', require('./routes/partners'));
app.use('/api/government', require('./routes/government'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/events', require('./routes/events'));

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 ESG Server running on port ${PORT}`);
});
