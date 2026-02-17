/**
 * 한국ESG학회 - 슬라이드 유틸리티
 * 프레임 표준화, 변환, 저장소, 렌더링 통합
 */

// ========================================
// 1. 프레임 설정 (메인 기준)
// ========================================
const FRAME_CONFIG = {
    // 메인 슬라이드 높이 (고정)
    MAIN_HEIGHT_MOBILE: 500,   // < 1920px
    MAIN_HEIGHT_FHD: 600,      // ≥ 1920px

    // 편집 모달 크기 (포스팅 툴 컨테이너와 동일)
    EDITOR_WIDTH: 1200,   // 포스팅 컨테이너 max-width와 동일
    EDITOR_HEIGHT: 300,   // 포스팅 카드 이미지 높이와 동일

    /**
     * 현재 화면의 메인 슬라이드 높이
     */
    getMainHeight() {
        return window.innerWidth >= 1920
            ? this.MAIN_HEIGHT_FHD
            : this.MAIN_HEIGHT_MOBILE;
    },

    /**
     * 편집 모달 높이 (포스팅 툴 카드와 동일)
     */
    getEditorHeight() {
        return this.EDITOR_HEIGHT;  // 고정 300px
    },

    /**
     * 현재 화면 비율
     */
    getCurrentRatio() {
        const screenWidth = window.innerWidth;
        const mainHeight = this.getMainHeight();
        return screenWidth / mainHeight;
    }
};

// ========================================
// 2. 이미지 변환 유틸리티
// ========================================
const ImageTransformUtils = {
    /**
     * 픽셀 → 퍼센트 변환
     */
    pixelToPercent(pixelValue, frameSize) {
        return (pixelValue / frameSize) * 100;
    },

    /**
     * 편집 모달 픽셀 → localStorage 퍼센트
     */
    editorToStorage(editorState) {
        const editorWidth = FRAME_CONFIG.EDITOR_WIDTH;
        const editorHeight = FRAME_CONFIG.getEditorHeight();

        return {
            zoom: editorState.zoom,
            positionX: this.pixelToPercent(editorState.positionX, editorWidth),
            positionY: this.pixelToPercent(editorState.positionY, editorHeight)
        };
    },

    /**
     * localStorage 퍼센트 → CSS 값
     */
    storageToCSS(imageTransform, maskOpacity) {
        if (!imageTransform) {
            return {
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                maskOpacity: maskOpacity !== undefined ? maskOpacity / 100 : 0.4
            };
        }

        // 중앙(50%) 기준 계산 (원래대로)
        const posX = 50 + imageTransform.positionX;
        const posY = 50 + imageTransform.positionY;

        return {
            backgroundSize: `${imageTransform.zoom}%`,
            backgroundPosition: `${posX}% ${posY}%`,
            maskOpacity: maskOpacity !== undefined ? maskOpacity / 100 : 0.4
        };
    },

    /**
     * CSS 적용 (DOM 조작)
     */
    applyToElement(element, imageUrl, imageTransform, maskOpacity) {
        if (!element || !imageUrl) {
            console.error('❌ applyToElement: 요소 또는 이미지 URL 없음');
            return;
        }

        const css = this.storageToCSS(imageTransform, maskOpacity);

        // 마스크 + 이미지
        element.style.backgroundImage =
            `linear-gradient(rgba(0, 0, 0, ${css.maskOpacity}), rgba(0, 0, 0, ${css.maskOpacity})), url('${imageUrl}')`;

        element.style.backgroundSize = css.backgroundSize;
        element.style.backgroundPosition = css.backgroundPosition;
        element.style.backgroundRepeat = 'no-repeat';

        console.log(`✅ CSS 적용: size=${css.backgroundSize}, pos=${css.backgroundPosition}, mask=${Math.round(css.maskOpacity * 100)}%`);
    }
};

// ========================================
// 3. 검증 시스템
// ========================================
const Validator = {
    /**
     * imageTransform 검증
     */
    validateImageTransform(transform) {
        if (!transform) return true;  // null 허용

        const errors = [];

        if (typeof transform.zoom !== 'number' || transform.zoom < 10 || transform.zoom > 500) {
            errors.push('zoom은 10~500 사이여야 함');
        }

        if (typeof transform.positionX !== 'number' || Math.abs(transform.positionX) > 100) {
            errors.push('positionX는 -100~100 사이여야 함');
        }

        if (typeof transform.positionY !== 'number' || Math.abs(transform.positionY) > 100) {
            errors.push('positionY는 -100~100 사이여야 함');
        }

        if (errors.length > 0) {
            console.error('❌ imageTransform 검증 실패:', errors);
            return false;
        }

        return true;
    },

    /**
     * maskOpacity 검증
     */
    validateMaskOpacity(opacity) {
        if (opacity === undefined || opacity === null) return true;

        if (typeof opacity !== 'number' || opacity < 0 || opacity > 100) {
            console.error('❌ maskOpacity는 0~100 사이여야 함');
            return false;
        }

        return true;
    }
};

