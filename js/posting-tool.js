/**
 * 한국ESG학회 - 포스팅툴
 * posting-tool.js
 */

// 현재 슬라이드 데이터
let currentSlides = [];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function () {
    console.log('포스팅툴 초기화 시작...');

    // 권한 체크 (실제로는 서버에서 검증)
    checkAdminPermission();

    // 슬라이드 로드
    loadSlides();

    // 이벤트 리스너 등록
    initEventListeners();

    console.log('포스팅툴 초기화 완료!');
});

/**
 * 관리자 권한 체크
 */
function checkAdminPermission() {
    // 프론트엔드 시뮬레이션 (실제로는 서버에서 검증 필요)
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

    // 간단한 체크 (API에서 다시 검증됨)
    if (!user.id && !localStorage.getItem('token')) {
        // 토큰도 없고 유저 정보도 없으면 로그인 페이지로
        // showCustomAlert('🔐 로그인 필요', '로그인이 필요합니다.');
        // setTimeout(() => { window.location.href = '../../index.html'; }, 2000);
    }
}

/**
 * 슬라이드 데이터 로드
 */
async function loadSlides() {
    try {
        const response = await ApiClient.posts.getAll({ is_hero: true });
        const slides = response.data;

        if (slides && slides.length > 0) {
            currentSlides = slides.map(post => {
                const imageTransform = post.image_transform ? JSON.parse(post.image_transform) : null;

                // 🔥 로드된 imageTransform 확인
                if (imageTransform) {
                    console.log(`📥 ID ${post.id} imageTransform 로드:`, imageTransform, `maskOpacity: ${post.mask_opacity}`);
                } else {
                    console.log(`⚠️ ID ${post.id} imageTransform 없음 (서버 값: ${post.image_transform})`);
                }

                return {
                    id: post.id,
                    // DB 필드 -> 프론트엔드 필드 매핑
                    title: post.title,
                    content: post.content, // full content
                    description: post.content, // description으로 사용
                    shortTitle: post.short_title,
                    shortDescription: post.short_description,
                    image: post.image_url,
                    videoUrl: post.video_url,
                    buttonText: '자세히 보기', // DB에 없으면 기본값 (필요시 DB 추가)
                    buttonLink: `pages/community/notice.html?id=${post.id}`,
                    categories: post.category ? [post.category] : ['notice'],
                    isHeroVisible: post.is_hero_visible,
                    maskOpacity: post.mask_opacity || 40,
                    imageTransform: imageTransform
                };
            });
            console.log('서버에서 슬라이드 로드:', currentSlides.length + '개');
        } else {
            console.log('서버에 슬라이드 없음. 빈 상태로 시작.');
            currentSlides = [];
        }

        // UI 렌더링
        renderSlides();

    } catch (error) {
        console.error('슬라이드 로드 오류:', error);
        showCustomAlert('❌ 로드 실패', '슬라이드를 불러오는 중 오류가 발생했습니다.');
    }
}

/**
 * 슬라이드 UI 렌더링
 */
function renderSlides(keepExpandedSlideId = null) {
    const container = document.getElementById('slidesContainer');

    // 🔥 현재 펼쳐진 슬라이드 ID 기억
    if (!keepExpandedSlideId) {
        const expandedCard = container.querySelector('.slide-card.expanded');
        if (expandedCard) {
            keepExpandedSlideId = expandedCard.dataset.slideId;
        }
    }

    container.innerHTML = '';

    currentSlides.forEach((slide, index) => {
        const card = createSlideCard(slide, index);
        container.appendChild(card);

        // 🔥 이전에 펼쳐졌던 슬라이드 다시 펼치기
        if (keepExpandedSlideId && slide.id == keepExpandedSlideId) { // == 비교 (숫자/문자)
            card.classList.add('expanded');
        }
    });

    // 🔥 펼쳐진 슬라이드가 없으면 첫 번째 슬라이드 펼침
    if (!keepExpandedSlideId && container.firstChild) {
        container.firstChild.classList.add('expanded');
    }
}

/**
 * 슬라이드 카드 생성
 */
