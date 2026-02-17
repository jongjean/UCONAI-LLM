# 마이페이지 드롭다운 메뉴 업데이트 가이드

## 🎯 목적
사용자의 요청: "마이페이지 드롭메뉴에 회원가입 로그인(로그아웃) 메뉴 추가해줘"

## ✅ 완료된 작업

### 1. 파일 생성
- ✅ `includes/header.html` - 공통 헤더 컴포넌트
- ✅ `js/header-loader.js` - 헤더 동적 로딩 스크립트
- ✅ `update_all_mypage_menus.py` - 일괄 업데이트 스크립트
- ✅ `batch_add_auth_menu.py` - 보조 업데이트 스크립트
- ✅ `MYPAGE_MENU_UPDATE_REPORT.md` - 상세 업데이트 보고서
- ✅ `README.md` 버전 업데이트 (v3.15 → v3.16)

### 2. 페이지 수동 업데이트 완료
다음 페이지들의 마이페이지 드롭다운 메뉴를 업데이트했습니다:
- ✅ `index.html`
- ✅ `pages/about/greeting-new.html`
- ✅ `pages/about/purpose.html`
- ✅ `pages/about/history.html`
- ✅ `pages/about/constitution.html`

### 3. 새로운 메뉴 구조

#### 로그인 전 (로그아웃 상태)
```html
<li class="auth-only logged-out">
  <a href="../auth/signup.html">
    <i class="fas fa-user-plus"></i> 회원가입
  </a>
</li>
<li class="auth-only logged-out">
  <a href="../auth/login.html">
    <i class="fas fa-sign-in-alt"></i> 로그인
  </a>
</li>
<li class="auth-only logged-out dropdown-divider"></li>
```

#### 로그인 후 (로그인 상태)
```html
<li class="auth-only logged-in">
  <a href="../mypage/profile.html">
    <i class="fas fa-user-edit"></i> 회원정보 관리
  </a>
</li>
<!-- ... 기타 마이페이지 메뉴들 ... -->
<li class="auth-only logged-in dropdown-divider"></li>
<li class="auth-only logged-in">
  <a href="#" id="logoutBtn">
    <i class="fas fa-sign-out-alt"></i> 로그아웃
  </a>
</li>
```

## 📝 남은 작업

### 옵션 1: Python 스크립트 실행 (권장)
```bash
# 프로젝트 루트 디렉토리에서 실행
python3 update_all_mypage_menus.py
```

이 스크립트가 자동으로:
- 모든 HTML 파일 탐색
- 마이페이지 드롭다운 메뉴 찾기
- 회원가입/로그인/로그아웃 메뉴 추가
- 아이콘 삽입
- 경로 자동 계산

### 옵션 2: 수동 업데이트
각 HTML 파일을 열어서 마이페이지 드롭다운 메뉴 부분을 아래 구조로 교체:

```html
<li class="nav-item has-dropdown">
    <a href="#" class="nav-link"><i class="fas fa-user-circle"></i> 마이페이지</a>
    <ul class="dropdown-menu">
        <!-- 로그인 전 메뉴 -->
        <li class="auth-only logged-out"><a href="../auth/signup.html"><i class="fas fa-user-plus"></i> 회원가입</a></li>
        <li class="auth-only logged-out"><a href="../auth/login.html"><i class="fas fa-sign-in-alt"></i> 로그인</a></li>
        <li class="auth-only logged-out dropdown-divider"></li>
        
        <!-- 로그인 후 메뉴 -->
        <li class="auth-only logged-in"><a href="../mypage/profile.html"><i class="fas fa-user-edit"></i> 회원정보 관리</a></li>
        <li class="auth-only logged-in"><a href="../mypage/payment.html"><i class="fas fa-credit-card"></i> 회비 납부</a></li>
        <li class="auth-only logged-in"><a href="../mypage/history.html"><i class="fas fa-history"></i> 납부 내역</a></li>
        <li class="auth-only logged-in"><a href="../mypage/paper.html"><i class="fas fa-file-alt"></i> 논문 투고 현황</a></li>
        <li class="auth-only logged-in"><a href="../mypage/event.html"><i class="fas fa-calendar-check"></i> 행사·세미나 신청 내역</a></li>
        <li class="auth-only logged-in"><a href="../mypage/certificate.html"><i class="fas fa-certificate"></i> 회원증·증명서</a></li>
        <li class="auth-only logged-in dropdown-divider"></li>
        <li class="auth-only logged-in"><a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> 로그아웃</a></li>
    </ul>
</li>
```

