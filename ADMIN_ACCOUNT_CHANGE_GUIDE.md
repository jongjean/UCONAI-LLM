# 🔐 관리자 계정 변경 가이드

## ✅ 관리자 이메일/비밀번호 변경 완료!

### **변경된 관리자 계정**:

```
📧 이메일: admin@kesg.or.kr
🔑 비밀번호: kesg2025!@#
```

---

## 📝 변경 내용

### **파일**: `js/auth.js` (177-183번 줄)

**변경 전**:
```javascript
validateLogin(email, password) {
    // 테스트 계정: test@esg.or.kr / password123
    return (email === 'test@esg.or.kr' && password === 'password123') || 
           (password.length >= 6);
}
```

**변경 후**:
```javascript
validateLogin(email, password) {
    // 관리자 계정 (여기서 이메일과 비밀번호 변경 가능)
    const ADMIN_EMAIL = 'admin@kesg.or.kr';  // ← 원하는 이메일로 변경
    const ADMIN_PASSWORD = 'kesg2025!@#';     // ← 원하는 비밀번호로 변경
    
    return (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) || 
           (password.length >= 6); // 임시: 6자 이상이면 통과
}
```

---

## 🎯 새 관리자 계정으로 로그인 테스트

### **1단계: 기존 로그인 정보 삭제**

**브라우저 콘솔 (F12)**에서:
```javascript
// 기존 로그인 정보 삭제
localStorage.removeItem('user');
sessionStorage.removeItem('user');

// 페이지 새로고침
location.reload();
```

---

### **2단계: 새 계정으로 로그인**

**메인페이지에서**:
```
1️⃣ 우측 상단 "로그인" 클릭
2️⃣ 이메일: admin@kesg.or.kr
3️⃣ 비밀번호: kesg2025!@#
4️⃣ "로그인" 클릭
```

**성공 시**:
- ✅ "로그인 성공!" 메시지
- ✅ 우측 상단에 "Admin" 표시
- ✅ 마이페이지 → 관리자 메뉴 접근 가능

---

### **3단계: 관리자 메뉴 확인**

```
1️⃣ 로그인 후 "마이페이지" 클릭
2️⃣ 좌측 사이드바에서 "관리자 메뉴" 확인
3️⃣ 포스팅툴 접근 테스트
4️⃣ 히스토리 관리 접근 테스트
```

---

## 🔧 다른 이메일/비밀번호로 변경하고 싶다면?

### **방법: js/auth.js 파일 수정**

**1단계**: `js/auth.js` 파일 열기

**2단계**: 177-183번 줄 찾기

**3단계**: 이메일과 비밀번호 변경
```javascript
const ADMIN_EMAIL = 'your-email@example.com';  // ← 원하는 이메일
const ADMIN_PASSWORD = 'your-secure-password';  // ← 원하는 비밀번호
```

**4단계**: 파일 저장

**5단계**: 테스트
```
1. 미리보기에서 로그인 테스트
2. 정상 작동 확인
3. 배포 (Unpublish → Publish)
```

---

## 🎨 여러 관리자 계정 추가하기

### **다수의 관리자를 지원하려면**:

**js/auth.js 수정**:

```javascript
validateLogin(email, password) {
    // 관리자 계정 목록
    const ADMIN_ACCOUNTS = [
        { email: 'admin@kesg.or.kr', password: 'kesg2025!@#' },
        { email: 'manager@kesg.or.kr', password: 'manager2025!' },
        { email: 'staff@kesg.or.kr', password: 'staff2025!' }
    ];
    
    // 관리자 계정 확인
    const isAdmin = ADMIN_ACCOUNTS.some(
        account => account.email === email && account.password === password
    );
    
    return isAdmin || (password.length >= 6); // 임시: 6자 이상이면 통과
}
```

**장점**:
- ✅ 여러 관리자 계정 지원
- ✅ 각 관리자마다 다른 이메일/비밀번호
- ✅ 쉽게 추가/삭제 가능

---

## 🔒 보안 권장사항

### **현재 시스템의 한계**:

⚠️ **프론트엔드 인증의 보안 문제**:
- 비밀번호가 JavaScript 파일에 노출됨
- 브라우저 개발자 도구로 확인 가능
- 누구나 코드를 볼 수 있음

### **실제 배포 시 필수 보안 조치**:

#### **1. 서버 기반 인증으로 전환** ⭐ 가장 중요

**현재 (프론트엔드)**:
```javascript
// ❌ 비밀번호가 코드에 노출됨
const ADMIN_PASSWORD = 'kesg2025!@#';
```

**권장 (서버 기반)**:
```javascript
// ✅ 서버에서 검증
async validateLogin(email, password) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
        const data = await response.json();
        return data.token; // JWT 토큰 반환
    }
    return null;
}
```

---

#### **2. 비밀번호 해싱**