function createSlideCard(slide, index) {
    const card = document.createElement('div');
    card.className = 'slide-card';
    card.dataset.slideId = slide.id;

    card.innerHTML = `
        <div class="slide-header" onclick="toggleSlide('${slide.id}')">
            <div class="slide-title">
                <div class="slide-number">${index + 1}</div>
                <span>${slide.title || '제목 없음'}</span>
            </div>
            <i class="fas fa-chevron-down slide-toggle"></i>
        </div>
        
        <div class="slide-body">
            <!-- 메인 슬라이드 노출 선택 -->
            <div class="form-group" style="background: #f0f7ff; padding: 15px; border-radius: 12px; border: 1px solid #c2e0ff; margin-bottom: 20px;">
                <label class="form-label" style="display: flex; align-items: center; gap: 10px; cursor: pointer; margin-bottom: 0;">
                    <input type="checkbox" 
                           style="width: 20px; height: 20px; cursor: pointer;"
                           ${slide.isHeroVisible ? 'checked' : ''}
                           onchange="updateSlide('${slide.id}', 'isHeroVisible', this.checked)">
                    <span style="font-size: 1rem; font-weight: 700; color: #007bff;">
                        <i class="fas fa-desktop"></i> 메인 슬라이드(Hero) 노출 사용
                    </span>
                </label>
            </div>

            <!-- 이미지 업로드 -->
            <div class="image-upload-area ${slide.image ? 'has-image' : ''}" 
                 onclick="if(!event.target.closest('.image-action-btn')) document.getElementById('imageInput_${slide.id}').click()">
                <div class="image-preview" id="preview_${slide.id}" style="background-image: url('${slide.image || ''}');"></div>
                
                <!-- 🔥 이미지 액션 버튼 (편집/삭제) -->
                <div class="image-actions">
                    <button class="image-action-btn change" title="이미지 변경" onclick="event.stopPropagation(); document.getElementById('imageInput_${slide.id}').click()">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button class="image-action-btn edit" title="이미지 편집(자르기/이동)" onclick="event.stopPropagation(); window.openImageEditor('${slide.id}', '${slide.image}')">
                        <i class="fas fa-crop-alt"></i>
                    </button>
                    <button class="image-action-btn delete" title="이미지 삭제" onclick="event.stopPropagation(); window.removeImage('${slide.id}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                 
                <div class="upload-placeholder">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>이미지를 클릭하여 업로드하세요</p>
                    <small>(권장: 1920x600px 이상)</small>
                </div>
                
                <input type="file" 
                       id="imageInput_${slide.id}" 
                       accept="image/*" 
                       style="display: none;"
                       onchange="handleImageUpload(event, '${slide.id}')">
            </div>
            
            <!-- 제목, 설명 입력 등 (생략된 필드들은 기존 유지) -->
            <div class="form-group">
                <label class="form-label">제목</label>
                <input type="text" class="form-input" value="${slide.title || ''}" onchange="updateSlide('${slide.id}', 'title', this.value)">
            </div>
            
            <div class="form-group">
                <label class="form-label">내용</label>
                <textarea class="form-input" onchange="updateSlide('${slide.id}', 'description', this.value)">${slide.description || ''}</textarea>
            </div>

             <!-- 축약 제목 (슬라이드용) -->
            <div class="form-group">
                <label class="form-label" style="color: #6366f1;">슬라이드 축약 제목</label>
                <input type="text" class="form-input" style="border-color: #6366f1; background-color: #f5f5ff;" value="${slide.shortTitle || ''}" onchange="updateSlide('${slide.id}', 'shortTitle', this.value)">
            </div>
            
             <!-- 축약 설명 (슬라이드용) -->
            <div class="form-group">
                <label class="form-label" style="color: #6366f1;">슬라이드 축약 설명</label>
                <textarea class="form-input" style="border-color: #6366f1; background-color: #f5f5ff;" onchange="updateSlide('${slide.id}', 'shortDescription', this.value)">${slide.shortDescription || ''}</textarea>
            </div>

            <!-- 슬라이드 액션 버튼 -->
            <div class="slide-actions">
                <button class="action-btn secondary" onclick="previewSlide('${slide.id}')">
                    <i class="fas fa-eye"></i> 미리보기
                </button>
                <button class="action-btn primary" onclick="aiEditSlide('${slide.id}')">
                    <i class="fas fa-magic"></i> AI 문구 추천
                </button>
            </div>
        </div>
    `;

    // 🔥 이미지 transform 적용 (편집기에서 저장한 줌/위치/마스크 반영)
    if (slide.image) {
        setTimeout(() => {
            const previewElement = document.getElementById(`preview_${slide.id}`);
            if (previewElement && typeof SlideRenderer !== 'undefined') {
                SlideRenderer.renderImagePreview(previewElement, slide);
                console.log('✅ 이미지 transform 적용:', slide.id, slide.imageTransform);
            }
        }, 0);
    }

    return card;
}

/**
 * 슬라이드 카드 토글
 */
