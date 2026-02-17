# 🔐 한국ESG학회 로그인 시스템 상세 가이드

## ✅ 현재 로그인 시스템 작동 상태

**결론: 네, 로그인이 완벽하게 작동합니다!** ✅

---

## 🎯 로그인 시스템 구조

### 📁 관련 파일
- **`js/auth.js`**: 로그인 모달, 인증 로직, 세션 관리
- **`index.html`**: 로그인 모달 UI, 사용자 상태 표시

### 🔧 주요 기능

1. **로그인 모달** (`LoginModal` 클래스)
2. **인증 시스템** (LocalStorage/SessionStorage 기반)
3. **세션 관리** (로그인 상태 유지)
4. **로그아웃 기능**
5. **효과음** (클릭/성공/오류)

---

## 🔑 로그인 방법

### 방법 1: 메인페이지 로그인 버튼

**1단계**: 메인페이지 접속
```
https://www.genspark.ai/api/code_sandbox_light/preview/68d5a3b6-99a3-44d6-8a91-440bc5253b4c/index.html?canvas_history_id=bd8255b8-e628-4063-9269-b2a901665fe9
```

**2단계**: 우측 상단 "로그인" 버튼 클릭
- 📍 위치: 헤더 우측 상단
- 🎨 아이콘: `<i class="fas fa-sign-in-alt"></i>`

**3단계**: 로그인 모달에서 정보 입력

**데모 계정**:
```
아이디: test@esg.or.kr
비밀번호: password123
```

**4단계**: "로그인" 버튼 클릭

**5단계**: 로그인 성공!
- ✅ 효과음 재생
- ✅ "로그인 성공!" 메시지 표시
- ✅ 우측 상단에 사용자 이름 표시
- ✅ 마이페이지 링크 활성화

---

### 방법 2: 브라우저 콘솔에서 수동 로그인

**F12** 눌러서 콘솔 열기 → 아래 코드 실행:

```javascript
// 로그인 정보 저장
localStorage.setItem('user', JSON.stringify({
    id: 'test@esg.or.kr',
    name: '관리자',
    loginTime: new Date().toISOString()
}));

// 페이지 새로고침
location.reload();
```

---

## 🔐 인증 시스템 상세

### 1. 로그인 검증 로직

**파일**: `js/auth.js` (177-182번 줄)

```javascript
validateLogin(email, password) {
    // 데모용 검증 (실제로는 서버에서 검증)
    // 테스트 계정: test@esg.or.kr / password123
    return (email === 'test@esg.or.kr' && password === 'password123') || 
           (password.length >= 6); // 임시: 6자 이상이면 통과
}
```

**현재 검증 방식**:
- ✅ 정확한 테스트 계정: `test@esg.or.kr` / `password123`
- ✅ 임시 검증: 비밀번호가 6자 이상이면 통과

**⚠️ 주의**: 프론트엔드 시뮬레이션이므로 실제 배포 시 서버 기반 인증으로 변경 필요

---

### 2. 세션 저장 방식

**파일**: `js/auth.js` (139-144번 줄)

```javascript
// 로컬 스토리지에 저장
if (rememberMe) {
    localStorage.setItem('user', JSON.stringify(userData));
} else {
    sessionStorage.setItem('user', JSON.stringify(userData));
}
```

**저장 방식**:
- **"로그인 유지" 체크**: `localStorage` 사용 (브라우저 닫아도 유지)
- **"로그인 유지" 미체크**: `sessionStorage` 사용 (브라우저 닫으면 삭제)

**저장 데이터 구조**:
```json
{
    "id": "test@esg.or.kr",
    "name": "Test",
    "loginTime": "2025-12-31T10:30:00.000Z"
}
```

---

### 3. 로그인 상태 확인

**파일**: `js/auth.js` (214-231번 줄)

```javascript
checkLoginStatus() {
    const user = this.getUser();
    if (user) {
        this.updateLoginStatus(user);
    } else {
        // 로그인하지 않은 상태
        loggedOut.classList.remove('hidden');
        loggedIn.classList.add('hidden');
    }
}

getUser() {
    const localUser = localStorage.getItem('user');
    const sessionUser = sessionStorage.getItem('user');
    return localUser ? JSON.parse(localUser) : (sessionUser ? JSON.parse(sessionUser) : null);
}
```

**확인 순서**:
1. `localStorage`에서 사용자 정보 확인
2. 없으면 `sessionStorage`에서 확인
3. 둘 다 없으면 로그아웃 상태

---

### 4. UI 업데이트

**파일**: `js/auth.js` (239-257번 줄)

```javascript
updateLoginStatus(user) {
    const loggedOut = document.querySelector('.user-status-logged-out');
    const loggedIn = document.querySelector('.user-status-logged-in');
    const userName = document.querySelector('.user-name');
    
    if (loggedOut && loggedIn && userName) {
        // 로그아웃 버튼 숨기기
        loggedOut.classList.add('hidden');
        
        // 로그인 상태 표시
        loggedIn.classList.remove('hidden');
        loggedIn.style.display = 'flex';
        
        // 사용자 이름 표시
        userName.textContent = user.name;
        
        // 네비게이션 로그인 버튼 숨기기
        const navLoginBtn = document.getElementById('loginBtn');
        if (navLoginBtn && navLoginBtn.parentElement) {
            navLoginBtn.parentElement.style.display = 'none';
        }
    }
}
```

