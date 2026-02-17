/**
 * 한국ESG학회 - 독립 게시판 관리 로직
 * board-manager.js
 */

const BOARD_ID = 'notice';

document.addEventListener('DOMContentLoaded', () => {
    loadNotices();
    initFormListeners();
});

/**
 * 게시물 목록 로딩 및 렌더링
 */
async function loadNotices() {
    try {
        const response = await ApiClient.posts.getAll({ boardId: BOARD_ID });
        const postList = response.data;

        const tbody = document.getElementById('postListBody');
        tbody.innerHTML = '';

        if (postList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 50px; color: #999;">등록된 게시물이 없습니다.</td></tr>';
            return;
        }

        postList.forEach(post => {
            const tr = document.createElement('tr');

            // 카테고리 배지 생성 (DB category 필드는 단일 문자열이므로 배열 처리 필요시 변환)
            const categories = post.category ? [post.category] : ['notice'];
            const catBadges = categories.map(cat => {
                let cls = 'badge-notice';
                let txt = '공지';
                if (cat === 'news') { cls = 'badge-news'; txt = '소식'; }
                if (cat === 'event') { cls = 'badge-event'; txt = '행사'; }
                return `<span class="badge ${cls}">${txt}</span>`;
            }).join(' ');

            // 날짜 포맷팅
            const dateStr = new Date(post.created_at).toISOString().split('T')[0];

            tr.innerHTML = `
                <td>
                    <img src="${post.image_url || '../../images/no-image.png'}" class="image-preview" alt="미리보기" onerror="this.src='../../images/no-image.png'">
                </td>
                <td>
                    <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px;">${post.title}</div>
                    <div style="font-size: 0.85rem; color: #7f8c8d; line-height: 1.4;">${(post.content || '').substring(0, 50)}...</div>
                </td>
                <td>${catBadges} ${post.is_hero_visible ? '<i class="fas fa-desktop" title="슬라이드 노출중" style="color: #27ae60; margin-left: 5px;"></i>' : ''}</td>
                <td>${dateStr}</td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.85rem;" onclick="editPost('${post.id}')">
                            <i class="fas fa-edit"></i> 수정
                        </button>
                        <button class="btn btn-danger" style="padding: 6px 12px; font-size: 0.85rem;" onclick="deletePost('${post.id}')">
                            <i class="fas fa-trash"></i> 삭제
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('불러오기 실패:', error);
        document.getElementById('postListBody').innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">데이터를 불러오는 중 오류가 발생했습니다.</td></tr>';
    }
}

/**
 * 모달 제어
 */
window.openNewPostModal = function () {
    document.getElementById('modalTitle').textContent = '새 게시물 작성';
    document.getElementById('postForm').reset();
    document.getElementById('editNoticeId').value = '';
    document.getElementById('modalImagePreview').style.display = 'none';

    // 파일 인풋 초기화
    const fileInput = document.getElementById('postImageFile');
    if (fileInput) fileInput.value = '';

    document.getElementById('postModal').style.display = 'block';
};

window.closeModal = function () {
    document.getElementById('postModal').style.display = 'none';
};

/**
 * 이미지 파일 처리 및 데이터 보존
 */
let selectedFile = null;
let currentEditingPost = null; // 수정 시 기존 데이터 보존용

window.previewImage = function (event) {
    const file = event.target.files[0];
    if (!file) return;

    selectedFile = file; // 저장 시 사용

    const reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById('modalImagePreview').src = e.target.result;
        document.getElementById('modalImagePreview').style.display = 'block';
    };
    reader.readAsDataURL(file);
};

/**
 * 저장 로직
 */
function initFormListeners() {
    const form = document.getElementById('postForm');
    form.onsubmit = async function (e) {
        e.preventDefault();

        const noticeId = document.getElementById('editNoticeId').value;
        const title = document.getElementById('postTitle').value;
        const content = document.getElementById('postContent').value;
        const videoUrl = document.getElementById('postVideoUrl').value;
        const isHeroVisible = document.getElementById('postIsHeroVisible').checked;

        // 카테고리 (단일 선택으로 가정하거나 첫번째 값 사용)
        const categories = Array.from(document.querySelectorAll('input[name="postCategory"]:checked'))
            .map(cb => cb.value);

        if (categories.length === 0) {
            alert('최소 하나 이상의 카테고리를 선택해주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('boardId', BOARD_ID);
        formData.append('title', title);
        formData.append('content', content);
        formData.append('category', categories[0]); // DB에는 문자열로 저장
        formData.append('videoUrl', videoUrl);
        formData.append('isHeroVisible', isHeroVisible);

        // 기존 데이터 보존 (Posting Tool에서 설정한 값들이 날아가면 안됨)
        if (currentEditingPost) {
            if (currentEditingPost.image_transform) {
                formData.append('imageTransform', currentEditingPost.image_transform); // 이미 문자열임
            }
            if (currentEditingPost.mask_opacity) {
                formData.append('maskOpacity', currentEditingPost.mask_opacity);
            }
            if (currentEditingPost.short_title) {
                formData.append('shortTitle', currentEditingPost.short_title);
            }
            if (currentEditingPost.short_description) {
                formData.append('shortDescription', currentEditingPost.short_description);
            }
        }

        if (selectedFile) {
            formData.append('image', selectedFile);
        } else {
            // 기존 이미지 유지 등을 위해 별도 처리 필요할 수 있음
            // 수정 시 이미지를 변경하지 않으면 서버에서 기존 이미지 유지
            const existingSrc = document.getElementById('modalImagePreview').src;
            if (noticeId && existingSrc && !existingSrc.includes('no-image')) {
                formData.append('existingImageUrl', existingSrc);
            }
        }

        try {
            if (noticeId) {
                // 수정
                await ApiClient.posts.update(noticeId, formData);
                alert('수정되었습니다.');
            } else {
                // 새 등록
                await ApiClient.posts.create(formData);
                alert('저장되었습니다.');
            }

            selectedFile = null;
            currentEditingPost = null;
            closeModal();
            loadNotices();
        } catch (error) {
            console.error('저장 실패:', error);
            alert('저장 중 오류가 발생했습니다: ' + error.message);
        }
    };
}

/**
 * 수정 모드 진입
 */
window.editPost = async function (id) {
    try {
        const post = await ApiClient.posts.getById(id);
        currentEditingPost = post; // 데이터 보존

        document.getElementById('modalTitle').textContent = '게시물 수정';
        document.getElementById('editNoticeId').value = post.id;
        document.getElementById('postTitle').value = post.title;
        document.getElementById('postContent').value = post.content;
        document.getElementById('postVideoUrl').value = post.video_url || '';
        document.getElementById('postIsHeroVisible').checked = !!post.is_hero_visible;

        // 카테고리 체크
        const checkboxes = document.querySelectorAll('input[name="postCategory"]');
        checkboxes.forEach(cb => {
            cb.checked = (cb.value === post.category);
        });

        if (post.image_url) {
            document.getElementById('modalImagePreview').src = post.image_url;
            document.getElementById('modalImagePreview').style.display = 'block';
        } else {
            document.getElementById('modalImagePreview').style.display = 'none';
        }

        selectedFile = null; // 초기화
        document.getElementById('postModal').style.display = 'block';
    } catch (error) {
        console.error('상세 정보 불러오기 오류:', error);
        alert('게시물 정보를 불러오지 못했습니다.');
    }
};

window.openNewPostModal = function () {
    currentEditingPost = null; // 초기화
    document.getElementById('modalTitle').textContent = '새 게시물 작성';
    document.getElementById('postForm').reset();
    // ... rest of initialization
    document.getElementById('editNoticeId').value = '';
    document.getElementById('modalImagePreview').style.display = 'none';

    const fileInput = document.getElementById('postImageFile');
    if (fileInput) fileInput.value = '';

    document.getElementById('postModal').style.display = 'block';
};

/**
 * 삭제 처리
 */
window.deletePost = async function (id) {
    if (!confirm('정말로 이 게시물을 삭제하시겠습니까?')) return;

    try {
        await ApiClient.posts.delete(id);
        loadNotices();
    } catch (error) {
        console.error('삭제 실패:', error);
        alert('삭제 중 오류가 발생했습니다.');
    }
};