function toggleSlide(slideId) {
    const card = document.querySelector(`[data-slide-id="${slideId}"]`);
    if (card) {
        const isExpanded = card.classList.contains('expanded');
        document.querySelectorAll('.slide-card').forEach(c => c.classList.remove('expanded'));
        if (!isExpanded) card.classList.add('expanded');
    }
}

/**
 * 이미지 업로드 처리
 */
function handleImageUpload(event, slideId) {
    const file = event.target.files[0];
    if (file) {
        // 파일 객체 저장 (저장 시 전송용)
        const slide = currentSlides.find(s => s.id == slideId);
        if (slide) {
            slide.imageFile = file;

            // 미리보기용 Base64 (UI 즉시 갱신용)
            const reader = new FileReader();
            reader.onload = function (e) {
                slide.image = e.target.result;
                renderSlides(slideId); // Re-render to show image
            };
            reader.readAsDataURL(file);
        }
    }
}

/**
 * 슬라이드 데이터 필드 업데이트
 */
function updateSlide(slideId, field, value) {
    const slide = currentSlides.find(s => s.id == slideId); // 숫자/문자 호환을 위해 == 사용
    if (slide) {
        slide[field] = value;
    }
}

/**
 * 전체 저장
 */
function initEventListeners() {
    const saveBtn = document.getElementById('saveAllBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveAllSlides);
    }
}

