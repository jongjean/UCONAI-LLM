const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'esg.db');
const db = new sqlite3.Database(dbPath);

const partners = [
    { name: '삼성전자', category: 'member', website_url: 'https://www.samsung.com/sec/' },
    { name: '현대자동차', category: 'member', website_url: 'https://www.hyundai.com/kr/ko/e' },
    { name: 'SK하이닉스', category: 'member', website_url: 'https://www.skhynix.com/' },
    { name: 'LG화학', category: 'member', website_url: 'https://www.lgchem.com/' },
    { name: 'POSCO홀딩스', category: 'member', website_url: 'https://www.posco-inc.com/' },
    { name: 'KB금융그룹', category: 'member', website_url: 'https://www.kbfg.com/' },
    { name: '신한금융지주', category: 'member', website_url: 'http://www.shinhangroup.com/' },
    { name: 'NAVER', category: 'member', website_url: 'https://www.navercorp.com/' },
    { name: '카카오', category: 'member', website_url: 'https://www.kakaocorp.com/' },
    { name: '한국전력공사', category: 'public', website_url: 'https://home.kepco.co.kr/' }
];

const government = [
    { name: '기획재정부', website_url: 'https://www.moef.go.kr/' },
    { name: '환경부', website_url: 'https://me.go.kr/' },
    { name: '산업통상자원부', website_url: 'https://www.motie.go.kr/' },
    { name: '금융위원회', website_url: 'https://www.fsc.go.kr/' },
    { name: '국민연금공단', website_url: 'https://www.nps.or.kr/' },
    { name: '한국거래소', website_url: 'http://www.krx.co.kr/' },
    { name: '한국ESG기준원', website_url: 'http://www.cgs.or.kr/' }
];

const members = [
    { id: 'admin', password: 'password123', name: '관리자', email: 'admin@esg.or.kr', role: 'admin' },
    { id: 'user1', password: 'password123', name: '홍길동', email: 'user1@example.com', role: 'user' }
];

const boards = [
    { id: 'notice', name: '공지사항', type: 'list' },
    { id: 'free', name: '자유게시판', type: 'list' }
];

const posts = [
    {
        board_id: 'notice',
        title: '2025년 제1회 ESG 전문가 과정 모집 안내',
        content: '<p>2025년 제1회 ESG 전문가 과정을 모집합니다.</p>',
        views: 1245, created_at: '2025-01-15 09:00:00'
    },
    {
        board_id: 'notice',
        title: '2025년 학술지 제1권 1호 논문 투고 마감 안내',
        content: '<p>논문 투고 마감이 임박했습니다.</p>',
        views: 892, created_at: '2025-01-10 14:30:00'
    },
    {
        board_id: 'notice',
        title: '제3회 월드ESG포럼 개최 안내 (2025.03.20)',
        content: '<p>많은 참여 바랍니다.</p>',
        views: 1567, created_at: '2025-01-08 11:20:00'
    },
    {
        board_id: 'notice',
        title: '2025년 정기총회 개최 안내',
        content: '<p>정기총회 일정을 안내드립니다.</p>',
        views: 734, created_at: '2025-01-05 10:00:00'
    },
    {
        board_id: 'notice',
        title: '홈페이지 리뉴얼 완료 안내',
        content: '<p>홈페이지가 새롭게 단장되었습니다.</p>',
        views: 1923, created_at: '2024-12-01 09:00:00'
    },
    // Free Board Posts
    {
        board_id: 'free',
        title: 'ESG 관련 무료 온라인 교육 플랫폼 정리',
        content: '<p>유용한 정보 공유합니다.</p>',
        views: 1567, created_at: '2025-12-26 10:00:00'
    },
    {
        board_id: 'free',
        title: 'ESG 보고서 작성 시 참고할 만한 자료 추천해주세요',
        content: '<p>처음이라 막막하네요.</p>',
        views: 876, created_at: '2025-12-25 14:00:00'
    },
    {
        board_id: 'free',
        title: '회사에서 ESG 팀 신설, 드디어 전담 부서 생겼어요!',
        content: '<p>축하해주세요!</p>',
        views: 1456, created_at: '2025-12-22 09:30:00'
    }
];

db.serialize(() => {
    // Clear existing data
    db.run("DELETE FROM partners");
    db.run("DELETE FROM government");
    db.run("DELETE FROM members");
    db.run("DELETE FROM posts");
    db.run("DELETE FROM boards");

    // Insert Partners
    const partnerStmt = db.prepare("INSERT INTO partners (name, category, website_url, display_order) VALUES (?, ?, ?, ?)");
    partners.forEach((p, i) => {
        partnerStmt.run(p.name, p.category, p.website_url, i + 1);
    });
    partnerStmt.finalize();

    // Insert Government
    const govStmt = db.prepare("INSERT INTO government (name, website_url, display_order) VALUES (?, ?, ?)");
    government.forEach((g, i) => {
        govStmt.run(g.name, g.website_url, i + 1);
    });
    govStmt.finalize();

    // Insert Members
    const memberStmt = db.prepare("INSERT INTO members (user_id, password, name, email, role) VALUES (?, ?, ?, ?, ?)");
    members.forEach(m => {
        const hash = bcrypt.hashSync(m.password, 10);
        memberStmt.run(m.id, hash, m.name, m.email, m.role);
    });
    memberStmt.finalize();

    // Insert Boards
    const boardStmt = db.prepare("INSERT OR IGNORE INTO boards (id, name, type) VALUES (?, ?, ?)");
    boards.forEach(b => {
        boardStmt.run(b.id, b.name, b.type);
    });
    boardStmt.finalize();

    // Insert Posts
    // Assuming admin is the first inserted member so ID is 1 (or get ID first)
    // Here we assume AUTOINCREMENT starts at 1 after delete (or use specific ID logic)
    // For safety, we'll just hardcode author_id=1 as we just inserted admin.
    const postStmt = db.prepare("INSERT INTO posts (board_id, title, content, author_id, views, created_at) VALUES (?, ?, ?, ?, ?, ?)");
    posts.forEach(p => {
        // author_id=1 (admin)
        postStmt.run(p.board_id, p.title, p.content, 1, p.views, p.created_at);
    });
    postStmt.finalize();

    console.log('✅ Full Seed data inserted successfully');
});

db.close();
