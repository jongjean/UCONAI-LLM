# 🔍 관리자 메뉴 표시 문제 해결 가이드

## ⚠️ 문제 상황

**질문**: "관리자 메뉴가 나와야 하는 것 아닌가?"

**답변**: 네, 맞습니다! 로그인 후 마이페이지에서 관리자 메뉴가 자동으로 표시되어야 합니다.

---

## 🎯 관리자 메뉴가 표시되는 조건

### **코드 로직** (`pages/mypage/profile.html` 889-911번 줄)

```javascript
function checkAdminRole() {
    // 로그인 사용자 정보 가져오기
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    
    // 데모용: 로그인한 모든 사용자에게 관리자 권한 부여
    if (user.id) {
        const adminActions = document.getElementById('adminActions');
        if (adminActions) {
            adminActions.style.display = 'block';
            console.log('✅ 관리자 메뉴 표시됨');
        }
    }
}
```

### **표시 조건**
1. ✅ `localStorage` 또는 `sessionStorage`에 `user` 객체 존재
2. ✅ `user.id` 값이 있어야 함
3. ✅ 페이지 로드 시 `checkAdminRole()` 함수 실행

---

## 🔧 관리자 메뉴가 안 보이는 이유

### **원인 1: 로그인하지 않음** ❌
- **증상**: 우측 상단에 "로그인" 버튼이 보임
- **해결**: 로그인 필요

### **원인 2: LocalStorage/SessionStorage에 사용자 정보 없음** ❌
- **증상**: 로그인했지만 페이지를 직접 URL로 접속함
- **해결**: 브라우저 콘솔에서 수동으로 사용자 정보 저장

### **원인 3: 페이지 캐시 문제** ❌
- **증상**: 로그인했는데도 관리자 메뉴가 안 보임
- **해결**: 강제 새로고침 (Ctrl+Shift+R 또는 Cmd+Shift+R)

### **원인 4: JavaScript 오류** ❌
- **증상**: 콘솔에 오류 메시지
- **해결**: 브라우저 콘솔(F12) 확인

---

## ✅ 해결 방법 (5가지)

---

### **방법 1: 정식 로그인 후 마이페이지 접속** ⭐ **가장 권장**

**1단계**: 메인페이지 접속
```
https://www.genspark.ai/api/code_sandbox_light/preview/68d5a3b6-99a3-44d6-8a91-440bc5253b4c/index.html?canvas_history_id=bd8255b8-e628-4063-9269-b2a901665fe9
```

**2단계**: 우측 상단 "로그인" 클릭

**3단계**: 로그인 정보 입력
```
아이디: test@esg.or.kr
비밀번호: password123
```

**4단계**: 로그인 성공 확인
- ✅ 우측 상단에 "Test" 표시

**5단계**: "마이페이지" 클릭
```
https://www.genspark.ai/api/code_sandbox_light/preview/68d5a3b6-99a3-44d6-8a91-440bc5253b4c/pages/mypage/profile.html?canvas_history_id=bd8255b8-e628-4063-9269-b2a901665fe9
```

**6단계**: 좌측 사이드바에서 "관리자 메뉴" 확인
- 📍 위치: "빠른 메뉴" 아래
- 🎨 아이콘: 👑 왕관
- 🎨 배경: 녹색

---

### **방법 2: 관리자 로그인 테스트 페이지 사용** ⚡ **가장 빠름**

**1단계**: 테스트 페이지 접속
```
https://www.genspark.ai/api/code_sandbox_light/preview/68d5a3b6-99a3-44d6-8a91-440bc5253b4c/admin-login-test.html?canvas_history_id=bd8255b8-e628-4063-9269-b2a901665fe9
```

**2단계**: "관리자 로그인 실행" 버튼 클릭

**3단계**: "마이페이지 열기" 버튼 클릭

**4단계**: 관리자 메뉴 확인 ✅

**장점**:
- ✅ 자동 로그인 처리
- ✅ 실시간 로그인 상태 확인
- ✅ 콘솔 로그 표시
- ✅ 원클릭으로 마이페이지 열기

---

### **방법 3: 브라우저 콘솔에서 수동 로그인**