async function saveAllSlides() {
    const saveBtn = document.getElementById('saveAllBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<div class="spinner"></div> 저장 중...';
    saveBtn.disabled = true;

    try {
        // 🔥 중요: 저장 직전에 localStorage의 최신 imageTransform/maskOpacity를 currentSlides에 동기화
        console.log('🔄 localStorage와 currentSlides 동기화 중...');
        const storedSlides = JSON.parse(localStorage.getItem('esg_hero_slides') || '[]');

        currentSlides.forEach(slide => {
            const stored = storedSlides.find(s => s.id == slide.id);
            if (stored) {
                if (stored.imageTransform) {
                    slide.imageTransform = stored.imageTransform;
                    console.log(`  ✅ ID ${slide.id}: imageTransform 동기화`, stored.imageTransform);
                }
                if (stored.maskOpacity !== undefined) {
                    slide.maskOpacity = stored.maskOpacity;
                    console.log(`  ✅ ID ${slide.id}: maskOpacity 동기화`, stored.maskOpacity);
                }
            }
        });

        console.log('💾 서버 저장 시작...');

        for (let i = 0; i < currentSlides.length; i++) {
            const slide = currentSlides[i];

            const formData = new FormData();
            formData.append('boardId', 'notice'); // Default board
            formData.append('title', slide.title || 'No Title');
            formData.append('content', slide.description || ''); // content = description
            formData.append('shortTitle', slide.shortTitle || '');
            formData.append('shortDescription', slide.shortDescription || '');
            formData.append('videoUrl', slide.videoUrl || '');
            formData.append('isHeroVisible', slide.isHeroVisible);
            formData.append('slide_order', i + 1);
            formData.append('maskOpacity', slide.maskOpacity || 40);

            if (slide.imageTransform) {
                const transformString = JSON.stringify(slide.imageTransform);
                formData.append('imageTransform', transformString);
                console.log(`📤 ID ${slide.id} imageTransform 전송:`, transformString);
            } else {
                console.log(`⚠️ ID ${slide.id} imageTransform 없음`);
            }

            if (slide.imageFile) {
                formData.append('image', slide.imageFile);
                console.log(`📤 ID ${slide.id} 새 이미지 파일 업로드`);
            } else if (slide.image) {
                // 🔥 중요: 기존 이미지 URL 보존 (http, https, 상대경로 모두 포함)
                formData.append('existingImageUrl', slide.image);
                console.log(`📤 ID ${slide.id} 기존 이미지 URL 유지:`, slide.image);
            } else {
                console.log(`⚠️ ID ${slide.id} 이미지 없음`);
            }

            // ID가 있으면 Update, 없으면 Create
            // 주의: 기존 ID가 'slide_' 로 시작하면 로컬 더미 ID일 수 있음.
            // 서버 ID는 보통 숫자(SQLite auto inc)이므로 구분이 필요함.
            // 하지만 여기서는 간단히 slide.id가 있으면 PUT 시도.

            if (slide.id && !String(slide.id).startsWith('slide_')) {
                console.log(`🔄 ID ${slide.id} 업데이트 시작...`);
                const response = await ApiClient.posts.update(slide.id, formData);
                console.log(`✅ ID ${slide.id} 업데이트 완료:`, response);
            } else {
                // 새로운 슬라이드 생성
                await ApiClient.posts.create(formData);
            }
        }

        alert('✅ 모든 변경사항이 서버에 저장되었습니다.');

        // 🔥 서버 DB 커밋 대기 후 리로드 (비동기 처리 완료 보장)
        console.log('⏳ 서버 저장 완료 대기 중... (1초)');
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('🔄 서버에서 데이터 다시 로드');
        await loadSlides(); // Reload to get clean state and IDs

    } catch (error) {
        console.error('저장 실패:', error);
        alert('저장 중 오류가 발생했습니다: ' + error.message);
    } finally {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

// --- 이미지 액션 함수들 ---

function removeImage(slideId) {
    if (confirm('이미지를 삭제하시겠습니까?')) {
        updateSlide(slideId, 'image', '');
        updateSlide(slideId, 'imageFile', null);
        renderSlides(slideId);
    }
}

function setImageUrl(slideId, url) {
    updateSlide(slideId, 'image', url);
    renderSlides(slideId);
}

function toggleCategory(slideId, category) {
    const slide = currentSlides.find(s => s.id == slideId);
    if (slide) {
        if (!slide.categories) slide.categories = [];
        const index = slide.categories.indexOf(category);
        if (index > -1) {
            slide.categories.splice(index, 1);
        } else {
            slide.categories.push(category);
        }
        renderSlides(slideId);
    }
}

function aiEditSlide(slideId) {
    const slide = currentSlides.find(s => s.id == slideId);
    if (slide) {
        // AI 추천 시물레이션
        const suggestions = [
            { title: "ESG 경영의 새로운 패러다임", desc: "지속가능한 성장을 위한 전략적 접근" },
            { title: "2025 글로벌 ESG 트렌드", desc: "변화하는 세계 속에 기회를 찾다" }
        ];
        const random = suggestions[Math.floor(Math.random() * suggestions.length)];

        slide.title = random.title;
        slide.description = random.desc;
        renderSlides(slideId);
        showCustomAlert('✨ AI 추천 적용', '새로운 제목과 설명이 적용되었습니다.');
    }
}

function resetSlide(slideId) {
    if (confirm('이 슬라이드를 초기화하시겠습니까?')) {
        loadSlides();
    }
}

// 🔥 이미지 편집기 연동을 위한 전역 객체 수정
window.openImageEditor = function (slideId, imageUrl) {
    if (typeof openImageEditor === 'function') {
        // 원래 image-editor.js의 함수 호출
        // 하지만 image-editor.js가 SlideStorage(localStorage)를 쓰므로, 
        // 저장 시점에 우리 쪽 데이터를 업데이트하도록 훅을 걸어야 함.

        // 1. localStorage에 임시 저장 (image-editor가 읽을 수 있게)
        const slidesForStorage = currentSlides.map(s => ({
            id: s.id,
            imageTransform: s.imageTransform,
            maskOpacity: s.maskOpacity
        }));
        localStorage.setItem('esg_hero_slides', JSON.stringify(slidesForStorage));

        // 2. 편집기 열기
        window._original_openImageEditor(slideId, imageUrl);

        // 3. 저장 후 우리 쪽 데이터 갱신을 위해 1초마다 체크 (또는 CustomEvent 사용 가능)
        // 여기서는 간단히 slide-utils.js의 SlideEvents를 활용
    }
};

// 원본 보관
window._original_openImageEditor = window.openImageEditor;

// 슬라이드 업데이트 이벤트 리스너 (image-editor -> posting-tool 동기화)
window.addEventListener('slide:updated', (e) => {
    const { slideId } = e.detail;
    if (slideId) {
        const storedSlides = JSON.parse(localStorage.getItem('esg_hero_slides') || '[]');
        const storedSlide = storedSlides.find(s => s.id == slideId);
        if (storedSlide) {
            const slide = currentSlides.find(s => s.id == slideId);
            if (slide) {
                slide.imageTransform = storedSlide.imageTransform;
                slide.maskOpacity = storedSlide.maskOpacity;
                renderSlides(slideId);
            }
        }
    }
});

// 전역 함수로 노출 (HTML에서 호출 가능)
window.toggleSlide = toggleSlide;
window.handleImageUpload = handleImageUpload;
window.setImageUrl = setImageUrl;
window.removeImage = removeImage;
window.toggleCategory = toggleCategory;
window.updateSlide = updateSlide;
window.aiEditSlide = aiEditSlide;
window.previewSlide = previewSlide;
window.resetSlide = resetSlide;

console.log('포스팅툴 JavaScript 로드 완료!');
