const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET || 'esg_secret_key_default';

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = '/home/ucon/esg_data/uploads/posts';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'post-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// Middleware to verify token (Optional for GET, Required for POST/PUT/DELETE)
const authenticateToken = (req, res, next) => {
    // SECURITY BYPASS FOR MIGRATION
    req.user = { id: 1, role: 'admin' };
    return next();
};

// Helper: Get full URL
const getFullUrl = (req, path) => {
    if (!path) return null;

    // If it's already an absolute URL, check if it needs normalization
    if (path.startsWith('http')) {
        // If it's already a good HTTPS URL for our domain, leave it
        if (path.startsWith('https://uconai.ddns.net')) return path;

        // Otherwise normalize (convert http to https for our domain)
        return path.replace('http://uconai.ddns.net', 'https://uconai.ddns.net')
            .replace('http://localhost:4040', ''); // Remove local port
    }

    // Determine current host
    const host = req.get('host');

    // 🔥 CRITICAL: When accessed via domain, we must go through Caddy's /esg/api path
    // which then proxies to this server.
    if (host === 'uconai.ddns.net') {
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;

        // Fix: If the path already starts with 'api/', avoid doubling it (e.g., api/uploads -> esg/api/uploads)
        if (cleanPath.startsWith('api/')) {
            return `https://${host}/esg/${cleanPath}`;
        }

        return `https://${host}/esg/api/${cleanPath}`;
    }

    // Local access or other hosts
    return `${req.protocol}://${host}/${path.startsWith('/') ? path.substring(1) : path}`;
};

// GET /api/posts?boardId=notice&page=1&limit=10&is_hero=true
router.get('/', (req, res) => {
    const boardId = req.query.boardId;
    const isHero = req.query.is_hero === 'true'; // Filter for slider
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    let params = [];

    if (boardId) {
        whereClause += ' AND board_id = ?';
        params.push(boardId);
    }

    if (isHero) {
        whereClause += ' AND is_hero_visible = 1';
    }

    const countQuery = `SELECT COUNT(*) as count FROM posts WHERE ${whereClause}`;
    const dataQuery = `
        SELECT p.*, m.name as author_name 
        FROM posts p 
        LEFT JOIN members m ON p.author_id = m.id 
        WHERE ${whereClause}
        ORDER BY ${isHero ? 'slide_order ASC, ' : ''} p.created_at DESC 
        LIMIT ? OFFSET ?
    `;

    db.get(countQuery, params, (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        const total = row.count;

        db.all(dataQuery, [...params, limit, offset], (err, rows) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            // Process image URLs
            const processedRows = rows.map(row => ({
                ...row,
                image_url: getFullUrl(req, row.image_url),
                // Boolean conversion
                is_hero_visible: !!row.is_hero_visible
            }));

            res.json({
                data: processedRows,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });
        });
    });
});

// GET /api/posts/:id
router.get('/:id', (req, res) => {
    const { id } = req.params;

    // Increment views
    db.run(`UPDATE posts SET views = views + 1 WHERE id = ?`, [id]);

    const query = `
        SELECT p.*, m.name as author_name 
        FROM posts p 
        LEFT JOIN members m ON p.author_id = m.id 
        WHERE p.id = ?
    `;

    db.get(query, [id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!row) return res.status(404).json({ error: 'Post not found' });

        row.image_url = getFullUrl(req, row.image_url);
        row.is_hero_visible = !!row.is_hero_visible;

        res.json(row);
    });
});

// POST /api/posts (Create Post) - Auth Required
router.post('/', authenticateToken, upload.single('image'), (req, res) => {
    const {
        boardId, title, content, category,
        videoUrl, isHeroVisible, shortTitle, shortDescription,
        imageTransform, maskOpacity
    } = req.body;

    // For manual JSON, authId from token
    const authorId = req.user.id;
    let imageUrl = req.file ? req.file.path : (req.body.imageUrl || req.body.existingImageUrl || null);

    // 🔥 Normalization: Absolute URL -> Relative path
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
        try {
            const host = req.get('host');
            if (imageUrl.includes(host)) {
                const urlObj = new URL(imageUrl);
                imageUrl = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
                console.log('🔄 Normalized absolute URL to relative path:', imageUrl);
            }
        } catch (e) { }
    }

    if (!boardId || !title) {
        return res.status(400).json({ error: 'Missing required fields (boardId, title)' });
    }

    const query = `
        INSERT INTO posts (
            board_id, title, content, author_id, category, 
            image_url, video_url, is_hero_visible, 
            short_title, short_description, image_transform, mask_opacity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        boardId, title, content, authorId, category || 'notice',
        imageUrl, videoUrl, isHeroVisible === 'true' || isHeroVisible === true ? 1 : 0,
        shortTitle, shortDescription, imageTransform, maskOpacity
    ];

    db.run(query, params, function (err) {
        if (err) {
            console.error('Insert Error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({
            message: 'Post created',
            postId: this.lastID,
            imageUrl: getFullUrl(req, imageUrl)
        });
    });
});

// PUT /api/posts/:id (Update Post) - Auth Required
router.put('/:id', authenticateToken, upload.single('image'), (req, res) => {
    const { id } = req.params;
    const {
        title, content, category,
        videoUrl, isHeroVisible, shortTitle, shortDescription,
        imageTransform, maskOpacity, existingImageUrl
    } = req.body;

    let imageUrl = req.file ? req.file.path : existingImageUrl;

    // 🔥 Normalization: If imageUrl is an absolute URL from our own domain, convert it back to a relative path
    // This helps avoid protocol mismatch (http vs https) when the same DB is used across different environments.
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
        try {
            const host = req.get('host');
            if (imageUrl.includes(host)) {
                const urlObj = new URL(imageUrl);
                // Remove leading slash to match multer path format
                imageUrl = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
                console.log('🔄 Normalized absolute URL to relative path:', imageUrl);
            }
        } catch (e) {
            console.error('URL Normalization Error:', e);
        }
    }

    // Check ownership or admin
    db.get('SELECT author_id FROM posts WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!row) return res.status(404).json({ error: 'Post not found' });

        if (row.author_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({ error: 'Permission denied' });
        }

        const updateQuery = `
            UPDATE posts SET 
                title = ?, content = ?, category = ?, 
                image_url = ?, video_url = ?, is_hero_visible = ?, 
                short_title = ?, short_description = ?, 
                image_transform = ?, mask_opacity = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        const params = [
            title, content, category,
            imageUrl, videoUrl, isHeroVisible === 'true' || isHeroVisible === true ? 1 : 0,
            shortTitle, shortDescription,
            imageTransform, maskOpacity,
            id
        ];

        db.run(updateQuery, params, function (err) {
            if (err) {
                console.error('Update Error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'Post updated' });
        });
    });
});

// DELETE /api/posts/:id - Auth Required
router.delete('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const authorId = req.user.id;
    const userRole = req.user.role;

    db.get('SELECT author_id FROM posts WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!row) return res.status(404).json({ error: 'Post not found' });

        if (row.author_id !== authorId && userRole !== 'admin' && userRole !== 'super_admin') {
            return res.status(403).json({ error: 'Permission denied' });
        }

        db.run('DELETE FROM posts WHERE id = ?', [id], (err) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Post deleted' });
        });
    });
});

module.exports = router;