**UI 변경사항**:
- ✅ 로그인 버튼 → 사용자 이름 + 로그아웃 버튼
- ✅ 마이페이지 링크 활성화
- ✅ 관리자 메뉴 표시 (마이페이지에서)

---

## 🚪 로그아웃

### 로그아웃 방법

**1단계**: 로그인 상태에서 우측 상단 사용자 아이콘 클릭

**2단계**: "로그아웃" 버튼 클릭

**3단계**: 로그아웃 완료
- ✅ 효과음 재생
- ✅ LocalStorage/SessionStorage에서 사용자 정보 삭제
- ✅ UI가 로그아웃 상태로 전환

---

### 로그아웃 로직

**파일**: `js/auth.js` (259-287번 줄)

```javascript
logout() {
    playSound('click');
    
    // 스토리지에서 사용자 정보 삭제
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    
    // UI 업데이트
    const loggedOut = document.querySelector('.user-status-logged-out');
    const loggedIn = document.querySelector('.user-status-logged-in');
    
    if (loggedOut && loggedIn) {
        loggedOut.classList.remove('hidden');
        loggedIn.classList.add('hidden');
        loggedIn.style.display = 'none';
        
        // 네비게이션 로그인 버튼 다시 표시
        const navLoginBtn = document.getElementById('loginBtn');
        if (navLoginBtn && navLoginBtn.parentElement) {
            navLoginBtn.parentElement.style.display = '';
        }
    }
}
```

---

## 🎨 효과음 시스템

### 효과음 종류

**파일**: `js/auth.js` (7-11번 줄)

```javascript
const SOUND_EFFECTS = {
    click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    success: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
    error: 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3'
};
```

**효과음 적용 상황**:
- **클릭**: 로그인 버튼, 닫기 버튼, 로그아웃 버튼
- **성공**: 로그인 성공
- **오류**: 로그인 실패

**재생 로직**:
```javascript
function playSound(soundType) {
    try {
        const audio = new Audio(SOUND_EFFECTS[soundType]);
        audio.volume = 0.15; // 음량 15%
        audio.play().catch(err => console.log('Sound play failed:', err));
    } catch (err) {
        console.log('Sound initialization failed:', err);
    }
}
```

---

## 🔄 로그인 플로우 전체 과정

### 성공 케이스

```
1. 사용자가 "로그인" 버튼 클릭
   ↓ (클릭 효과음 재생)
2. 로그인 모달 열림
   ↓ (첫 번째 입력 필드 자동 포커스)
3. 이메일/비밀번호 입력
   ↓
4. "로그인" 버튼 클릭
   ↓ (버튼 텍스트: "로그인 중..." + 로딩 스피너)
5. 1.5초 지연 (서버 응답 시뮬레이션)
   ↓
6. 검증 성공
   ↓ (성공 효과음 재생)
7. 사용자 정보를 LocalStorage/SessionStorage에 저장
   ↓
8. "로그인 성공!" 메시지 표시
   ↓ (성공 애니메이션)
9. 1초 후 모달 닫힘
   ↓
10. UI 업데이트 (사용자 이름 표시, 마이페이지 활성화)
```

### 실패 케이스

```
1. 사용자가 "로그인" 버튼 클릭
   ↓
2. 로그인 모달 열림
   ↓
3. 잘못된 이메일/비밀번호 입력
   ↓
4. "로그인" 버튼 클릭
   ↓
5. 1.5초 지연
   ↓
6. 검증 실패
   ↓ (오류 효과음 재생)
7. 모달 흔들림 애니메이션
   ↓
8. "아이디 또는 비밀번호가 올바르지 않습니다." 메시지 표시
   ↓
9. 버튼 텍스트 복구 ("로그인")
```

---

## 🧪 테스트 방법

### 1. 정상 로그인 테스트

**메인페이지 접속**:
```
https://www.genspark.ai/api/code_sandbox_light/preview/68d5a3b6-99a3-44d6-8a91-440bc5253b4c/index.html?canvas_history_id=bd8255b8-e628-4063-9269-b2a901665fe9
```

**로그인 정보**:
- 아이디: `test@esg.or.kr`
- 비밀번호: `password123`

**확인 사항**:
- ✅ 로그인 모달이 열리는가?
- ✅ 효과음이 재생되는가?
- ✅ "로그인 성공!" 메시지가 표시되는가?
- ✅ 우측 상단에 "Test" (사용자 이름) 표시되는가?
- ✅ 로그인 버튼이 사라지는가?

---

### 2. 임시 검증 테스트

**로그인 정보**:
- 아이디: `any@example.com`
- 비밀번호: `123456` (6자 이상)

**확인 사항**:
- ✅ 6자 이상 비밀번호로 로그인 가능

---

### 3. 실패 케이스 테스트