**주의사항:**
- `index.html`의 경우 경로가 `pages/auth/signup.html` (상대 경로 다름)
- 서브페이지는 `../auth/signup.html` 형식

### 업데이트가 필요한 페이지 목록

#### pages/organization/ (3개)
- [ ] executives.html
- [ ] committees.html
- [ ] divisions.html

#### pages/member/ (7개)
- [ ] types.html
- [ ] process.html
- [ ] fee.html
- [ ] benefits.html
- [ ] companies.html
- [ ] types-new.html
- [ ] application.html

#### pages/core/ (10개)
- [ ] forum.html
- [ ] award.html
- [ ] ordinance.html
- [ ] seminar.html
- [ ] main-services.html
- [ ] consulting.html
- [ ] education.html
- [ ] certification.html
- [ ] forum-new.html

#### pages/journal/ (8개)
- [ ] about.html
- [ ] submission.html
- [ ] editorial.html
- [ ] review.html
- [ ] archive.html
- [ ] dbpia-embed.html
- [ ] editorial-board.html
- [ ] search.html

#### pages/policy/ (5개)
- [ ] research.html
- [ ] standards.html
- [ ] law.html
- [ ] global.html
- [ ] reports.html

#### pages/news/ (7개)
- [ ] main.html
- [ ] policy.html
- [ ] cases.html
- [ ] press.html
- [ ] column.html
- [ ] video.html
- [ ] esg-news-embed.html
- [ ] domestic.html

#### pages/community/ (6개)
- [ ] notice.html
- [ ] forum.html
- [ ] discussion.html
- [ ] member-news.html
- [ ] qna.html
- [ ] free-board.html
- [ ] notice-new.html

#### pages/materials/ (5개)
- [ ] academic.html
- [ ] policy.html
- [ ] presentation.html
- [ ] report.html
- [ ] video.html

#### pages/support/ (4개)
- [ ] guide.html
- [ ] corporate.html
- [ ] personal.html
- [ ] usage.html

#### pages/mypage/ (6개)
- [ ] profile.html
- [ ] payment.html
- [ ] history.html
- [ ] paper.html
- [ ] event.html
- [ ] certificate.html

#### 기타
- [ ] pages/about/greeting.html
- [ ] pages/about/ci.html
- [ ] pages/about/location.html

**총계: 약 63개 페이지**

## 🔍 확인 방법

업데이트 후 브라우저에서 확인:
1. 아무 페이지 열기
2. 상단 메뉴에서 "마이페이지" 클릭
3. 드롭다운에서 "회원가입", "로그인" 메뉴 확인
4. 로그인 후 "로그아웃" 버튼 확인

## 💡 기술 세부사항

### CSS 클래스
- `.auth-only` - 인증 관련 메뉴 항목
- `.logged-out` - 로그아웃 상태에서만 표시
- `.logged-in` - 로그인 상태에서만 표시
- `.dropdown-divider` - 메뉴 구분선

### JavaScript 로직
```javascript
// 로그인 상태 확인
const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

// 메뉴 표시/숨김
if (isLoggedIn) {
    document.querySelectorAll('.logged-out').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.logged-in').forEach(el => el.style.display = 'block');
} else {
    document.querySelectorAll('.logged-out').forEach(el => el.style.display = 'block');
    document.querySelectorAll('.logged-in').forEach(el => el.style.display = 'none');
}
```

## 📚 참고 문서
- `MYPAGE_MENU_UPDATE_REPORT.md` - 상세 업데이트 보고서
- `MYPAGE_AUTH_IMPLEMENTATION_REPORT.md` - 인증 시스템 구현 보고서
- `README.md` - 프로젝트 전체 문서

---

**업데이트 일시**: 2024-12-30  
**버전**: v3.16  
**담당**: AI Assistant
