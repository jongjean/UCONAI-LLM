# 모바일 메뉴 사이드바 개선 - 2025-12-27

## 🎯 작업 내용

햄버거 메뉴를 **좌측 사이드바 형태**로 변경하여 컴팩트하고 사용하기 편리하게 개선

## ✅ 주요 변경사항

### 1. 전체 화면 → 좌측 사이드바
**이전** (❌ 문제):
- 화면 전체를 차지
- 스크롤이 많이 필요
- 닫기 불편

**개선** (✅ 해결):
- 좌측에서 슬라이드 인
- 280px 고정 폭
- 컴팩트한 디자인

### 2. 사이드바 구조
```
┌─────────────────────┐
│ 메뉴 (헤더)         │ ← 초록색 헤더
├─────────────────────┤
│ 학회소개 >          │
│ 학회조직 >          │
│ 회원안내 >          │
│ 핵심사업 >          │
│ 학술지·논문 >       │
│ ESG정책·연구 >      │
│ ...                 │
└─────────────────────┘
```

## 🎨 디자인 특징

### 사이드바 스타일
```css
.nav-menu {
    position: fixed;
    left: -280px;           /* 기본: 화면 밖 */
    width: 280px;           /* 고정 폭 */
    height: 100vh;          /* 전체 높이 */
    background: white;
    z-index: 2000;
}

.nav-menu.active {
    left: 0;                /* 열림: 화면에 표시 */
}
```

### 헤더 스타일
```css
.nav-menu::before {
    content: '메뉴';
    background: var(--primary-green);
    color: white;
    padding: 20px;
    position: sticky;       /* 스크롤 시 고정 */
    top: 0;
}
```

### 오버레이 배경
```css
.menu-overlay {
    background: rgba(0, 0, 0, 0.5);
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 1500;
}
```

## 📱 인터랙션

### 1. 열기/닫기 방법
| 방법 | 동작 |
|------|------|
| **햄버거 버튼** | 메뉴 열기/닫기 토글 |
| **오버레이 클릭** | 메뉴 닫기 |
| **왼쪽 스와이프** | 메뉴 닫기 (터치) |

### 2. 스와이프 기능
```javascript
// 터치 시작 위치 기록
touchstart → touchStartX

// 터치 종료 위치 기록
touchend → touchEndX

// 왼쪽으로 50px 이상 스와이프 시 닫기
if (touchStartX - touchEndX > 50) {
    closeMenu();
}
```

## 🔧 JavaScript 기능

### 메뉴 토글
```javascript
mobileMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuOverlay.classList.toggle('active');
});
```

### 오버레이 클릭
```javascript
menuOverlay.addEventListener('click', () => {
    navMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
});
```

### 스와이프 감지
```javascript
navMenu.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

navMenu.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) {
        closeMenu();
    }
});
```

## 📐 크기 및 간격

| 항목 | 값 |
|------|-----|
| **사이드바 폭** | 280px |
| **헤더 높이** | 60px (padding 20px) |
| **메뉴 항목 패딩** | 12px 20px |
| **폰트 크기** | 0.85rem |
| **드롭다운 패딩** | 10px 30px |
| **드롭다운 폰트** | 0.8rem |

## 🌟 개선 효과

### Before (전체 화면 메뉴)
```
┌─────────────────────────┐
│                         │
│ 학회소개                │
│ 학회조직                │
│ 회원안내                │
│ ...                     │
│ (화면 전체 차지)        │
│                         │
│                         │
└─────────────────────────┘
```

### After (사이드바 메뉴)
```
┌────┬──────────────────┐
│메뉴│ Content          │
│────│                  │
│학회│                  │
│학회│                  │
│회원│                  │
│...│                  │
└────┴──────────────────┘
```

## 💡 사용자 경험 개선

- ✅ **공간 효율**: 280px만 사용
- ✅ **컨텐츠 보임**: 나머지 화면은 컨텐츠 보임
- ✅ **빠른 닫기**: 오버레이 클릭 또는 스와이프
- ✅ **자연스러움**: 앱 같은 UX
- ✅ **컴팩트**: 작은 폰트와 간격

## 📂 수정 파일

1. ✅ **css/style.css**
   - 사이드바 스타일
   - 오버레이 스타일
   - 모바일 메뉴 레이아웃

2. ✅ **index.html**
   - 오버레이 div 추가

3. ✅ **js/main.js**
   - 오버레이 클릭 이벤트
   - 스와이프 제스처 감지

## 🚀 배포

**Publish 탭**에서 다운로드!

---

**작성일**: 2025-12-27  
**상태**: ✅ 완료 - 좌측 사이드바 메뉴!  
**특징**: 스와이프로 닫기, 오버레이 클릭 닫기
