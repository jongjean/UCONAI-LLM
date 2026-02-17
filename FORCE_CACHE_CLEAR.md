# 🔥 긴급: 캐시 강제 무효화 가이드

## 📋 문제 확인
✅ **localStorage에 Unsplash 이미지 있음**
❌ **화면에는 hero-slide-1.jpg (로컬 샘플 이미지) 표시**
❌ **main.js가 구버전으로 캐싱됨**

**원인**: 브라우저가 구버전 `main.js`를 사용 → `loadHeroSlides()` 함수가 실행 안 됨

---

## ✅ 수정 완료

1. ✅ `js/main.js` - 버전 업데이트: `v20250119T2100`
2. ✅ `index.html` - main.js 버전: `?v=20250119T2100`
3. ✅ localStorage 즉시 확인 로그 추가

---

## 🔥 즉시 실행 (순서대로!)

### 1️⃣ **완전 초기화 스크립트**

F12 → Console에 **복사 & 붙여넣기**:

```javascript
console.clear();
console.log('🔥 === 캐시 완전 삭제 시작 ===');

// Service Worker 삭제
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => reg.unregister());
        console.log('✅ Service Worker 삭제');
    });
}

// Cache 삭제
if ('caches' in window) {
    caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
        console.log('✅ Cache 삭제');
    });
}

console.log('✅ 초기화 완료');
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

### 3️⃣ **강제 새로고침 (여러 번!)**

```
Ctrl + Shift + R
```

**최소 5번 이상 눌러주세요!**

---

### 4️⃣ **Console 로그 확인**

새로고침 후 **이 메시지들이 보여야 함**:

```
🚀 main.js 로드 - 버전: v20250119T2100
⏰ 로드 시간: 2026-01-19T...
✅ 포스팅툴 데이터 감지: 3개
⚠️ 포스팅툴 데이터 없음 - 기본 HTML 슬라이드 사용
✅ 포스팅툴 슬라이드 데이터 발견: 3개
  [0] 이미지: https://images.unsplash.com/photo-1497436072909-60f360e1d4b1...
  [1] 이미지: https://images.unsplash.com/photo-1542601906990-b4d3fb778b09...
  [2] 이미지: https://images.unsplash.com/photo-1511578314322-379afb476865...
✅ 포스팅툴 슬라이드 로드 완료
```

---

### 5️⃣ **슬라이드 이미지 확인 스크립트**

```javascript
console.log('=== 최종 확인 ===');

const slideElements = document.querySelectorAll('.slide');
slideElements.forEach((slide, i) => {
    const bg = window.getComputedStyle(slide).backgroundImage;
    console.log(`[${i}] ${bg}`);
});

// Unsplash URL이 보여야 함!
// 예: url("https://images.unsplash.com/photo-...")
```

---

## 🚨 여전히 안 된다면?

### **옵션 A: 시크릿 모드 (필수!)**

```
Ctrl + Shift + N
```

1. 시크릿 창 열기
2. 미리보기 URL 붙여넣기
3. F12 → Console 확인

**시크릿 모드에서 성공하면** → 일반 브라우저 캐시 문제!

---

### **옵션 B: 다른 브라우저**

- Chrome 안 되면 → Firefox
- Edge 안 되면 → Chrome

---

### **옵션 C: localStorage 강제 재설정**

Console에 입력:

```javascript
// 1. 기존 데이터 백업
const backup = localStorage.getItem('esg_hero_slides');
console.log('백업:', backup);

// 2. 삭제
localStorage.removeItem('esg_hero_slides');

// 3. 재설정
localStorage.setItem('esg_hero_slides', backup);

// 4. 새로고침
location.reload(true);
```

---

### **옵션 D: 강제 슬라이드 재생성 (최종 수단)**

Console에 입력:

```javascript
// 🔥 강제로 슬라이드 재생성
const sliderContainer = document.querySelector('.slider-container');
const slidesData = JSON.parse(localStorage.getItem('esg_hero_slides') || '[]');

console.log('슬라이드 데이터:', slidesData.length + '개');

if (slidesData.length > 0 && sliderContainer) {
    // 기존 슬라이드 제거
    sliderContainer.innerHTML = '';
    
    // 새 슬라이드 생성
    slidesData.forEach((slide, index) => {
        const slideElement = document.createElement('div');
        slideElement.className = 'slide' + (index === 0 ? ' active' : '');
        
        if (slide.image) {
            slideElement.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${slide.image}')`;
        }
        
        slideElement.innerHTML = `
            <div class="slide-content">
                <h1 class="slide-title">${slide.title || ''}</h1>
                <p class="slide-text">${slide.description || ''}</p>
                <a href="${slide.buttonLink || '#'}" class="slide-btn">${slide.buttonText || '자세히 보기'}</a>
            </div>
        `;
        
        sliderContainer.appendChild(slideElement);
        console.log(`✅ [${index}] 슬라이드 생성:`, slide.title);
    });
    
    console.log('✅ 슬라이드 강제 생성 완료!');
    console.log('🎨 이제 Unsplash 이미지가 보여야 합니다!');
}
```

**이 스크립트는 즉시 슬라이드를 교체합니다!**

---

## 🎯 예상 결과

### ✅ **성공하면**:

1. Console에 `v20250119T2100` 버전 로그
2. `✅ 포스팅툴 슬라이드 데이터 발견: 3개`
3. Unsplash 이미지 URL 출력
4. **화면에 Unsplash 이미지 표시!**

### ❌ **실패하면**:

1. Console에 버전 로그 없음 → 여전히 구버전
2. `⚠️ 포스팅툴 데이터 없음` → localStorage 문제
3. 여전히 hero-slide-1.jpg 표시 → 캐시 문제

---

## 📝 체크리스트

- [ ] 1단계: 완전 초기화 스크립트 실행
- [ ] 2단계: 브라우저 캐시 수동 삭제
- [ ] 3단계: Ctrl + Shift + R (5번 이상)
- [ ] 4단계: Console 로그 확인 (`v20250119T2100`)
- [ ] 5단계: 슬라이드 이미지 확인 (Unsplash URL)
- [ ] 실패 시: 시크릿 모드 테스트
- [ ] 최종 수단: 강제 슬라이드 재생성 스크립트

---

**모든 단계를 순서대로 실행하고 결과를 알려주세요!** 🚀

특히 **Console에 어떤 버전이 표시되는지** 확인이 가장 중요합니다!

---

**수정 시간**: 2026-01-19 21:00  
**버전**: v20250119T2100  
**상태**: 캐시 버스팅 강화 완료
