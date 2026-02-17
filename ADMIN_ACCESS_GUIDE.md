# 🔐 관리자 페이지 접근 가이드

## 📍 현재 프로젝트 URL 구조

**기본 URL**: 
```
https://www.genspark.ai/api/code_sandbox_light/preview/68d5a3b6-99a3-44d6-8a91-440bc5253b4c/
```

**쿼리 파라미터**: 
```
?canvas_history_id=bd8255b8-e628-4063-9269-b2a901665fe9
```

---

## 🎯 관리자 페이지 접근 방법 (3가지)

### 방법 1: 마이페이지를 통한 접근 (⭐ 가장 권장)

#### **전체 경로**:
```
메인페이지 → 로그인 → 마이페이지 → 관리자 메뉴 → 포스팅툴/히스토리 관리
```

#### **단계별 가이드**:

**1단계**: 메인페이지 접속
```
https://www.genspark.ai/api/code_sandbox_light/preview/68d5a3b6-99a3-44d6-8a91-440bc5253b4c/index.html?canvas_history_id=bd8255b8-e628-4063-9269-b2a901665fe9
```

**2단계**: 우측 상단 "로그인" 버튼 클릭

**3단계**: 데모 계정으로 로그인
- **ID**: `test@esg.or.kr`
- **PW**: `password123`

**4단계**: 로그인 후 우측 상단 "마이페이지" 클릭
```
https://www.genspark.ai/api/code_sandbox_light/preview/68d5a3b6-99a3-44d6-8a91-440bc5253b4c/pages/mypage/profile.html?canvas_history_id=bd8255b8-e628-4063-9269-b2a901665fe9
```

**5단계**: 좌측 사이드바에서 "**관리자 메뉴**" 섹션 찾기
- 📍 위치: 빠른 메뉴 섹션 아래
- 🎨 스타일: 왕관 아이콘(👑) + 녹색 배경
- ⚠️ 주의: 로그인하지 않으면 보이지 않음

**6단계**: 관리자 메뉴에서 원하는 도구 선택
- **포스팅툴**: 히어로 슬라이더 편집
- **히스토리 관리**: 버전 관리

---

### 방법 2: 직접 URL 접근 (빠른 방법)

#### **마이페이지 직접 접속**:
```
https://www.genspark.ai/api/code_sandbox_light/preview/68d5a3b6-99a3-44d6-8a91-440bc5253b4c/pages/mypage/profile.html?canvas_history_id=bd8255b8-e628-4063-9269-b2a901665fe9
```

**주의사항**:
- 로그인이 되어 있지 않으면 관리자 메뉴가 보이지 않음
- 먼저 로그인 후 새로고침 또는 다시 접속

#### **로그인 없이 바로 관리자 메뉴 확인하기**:

브라우저 개발자 도구(F12) → Console 탭에서:
```javascript
localStorage.setItem('user', JSON.stringify({
    id: 'test@esg.or.kr',
    name: '관리자',
    role: 'admin'
}));
location.reload();
```

---

### 방법 3: 테스트 페이지 활용 (⚡ 가장 빠른 방법)

#### **테스트 페이지 직접 접속**:
```
https://www.genspark.ai/api/code_sandbox_light/preview/68d5a3b6-99a3-44d6-8a91-440bc5253b4c/posting-tool-access.html?canvas_history_id=bd8255b8-e628-4063-9269-b2a901665fe9
```

**장점**:
- ✅ 자동 로그인 처리
- ✅ 모든 관리자 링크 한 곳에 모음
- ✅ 클릭 한 번으로 포스팅툴/히스토리 접근
- ✅ 로그인 과정 생략

**사용법**:
1. 위 링크 클릭
2. 원하는 버튼 클릭:
   - "포스팅툴 열기"
   - "히스토리 관리 열기"
   - "마이페이지 (관리자 메뉴)"

---

## 🗂️ 관리자 페이지 구조

### 📂 마이페이지 내 관리자 메뉴 위치

```
pages/mypage/profile.html
└── 좌측 사이드바
    ├── 빠른 메뉴
    │   ├── 회원정보 관리
    │   ├── 회비 납부
    │   ├── 논문 투고
    │   └── 행사 신청
    │
    └── 🎯 관리자 메뉴 (로그인 시에만 표시)
        ├── 📝 포스팅툴
        └── 🕐 히스토리 관리
```

### 🎨 관리자 메뉴 UI 특징

- **아이콘**: 👑 왕관 (fas fa-crown)
- **제목**: "관리자 메뉴"
- **배경색**: 녹색 그라데이션
- **버튼 스타일**: 
  - 포스팅툴: Primary (진한 녹색)
  - 히스토리 관리: Secondary (밝은 녹색)

---

## 🔑 권한 시스템

### 현재 권한 체크 방식 (프론트엔드 시뮬레이션)

**파일**: `pages/mypage/profile.html` (889-906번 줄)

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

### 🚨 중요: 현재 권한 시스템 특징

1. **프론트엔드 시뮬레이션**
   - LocalStorage 기반 권한 체크
   - 로그인한 모든 사용자가 관리자 메뉴 접근 가능

