# 로그인 상태창 추가 - 2025-12-27

## 🎯 기능

사용자의 로그인 상태를 실시간으로 표시하는 상태창 추가

## ✅ 구현 내용

### 1. HTML 구조 (index.html)

```html
<!-- 로그인 상태창 -->
<div class="user-status">
    <!-- 로그인 전 -->
    <div class="user-status-logged-out">
        <a href="pages/member/process.html" class="status-link">회원가입</a>
        <span class="status-divider">|</span>
        <a href="pages/mypage/profile.html" class="status-link">로그인</a>
    </div>
    
    <!-- 로그인 후 -->
    <div class="user-status-logged-in" style="display: none;">
        <div class="user-info">
            <i class="fas fa-user-circle"></i>
            <span class="user-name">홍길동</span>님
        </div>
        <a href="pages/mypage/profile.html" class="status-btn">마이페이지</a>
        <button class="status-btn logout-btn">로그아웃</button>
    </div>
</div>
```

### 2. CSS 스타일 (css/style.css)

#### 데스크톱 스타일
- 메뉴 오른쪽에 배치 (margin-left: 20px)
- 로그인 전: 회원가입 | 로그인 링크
- 로그인 후: 사용자 정보 + 마이페이지 + 로그아웃 버튼

#### 모바일 스타일 (900px 이하)
- 우상단에 절대 위치 (햄버거 메뉴 왼쪽)
- 세로 배열로 변경
- 작은 폰트와 패딩

### 3. JavaScript 기능 (js/main.js)

#### 주요 기능
```javascript
// 로그인 상태 확인 (localStorage)
checkLoginStatus()

// 로그인 상태 표시
showLoggedInStatus(userData)

// 로그아웃 상태 표시
showLoggedOutStatus()

// 로그아웃 버튼
logoutBtn.addEventListener('click', ...)
```

#### 테스트 방법
브라우저 콘솔에서 실행:
```javascript
// 로그인 테스트
testLogin({name: '홍길동', email: 'hong@example.com'});

// 로그아웃 테스트
localStorage.removeItem('user');
location.reload();
```

## 📱 반응형 동작

### 데스크톱 (900px 초과)
```
┌─────────────────────────────────────────────────────────┐
│ 한국ESG학회  [메뉴들...]  회원가입 | 로그인              │
└─────────────────────────────────────────────────────────┘
```

### 모바일 (900px 이하)
```
┌─────────────────────────────────────────┐
│ 한국ESG학회            회원가입  [☰]    │
│                        로그인            │
└─────────────────────────────────────────┘
```

## 🎨 디자인 특징

### 로그인 전
- 간단한 링크 스타일
- 구분선 (|) 사용
- 호버 시 초록색

### 로그인 후
- 사용자 아이콘 + 이름 표시
- 둥근 배경 (pill 스타일)
- 마이페이지 버튼 (초록색 테두리)
- 로그아웃 버튼 (회색 → 빨강색 호버)

## 💾 데이터 저장

### localStorage 사용
```javascript
// 저장
{
    "name": "홍길동",
    "email": "hong@example.com"
}

// 키: 'user'
```

### 보안 참고
- 실제 프로덕션: JWT 토큰 사용 권장
- 현재는 클라이언트 사이드 데모용

## 📂 수정 파일
- `index.html` (로그인 상태창 HTML 추가)
- `css/style.css` (스타일 추가)
- `js/main.js` (로그인 관리 기능 추가)

## 🚀 배포
**Publish 탭**에서 다운로드!

## 📸 화면 예시

### 로그인 전
```
회원가입 | 로그인
```

### 로그인 후
```
👤 홍길동님   [마이페이지]  [로그아웃]
```

---

**작성일**: 2025-12-27  
**상태**: ✅ 완료 - 로그인 상태창 추가!
