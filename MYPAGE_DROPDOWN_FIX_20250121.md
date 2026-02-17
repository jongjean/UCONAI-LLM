# 마이페이지 드롭다운 메뉴 버그 수정
**날짜**: 2025-01-21  
**문제**: 로그아웃 버튼이 모든 드롭다운 메뉴에 중복 표시되는 버그

---

## 🐛 **문제 현상**

### Before (수정 전)
1. 마이페이지 드롭다운 클릭
2. ✅ 로그아웃 버튼 표시 (정상)
3. 다른 메뉴 드롭다운 클릭 (예: 학술지·논문, ESG정책연구)
4. ❌ 로그아웃 버튼이 이 메뉴에도 표시됨 (비정상!)

**스크린샷에서 확인된 증상:**
- "후원·기부" 메뉴에 로그아웃 버튼 표시
- "학술지·논문" 메뉴에 로그아웃 버튼 표시
- "ESG정책연구" 메뉴에도 로그아웃 버튼 표시

---

## 🔍 **원인 분석**

### 코드 분석
```javascript
// js/auth.js - updateMenuDisplay() 함수 (수정 전)

updateMenuDisplay(isLoggedIn) {
    // ❌ 문제: 모든 드롭다운 메뉴를 순회
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    
    dropdowns.forEach(dropdown => {
        // 각 드롭다운의 모든 항목을 검사
        const menuItems = dropdown.querySelectorAll('li');
        
        menuItems.forEach(item => {
            const text = link.textContent.trim();
            
            // ❌ 문제: text.includes('로그아웃')으로 판별
            // 이로 인해 모든 드롭다운에서 "로그아웃" 텍스트가 
            // 있는 항목을 표시하려고 시도
            const isUserMenu = text.includes('로그아웃') || ...
        });
    });
}
```

**핵심 문제:**
- `document.querySelectorAll('.dropdown-menu')`로 **모든** 드롭다운 메뉴 선택
- 로그아웃 버튼은 마이페이지 드롭다운에만 있어야 함
- 하지만 로직이 모든 드롭다운을 순회하면서 메뉴 항목을 표시/숨김 처리
- 결과적으로 다른 드롭다운에도 영향을 미침

---

## ✅ **해결 방법**

### 수정된 코드
```javascript
// js/auth.js - updateMenuDisplay() 함수 (수정 후)

updateMenuDisplay(isLoggedIn) {
    // ✅ 해결: 마이페이지가 있는 nav-item만 찾기
    const navItems = document.querySelectorAll('.nav-item.has-dropdown');
    
    navItems.forEach(navItem => {
        const navLink = navItem.querySelector('.nav-link');
        if (!navLink) return;
        
        const navText = navLink.textContent.trim();
        
        // ✅ 해결: 마이페이지 드롭다운인지 확인
        if (!navText.includes('마이페이지')) return;
        
        // 마이페이지 드롭다운만 처리
        const dropdown = navItem.querySelector('.dropdown-menu');
        if (!dropdown) return;
        
        const menuItems = dropdown.querySelectorAll('li');
        // ... 메뉴 표시/숨김 로직
    });
}
```

### 핵심 변경 사항
1. **선택자 변경**: 
   - Before: `.dropdown-menu` (모든 드롭다운)
   - After: `.nav-item.has-dropdown` → `마이페이지` 포함 여부 확인

2. **필터링 추가**:
   ```javascript
   if (!navText.includes('마이페이지')) return;
   ```

3. **스코프 제한**:
   - 마이페이지 드롭다운에서만 메뉴 항목 처리
   - 다른 드롭다운은 완전히 무시

---

## 📦 **수정된 파일**

1. **`js/auth.js`**
   - `updateMenuDisplay()` 함수 수정
   - 마이페이지 드롭다운만 처리하도록 변경
   - 디버깅 로그 정리

2. **`index.html`**
   - 스크립트 버전 업데이트: `?v=20250121-MYPAGE-ONLY`
   - 캐시 무효화

---

## 🧪 **테스트 방법**

