const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'esg_secret_key_default';

// Authentication Middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};
router.get('/my-stats', authenticate, (req, res) => {
    const userId = req.user.id;

    const stats = {
        total: 0,
        upcoming: 0,
        completed: 0,
        cancelled: 0,
        certificates: 0
    };

    // 총 참가 행사
    db.get('SELECT COUNT(*) as count FROM event_registrations WHERE user_id = ?',
        [userId], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.total = row.count;

            // 참석 완료
            db.get(`SELECT COUNT(*) as count FROM event_registrations
                    WHERE user_id = ? AND status = 'completed'`,
                [userId], (err2, row2) => {
                    if (err2) return res.status(500).json({ error: err2.message });
                    stats.completed = row2.count;

                    // 예정된 행사 (confirmed 상태)
                    db.get(`SELECT COUNT(*) as count FROM event_registrations
                            WHERE user_id = ? AND status = 'confirmed'`,
                        [userId], (err3, row3) => {
                            if (err3) return res.status(500).json({ error: err3.message });
                            stats.upcoming = row3.count;

                            // 취소된 행사
                            db.get(`SELECT COUNT(*) as count FROM event_registrations
                                    WHERE user_id = ? AND status = 'cancelled'`,
                                [userId], (err4, row4) => {
                                    if (err4) return res.status(500).json({ error: err4.message });
                                    stats.cancelled = row4.count;
                                    stats.certificates = stats.completed; // 수료증 = 완료된 행사

                                    res.json(stats);
                                });
                        });
                });
        });
});

// 사용자의 신청 내역
router.get('/my-registrations', authenticate, (req, res) => {
    const userId = req.user.id;

    db.all(`
        SELECT 
            r.id as registration_id,
            r.status,
            r.registration_date,
            r.attended,
            r.qr_code,
            p.id as post_id,
            p.title,
            p.content,
            p.short_description,
            p.image_url,
            p.created_at as event_date,
            p.category
        FROM event_registrations r
        JOIN posts p ON r.event_post_id = p.id
        WHERE r.user_id = ?
        ORDER BY p.created_at DESC
    `, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 다가오는 이벤트 목록 (로그인 안해도 볼 수 있음)
router.get('/upcoming', (req, res) => {
    db.all(`
        SELECT id, title, short_title, content, short_description, image_url, created_at, category
        FROM posts
        WHERE board_id = 'events'
        AND datetime(created_at) > datetime('now')
        ORDER BY created_at ASC
        LIMIT 10
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 신청하기
router.post('/register', authenticate, (req, res) => {
    const { event_post_id } = req.body;
    const userId = req.user.id;

    if (!event_post_id) {
        return res.status(400).json({ error: 'event_post_id is required' });
    }

    // 이미 신청했는지 확인
    db.get('SELECT id FROM event_registrations WHERE user_id = ? AND event_post_id = ?',
        [userId, event_post_id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });

            if (row) {
                return res.status(400).json({ error: '이미 신청한 행사입니다.' });
            }

            // 신청 등록
            db.run(`INSERT INTO event_registrations (user_id, event_post_id, status)
                    VALUES (?, ?, 'confirmed')`, [userId, event_post_id], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({
                    id: this.lastID,
                    message: '신청이 완료되었습니다.'
                });
            });
        });
});

// 취소하기
router.put('/:id/cancel', authenticate, (req, res) => {
    const regId = req.params.id;
    const userId = req.user.id;

    db.run(`UPDATE event_registrations 
            SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?`, [regId, userId], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        if (this.changes === 0) {
            return res.status(404).json({ error: '신청 내역을 찾을 수 없습니다.' });
        }

        res.json({ message: '신청이 취소되었습니다.' });
    });
});

module.exports = router;
