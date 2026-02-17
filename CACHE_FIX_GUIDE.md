# 🔥 긴급: 미리보기 캐시 문제 해결

## 📋 문제
**"미리보기는 계속 예전 이미지를 보여주고 있어"**

**원인**: 브라우저가 구버전 `main.js`와 `style.css`를 캐싱

---

## ✅ 최종 해결책

### 수정된 파일 (4개):

1. ✅ **`js/main.js`**
   - 버전 로그 추가: `v20250119-slider-fix`
   - `loadHeroSlides()` 함수에 localStorage 강제 삭제 추가
   
2. ✅ **`css/style.css`**
   - 이미지 URL 캐시 버스팅: `?v=2` → `?v=20250119`

3. ✅ **`index.html`**
   - main.js: `?v=20250119-slider-fix` 추가
   - style.css: `?v=20250119-slider-fix` 추가

4. ✅ **`pages/mypage/profile.html`**
   - 이미 버전 있음: `?v=20250119-v4`

---

## 🧪 즉시 테스트 (순서대로!)

### 1️⃣ **완전 초기화 스크립트**

F12 → Console에 **복사 & 붙여넣기**:

```javascript
console.clear();
console.log('🔥 === 완전 초기화 시작 ===');

// 1. 모든 Storage 삭제
localStorage.clear();
sessionStorage.clear();
console.log('✅ Storage 삭제 완료');

// 2. 슬라이드 데이터 확인
console.log('esg_hero_slides:', localStorage.getItem('esg_hero_slides'));

// 3. Service Worker 삭제
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(reg => reg.unregister());
        console.log('✅ Service Worker 삭제 완료');
    });
}

// 4. Cache 삭제
if ('caches' in window) {
    caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
        console.log('✅ Cache 삭제 완료');
    });
}

console.log('⏳ 3초 후 강제 새로고침...');

setTimeout(() => {
    window.location.reload(true);
}, 3000);
```

---

### 2️⃣ **브라우저 캐시 수동 삭제**

**Chrome/Edge**:
1. `Ctrl + Shift + Delete`
2. 시간 범위: **"전체 기간"**
3. 체크:
   - ✅ 쿠키 및 기타 사이트 데이터
   - ✅ 캐시된 이미지 및 파일
4. **삭제 클릭**

---

### 3️⃣ **강제 새로고침**

```
Ctrl + Shift + R
```

여러 번 눌러주세요! (3~5번)

---

### 4️⃣ **Console 로그 확인**

페이지 로드 후 F12 → Console에서 **이 메시지들이 보여야 함**:

```
🚀 main.js 로드 - 버전: v20250119-slider-fix
⏰ 로드 시간: 2026-01-19T...
✅ 기본 HTML 슬라이드 사용 (localStorage 무시)
```

**만약 "⚠️ 기존 슬라이드 데이터 발견"도 보이면**:
```
⚠️ 기존 슬라이드 데이터 발견 - 삭제 중...
✅ 슬라이드 데이터 삭제 완료
```

---

### 5️⃣ **슬라이드 확인 스크립트**

Console에 입력:

```javascript
console.log('=== 슬라이드 상태 확인 ===');

const slides = document.querySelectorAll('.slide');
console.log('슬라이드 개수:', slides.length);

slides.forEach((slide, i) => {
    const title = slide.querySelector('.slide-title')?.textContent;
    const bg = window.getComputedStyle(slide).backgroundImage;
    console.log(`[${i}] "${title}"`);
    console.log('  배경:', bg);
});

console.log('localStorage:', localStorage.getItem('esg_hero_slides'));
```

**예상 결과**:
```
슬라이드 개수: 3
[0] "한국ESG학회"
  배경: url("http://.../images/hero-slide-1.jpg?v=20250119")
[1] "지속가능한 미래를 위한 연구"
  배경: url("http://.../images/hero-slide-2.jpg?v=20250119")
[2] "학술 활동 및 교류"
  배경: url("http://.../images/hero-slide-3.jpg?v=20250119")
localStorage: null
```

---

## 🚨 여전히 안 된다면?

### 옵션 A: 시크릿 모드 테스트
```
Ctrl + Shift + N
```
미리보기 URL 붙여넣기

### 옵션 B: 다른 브라우저로 테스트
- Chrome 안 되면 → Firefox 시도
- Edge 안 되면 → Chrome 시도

### 옵션 C: 미리보기 종료 후 재시작
1. 미리보기 탭 완전히 닫기
2. GenSpark Files 탭에서 index.html 다시 열기
3. Preview 버튼 다시 클릭

---

## 📝 핵심 변경사항

### js/main.js (Line 1-6):
```javascript
// ==========================================
// 🔥 버전 확인: v20250119-slider-fix
// ==========================================
console.log('🚀 main.js 로드 - 버전: v20250119-slider-fix');
console.log('⏰ 로드 시간:', new Date().toISOString());
```

### js/main.js (Line 533-542):
```javascript
function loadHeroSlides() {
    console.log('✅ 기본 HTML 슬라이드 사용 (localStorage 무시)');
    
    // 🔥 기존 슬라이드 데이터 완전 삭제
    if (localStorage.getItem('esg_hero_slides')) {
        console.log('⚠️ 기존 슬라이드 데이터 발견 - 삭제 중...');
        localStorage.removeItem('esg_hero_slides');
        console.log('✅ 슬라이드 데이터 삭제 완료');
    }
    
    return;
```

### css/style.css (Line 700-708):
```css
.slide:nth-child(1) {
    background-image: url('../images/hero-slide-1.jpg?v=20250119');
}
```

### index.html:
```html
<link rel="stylesheet" href="css/style.css?v=20250119-slider-fix">
<script src="js/main.js?v=20250119-slider-fix"></script>
```

---

## 🎯 최종 체크리스트

- ✅ 1단계: 완전 초기화 스크립트 실행
- ✅ 2단계: 브라우저 캐시 삭제
- ✅ 3단계: Ctrl + Shift + R (여러 번)
- ✅ 4단계: Console 로그 확인
- ✅ 5단계: 슬라이드 확인 스크립트 실행

**모든 단계를 순서대로 실행하고 결과를 보내주세요!**

---

**수정 완료 시간**: 2026-01-19  
**버전**: v20250119-slider-fix