### 1. 로그아웃 상태 테스트
```
1. 브라우저 캐시 강제 새로고침 (Ctrl+Shift+R)
2. 마이페이지 클릭
   → ✅ "회원가입", "로그인" 표시
   → ❌ 다른 메뉴는 표시 안됨
3. 다른 메뉴 클릭 (학술지·논문, ESG정책연구 등)
   → ✅ 각 메뉴의 정상 항목만 표시
   → ❌ 로그아웃 버튼 표시 안됨 (정상!)
```

### 2. 로그인 상태 테스트
```
1. force-login.html로 관리자 로그인
2. 메인 페이지로 이동
3. 마이페이지 클릭
   → ✅ "회원정보 관리", "회비 납부", "로그아웃" 등 표시
   → ❌ "회원가입", "로그인" 숨겨짐
4. 다른 메뉴 클릭 (학술지·논문, ESG정책연구 등)
   → ✅ 각 메뉴의 정상 항목만 표시
   → ❌ 로그아웃 버튼 표시 안됨 (정상!)
```

### 3. 브라우저 콘솔 확인
```javascript
// 정상 로그 (수정 후)
🔍 메뉴 업데이트 시작 - 로그인 상태: true
✅ 메뉴 업데이트 완료 - 로그인 상태: true

// 이전 로그 (수정 전)
🔥 로그아웃 버튼 발견: { ... }  // 여러 번 출력됨 (비정상)
```

---

## 📊 **Before / After 비교**

| 항목 | Before (수정 전) | After (수정 후) |
|------|------------------|-----------------|
| **마이페이지 드롭다운** | ✅ 로그아웃 버튼 표시 | ✅ 로그아웃 버튼 표시 |
| **학술지·논문 드롭다운** | ❌ 로그아웃 버튼 표시 (버그!) | ✅ 정상 (로그아웃 버튼 없음) |
| **ESG정책연구 드롭다운** | ❌ 로그아웃 버튼 표시 (버그!) | ✅ 정상 (로그아웃 버튼 없음) |
| **후원·기부 드롭다운** | ❌ 로그아웃 버튼 표시 (버그!) | ✅ 정상 (로그아웃 버튼 없음) |

---

## 🔐 **보안 영향**

### 변경 전
- 로그아웃 버튼이 모든 메뉴에 표시되어 혼란 야기
- 사용자 경험 저하
- 보안 문제는 없음 (클릭 시 정상 작동)

### 변경 후
- 로그아웃 버튼이 마이페이지에만 표시
- 명확한 사용자 인터페이스
- 정상적인 동작

---

## 📝 **추가 정보**

### HTML 구조
```html
<!-- index.html -->
<li class="nav-item has-dropdown">
    <a href="#" class="nav-link">
        <i class="fas fa-user-circle"></i> 마이페이지
    </a>
    <ul class="dropdown-menu">
        <li><a href="#" onclick="openSignupModal()">회원가입</a></li>
        <li><a href="#" id="loginBtn">로그인</a></li>
        <li><a href="pages/mypage/profile.html">회원정보 관리</a></li>
        ...
        <li><a href="#" id="logoutBtn">로그아웃</a></li> <!-- 여기에만 있어야 함 -->
    </ul>
</li>
```

### 로그아웃 버튼 식별
- **ID**: `logoutBtn`
- **텍스트**: "로그아웃"
- **위치**: 마이페이지 드롭다운 (`.nav-item.has-dropdown` 내)

---

## ✅ **완료 체크리스트**

- [x] 문제 원인 파악
- [x] `updateMenuDisplay()` 함수 수정
- [x] 마이페이지 드롭다운만 처리하도록 변경
- [x] 스크립트 버전 업데이트 (캐시 무효화)
- [x] 문서 작성
- [ ] 로컬 테스트
- [ ] 배포
- [ ] 배포 후 테스트

---

## 🚀 **배포 절차**

1. **파일 다운로드**
   ```
   파일 탐색기 → Download files 버튼
   ```

2. **Ctrl+Shift+R 강제 새로고침**
   - 브라우저 캐시 무효화

3. **테스트**
   - 모든 드롭다운 메뉴 클릭
   - 로그아웃 버튼이 마이페이지에만 표시되는지 확인

---

**다음 단계: 파일 다운로드 → 로컬 테스트 → 배포** 🚀
