const sqlite3 = require('sqlite3').verbose();
const path = require('path');

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

db.serialize(() => {
    // Clear existing data (optional, but good for reset)
    db.run("DELETE FROM partners");
    db.run("DELETE FROM government");

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

    console.log('✅ Seed data inserted successfully');
});

db.close();
