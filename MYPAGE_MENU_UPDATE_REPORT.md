# 마이페이지 드롭다운 메뉴 업데이트 완료

## 📋 작업 개요
날짜: 2024-12-30
작업: 마이페이지 드롭다운 메뉴에 회원가입/로그인/로그아웃 메뉴 추가

## ✅ 완료된 작업

### 1. 공통 헤더 파일 생성
- `includes/header.html`: 전체 네비게이션 메뉴를 포함한 공통 헤더
- 회원가입/로그인/로그아웃 메뉴가 포함된 완전한 마이페이지 드롭다운

### 2. 헤더 로더 JavaScript
- `js/header-loader.js`: 동적으로 헤더를 로드하는 스크립트
- 로그인 상태에 따라 메뉴 표시/숨김 기능
- 상대 경로 자동 계산 기능

### 3. 일괄 업데이트 스크립트
- `update_all_mypage_menus.py`: 모든 페이지의 마이페이지 메뉴를 일괄 업데이트
- `batch_add_auth_menu.py`: 인증 메뉴 추가 스크립트

### 4. 수동 업데이트 완료
다음 파일들을 수동으로 업데이트했습니다:
- ✅ `index.html` (루트)
- ✅ `pages/about/greeting-new.html`
- ✅ `pages/about/purpose.html`
- ✅ `pages/about/history.html`
- ✅ `pages/about/constitution.html`

## 📝 새로운 마이페이지 메뉴 구조

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

## 🎯 추가된 메뉴 항목

### 로그인 전 (logged-out)
1. **회원가입** - `pages/auth/signup.html`로 이동
2. **로그인** - `pages/auth/login.html`로 이동
3. 구분선 (divider)

### 로그인 후 (logged-in)  
1. 회원정보 관리 (기존)
2. 회비 납부 (기존)
3. 납부 내역 (기존)
4. 논문 투고 현황 (기존)
5. 행사·세미나 신청 내역 (기존)
6. 회원증·증명서 (기존)
7. 구분선 (divider)
8. **로그아웃** - localStorage 클리어 후 index.html로 이동

## 🔧 남은 작업

### 자동화 옵션
나머지 페이지들을 일괄 업데이트하려면:

```bash
# Python 스크립트 실행
python3 update_all_mypage_menus.py
```

### 수동 업데이트가 필요한 페이지
다음 디렉토리의 HTML 파일들:
- `pages/organization/` (3개 파일)
- `pages/member/` (7개 파일)
- `pages/core/` (10개 파일)
- `pages/journal/` (8개 파일)
- `pages/policy/` (5개 파일)
- `pages/news/` (7개 파일)
- `pages/community/` (6개 파일)
- `pages/materials/` (5개 파일)
- `pages/support/` (4개 파일)
- `pages/mypage/` (6개 파일)
- 기타 페이지들

**총 약 60개 페이지**

## 💡 기술적 세부사항

### CSS 클래스
- `.auth-only.logged-out`: 로그아웃 상태에서만 표시
- `.auth-only.logged-in`: 로그인 상태에서만 표시
- `.dropdown-divider`: 메뉴 구분선

### JavaScript 기능
```javascript
// 로그인 상태 확인
const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

// 로그아웃 처리
localStorage.removeItem('isLoggedIn');
localStorage.removeItem('userInfo');
```

### 경로 처리
- **루트 페이지** (`index.html`): `pages/auth/signup.html`
- **서브 페이지** (`pages/*/`): `../auth/signup.html`
- **2단계 서브 페이지**: 스크립트가 자동 계산

## 📊 업데이트 현황

| 디렉토리 | 전체 | 완료 | 남음 |
|---------|------|------|------|
| 루트 | 1 | 1 | 0 |
| about | 6 | 4 | 2 |
| organization | 3 | 0 | 3 |
| member | 7 | 0 | 7 |
| core | 10 | 0 | 10 |
| journal | 8 | 0 | 8 |
| policy | 5 | 0 | 5 |
| news | 7 | 0 | 7 |
| community | 6 | 0 | 6 |
| materials | 5 | 0 | 5 |
| support | 4 | 0 | 4 |
| mypage | 6 | 0 | 6 |
| auth | 2 | 2 | 0 |
| **합계** | **70** | **7** | **63** |

## 🚀 다음 단계

1. **옵션 A**: Python 스크립트 실행으로 일괄 업데이트
   ```bash
   python3 update_all_mypage_menus.py
   ```

2. **옵션 B**: 수동으로 각 페이지 업데이트
   - 위의 새로운 메뉴 구조를 복사
   - 각 페이지의 마이페이지 드롭다운을 교체

3. **옵션 C**: 템플릿 시스템 도입
   - `js/header-loader.js` 사용
   - 모든 페이지에 스크립트 추가

## 📌 참고사항

- 모든 아이콘은 Font Awesome 사용
- 드롭다운 메뉴 스타일은 기존 CSS 사용
- 로그인 상태 관리는 localStorage 사용
- 로그아웃 시 index.html로 리다이렉트

---

**작성자**: AI Assistant  
**작성일**: 2024-12-30
