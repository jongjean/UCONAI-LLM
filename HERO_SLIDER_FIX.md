# Hero Slider 일관성 수정 완료 ✅ (v2 - 최종)

## 📋 문제 요약
**로그인 상태와 로그아웃 상태에서 메인 페이지의 사진(Hero Slider)이 다르게 표시됨**

**추가 문제**: GenSpark 재시작 후 이전 이미지로 되돌아가는 현상

---

## 🔍 원인 분석

### 1. **JavaScript 동적 렌더링** (`js/main.js`)
```javascript
function loadHeroSlides() {
    // LocalStorage에서 슬라이드 데이터 로드
    const slidesData = JSON.parse(localStorage.getItem('esg_hero_slides') || '[]');
    
    if (slidesData.length === 0) {
        // 데이터 없음 → 기본 HTML 슬라이드 사용
        return;
    }
    
    // 데이터 있음 → 동적으로 슬라이드 생성 (기존 HTML 제거!)
    sliderContainer.innerHTML = '';  // 🔥 문제!
    slidesData.forEach((slide, index) => {
        // 배경 이미지 동적 설정
        slideElement.style.backgroundImage = `url('${slide.image}')`;
    });
}
```

### 2. **문제 시나리오**
- **시나리오 A**: `localStorage.esg_hero_slides` 없음 → 기본 HTML 슬라이드 표시
- **시나리오 B**: `localStorage.esg_hero_slides` 있음 → 동적 슬라이드 표시 (기존 HTML 덮어씀!)
- **시나리오 C**: GenSpark 재시작 → localStorage 불규칙하게 변경됨 → 슬라이드가 바뀜!

**결과**: **예측 불가능한 슬라이드 표시**

---

## ✅ 해결 방법 (최종)

### **옵션 1: loadHeroSlides() 함수 완전 비활성화** ⭐ (채택)

localStorage를 완전히 무시하고 **항상 기본 HTML 슬라이드 사용**

#### **js/main.js** (Line 527)
```javascript
// 슬라이드 동적 생성 - 비활성화 (항상 기본 HTML 슬라이드 사용)
function loadHeroSlides() {
    // 🔥 localStorage 무시하고 항상 기본 HTML 슬라이드 사용
    console.log('✅ 기본 HTML 슬라이드 사용 (localStorage 무시)');
    return;
    
    /* 비활성화된 동적 로딩 코드
    ... (기존 코드 주석 처리)
    */
}

// 페이지 로드 시 슬라이드 렌더링 (현재 비활성화)
loadHeroSlides();
```

### **옵션 2: 로그아웃 시 슬라이드 데이터 삭제** (보조)

만약 향후 동적 로딩을 다시 활성화할 경우를 대비

#### 1. **js/auth.js** (Line 332)
```javascript
logout() {
    playSound('click');
    
    // 스토리지에서 사용자 정보 삭제
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    
    // 🔥 슬라이드 데이터도 초기화
    localStorage.removeItem('esg_hero_slides');
    
    // body에서 user-logged-in 클래스 제거
    document.body.classList.remove('user-logged-in');
    
    this.updateMenuDisplay(false);
    console.log('✅ 로그아웃 완료');
}
```

#### 2. **index.html** (Line 590)
```javascript
btn.addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    // 🔥 슬라이드 데이터도 초기화
    localStorage.removeItem('esg_hero_slides');
    setTimeout(() => {
        window.location.reload();
    }, 300);
});
```

#### 3. **pages/mypage/profile.html** (Line 1040)
```javascript
btn.addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    // 🔥 슬라이드 데이터도 초기화
    localStorage.removeItem('esg_hero_slides');
    setTimeout(() => {
        window.location.href = '../../index.html';
    }, 300);
});
```

#### 4. **includes/header.html** (Line 264)
```javascript
btn.addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    // 🔥 슬라이드 데이터도 초기화
    localStorage.removeItem('esg_hero_slides');
    updateHeaderMenu();
    setTimeout(() => {
        window.location.href = '/index.html';
    }, 300);
});
```

---

## 🎯 수정된 파일 (5개)

### 핵심 수정:
1. ✅ **`js/main.js`** - `loadHeroSlides()` 함수 완전 비활성화 ⭐

### 보조 수정 (향후 대비):
2. ✅ `js/auth.js` - 로그아웃 함수에 슬라이드 데이터 삭제 추가
3. ✅ `index.html` - 인라인 로그아웃 핸들러에 슬라이드 데이터 삭제 추가
4. ✅ `pages/mypage/profile.html` - 인라인 로그아웃 핸들러에 슬라이드 데이터 삭제 추가
5. ✅ `includes/header.html` - 인라인 로그아웃 핸들러에 슬라이드 데이터 삭제 추가

---

## 🧪 테스트 방법

### 1. **localStorage 완전 삭제 (중요!)**
F12 → Console에 입력:
```javascript
localStorage.clear();
sessionStorage.clear();
console.log('✅ 모든 저장소 삭제 완료');
location.reload();
```

### 2. **미리보기 강제 새로고침**
```
Ctrl + Shift + R
```

### 3. **테스트 시나리오**

#### A. 로그아웃 상태
1. 메인 페이지 접속
2. F12 → Console 확인:
   ```
   ✅ 기본 HTML 슬라이드 사용 (localStorage 무시)
   ```
3. Hero Slider 확인 (기본 슬라이드 3개)

#### B. 로그인 상태
1. 로그인: `jongjean@naver.com` / `kjj468600!`
2. 메인 페이지 접속
3. Hero Slider 확인 ← **로그아웃 상태와 완전히 동일!** ✨

#### C. 로그아웃 후
1. 마이페이지 → 로그아웃 클릭
2. 메인 페이지로 자동 이동
3. Hero Slider 확인 ← **여전히 동일한 슬라이드** ✨

#### D. GenSpark 재시작 후
1. GenSpark 종료 → 재시작
2. 메인 페이지 접속
3. Hero Slider 확인 ← **여전히 동일한 슬라이드!** 🎉

---

## 🎉 결과

✅ **로그인/로그아웃/재시작 상태에 관계없이 항상 동일한 슬라이드!**

- `loadHeroSlides()` 함수 완전 비활성화
- localStorage 완전히 무시
- 기본 HTML 슬라이드만 사용
- **100% 일관된 사용자 경험**

---

## 📝 참고사항

### 동적 슬라이드 비활성화 이유
1. **불안정한 localStorage**: GenSpark 재시작 시 데이터 변경됨
2. **예측 불가능**: 사용자마다 다른 슬라이드가 보일 수 있음
3. **유지보수 어려움**: 슬라이드 수정 시 localStorage와 HTML 모두 관리 필요

### 향후 동적 슬라이드가 필요하다면:
1. **서버 API 사용**: localStorage 대신 서버에서 슬라이드 데이터 관리
2. **Database 연동**: RESTful Table API로 슬라이드 데이터 저장
3. **관리자 페이지**: 슬라이드 수정 인터페이스 제공

### 현재 슬라이드 수정 방법:
1. `index.html` (Line 177-197) 직접 수정
2. `css/style.css` (Line 700-708) 배경 이미지 URL 수정
3. `images/` 폴더에 새 이미지 업로드

---

**최종 수정 날짜**: 2026-01-19  
**버전**: v2 (최종)  
**담당**: GenSpark AI Assistant
