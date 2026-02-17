# 🚨 문제 확인 - 로그인/로그아웃 UI 누락

## 2025-01-19 20:20 KST

---

## 🔍 발견된 문제

### **index.html에 로그인/로그아웃 UI가 없습니다!**

#### 현재 상태

**index.html (메인 페이지)**:
```html
<nav class="navbar">
    <ul class="nav-menu">
        <li class="nav-item has-dropdown">
            <a href="#" class="nav-link">마이페이지</a>
            <ul class="dropdown-menu">
                <li><a href="pages/auth/signup.html">회원가입</a></li>
                <li><a href="pages/auth/login.html">로그인</a></li>
                <!-- 다른 메뉴들 -->
            </ul>
        </li>
    </ul>
</nav>
```

**문제점**:
- ❌ 우측 상단에 로그인 버튼 없음
- ❌ 로그아웃 버튼 없음
- ❌ 사용자 이름 표시 영역 없음
- ✅ 서브페이지들에는 있음

---

## 🔍 서브페이지 구조 (정상)

**예: pages/about/greeting-new.html**:
```html
<ul class="nav-menu">
    <!-- ... 메뉴들 ... -->
    
    <!-- 로그인 전 -->
    <li class="auth-only logged-out">
        <a href="#" id="loginBtn">
            <i class="fas fa-sign-in-alt"></i> 로그인
        </a>
    </li>
    
    <!-- 로그인 후 -->
    <li class="auth-only logged-in" style="display: none;">
        <span class="user-name">홍길동</span>
        <a href="#" id="logoutBtn">
            <i class="fas fa-sign-out-alt"></i> 로그아웃
        </a>
    </li>
</ul>
```

---

## 💡 왜 이런 문제가?

### 메인 페이지가 구버전

**증거**:
```
index.html: Dec 30 13:26
서브페이지들: 로그인 UI 포함됨
```

**이유**:
1. 로그인 시스템이 12월 30일 이후 추가됨
2. 서브페이지들은 업데이트됨
3. **index.html은 업데이트되지 않음**

---

## 🎯 즉시 수정

### index.html에 로그인 UI 추가

**위치**: `<nav class="navbar">` 내부, `<ul class="nav-menu">` 끝부분

**추가할 코드**:
```html
<!-- 로그인/로그아웃 UI -->
<li class="nav-item auth-item user-status-logged-out">
    <a href="#" id="loginBtn" class="nav-link auth-btn" data-sound-click="true">
        <i class="fas fa-sign-in-alt"></i> 로그인
    </a>
</li>

<li class="nav-item auth-item user-status-logged-in" style="display: none;">
    <div class="user-info">
        <span class="user-name"></span>
        <a href="#" id="logoutBtn" class="nav-link logout-btn" data-sound-click="true">
            <i class="fas fa-sign-out-alt"></i> 로그아웃
        </a>
    </div>
</li>
```

---

## 📋 전체 수정 계획

### 1. index.html 네비게이션 업데이트
- 로그인 버튼 추가
- 로그아웃 버튼 추가
- 사용자 이름 표시 영역 추가

### 2. 로그인 모달 추가
- 로그인 폼 HTML 추가
- 모달 배경 추가

### 3. CSS 확인
- 로그인 UI 스타일 확인
- auth-item 클래스 스타일 확인

### 4. JavaScript 연동 확인
- auth.js 로드 확인
- updateLoginStatus() 함수 동작 확인

---

## 🚀 지금 수정하겠습니다!

**수정 예상 시간**: 3-5분
**수정 파일**: index.html
**추가 내용**: 로그인/로그아웃 UI + 로그인 모달

**수정 후 재배포 필요합니다!**
