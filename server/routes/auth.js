const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'esg_secret_key_default';

// ==================================================
// 이메일 중복 확인
// ==================================================
router.get('/check-email/:email', (req, res) => {
    const { email } = req.params;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    db.get(`SELECT id FROM members WHERE email = ?`, [email], (err, user) => {
        if (err) {
            console.error('DB Error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (user) {
            return res.status(409).json({ error: 'Email already exists', available: false });
        }

        res.json({ message: 'Email is available', available: true });
    });
});

// ==================================================
// 회원가입 (REGISTER)
// ==================================================
router.post('/register', async (req, res) => {
    const {
        email, password, name, name_en,
        phone, mobile,
        affiliation, affiliation_en, department, position,
        education_level, major_field, research_interests,
        member_type,
        postal_code, address, address_detail,
        website, bio
    } = req.body;

    // 필수 필드 검증
    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Missing required fields: email, password, name' });
    }

    // 이메일 중복 체크
    db.get(`SELECT id FROM members WHERE email = ?`, [email], async (err, existing) => {
        if (err) {
            console.error('DB Error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (existing) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        // 비밀번호 해시화
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = 'user'; // 기본 역할
        const memberStatus = 'pending'; // 승인 대기

        // members 테이블에 삽입 (확장된 필드)
        const query = `INSERT INTO members (
            user_id, email, password, name, name_en, role,
            phone, mobile,
            affiliation, affiliation_en, department, position,
            education_level, major_field, research_interests,
            member_type, member_status,
            postal_code, address, address_detail,
            website, bio
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.run(query, [
            email, email, hashedPassword, name, name_en || null, userRole,
            phone || null, mobile || null,
            affiliation || null, affiliation_en || null, department || null, position || null,
            education_level || null, major_field || null, research_interests || null,
            member_type || 'general', memberStatus,
            postal_code || null, address || null, address_detail || null,
            website || null, bio || null
        ], function (err) {
            if (err) {
                console.error('Insert Error:', err.message);
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ error: 'Email already exists' });
                }
                return res.status(500).json({ error: 'Database error during registration' });
            }

            console.log(`✅ New user registered: ${email} (ID: ${this.lastID})`);

            res.status(201).json({
                success: true,
                message: 'User registered successfully. Your membership is pending approval.',
                userId: this.lastID,
                user: {
                    id: this.lastID,
                    email,
                    name,
                    role: userRole
                }
            });
        });
    });
});

// ==================================================
// 로그인 (LOGIN)
// ==================================================
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get(`SELECT * FROM members WHERE email = ? OR user_id = ?`, [email, email], async (err, user) => {
        if (err) {
            console.error('DB Error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 비밀번호 확인
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // JWT 토큰 생성
        const token = jwt.sign(
            {
                id: user.id,
                user_id: user.user_id,
                email: user.email,
                role: user.role,
                name: user.name
            },
            JWT_SECRET,
            { expiresIn: '7d' } // 7일간 유효
        );

        console.log(`✅ User logged in: ${user.email}`);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                user_id: user.user_id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    });
});

// ==================================================
// 토큰 검증 및 사용자 정보 조회 (GET ME)
// ==================================================
router.get('/me', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Invalid token format' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        // DB에서 최신 사용자 정보 조회
        db.get(`SELECT id, user_id, email, name, role, created_at FROM members WHERE id = ?`, [decoded.id], (err, user) => {
            if (err) {
                console.error('DB Error:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                success: true,
                user: {
                    id: user.id,
                    user_id: user.user_id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    created_at: user.created_at
                }
            });
        });
    });
});

// ==================================================
// 비밀번호 변경
// ==================================================
router.post('/change-password', (req, res) => {
    const authHeader = req.headers.authorization;
    const { oldPassword, newPassword } = req.body;

    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Old password and new password are required' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }

        // 사용자 조회
        db.get(`SELECT * FROM members WHERE id = ?`, [decoded.id], async (err, user) => {
            if (err || !user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // 기존 비밀번호 확인
            const isValidPassword = await bcrypt.compare(oldPassword, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            // 새 비밀번호 해시화
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            // 비밀번호 업데이트
            db.run(`UPDATE members SET password = ? WHERE id = ?`, [hashedNewPassword, user.id], function (err) {
                if (err) {
                    console.error('Password update error:', err);
                    return res.status(500).json({ error: 'Failed to update password' });
                }

                console.log(`✅ Password changed for user: ${user.email}`);
                res.json({ success: true, message: 'Password changed successfully' });
            });
        });
    });
});

module.exports = router;
