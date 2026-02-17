const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/government
router.get('/', (req, res) => {
    const query = 'SELECT * FROM government ORDER BY display_order ASC';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(rows);
        }
    });
});

// GET /api/government/:id
router.get('/:id', (req, res) => {
    const query = 'SELECT * FROM government WHERE id = ?';
    db.get(query, [req.params.id], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Database error' });
        } else if (!row) {
            res.status(404).json({ error: 'Agency not found' });
        } else {
            res.json(row);
        }
    });
});

// POST /api/government
router.post('/', (req, res) => {
    const { name, logo_url, website_url, display_order } = req.body;
    const query = 'INSERT INTO government (name, logo_url, website_url, display_order) VALUES (?, ?, ?, ?)';
    db.run(query, [name, logo_url, website_url, display_order || 0], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.status(201).json({ id: this.lastID, message: 'Agency added successfully' });
        }
    });
});

// PUT /api/government/:id
router.put('/:id', (req, res) => {
    const { name, logo_url, website_url, display_order } = req.body;
    const query = 'UPDATE government SET name = ?, logo_url = ?, website_url = ?, display_order = ? WHERE id = ?';
    db.run(query, [name, logo_url, website_url, display_order, req.params.id], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Database error' });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Agency not found' });
        } else {
            res.json({ message: 'Agency updated successfully' });
        }
    });
});

// DELETE /api/government/:id
router.delete('/:id', (req, res) => {
    const query = 'DELETE FROM government WHERE id = ?';
    db.run(query, [req.params.id], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Database error' });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Agency not found' });
        } else {
            res.json({ message: 'Agency deleted successfully' });
        }
    });
});

module.exports = router;