// ========================================
// 4. 슬라이드 데이터 클래스
// ========================================
class SlideData {
    constructor(data) {
        this.id = data.id;
        this.order = data.order;
        this.image = data.image;
        this.title = data.title || '';           // 본래 제목 (게시물용)
        this.shortTitle = data.shortTitle || ''; // 축약 제목 (슬라이드용)
        this.description = data.description || ''; // 본래 내용 (게시물용)
        this.shortDescription = data.shortDescription || ''; // 축약 내용 (슬라이드용)
        this.buttonText = data.buttonText || '자세히 보기';
        this.buttonLink = data.buttonLink || '#';
        this.noticeId = data.noticeId || null;   // 연결된 게시물 ID
        this.categories = data.categories || ['notice']; // 카테고리 배열 (notice, news, event)
        this.videoUrl = data.videoUrl || '';     // 동영상 URL
        this.isHeroVisible = data.isHeroVisible !== undefined ? data.isHeroVisible : true; // 메인 슬라이드 노출 여부
        this.likes = data.likes || 0;             // 좋아요 수
        this.comments = data.comments || [];      // 댓글 배열
        this.imageTransform = data.imageTransform || null;
        this.maskOpacity = data.maskOpacity !== undefined ? data.maskOpacity : 40;
    }

    isValid() {
        // 🔥 ID만 있으면 유효 (이미지는 선택사항)
        return !!this.id;
    }

    toJSON() {
        return {
            id: this.id,
            order: this.order,
            image: this.image,
            title: this.title,
            shortTitle: this.shortTitle,
            description: this.description,
            shortDescription: this.shortDescription,
            buttonText: this.buttonText,
            buttonLink: this.buttonLink,
            noticeId: this.noticeId,
            categories: this.categories,
            videoUrl: this.videoUrl,
            isHeroVisible: this.isHeroVisible,
            likes: this.likes,
            comments: this.comments,
            imageTransform: this.imageTransform,
            maskOpacity: this.maskOpacity
        };
    }
}

