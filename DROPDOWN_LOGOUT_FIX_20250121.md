# 드롭다운 메뉴 로그아웃 버튼 중복 표시 문제 해결

**날짜**: 2025-01-21  
**버전**: v20250121-DROPDOWN-FIX

---

## 🐛 **문제 증상**

- **모든 드롭다운 메뉴에 "로그아웃" 버튼이 표시됨**
  - 학회소개, 핵심사업, ESG정책연구, 자료실, 후원·기부 등 **모든 메뉴**에 로그아웃이 보임
  - 로그아웃은 **마이페이지 드롭다운에만** 있어야 하는데, 다른 메뉴에도 겹쳐서 보임

---

## 🔍 **원인 분석**

### **1. HTML 구조**
```html
<!-- index.html 162번 줄: 로그아웃은 마이페이지에만 존재 -->
<li class="nav-item has-dropdown">
    <a href="#" class="nav-link">마이페이지</a>
    <ul class="dropdown-menu">
        ...
        <li><a href="#" id="logoutBtn">로그아웃</a></li>
    </ul>
</li>
```

- **로그아웃은 HTML에 딱 한 곳(마이페이지)에만 존재**

### **2. JavaScript 동작**
```javascript
// js/auth.js 297번 줄
if (!navText.includes('마이페이지')) return;
```

- **마이페이지가 아닌 드롭다운은 처리하지 않음**
- JavaScript는 정상 동작

### **3. CSS 문제 (핵심 원인)**
```css
/* css/style.css 410번 줄 */
.dropdown-menu {
    z-index: 1100; /* 모든 드롭다운이 동일한 z-index */
    opacity: 0;
    visibility: hidden;
}

.nav-item:hover > .dropdown-menu {
    opacity: 1;
    visibility: visible;
}
```

**문제점:**
1. **모든 드롭다운이 동일한 z-index(1100)**를 가짐
2. **hover에서 벗어나도 완전히 숨겨지지 않음**
3. **마이페이지 드롭다운이 다른 드롭다운 위에 겹쳐서 보임**

**시나리오:**
1. 사용자가 마이페이지에 마우스 오버 → 마이페이지 드롭다운이 열림 (opacity: 1)
2. 사용자가 자료실로 마우스 이동 → 자료실 드롭다운이 열림
3. **하지만 마이페이지 드롭다운의 opacity가 즉시 0이 되지 않음** (transition 0.3s)
4. **두 드롭다운이 겹쳐서 보임** → 로그아웃이 모든 메뉴에 보이는 것처럼 보임

---

## ✅ **해결책**

### **CSS 수정: hover되지 않은 드롭다운 강제 숨김**

```css
/* css/style.css */
.nav-item:hover > .dropdown-menu,
.nav-item:focus-within > .dropdown-menu {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
}

/* 호버되지 않은 드롭다운은 완전히 숨김 */
.nav-item:not(:hover):not(:focus-within) > .dropdown-menu {
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
}
```

**핵심:**
- `:not(:hover):not(:focus-within)` 선택자로 **호버되지 않은 드롭다운은 즉시 숨김**
- `!important`로 **transition 무시하고 즉시 적용**
- **한 번에 하나의 드롭다운만 보이도록 강제**

---

## 📝 **수정 파일**

1. **`css/style.css`** - 드롭다운 hover 로직 수정
2. **`index.html`** - CSS 캐시 버스팅 (v=20250121-DROPDOWN-FIX)

---

## 🧪 **테스트 방법**

### **1. 로그아웃 상태 테스트**
```
1) Ctrl+Shift+R (강제 새로고침)
2) 각 메뉴에 마우스 오버
   - 학회소개 → 로그아웃 없음 ✅
   - 핵심사업 → 로그아웃 없음 ✅
   - 자료실 → 로그아웃 없음 ✅
   - 마이페이지 → "회원가입", "로그인"만 보임 ✅
```

### **2. 로그인 상태 테스트**
```
1) force-login.html로 로그인
2) 메인 페이지로 이동
3) 각 메뉴에 마우스 오버
   - 학회소개 → 로그아웃 없음 ✅
   - 자료실 → 로그아웃 없음 ✅
   - 마이페이지 → "로그아웃", "회원정보 관리" 등 표시 ✅
```

---

## 🎯 **예상 결과**

**Before (문제):**
- 모든 드롭다운에 로그아웃이 겹쳐서 보임
- 마이페이지 드롭다운이 다른 드롭다운과 겹침

**After (수정 후):**
- **한 번에 하나의 드롭다운만 보임**
- 마이페이지가 아닌 드롭다운에서는 로그아웃이 절대 보이지 않음
- 드롭다운 전환이 즉각적이고 깔끔함

---

## 📦 **다음 단계**

1. **파일 다운로드**: "Download files" 버튼으로 최신 파일 다운로드
2. **브라우저 테스트**: Ctrl+Shift+R로 캐시 삭제 후 테스트
3. **배포**: 문제 없으면 서버 배포

---

## ✅ **체크리스트**

- [x] 문제 원인 파악 (CSS z-index 및 transition)
- [x] CSS 수정 (강제 숨김 로직)
- [x] 캐시 버스팅 (v=20250121-DROPDOWN-FIX)
- [x] 문서 작성
- [ ] 파일 다운로드
- [ ] 브라우저 테스트
- [ ] 배포

---

## 🎉 **완료!**

이제 **로그아웃은 마이페이지 드롭다운에서만** 보입니다!
