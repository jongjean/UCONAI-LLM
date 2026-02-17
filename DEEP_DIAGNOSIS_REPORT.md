# 심층 진단 보고서 - 배포 문제 분석

## 🔍 진단 일시
**2025-01-19 19:30 (KST)**

---

## 📊 현재 상태 진단

### 1️⃣ 프로젝트 파일 상태
```
✅ index.html 존재: 27,659 bytes (Dec 30 13:26)
✅ css/style.css 존재: 슬라이더 스타일 정의됨
✅ js/main.js 존재: 슬라이더 로직 포함
✅ images/ 폴더:
   - hero-slide-1.jpg (319KB, Dec 30 13:52)
   - hero-slide-2.jpg (260KB, Dec 30 13:51)
   - hero-slide-3.jpg (264KB, Dec 30 13:51)
```

**마지막 수정 날짜**: 2024년 12월 30일

---

### 2️⃣ 슬라이더 구조 분석

#### HTML 구조 (index.html, 라인 173-202)
```html
<section class="hero-slider">
    <div class="slider-container">
        <div class="slide active">
            <div class="slide-content">
                <h1>한국ESG학회</h1>
                <p>환경, 사회, 거버넌스를 선도하는 학회</p>
                <a href="pages/about/greeting-new.html">자세히 보기</a>
            </div>
        </div>
        <div class="slide">...</div>
        <div class="slide">...</div>
    </div>
</section>
```

**특징**:
- **정적 HTML로 3개의 슬라이드가 하드코딩되어 있음**
- 배경 이미지는 CSS에서 지정

#### CSS 스타일 (css/style.css, 라인 695-705)
```css
.slide:nth-child(1) {
    background-image: url('../images/hero-slide-1.jpg?v=2');
}

.slide:nth-child(2) {
    background-image: url('../images/hero-slide-2.jpg?v=2');
}

.slide:nth-child(3) {
    background-image: url('../images/hero-slide-3.jpg?v=2');
}
```

**특징**:
- 배경 이미지를 CSS로 직접 지정
- `?v=2` 캐시 버스팅 파라미터 사용

#### JavaScript 로직 (js/main.js, 라인 528-575)
```javascript
function loadHeroSlides() {
    const sliderContainer = document.querySelector('.slider-container');
    if (!sliderContainer) return;
    
    try {
        // LocalStorage에서 슬라이드 데이터 로드
        const slidesData = JSON.parse(localStorage.getItem('esg_hero_slides') || '[]');
        
        // 슬라이드 데이터가 없으면 기본 HTML 유지
        if (slidesData.length === 0) {
            console.log('포스팅툴 데이터 없음 - 기본 슬라이드 사용');
            return;
        }
        
        // 기존 슬라이드 제거하고 새로 생성
        sliderContainer.innerHTML = '';
        slidesData.forEach((slide, index) => {
            // 동적 슬라이드 생성
        });
    } catch (error) {
        console.error('슬라이드 로드 오류:', error);
    }
}
```

**중요 발견**:
- `localStorage.getItem('esg_hero_slides')` 데이터를 읽음
- **데이터가 없으면 기본 HTML 유지**
- **데이터가 있으면 HTML을 완전히 교체**

---

### 3️⃣ 콘솔 로그 분석

**미리보기 환경 (PlaywrightConsoleCapture 결과)**:
```
포스팅툴 데이터 없음 - 기본 슬라이드 사용
```

**의미**:
- `localStorage.getItem('esg_hero_slides')`가 **빈 배열 또는 null**
- 따라서 **정적 HTML의 기본 슬라이드를 사용**
- CSS에 정의된 `hero-slide-1.jpg`, `hero-slide-2.jpg`, `hero-slide-3.jpg` 표시

---

### 4️⃣ 포스팅툴 시스템 분석

