/**
 * 한국ESG학회 - 공지사항 관리자 (API 연동)
 * notice-manager.js
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('📢 공지사항 매니저 API 연동 초기화...');

    // 1. 현재 URL 파라미터 확인 (상세보기 모드)
    const urlParams = new URLSearchParams(window.location.search);
    const noticeId = urlParams.get('id');

    if (noticeId) {
        // 상세보기 모드
        await loadAndShowNoticeDetail(noticeId);
    } else {
        // 리스트 모드
        await loadAndRenderNoticeList();
    }
});

/**
 * 공지사항 목록 로드 및 렌더링
 */
async function loadAndRenderNoticeList() {
    try {
        // API에서 공지사항 목록 가져오기 (boardId='notice'는 기본값일 수 있음)
        const response = await ApiClient.posts.getAll({ boardId: 'notice' });
        const notices = response.data;
        renderNoticeList(notices);
    } catch (error) {
        console.error('공지사항 목록 로드 실패:', error);
        renderNoticeList([]); // 빈 목록 렌더링
    }
}

/**
 * 공지사항 상세 로드 및 표시
 */
async function loadAndShowNoticeDetail(id) {
    try {
        const notice = await ApiClient.posts.getById(id);
        showNoticeDetail(notice);
    } catch (error) {
        console.error('공지사항 상세 로드 실패:', error);
        alert('공지사항을 불러올 수 없습니다.\n삭제되었거나 존재하지 않는 게시물입니다.');
        window.location.href = 'notice.html';
    }
}

/**
 * 공지사항 리스트 렌더링
 */