// ========================================
// 5. localStorage 저장소
// ========================================
const SlideStorage = {
    STORAGE_KEY: 'esg_hero_slides',

    /**
     * 모든 슬라이드 읽기
     */
    getAll() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) return [];

            const parsed = JSON.parse(data);
            return parsed.map(item => new SlideData(item));
        } catch (error) {
            console.error('❌ 슬라이드 읽기 오류:', error);
            return [];
        }
    },

    /**
     * 특정 슬라이드 읽기
     */
    getById(slideId) {
        const slides = this.getAll();
        return slides.find(s => s.id == slideId) || null;
    },

    /**
     * 슬라이드 업데이트
     */
    update(slideId, updates) {
        const slides = this.getAll();
        // ID 타입 차이(문자열/숫자)를 고려하여 느슨한 비교(==) 사용
        let index = slides.findIndex(s => s.id == slideId);

        if (index === -1) {
            console.log('ℹ️ SlideStorage: localStorage에 정보가 없어 새로 추가합니다.', slideId);
            const newSlide = new SlideData({ id: slideId, ...updates });
            slides.push(newSlide);
        } else {
            // 업데이트 적용
            Object.assign(slides[index], updates);
        }

        // 저장
        return this.saveAll(slides);
    },

    /**
     * 모든 슬라이드 저장
     */
    saveAll(slides) {
        try {
            const validSlides = slides.filter(s => s.isValid());

            if (validSlides.length !== slides.length) {
                console.warn('⚠️ 일부 슬라이드가 유효하지 않아 제외됨');
            }

            validSlides.sort((a, b) => a.order - b.order);

            const json = JSON.stringify(validSlides.map(s => s.toJSON()));
            localStorage.setItem(this.STORAGE_KEY, json);

            console.log('✅ localStorage 저장 완료:', validSlides.length, '개');
            return true;
        } catch (error) {
            console.error('❌ localStorage 저장 오류:', error);
            return false;
        }
    },

    /**
     * 이미지 변형 업데이트 (전용 메서드)
     */
    updateImageTransform(slideId, imageTransform, maskOpacity) {
        // 검증
        if (!Validator.validateImageTransform(imageTransform)) {
            return false;
        }

        if (!Validator.validateMaskOpacity(maskOpacity)) {
            return false;
        }

        // 업데이트
        return this.update(slideId, {
            imageTransform: imageTransform,
            maskOpacity: maskOpacity
        });
    },

    /**
     * 특정 Notice ID와 연결된 슬라이드 삭제
     */
    removeByNoticeId(noticeId) {
        const slides = this.getAll();
        const updatedSlides = slides.filter(s => s.noticeId !== noticeId);
        if (slides.length !== updatedSlides.length) {
            return this.saveAll(updatedSlides);
        }
        return true;
    },

    /**
     * Notice 데이터를 기반으로 슬라이드 추가/업데이트
     */
    upsertFromNotice(notice) {
        const slides = this.getAll();
        const existingIndex = slides.findIndex(s => s.noticeId === notice.id);

        const slideData = {
            id: existingIndex !== -1 ? slides[existingIndex].id : 'slide_' + Date.now(),
            noticeId: notice.id,
            order: existingIndex !== -1 ? slides[existingIndex].order : (slides.length + 1),
            image: notice.image || 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1920&h=1080&fit=crop',
            title: notice.title,
            description: notice.content ? (notice.content.substring(0, 100)) : '내용이 없습니다.',
            shortTitle: notice.title ? notice.title.substring(0, 20) : '',
            shortDescription: notice.content ? (notice.content.substring(0, 50)) : '',
            buttonText: '자세히 보기',
            buttonLink: 'pages/community/notice.html?id=' + notice.id,
            categories: notice.categories || ['notice'],
            videoUrl: notice.videoUrl || '',
            isHeroVisible: true,
            // 트랜스폼 데이터 유지
            imageTransform: existingIndex !== -1 ? slides[existingIndex].imageTransform : null,
            maskOpacity: existingIndex !== -1 ? slides[existingIndex].maskOpacity : 40
        };

        if (existingIndex !== -1) {
            slides[existingIndex] = new SlideData(slideData);
        } else {
            slides.push(new SlideData(slideData));
        }

        return this.saveAll(slides);
    }
};

// ========================================
// 6. 슬라이드 렌더러
// ========================================
const SlideRenderer = {
    /**
     * 이미지 프리뷰 렌더링 (공통)
     */
    renderImagePreview(element, slide) {
        if (!element || !slide || !slide.image) {
            console.error('❌ 렌더링 실패: 요소 또는 이미지 없음');
            return;
        }

        ImageTransformUtils.applyToElement(
            element,
            slide.image,
            slide.imageTransform,
            slide.maskOpacity
        );

        console.log(`✅ 슬라이드 렌더링: ${slide.id} (${slide.title})`);
    },

    /**
     * 메인 슬라이드 렌더링
     */
    renderMainSlide(container, slide, isActive = false, basePath = '') {
        const slideElement = document.createElement('div');
        slideElement.className = 'slide' + (isActive ? ' active' : '');

        // 이미지 적용
        this.renderImagePreview(slideElement, slide);

        // 메인페이지 이미지 위에는 '축약 제목'과 '축약 설명'만 노출 (사용자 요청)
        // 제목과 문구가 긴 게시물 내용은 게시판 상세보기에서만 확인하도록 처리
        const displayTitle = slide.shortTitle || slide.title || '';
        const displayDesc = slide.shortDescription || slide.description || '';

        // 버튼 링크에 basePath 적용
        const fullLink = slide.buttonLink.startsWith('http')
            ? slide.buttonLink
            : (basePath + slide.buttonLink);

        slideElement.innerHTML = `
            <div class="slide-content">
                <h1 class="slide-title">${displayTitle}</h1>
                <p class="slide-text">${displayDesc}</p>
            </div>
            <a href="${fullLink}" class="slide-btn">${slide.buttonText}</a>
        `;

        container.appendChild(slideElement);
    }
};

// ========================================
// 7. 이벤트 시스템
// ========================================
const SlideEvents = {
    /**
     * 슬라이드 업데이트 이벤트 발생
     */
    emitUpdate(slideId) {
        const event = new CustomEvent('slide:updated', {
            detail: { slideId }
        });
        window.dispatchEvent(event);
        console.log('📢 이벤트 발생: slide:updated', slideId);
    },

    /**
     * 슬라이드 업데이트 리스너 등록
     */
    onUpdate(callback) {
        window.addEventListener('slide:updated', (e) => {
            callback(e.detail.slideId);
        });
    }
};

console.log('✅ slide-utils.js 로드 완료');