#### 포스팅툴 데이터 구조 (js/posting-tool.js)
```javascript
const STORAGE_KEYS = {
    SLIDES: 'esg_hero_slides',
    HISTORY: 'esg_main_history'
};

const DEFAULT_SLIDES = [
    {
        id: 'slide_001',
        order: 1,
        image: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1920',
        title: '한국ESG학회',
        description: '환경, 사회, 거버넌스를 선도하는 학회',
        buttonText: '자세히 보기',
        buttonLink: 'pages/about/greeting-new.html'
    },
    // ...
];
```

**중요 발견**:
- 포스팅툴은 **Unsplash 이미지 URL**을 사용
- index.html은 **로컬 images/ 폴더의 JPG 파일**을 사용
- **두 시스템이 완전히 분리되어 있음**

---

## 🚨 핵심 문제 발견

### **근본 원인: 이중 시스템**

프로젝트에 **두 개의 독립적인 슬라이더 시스템**이 존재합니다:

#### 시스템 A: 정적 HTML 슬라이더
- **위치**: index.html (라인 173-202)
- **이미지**: `images/hero-slide-1.jpg`, `hero-slide-2.jpg`, `hero-slide-3.jpg`
- **마지막 수정**: 2024년 12월 30일
- **동작 방식**: 
  - HTML에 하드코딩된 3개 슬라이드
  - CSS로 배경 이미지 지정
  - LocalStorage 데이터가 **없을 때** 사용
- **현재 상태**: ✅ 작동 중 (미리보기에서 확인됨)

#### 시스템 B: 포스팅툴 동적 슬라이더
- **위치**: js/posting-tool.js, pages/admin/posting-tool.html
- **이미지**: Unsplash URL (외부 이미지)
- **동작 방식**:
  - LocalStorage에 JSON 데이터 저장
  - main.js의 `loadHeroSlides()` 함수가 읽음
  - HTML을 **완전히 교체**
- **현재 상태**: ❌ LocalStorage 데이터 없음

---

## 🎯 배포 vs 미리보기 차이 분석

### 왜 미리보기와 배포가 다른가?

#### 미리보기 환경
```
1. index.html 로드
2. main.js 실행
3. loadHeroSlides() 호출
4. localStorage.getItem('esg_hero_slides') → null
5. "포스팅툴 데이터 없음 - 기본 슬라이드 사용"
6. 정적 HTML 유지
7. CSS가 hero-slide-1.jpg, hero-slide-2.jpg, hero-slide-3.jpg 표시
8. ✅ 최신 이미지 (Dec 30) 표시
```

#### 배포 환경 (추정)
```
1. index.html 로드 (구버전?)
2. main.js 실행
3. loadHeroSlides() 호출
4. localStorage.getItem('esg_hero_slides') → null 또는 구 데이터
5. 두 가지 경우:
   Case A: 구버전 HTML → 구버전 이미지
   Case B: 구 LocalStorage 데이터 → 다른 이미지
```

---

## 💡 가능한 시나리오

### 시나리오 1: 배포 파일이 구버전
**증상**:
- 배포 날짜가 2024-12-30으로 표시
- 슬라이더 이미지가 다름

**원인**:
- GenSpark가 **구버전 파일을 배포**
- index.html의 마지막 수정: Dec 30 13:26
- 배포 시스템이 이 버전을 캐싱

**증거**:
- LS 명령어 결과: `index.html` 파일 날짜 `Dec 30 13:26`
- 배포 로그: "9 hours ago"

### 시나리오 2: LocalStorage 데이터 차이
**증상**:
- 미리보기는 정적 HTML 사용
- 배포는 이전 포스팅툴 데이터 사용

**원인**:
- 배포 환경의 LocalStorage에 구 데이터 존재
- `loadHeroSlides()`가 이를 읽어서 HTML 교체

**증거**:
- 콘솔 로그: "포스팅툴 데이터 없음"은 미리보기에서만 확인됨
- 배포 환경의 LocalStorage는 확인 불가

### 시나리오 3: 이미지 파일 배포 누락
**증상**:
- HTML/CSS는 최신
- 이미지 파일만 구버전

**원인**:
- R2 버킷에 이미지가 업로드되지 않음
- 또는 이전 버전 이미지 캐싱