**1단계**: 마이페이지 접속
```
https://www.genspark.ai/api/code_sandbox_light/preview/68d5a3b6-99a3-44d6-8a91-440bc5253b4c/pages/mypage/profile.html?canvas_history_id=bd8255b8-e628-4063-9269-b2a901665fe9
```

**2단계**: F12 눌러서 콘솔 열기

**3단계**: 아래 코드 복사 & 붙여넣기
```javascript
// 관리자 로그인
localStorage.setItem('user', JSON.stringify({
    id: 'test@esg.or.kr',
    name: '관리자',
    role: 'admin',
    loginTime: new Date().toISOString()
}));

// 페이지 새로고침
location.reload();
```

**4단계**: Enter 키 → 페이지 자동 새로고침

**5단계**: 관리자 메뉴 확인 ✅

---

### **방법 4: 테스트 페이지 (posting-tool-access.html) 사용**

**1단계**: 테스트 페이지 접속
```
https://www.genspark.ai/api/code_sandbox_light/preview/68d5a3b6-99a3-44d6-8a91-440bc5253b4c/posting-tool-access.html?canvas_history_id=bd8255b8-e628-4063-9269-b2a901665fe9
```

**2단계**: "마이페이지 (관리자 메뉴 포함)" 버튼 클릭

**3단계**: 관리자 메뉴 확인 ✅

---

### **방법 5: 강제 새로고침**

로그인했는데도 관리자 메뉴가 안 보일 때:

**Windows**: Ctrl + Shift + R
**Mac**: Cmd + Shift + R

또는

**브라우저 콘솔(F12)**:
```javascript
location.reload(true);
```

---

## 🔍 관리자 메뉴 표시 확인 방법

### **1. 시각적 확인**

**마이페이지 좌측 사이드바 구조**:
```
빠른 메뉴
├── 회원정보 관리
├── 회비 납부
├── 논문 투고
└── 행사 신청

👑 관리자 메뉴 ← 이 섹션이 보여야 함!
├── 📝 포스팅툴
└── 🕐 히스토리 관리
```

**관리자 메뉴 특징**:
- 🎨 배경: 녹색 그라데이션
- 👑 아이콘: 왕관 (`fas fa-crown`)
- 📍 위치: "빠른 메뉴" 바로 아래

---

### **2. 개발자 도구 확인**

**브라우저 콘솔(F12)**:
```javascript
// 로그인 상태 확인
const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
console.log('로그인 사용자:', user);

// 관리자 메뉴 요소 확인
const adminMenu = document.getElementById('adminActions');
console.log('관리자 메뉴 요소:', adminMenu);
console.log('표시 상태:', adminMenu ? adminMenu.style.display : 'not found');

// 출력 예시:
// 로그인 사용자: {id: "test@esg.or.kr", name: "관리자", role: "admin", ...}
// 관리자 메뉴 요소: <div id="adminActions">...</div>
// 표시 상태: block
```

---

### **3. HTML 요소 검사**

**브라우저 개발자 도구 (F12) → Elements 탭**:

1. Ctrl+F (또는 Cmd+F) 검색
2. `adminActions` 검색
3. 해당 요소의 `style` 속성 확인
   - ✅ `display: block` → 표시됨
   - ❌ `display: none` → 숨겨짐

---

## 🧪 테스트 시나리오

### **시나리오 1: 정상 플로우**

```
1️⃣ 메인페이지 접속
2️⃣ 로그인 (test@esg.or.kr / password123)
3️⃣ 로그인 성공 확인 (우측 상단 "Test" 표시)
4️⃣ 마이페이지 클릭
5️⃣ 좌측 사이드바에서 "관리자 메뉴" 확인 ✅
6️⃣ "포스팅툴" 클릭
7️⃣ 슬라이드 편집 시작!
```

**예상 결과**: 모든 단계에서 정상 작동 ✅

---

### **시나리오 2: 직접 URL 접속 (문제 발생 가능)**

```
1️⃣ 마이페이지 URL 직접 접속
   → 로그인 정보 없음 ❌
2️⃣ 콘솔에서 수동 로그인
3️⃣ 페이지 새로고침
4️⃣ 관리자 메뉴 표시 확인 ✅
```

**예상 결과**: 수동 로그인 후 정상 작동 ✅

