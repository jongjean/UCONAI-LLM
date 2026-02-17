
// Seed initial data for ESG Board
const PORT = 4045;
const API_URL = `http://localhost:${PORT}/api/posts`;

const sampleNotice = {
    title: '🎉 ESG 학회 홈페이지 개편 안내',
    content: 'ESG 학회 홈페이지가 서버 기반 시스템으로 새롭게 개편되었습니다.\n이제 모든 데이터가 중앙 서버에 저장되어 PC와 모바일 어디서든 동일한 내용을 확인하실 수 있습니다.\n\n[주요 변경사항]\n1. 게시판 및 슬라이드 관리 시스템 통합\n2. 이미지 업로드 및 편집 기능 강화\n3. 데이터 안정성 및 보안 강화',
    category: 'notice',
    isHeroVisible: false
};

const sampleSlide = {
    title: '지속가능한 미래, ESG와 함께',
    content: '환경(E), 사회(S), 지배구조(G) 중심의 경영 패러다임 변화를 선도합니다.',
    shortTitle: 'ESG 비전 선포',
    shortDescription: '새로운 경영 패러다임의 시작',
    category: 'news',
    isHeroVisible: true,
    slide_order: 1,
    imageTransform: JSON.stringify({ scale: 1, x: 0, y: 0 }),
    maskOpacity: 30
};

async function seed() {
    console.log(`🌱 Seeding data to ${API_URL}...`);

    try {
        // 1. Check existing
        const checkRes = await fetch(API_URL);
        const existing = await checkRes.json();

        if (existing.length > 0) {
            console.log('ℹ️ Data already exists. Skipping seed.');
            return;
        }

        // 2. Insert Notice
        console.log('Creating Notice...');
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sampleNotice)
        });

        // 3. Insert Slide
        console.log('Creating Hero Slide...');
        // Note: Real app uses FormData for images, but basic fields work with JSON if API supports it.
        // If API enforces FormData/Multer, we might need a workaround or just basic data.
        // server/routes/posts.js usually uses upload.single('image') which handles multipart/form-data.
        // But body-parser also handles JSON. Let's try JSON first.
        // If it fails, I will just manually insert via SQLite.

        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sampleSlide)
        });

        console.log('✅ Seed completed!');

    } catch (e) {
        console.error('❌ Seed failed:', e);
    }
}

seed();