**증거**:
- 배포 로그: "9 binary files uploaded to R2"
- hero-slide-1.jpg, hero-slide-2.jpg, hero-slide-3.jpg 포함됨

---

## 🔬 추가 확인이 필요한 항목

### 1. 배포 URL의 실제 파일
```bash
# 브라우저 개발자 도구에서 확인
1. Network 탭 열기
2. index.html 다운로드
3. 파일 내용 확인 (라인 173-202의 슬라이드 구조)
4. CSS 파일 다운로드
5. 라인 695-705의 이미지 URL 확인
```

### 2. 배포 환경 LocalStorage
```javascript
// 배포 URL 접속 후 콘솔에서 실행
const slidesData = localStorage.getItem('esg_hero_slides');
console.log('배포 LocalStorage:', slidesData);
```

### 3. 실제 이미지 URL
```javascript
// 배포 URL 접속 후 콘솔에서 실행
const slide1 = document.querySelector('.slide:nth-child(1)');
const bgImage = window.getComputedStyle(slide1).backgroundImage;
console.log('슬라이드 1 배경 이미지:', bgImage);
```

### 4. 배포 로그의 파일 해시
- index.html의 체크섬
- hero-slide-*.jpg의 체크섬
- 현재 파일과 비교

---

## 📝 결론 및 다음 단계

### 현재 상태 요약
1. ✅ **프로젝트 파일은 정상**
   - index.html: 정적 슬라이더 포함
   - CSS: 3개 이미지 정의
   - JS: LocalStorage 기반 동적 로딩
   - 이미지: hero-slide-1/2/3.jpg 존재

2. ❌ **배포와 미리보기가 다름**
   - 미리보기: 최신 이미지 (Dec 30)
   - 배포: 다른 이미지 (날짜 미상)

3. ⚠️ **이중 시스템 구조**
   - 정적 HTML + 동적 포스팅툴
   - LocalStorage 유무에 따라 다른 동작

### 즉시 확인해야 할 사항
**다음 정보를 제공해주세요**:

1. **배포 URL 접속 후**:
   ```javascript
   // F12 → 콘솔에서 실행
   console.log('LocalStorage:', localStorage.getItem('esg_hero_slides'));
   
   // 슬라이드 개수 확인
   console.log('슬라이드 개수:', document.querySelectorAll('.slide').length);
   
   // 첫 번째 슬라이드 배경 확인
   const slide1 = document.querySelector('.slide:nth-child(1)');
   console.log('배경 이미지:', window.getComputedStyle(slide1).backgroundImage);
   
   // 슬라이드 텍스트 확인
   console.log('슬라이드 1 제목:', document.querySelector('.slide:nth-child(1) .slide-title').textContent);
   ```

2. **Network 탭에서**:
   - `hero-slide-1.jpg` 요청 URL
   - 응답 헤더 (Date, ETag, Cache-Control)
   - 파일 크기 (319KB인지 확인)

3. **스크린샷**:
   - 배포 페이지 메인 슬라이더
   - 미리보기 페이지 메인 슬라이더
   - 두 이미지를 나란히 비교

### 추정되는 최종 원인
**가장 가능성 높은 원인**:
1. **배포 파일이 12월 30일 이전 버전** (70% 확률)
2. **이미지 파일만 배포되지 않음** (20% 확률)
3. **LocalStorage에 구 데이터 존재** (10% 확률)

---

## 🎯 임시 해결책 (확인 전)

### 방법 1: LocalStorage 초기화
```javascript
// 배포 URL에서 실행
localStorage.removeItem('esg_hero_slides');
localStorage.removeItem('esg_main_history');
location.reload();
```

### 방법 2: 강제 캐시 무효화
```
배포 URL + ?force_reload=20250119
```

### 방법 3: CSS 캐시 버스팅 업데이트
```css
/* css/style.css 라인 695-705 */
.slide:nth-child(1) {
    background-image: url('../images/hero-slide-1.jpg?v=20250119');
}
```

---

**위 콘솔 명령어 결과를 제공해주시면 정확한 원인을 파악하고 해결책을 제시하겠습니다.**