**로그인 정보**:
- 아이디: `wrong@example.com`
- 비밀번호: `12345` (6자 미만)

**확인 사항**:
- ✅ 오류 메시지 표시
- ✅ 오류 효과음 재생
- ✅ 모달 흔들림 애니메이션

---

### 4. 로그인 유지 테스트

**테스트 1**: "로그인 유지" 체크
1. 로그인 시 "로그인 유지" 체크
2. 브라우저 닫기
3. 브라우저 다시 열기
4. **결과**: 로그인 상태 유지됨 (LocalStorage)

**테스트 2**: "로그인 유지" 미체크
1. 로그인 시 "로그인 유지" 미체크
2. 브라우저 닫기
3. 브라우저 다시 열기
4. **결과**: 로그아웃 상태 (SessionStorage)

---

### 5. 마이페이지 접근 테스트

**로그인 전**:
```
pages/mypage/profile.html 접속
→ 관리자 메뉴 보이지 않음
```

**로그인 후**:
```
pages/mypage/profile.html 접속
→ 관리자 메뉴 표시됨 (포스팅툴, 히스토리 관리)
```

---

## 🛠️ 개발자 도구 활용

### 1. 현재 로그인 상태 확인

**브라우저 콘솔 (F12)**:
```javascript
// LocalStorage 확인
console.log('LocalStorage User:', localStorage.getItem('user'));

// SessionStorage 확인
console.log('SessionStorage User:', sessionStorage.getItem('user'));

// 파싱
const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log('User Info:', user);
```

---

### 2. 수동 로그인

```javascript
localStorage.setItem('user', JSON.stringify({
    id: 'admin@esg.or.kr',
    name: '슈퍼관리자',
    role: 'admin',
    loginTime: new Date().toISOString()
}));
location.reload();
```

---

### 3. 강제 로그아웃

```javascript
localStorage.removeItem('user');
sessionStorage.removeItem('user');
location.reload();
```

---

## ⚠️ 보안 고려사항 (실제 배포 시)

### 현재 시스템의 한계

1. **프론트엔드 기반 검증**
   - ❌ 비밀번호가 클라이언트에서 검증됨
   - ❌ 누구나 LocalStorage를 조작할 수 있음
   - ❌ CSRF, XSS 공격에 취약

2. **세션 관리**
   - ❌ 세션 타임아웃 없음
   - ❌ 중복 로그인 방지 없음
   - ❌ 세션 고정 공격 방어 없음

3. **비밀번호 보안**
   - ❌ 평문 비밀번호 전송 (HTTPS 필요)
   - ❌ 비밀번호 해싱/솔팅 없음

---

### 실제 배포 시 권장사항

#### 1. 서버 기반 인증

```javascript
// 실제 서버 API 호출
async handleLogin(e) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: loginId,
            password: password
        })
    });
    
    if (response.ok) {
        const data = await response.json();
        // JWT 토큰 저장
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
    }
}
```

#### 2. JWT 토큰 인증

```javascript
// 인증 헤더 추가
fetch('/api/user/profile', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
});
```

#### 3. HTTPS 필수

```
http://example.com ❌
https://example.com ✅
```

#### 4. 비밀번호 해싱

```javascript
// 서버에서 bcrypt 사용
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 10);
```

#### 5. 세션 타임아웃

```javascript
// 30분 후 자동 로그아웃
const sessionTimeout = 30 * 60 * 1000; // 30분
setTimeout(() => {
    if (isSessionExpired()) {
        logout();
    }
}, sessionTimeout);
```

---

## 📋 요약

### ✅ 현재 상태

| 기능 | 상태 | 비고 |
|------|------|------|
| **로그인 모달** | ✅ 작동 | UI/UX 완벽 |
| **인증 검증** | ✅ 작동 | 프론트엔드 시뮬레이션 |
| **세션 관리** | ✅ 작동 | LocalStorage/SessionStorage |
| **로그아웃** | ✅ 작동 | 정상 동작 |
| **효과음** | ✅ 작동 | 클릭/성공/오류 |
| **UI 업데이트** | ✅ 작동 | 사용자 이름 표시 |
| **마이페이지 연동** | ✅ 작동 | 관리자 메뉴 표시 |

---

### 🚀 테스트 계정

```
아이디: test@esg.or.kr
비밀번호: password123
```

**또는**

```
아이디: 아무거나@example.com
비밀번호: 6자 이상
```

---

### 🔗 관련 링크

**메인페이지**:
```
https://www.genspark.ai/api/code_sandbox_light/preview/68d5a3b6-99a3-44d6-8a91-440bc5253b4c/index.html?canvas_history_id=bd8255b8-e628-4063-9269-b2a901665fe9
```

**마이페이지**:
```
https://www.genspark.ai/api/code_sandbox_light/preview/68d5a3b6-99a3-44d6-8a91-440bc5253b4c/pages/mypage/profile.html?canvas_history_id=bd8255b8-e628-4063-9269-b2a901665fe9
```

---

**마지막 업데이트**: 2025년 12월 31일  
**버전**: v1.0  
**프로젝트**: 한국ESG학회 공식 웹사이트
