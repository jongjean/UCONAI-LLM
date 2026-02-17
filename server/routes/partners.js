const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/partners
router.get('/', (req, res) => {
    const query = 'SELECT * FROM partners ORDER BY display_order ASC';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(rows);
        }
    });
});

// GET /api/partners/:id
router.get('/:id', (req, res) => {
    const query = 'SELECT * FROM partners WHERE id = ?';
    db.get(query, [req.params.id], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Database error' });
        } else if (!row) {
            res.status(404).json({ error: 'Partner not found' });
        } else {
            res.json(row);
        }
    });
});

// POST /api/partners
router.post('/', (req, res) => {
    const { name, logo_url, website_url, category, display_order } = req.body;
    const query = 'INSERT INTO partners (name, logo_url, website_url, category, display_order) VALUES (?, ?, ?, ?, ?)';
    db.run(query, [name, logo_url, website_url, category, display_order || 0], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.status(201).json({ id: this.lastID, message: 'Partner added successfully' });
        }
    });
});

// PUT /api/partners/:id
router.put('/:id', (req, res) => {
    const { name, logo_url, website_url, category, display_order } = req.body;
    const query = 'UPDATE partners SET name = ?, logo_url = ?, website_url = ?, category = ?, display_order = ? WHERE id = ?';
    db.run(query, [name, logo_url, website_url, category, display_order, req.params.id], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Database error' });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Partner not found' });
        } else {
            res.json({ message: 'Partner updated successfully' });
        }
    });
});

// DELETE /api/partners/:id
router.delete('/:id', (req, res) => {
    const query = 'DELETE FROM partners WHERE id = ?';
    db.run(query, [req.params.id], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Database error' });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Partner not found' });
        } else {
            res.json({ message: 'Partner deleted successfully' });
        }
    });
});

module.exports = router;