function renderNoticeList(notices) {
    const listContainer = document.querySelector('.notice-list');
    if (!listContainer) return;

    // 1. 관리자 권한 확인 후 글쓰기 버튼 추가
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    const isAdmin = checkIsAdmin();

    if (isAdmin) {
        let writeBtnContainer = document.querySelector('.write-btn-container');
        if (!writeBtnContainer) {
            writeBtnContainer = document.createElement('div');
            writeBtnContainer.className = 'write-btn-container';
            writeBtnContainer.style.textAlign = 'right';
            writeBtnContainer.style.marginTop = '20px';
            writeBtnContainer.style.marginBottom = '20px';
            listContainer.parentNode.insertBefore(writeBtnContainer, listContainer);
        }

        writeBtnContainer.innerHTML = `
            <a href="../admin/board-manager.html" class="btn-list" style="background: #e91e63; color: white; display: inline-flex; align-items: center; gap: 8px; border-radius: 50px;">
                <i class="fas fa-edit"></i> 글쓰기 (게시판 관리)
            </a>
        `;
    }

    if (!notices || notices.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 100px 20px; color: #999;">
                <i class="fas fa-folder-open" style="font-size: 4rem; margin-bottom: 20px; opacity: 0.3;"></i>
                <p style="font-size: 1.2rem;">등록된 게시물이 없습니다.</p>
                ${isAdmin ? '<p style="margin-top: 10px;">상단의 글쓰기 버튼을 눌러 첫 소식을 전해보세요!</p>' : ''}
            </div>
        `;
        return;
    }

    listContainer.innerHTML = '';

    notices.forEach(notice => {
        const item = createNoticeItem(notice);
        listContainer.appendChild(item);
    });
}

function createNoticeItem(notice) {
    const item = document.createElement('div');
    item.className = 'notice-item';
    item.onclick = () => window.location.href = `notice.html?id=${notice.id}`;

    const categories = notice.category ? [notice.category] : ['notice'];
    const catBadges = categories.map(cat => {
        let cls = 'badge-general';
        let txt = '공지';
        if (cat === 'news') { cls = 'badge-news'; txt = '소식'; }
        if (cat === 'event') { cls = 'badge-event'; txt = '행사'; }
        return `<span class="notice-badge ${cls}"><i class="fas fa-tag"></i> ${txt}</span>`;
    }).join('');

    const dateStr = notice.created_at ? new Date(notice.created_at).toISOString().split('T')[0] : '';

    // NEW 배지 로직 (최근 3일)
    const isNew = false;
    // const threeDaysAgo = new Date(); threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    // const isNew = new Date(notice.created_at) > threeDaysAgo;

    item.innerHTML = `
        <div class="notice-header">
            ${catBadges}
            ${isNew ? '<span class="notice-badge badge-new"><i class="fas fa-star"></i> NEW</span>' : ''}
            <div class="notice-title">
                ${notice.title}
            </div>
        </div>
        <div class="notice-meta">
            <span><i class="fas fa-user"></i> ${notice.author_name || '관리자'}</span>
            <span><i class="fas fa-calendar"></i> ${dateStr}</span>
            <span><i class="fas fa-eye"></i> 조회 ${notice.views || 0}</span>
        </div>
    `;
    return item;
}

/**
 * 공지사항 상세보기 표시
 */
function showNoticeDetail(notice) {
    if (!notice) return;

    injectDetailStyles();

    // UI 요소 숨기기
    const listSection = document.querySelector('.notice-list');
    const searchSection = document.querySelector('.search-box');
    const statsSection = document.querySelector('.stats-grid');
    const paginationSection = document.querySelector('.pagination');

    if (listSection) listSection.style.display = 'none';
    if (searchSection) searchSection.style.display = 'none';
    if (statsSection) statsSection.style.display = 'none';
    if (paginationSection) paginationSection.style.display = 'none';

    // 상세보기 컨테이너 확보
    let detailSection = document.querySelector('.notice-detail');
    if (!detailSection) {
        detailSection = document.createElement('div');
        detailSection.className = 'notice-detail active';
        document.querySelector('.content-wrapper').appendChild(detailSection);
    }
    detailSection.style.display = 'block';

    const isAdmin = checkIsAdmin();

    // 비디오 임베드
    let videoEmbedHtml = '';
    if (notice.video_url) {
        if (notice.video_url.includes('youtube.com') || notice.video_url.includes('youtu.be')) {
            const videoId = extractYouTubeId(notice.video_url);
            if (videoId) {
                videoEmbedHtml = `
                    <div class="video-container">
                        <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                    </div>
                `;
            }
        }
    }

    const dateStr = notice.created_at ? new Date(notice.created_at).toLocaleString() : '';

    detailSection.innerHTML = `
        <div class="detail-header">
            <h2 class="detail-title">${notice.title}</h2>
            <div class="detail-meta">
                <span><i class="fas fa-user"></i> 작성자: ${notice.author_name || '관리자'}</span>
                <span><i class="fas fa-calendar-alt"></i> 작성일: ${dateStr}</span>
                <span><i class="fas fa-eye"></i> 조회수: ${notice.views}</span>
            </div>
        </div>
        <div class="detail-content">
            ${videoEmbedHtml}
            ${notice.image_url ? `<img src="${notice.image_url}" class="detail-image">` : ''}
            <div class="text-content">
                ${notice.content}
            </div>
            
            ${notice.short_title ? `
            <div class="short-info-box">
                <h4><i class="fas fa-info-circle"></i> 메인 슬라이드용 축약 정보</h4>
                <p><strong>축약 제목:</strong> ${notice.short_title}</p>
                <p><strong>축약 설명:</strong> ${notice.short_description}</p>
            </div>
            ` : ''}
        </div>

        <div class="detail-footer">
            <a href="notice.html" class="btn-list">
                <i class="fas fa-list"></i> 목록으로 돌아가기
            </a>
            ${isAdmin ? `
            <a href="../admin/board-manager.html" class="btn-list" style="background: #e91e63; color: white; margin-left: 10px;">
                <i class="fas fa-edit"></i> 수정 (게시판 관리)
            </a>
            ` : ''}
        </div>
    `;
}

function checkIsAdmin() {
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    return (user.id && (user.role === 'admin' || user.role === 'super_admin' || user.name === '관리자'));
}

function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * 상세 페이지 전용 스타일 주입
 */
function injectDetailStyles() {
    if (document.getElementById('noticeDetailStyles')) return;

    const style = document.createElement('style');
    style.id = 'noticeDetailStyles';
    style.innerHTML = `
        .notice-detail {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            margin-bottom: 50px;
            animation: fadeIn 0.5s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .detail-header {
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 25px;
            margin-bottom: 30px;
        }
        .detail-title {
            font-size: 2.2rem;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 15px;
            line-height: 1.3;
        }
        .detail-meta {
            display: flex;
            gap: 20px;
            color: #7f8c8d;
            font-size: 0.95rem;
        }
        .video-container {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            overflow: hidden;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .video-container iframe {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
        }
        .detail-image {
            max-width: 100%;
            border-radius: 12px;
            margin-bottom: 30px;
            display: block;
        }
        .text-content {
            font-size: 1.15rem;
            line-height: 1.9;
            color: #34495e;
            white-space: pre-wrap;
        }
        .short-info-box {
            margin-top: 50px;
            padding: 25px;
            background: #f8faff;
            border-left: 5px solid #6366f1;
            border-radius: 0 10px 10px 0;
        }
        .detail-footer {
            margin-top: 50px;
            text-align: center;
        }
        .btn-list {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 15px 35px;
            background: #34495e;
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            transition: all 0.3s;
        }
        .btn-list:hover {
            background: #2c3e50;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
    `;
    document.head.appendChild(style);
}
