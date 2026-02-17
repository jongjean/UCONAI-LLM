# 마이페이지 로그인/로그아웃 메뉴 수정 완료

## 🎯 목표
**미리보기**에서 마이페이지 드롭다운에 로그아웃 버튼이 보이도록 수정

---

## ❌ 문제 원인

### 1. **드롭다운 메뉴 구조 누락**
- `pages/mypage/profile.html`의 마이페이지 드롭다운에 **로그인/로그아웃 메뉴가 없었음**
- 기존에는 정적 메뉴만 존재:
  ```html
  <li><a href="profile.html">회원정보 관리</a></li>
  <li><a href="payment.html">회비 납부</a></li>
  ```

### 2. **로그인 모달 없음**
- `profile.html`에 로그인 모달 HTML이 없어서 로그인 불가

### 3. **login.css 미포함**
- 로그인 모달 스타일시트가 로드되지 않음

---

## ✅ 수정 내용

### 1. **마이페이지 드롭다운 메뉴 추가** (pages/mypage/profile.html)

```html
<li class="nav-item has-dropdown">
    <a href="#" class="nav-link">마이페이지</a>
    <ul class="dropdown-menu">
        <!-- 로그아웃 상태 메뉴 -->
        <li class="auth-only logged-out"><a href="../auth/signup.html"><i class="fas fa-user-plus"></i> 회원가입</a></li>
        <li class="auth-only logged-out"><a href="#" id="topLoginBtn"><i class="fas fa-sign-in-alt"></i> 로그인</a></li>
        
        <!-- 로그인 상태 메뉴 -->
        <li class="auth-only logged-in"><a href="profile.html"><i class="fas fa-user-cog"></i> 회원정보 관리</a></li>
        <li class="auth-only logged-in"><a href="payment.html"><i class="fas fa-credit-card"></i> 회비 납부</a></li>
        <li class="auth-only logged-in"><a href="history.html"><i class="fas fa-history"></i> 납부 내역</a></li>
        <li class="auth-only logged-in"><a href="paper.html"><i class="fas fa-file-alt"></i> 논문 투고 현황</a></li>
        <li class="auth-only logged-in"><a href="event.html"><i class="fas fa-calendar-check"></i> 행사·세미나 신청 내역</a></li>
        <li class="auth-only logged-in"><a href="certificate.html"><i class="fas fa-certificate"></i> 회원증·증명서</a></li>
        <li class="auth-only logged-in"><a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> 로그아웃</a></li>
    </ul>
</li>
```

### 2. **로그인 모달 HTML 추가** (pages/mypage/profile.html)

Footer 직후에 로그인 모달 추가:
```html
<!-- 로그인 모달 -->
<div class="login-modal" id="loginModal">
    <div class="login-modal-overlay"></div>
    <div class="login-modal-content">
        <button class="login-modal-close" aria-label="닫기">
            <i class="fas fa-times"></i>
        </button>
        
        <div class="login-header">
            <h2><i class="fas fa-user-circle"></i> 로그인</h2>
            <p>한국ESG학회 회원 로그인</p>
        </div>
        
        <form class="login-form" id="loginForm">
            <!-- 로그인 폼 내용 -->
        </form>
    </div>
</div>
```

### 3. **login.css 추가** (pages/mypage/profile.html)

```html
<link rel="stylesheet" href="../../css/login.css">
```

### 4. **자동 로그인 스크립트 추가** (테스트용)

```javascript
// 🔥 미리보기 테스트용: 자동 로그인 (배포 시 제거)
if (!localStorage.getItem('user') && !sessionStorage.getItem('user')) {
    const testUser = {
        id: 'jongjean@naver.com',
        name: 'Jongjean',
        role: 'admin',
        loginTime: new Date().toISOString()
    };
    localStorage.setItem('user', JSON.stringify(testUser));
    console.log('🔥 테스트 로그인 자동 실행:', testUser);
}
```

---

## 🔄 동작 원리

### **페이지 로드 시**
1. **자동 로그인 스크립트 실행** → localStorage에 user 저장
2. **auth.js 로드** → `checkLoginStatus()` 실행
3. **user 확인** → `body.classList.add('user-logged-in')`
4. **CSS 자동 전환** → 로그아웃 메뉴 표시

### **CSS 선택자 동작**
```css
/* 기본: 로그아웃 상태 */
.auth-only.logged-out { display: list-item; }
.auth-only.logged-in { display: none; }

/* body.user-logged-in 클래스 추가 시 */
body.user-logged-in .auth-only.logged-out { display: none; }
body.user-logged-in .auth-only.logged-in { display: list-item; }
```

---

## 🧪 테스트 방법

### 1. **미리보기에서 접속**
```
pages/mypage/profile.html
```

### 2. **콘솔 확인** (F12)
```javascript
// 다음 로그가 보여야 함:
// 🔥 테스트 로그인 자동 실행: {id: 'jongjean@naver.com', ...}
// ✅ 기존 로그인 상태 확인: Jongjean
```

### 3. **body 클래스 확인**
```javascript
document.body.classList.contains('user-logged-in')
// true 반환
```

### 4. **드롭다운 확인**
- 상단 네비게이션 → **마이페이지** 클릭
- 드롭다운에 다음 메뉴가 표시되어야 함:
  - ✅ 회원정보 관리
  - ✅ 회비 납부
  - ✅ 납부 내역
  - ✅ 논문 투고 현황
  - ✅ 행사·세미나 신청 내역
  - ✅ 회원증·증명서
  - ✅ **로그아웃** ← 이게 보여야 함!

### 5. **로그아웃 테스트**
- **로그아웃** 클릭
- 콘솔에 `✅ 로그아웃 완료` 표시
- 드롭다운 다시 열면:
  - ✅ 회원가입
  - ✅ 로그인

---

## 📊 예상 결과

### ✅ **성공 케이스**
- 페이지 로드 시 자동 로그인
- body.user-logged-in 클래스 자동 추가
- 드롭다운에 로그아웃 버튼 표시
- 로그아웃 클릭 시 메뉴 전환
- 콘솔 로그 정상 출력

### ❌ **실패 케이스**
- 로그아웃 버튼 안 보임 → CSS 문제
- 로그인 모달 안 열림 → login.css 미로드
- 콘솔 에러 → auth.js 로드 실패

---

## 🚀 다음 단계

### **미리보기 테스트 완료 후**
1. ✅ profile.html 정상 작동 확인
2. 나머지 **5개 마이페이지 파일**도 동일하게 수정:
   - pages/mypage/payment.html
   - pages/mypage/history.html
   - pages/mypage/paper.html
   - pages/mypage/event.html
   - pages/mypage/certificate.html

3. **배포 전 제거할 코드**:
   ```javascript
   // 🔥 미리보기 테스트용: 자동 로그인 (배포 시 제거)
   // 이 부분 전체 삭제
   ```

---

## 📝 수정 파일 목록

1. ✅ **pages/mypage/profile.html**
   - 마이페이지 드롭다운 메뉴 추가
   - 로그인 모달 HTML 추가
   - login.css 추가
   - 자동 로그인 스크립트 추가

---

## ✅ 최종 결론

**미리보기에서 지금 바로 테스트 가능합니다!**

1. `pages/mypage/profile.html` 미리보기 접속
2. 마이페이지 드롭다운 클릭
3. **로그아웃 버튼이 보여야 함**

**성공하면 알려주세요!** 그러면 나머지 5개 파일도 일괄 수정하겠습니다! 🎯