2. **실제 운영 시 변경 필요**
   - 서버 기반 권한 검증
   - JWT 토큰 인증
   - 역할 기반 접근 제어 (RBAC)

3. **권장 조건 (실제 배포 시)**
   ```javascript
   if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
       // 관리자 메뉴 표시
   }
   ```

---

## 📋 관리자 도구 목록

### 1. 포스팅툴 (Posting Tool)

**접근 경로**:
```
마이페이지 → 관리자 메뉴 → 포스팅툴
```

**직접 URL**:
```
https://www.genspark.ai/api/code_sandbox_light/preview/68d5a3b6-99a3-44d6-8a91-440bc5253b4c/pages/admin/posting-tool.html?canvas_history_id=bd8255b8-e628-4063-9269-b2a901665fe9
```

**주요 기능**:
- ✅ 히어로 슬라이더 3개 동시 편집
- ✅ 이미지 업로드/URL 입력
- ✅ 제목/설명/버튼 텍스트 수정
- ✅ AI 기반 텍스트 최적화
- ✅ 실시간 미리보기
- ✅ 버전 저장 및 게시

---

### 2. 히스토리 관리 (History Manager)

**접근 경로**:
```
마이페이지 → 관리자 메뉴 → 히스토리 관리
```

**직접 URL**:
```
https://www.genspark.ai/api/code_sandbox_light/preview/68d5a3b6-99a3-44d6-8a91-440bc5253b4c/pages/admin/history-manager.html?canvas_history_id=bd8255b8-e628-4063-9269-b2a901665fe9
```

**주요 기능**:
- ✅ 모든 버전 목록 조회
- ✅ 버전 검색 (제목/작성자/설명)
- ✅ 3개 슬라이드 미리보기
- ✅ 버전 적용 (메인페이지 즉시 반영)
- ✅ 수정하기 (포스팅툴로 이동)
- ✅ 삭제하기 (현재 버전 보호)

---

## 🎯 빠른 접근 링크 요약

| 방법 | URL | 특징 |
|------|-----|------|
| **테스트 페이지** | `/posting-tool-access.html` | ⚡ 가장 빠름, 자동 로그인 |
| **마이페이지** | `/pages/mypage/profile.html` | 🏆 권장, 정식 경로 |
| **포스팅툴** | `/pages/admin/posting-tool.html` | 📝 직접 접근 |
| **히스토리** | `/pages/admin/history-manager.html` | 🕐 버전 관리 |

---

## 🔍 문제 해결 (Troubleshooting)

### ❓ 관리자 메뉴가 보이지 않을 때

**원인 1**: 로그인하지 않음
- **해결**: 메인페이지에서 로그인 (`test@esg.or.kr` / `password123`)

**원인 2**: LocalStorage에 사용자 정보 없음
- **해결**: 브라우저 콘솔(F12)에서 실행
```javascript
localStorage.setItem('user', JSON.stringify({
    id: 'test@esg.or.kr',
    name: '관리자',
    role: 'admin'
}));
location.reload();
```

**원인 3**: 페이지 캐시 문제
- **해결**: 강제 새로고침 (Ctrl + Shift + R 또는 Cmd + Shift + R)

---

### ❓ 포스팅툴/히스토리 페이지가 열리지 않을 때

**원인**: 상대 경로 문제
- **해결**: 전체 URL 복사해서 새 탭에서 열기

**테스트 페이지 활용**:
```
posting-tool-access.html 페이지에서 버튼 클릭
```

---

## 📱 모바일 접근

### 모바일에서 관리자 메뉴 접근하기

**1단계**: 모바일 브라우저에서 메인페이지 접속

**2단계**: 로그인 (test@esg.or.kr / password123)

**3단계**: 햄버거 메뉴(☰) → 마이페이지

**4단계**: 아래로 스크롤 → 관리자 메뉴 → 포스팅툴

**특징**:
- ✅ 모바일 최적화된 UI
- ✅ 카카오톡 스타일 인터페이스
- ✅ 터치 제스처 지원

---

## 🚀 권장 워크플로우

### 일반 사용자 → 관리자 전환 플로우

```
1. 메인페이지 접속
   ↓
2. 로그인 (test@esg.or.kr / password123)
   ↓
3. 마이페이지 클릭
   ↓
4. 좌측 사이드바 → 관리자 메뉴
   ↓
5. 포스팅툴 클릭
   ↓
6. 슬라이드 편집 시작
```

### 관리자 전용 빠른 접근

```
1. 테스트 페이지 직접 접속
   (posting-tool-access.html)
   ↓
2. "포스팅툴 열기" 클릭
   ↓
3. 편집 시작
```

---

## 📞 추가 도움말

### 관련 문서
- `POSTING_TOOL_LINKS.md`: 모든 링크 모음
- `POSTING_TOOL_GUIDE.md`: 포스팅툴 사용 가이드
- `MIGRATION_GUIDE.md`: 서버 배포 가이드

### 문의
- 이메일: admin@esg.or.kr
- 전화: 010-4263-7715

---

**마지막 업데이트**: 2025년 12월 31일  
**버전**: v1.0  
**프로젝트**: 한국ESG학회 공식 웹사이트
