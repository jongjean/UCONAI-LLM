const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const dbPath = '/home/ucon/esg_data/db/esg.db';
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('✅ Connected to SQLite database:', dbPath);
        initTables();
    }
});

// Initialize Tables
function initTables() {
    db.serialize(() => {
        // 1. Members Table (확장된 버전)
        db.run(`CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            name_en TEXT,
            role TEXT DEFAULT 'user',
            
            -- 연락처 정보
            phone TEXT,
            mobile TEXT,
            
            -- 소속 정보
            affiliation TEXT,
            affiliation_en TEXT,
            department TEXT,
            position TEXT,
            
            -- 학술 정보
            education_level TEXT,
            major_field TEXT,
            research_interests TEXT,
            
            -- 회원 정보
            member_type TEXT DEFAULT 'general',
            member_status TEXT DEFAULT 'pending',
            join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            approval_date DATETIME,
            
            -- 주소 정보
            postal_code TEXT,
            address TEXT,
            address_detail TEXT,
            
            -- 기타
            website TEXT,
            profile_image TEXT,
            bio TEXT,
            
            -- 시스템 정보
            last_login DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 2. Partners Table
        db.run(`CREATE TABLE IF NOT EXISTS partners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            logo_url TEXT,
            website_url TEXT,
            category TEXT,
            display_order INTEGER DEFAULT 0
        )`);

        // 3. Government/Related Org Table
        db.run(`CREATE TABLE IF NOT EXISTS government (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            logo_url TEXT,
            website_url TEXT,
            display_order INTEGER DEFAULT 0
        )`);

        // 4. Boards (Meta info)
        db.run(`CREATE TABLE IF NOT EXISTS boards (
            id TEXT PRIMARY KEY,
            name TEXT,
            type TEXT DEFAULT 'list'
        )`);

        // 5. Posts (Enhanced for Board Manager & Slider)
        db.run(`CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            board_id TEXT,
            title TEXT,
            content TEXT,
            author_id INTEGER,
            views INTEGER DEFAULT 0,
            
            -- 게시판/슬라이드 확장 필드
            category TEXT DEFAULT 'notice',
            image_url TEXT,
            video_url TEXT,
            
            -- 메인 슬라이드 설정
            is_hero_visible INTEGER DEFAULT 0, -- 0: false, 1: true
            short_title TEXT,
            short_description TEXT,
            slide_order INTEGER DEFAULT 999,
            
            -- 이미지 편집 설정
            image_transform TEXT, -- JSON string
            mask_opacity INTEGER DEFAULT 40,
            
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            
            FOREIGN KEY(board_id) REFERENCES boards(id),
            FOREIGN KEY(author_id) REFERENCES members(id)
        )`, (err) => {
            if (!err) {
                // 기존 테이블에 컬럼이 없을 경우 추가 (Migration)
                const columnsToAdd = [
                    { name: 'category', type: 'TEXT DEFAULT "notice"' },
                    { name: 'image_url', type: 'TEXT' },
                    { name: 'video_url', type: 'TEXT' },
                    { name: 'is_hero_visible', type: 'INTEGER DEFAULT 0' },
                    { name: 'short_title', type: 'TEXT' },
                    { name: 'short_description', type: 'TEXT' },
                    { name: 'slide_order', type: 'INTEGER DEFAULT 999' },
                    { name: 'image_transform', type: 'TEXT' },
                    { name: 'mask_opacity', type: 'INTEGER DEFAULT 40' },
                    { name: 'updated_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
                ];

                columnsToAdd.forEach(col => {
                    db.run(`ALTER TABLE posts ADD COLUMN ${col.name} ${col.type}`, (err) => {
                        // 컬럼이 이미 존재하면 에러가 발생하므로 무시
                    });
                });
            }
        });

        // 6. Comments
        db.run(`CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER,
            author_id INTEGER,
            content TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(post_id) REFERENCES posts(id),
            FOREIGN KEY(author_id) REFERENCES members(id)
        )`);

        console.log('✅ Tables initialized successfully');
    });
}

module.exports = db;