**서버에서** (Node.js 예시):
```javascript
const bcrypt = require('bcrypt');

// 비밀번호 해싱
const hashedPassword = await bcrypt.hash('kesg2025!@#', 10);

// 비밀번호 검증
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

---

#### **3. JWT 토큰 인증**

```javascript
// 로그인 성공 시 JWT 토큰 발급
const token = jwt.sign(
    { email: 'admin@kesg.or.kr', role: 'admin' },
    SECRET_KEY,
    { expiresIn: '24h' }
);

// 토큰을 LocalStorage에 저장
localStorage.setItem('accessToken', token);
```

---

#### **4. HTTPS 필수**

```
❌ http://yourdomain.com
✅ https://yourdomain.com

→ 비밀번호가 암호화되어 전송됨
```

---

#### **5. 강력한 비밀번호 정책**

**권장 비밀번호 규칙**:
- ✅ 최소 12자 이상
- ✅ 대문자, 소문자, 숫자, 특수문자 포함
- ✅ 일반적인 단어 사용 금지
- ✅ 주기적 변경 (3-6개월)

**좋은 예시**:
```
✅ K3sg@2025!Secure#Admin
✅ ESG$ecure2025^Admin!
✅ Admin#K3SG$2025!Str0ng
```

**나쁜 예시**:
```
❌ admin123
❌ password
❌ kesg2025
❌ 12345678
```

---

#### **6. 2단계 인증 (2FA)**

추가 보안 레이어:
- 이메일 인증
- SMS 인증
- Google Authenticator

---

## 📊 현재 vs 권장 비교

| 항목 | 현재 (프론트엔드) | 권장 (서버 기반) |
|------|-----------------|----------------|
| **비밀번호 저장** | JavaScript 파일 ❌ | 서버 DB (해싱) ✅ |
| **검증 위치** | 브라우저 ❌ | 서버 ✅ |
| **보안 수준** | 낮음 ⚠️ | 높음 ✅ |
| **토큰 인증** | 없음 ❌ | JWT ✅ |
| **HTTPS** | 선택 ⚠️ | 필수 ✅ |
| **2FA** | 없음 ❌ | 지원 ✅ |

---

## 🚀 즉시 테스트

### **새 관리자 계정 테스트**:

```
1️⃣ 기존 로그인 삭제
   F12 → Console:
   localStorage.clear();
   location.reload();

2️⃣ 로그인 페이지 열기
   우측 상단 "로그인" 클릭

3️⃣ 새 관리자 계정 입력
   이메일: admin@kesg.or.kr
   비밀번호: kesg2025!@#

4️⃣ 로그인 성공 확인
   우측 상단 "Admin" 표시

5️⃣ 관리자 메뉴 확인
   마이페이지 → 관리자 메뉴
```

---

## 📋 변경 체크리스트

### **변경 완료**:
- [x] js/auth.js 파일 수정
- [x] 관리자 이메일 변경: `admin@kesg.or.kr`
- [x] 관리자 비밀번호 변경: `kesg2025!@#`
- [x] 코드 주석 추가

### **테스트 필요**:
- [ ] 미리보기에서 새 계정으로 로그인 테스트
- [ ] 로그인 성공 확인
- [ ] 관리자 메뉴 접근 확인
- [ ] 포스팅툴 작동 확인
- [ ] 히스토리 관리 작동 확인

### **배포 필요**:
- [ ] 변경사항 저장 확인
- [ ] Unpublish → Publish (강제 재배포)
- [ ] 배포 완료 후 새 계정으로 로그인 테스트

---

## 💡 팁

### **비밀번호 잊어버렸을 때**:

**js/auth.js 파일 확인**:
```javascript
// 177-183번 줄에서 확인
const ADMIN_EMAIL = 'admin@kesg.or.kr';
const ADMIN_PASSWORD = 'kesg2025!@#';
```

---

### **임시 로그인 (6자 이상 비밀번호)**:

현재는 **6자 이상 비밀번호**면 아무 이메일로든 로그인 가능합니다:

```javascript
// js/auth.js 181번 줄
return isAdmin || (password.length >= 6); // ← 임시 검증
```

**실제 배포 시 이 라인 제거 권장**:
```javascript
return isAdmin; // ← 관리자 계정만 허용
```

---

## 📞 추가 도움

### **다른 이메일/비밀번호로 변경 요청 시**:

1. 원하는 이메일 알려주세요
2. 원하는 비밀번호 알려주세요
3. 즉시 수정해드리겠습니다

### **여러 관리자 계정 필요 시**:

1. 각 관리자의 이메일/비밀번호 목록 제공
2. 여러 계정 지원 코드로 업데이트

---

## 🎯 요약

### **새 관리자 계정**:
```
📧 이메일: admin@kesg.or.kr
🔑 비밀번호: kesg2025!@#
```

### **변경 파일**:
```
js/auth.js (177-183번 줄)
```

### **다음 단계**:
```
1. 미리보기에서 새 계정으로 로그인 테스트
2. 정상 작동 확인
3. Unpublish → Publish (재배포)
4. 배포 사이트에서 로그인 테스트
```

---

**마지막 업데이트**: 2025년 12월 31일  
**변경 내용**: 관리자 이메일/비밀번호 변경  
**프로젝트**: 한국ESG학회 공식 웹사이트