---

### **시나리오 3: 테스트 페이지 사용 (가장 안정적)**

```
1️⃣ admin-login-test.html 접속
2️⃣ "관리자 로그인 실행" 클릭
3️⃣ 로그인 성공 메시지 확인
4️⃣ "마이페이지 열기" 클릭
5️⃣ 관리자 메뉴 표시 확인 ✅
```

**예상 결과**: 100% 정상 작동 ✅

---

## 📊 문제 해결 플로차트

```
관리자 메뉴가 안 보임
    ↓
[Q1] 로그인했나요?
    ├── NO → 메인페이지에서 로그인
    └── YES
        ↓
    [Q2] 우측 상단에 사용자 이름(Test) 보이나요?
        ├── NO → 콘솔에서 수동 로그인
        └── YES
            ↓
        [Q3] 마이페이지에 있나요?
            ├── NO → 마이페이지로 이동
            └── YES
                ↓
            [Q4] 페이지 새로고침 했나요?
                ├── NO → Ctrl+Shift+R 강제 새로고침
                └── YES
                    ↓
                [Q5] 브라우저 콘솔에 오류가 있나요?
                    ├── YES → 오류 내용 확인
                    └── NO → 테스트 페이지 사용
```

---

## 🎯 권장 해결 방법 (우선순위)

### **1순위**: 테스트 페이지 사용 ⭐⭐⭐⭐⭐
```
admin-login-test.html → "관리자 로그인 실행" → "마이페이지 열기"
```
**장점**: 자동화, 시각적 피드백, 100% 성공률

---

### **2순위**: 정식 로그인 플로우 ⭐⭐⭐⭐
```
메인페이지 → 로그인 → 마이페이지 → 관리자 메뉴
```
**장점**: 실제 사용자 경험, 정식 경로

---

### **3순위**: 콘솔 수동 로그인 ⭐⭐⭐
```
F12 → 콘솔 → localStorage.setItem(...) → reload
```
**장점**: 빠름, 개발자용

---

## 📋 체크리스트

### **로그인 전**
- [ ] 메인페이지 접속 확인
- [ ] 우측 상단 "로그인" 버튼 표시
- [ ] 브라우저 JavaScript 활성화

### **로그인 중**
- [ ] 로그인 모달 열림
- [ ] test@esg.or.kr / password123 입력
- [ ] "로그인" 버튼 클릭
- [ ] 성공 메시지 표시

### **로그인 후**
- [ ] 우측 상단 "Test" 표시
- [ ] 로그인 버튼 사라짐
- [ ] 마이페이지 링크 활성화

### **마이페이지에서**
- [ ] 좌측 사이드바 표시
- [ ] "빠른 메뉴" 섹션 표시
- [ ] **"관리자 메뉴" 섹션 표시** ← 핵심!
- [ ] 포스팅툴 버튼 표시
- [ ] 히스토리 관리 버튼 표시

---

## 🔗 관련 링크

### **테스트 페이지**
```
https://www.genspark.ai/api/code_sandbox_light/preview/68d5a3b6-99a3-44d6-8a91-440bc5253b4c/admin-login-test.html?canvas_history_id=bd8255b8-e628-4063-9269-b2a901665fe9
```

### **마이페이지**
```
https://www.genspark.ai/api/code_sandbox_light/preview/68d5a3b6-99a3-44d6-8a91-440bc5253b4c/pages/mypage/profile.html?canvas_history_id=bd8255b8-e628-4063-9269-b2a901665fe9
```

### **메인페이지**
```
https://www.genspark.ai/api/code_sandbox_light/preview/68d5a3b6-99a3-44d6-8a91-440bc5253b4c/index.html?canvas_history_id=bd8255b8-e628-4063-9269-b2a901665fe9
```

---

## 📞 추가 지원

문제가 계속 발생하면:

1. **스크린샷 공유**: 마이페이지 전체 화면
2. **콘솔 로그 공유**: F12 → Console 탭의 모든 메시지
3. **브라우저 정보**: Chrome/Firefox/Safari 버전

---

**마지막 업데이트**: 2025년 12월 31일  
**버전**: v1.0  
**프로젝트**: 한국ESG학회 공식 웹사이트
