# 한국ESG학회 웹사이트

## 프로젝트 개요
한국ESG학회의 공식 웹사이트입니다. 메인 페이지 히어로 슬라이드 관리 시스템, 포스팅 툴, 회원 관리 시스템을 제공합니다.

---

## 🔧 개발자 도구

### 강제 로그인 (테스트용)

개발 및 테스트 시 빠른 로그인을 위한 도구입니다.

#### 방법 1: 테스트 페이지 사용 (권장)
- 📄 파일: `force-login.html`
- 🌐 접속: 브라우저에서 직접 열기
- ✨ 원클릭으로 최고관리자/관리자/일반 사용자 로그인

#### 방법 2: 브라우저 콘솔 사용
```javascript
// force-login.js 스크립트 로드 후 콘솔에서:

// 최고관리자로 로그인
forceLoginAsAdmin()

// 커스텀 로그인
forceLoginAs('test@example.com', '홍길동', 'admin')

// 로그아웃
forceLogout()

// 로그인 상태 확인
checkLoginStatus()
```

#### 방법 3: URL 파라미터
```
http://localhost/index.html?auto_login=admin
```

**⚠️ 주의: 프로덕션 환경에서는 반드시 제거하세요!**

---

## 주요 기능

### ✅ 완료된 기능

#### 1. 회원 관리 시스템 (2025-01-21 신규 추가)
- **회원가입**
  - 이메일 중복 확인
  - 비밀번호 강도 체크 (약함/보통/강함)
  - SHA-256 해싱으로 비밀번호 보안
  - 필수 정보: 이메일, 비밀번호, 이름
  - 선택 정보: 전화번호, 소속 기관
  - 약관 동의 (이용약관, 개인정보처리방침)
  
- **로그인**
  - Table API 기반 실제 회원 인증
  - 자동 로그인 (로그인 상태 유지)
  - 마지막 로그인 시간 자동 기록

- **권한 시스템 (3단계)**
  - **최고관리자** (super_admin): 모든 권한
  - **관리자** (admin): 메인 관리, AI 모듈, 관리 게시판, 게시물 입력 권한
  - **사용자** (user): 일반 게시판, 댓글 작성 권한
  
- **데이터베이스**
  - `members` 테이블: 회원 정보 저장 (RESTful Table API)
  - 13개 필드: id(이메일), password(해시), name, role, status, phone, affiliation 등
  - `government` 테이블: 정부기관 정보 (id, name, logo, url, display_order)
  - `partners` 테이블: 협력기관 정보 (id, name, logo, url, display_order)
  
**⚠️ 중요: 2025-01-21 업데이트**
- SQL 예약어 충돌 해결: `order` 컬럼을 `display_order`로 변경
- 기존 데이터가 있다면 마이그레이션 필요

#### 2. 포스팅 툴 (Posting Tool)
- **경로**: `pages/admin/posting-tool.html`
- **기능**:
  - 메인 페이지 히어로 슬라이드 3개 관리
  - 이미지 업로드 (자동 압축: 1920x1080, JPEG 80%, 최대 20MB)
  - 이미지 편집 모달 (확대/축소, 위치 조정, 마스크 투명도)
  - 슬라이드 순서 변경
  - 버전 히스토리 저장
  - localStorage 기반 데이터 저장

#### 2. 이미지 자동 압축
- 원본 이미지를 1920x1080 이하로 리사이즈
- JPEG 품질 80% 압축
- Base64 인코딩으로 localStorage 저장
- 평균 압축률: 80~90%
- QuotaExceededError 해결

#### 3. 이미지 편집 모달
- **크기**: 1600px × 300px (포스팅 카드와 유사한 비율)
- **기능**:
  - 확대/축소 (50% ~ 200%)
  - 위치 조정 (드래그, 버튼, 키보드)
  - 마스크 투명도 조정 (0% ~ 100%)
- **UI/UX**:
  - 드래그로 이미지 위치 조정
  - ▲▼◀▶ 버튼으로 미세 조정 (20px)
  - 키보드 화살표로 미세 조정 (10px)
  - 중앙 정렬 리셋 기능

#### 4. 커스텀 알림 시스템
- 브라우저 중앙에 표시되는 모달 알림
- z-index 계층: 알림(12000) > 저장확인(11000) > 이미지편집(9000)
- 15개 알림 통합:
  - 로그인 필요, 파일 크기 초과, 파일 형식 오류
  - 이미지 처리 실패, 버전 제목 필수, 콘텐츠 필요
  - 저장 완료/실패, AI 편집 완료
  - 이미지 변형 값 유효하지 않음, 마스크 투명도 유효하지 않음
  - 이미지 업로드 성공 등

#### 5. 슬라이드 상태 유지
- 이미지 업로드 후 현재 펼친 슬라이드 유지
- `renderSlides(keepExpandedSlideId)` 함수로 자동 상태 복원

#### 6. 데이터 구조
```javascript
// localStorage: esg_hero_slides
[
  {
    id: 'slide_001',
    order: 1,
    image: 'data:image/jpeg;base64,...',  // Base64 압축 이미지
    title: '제목',
    description: '설명',
    buttonText: '버튼 텍스트',
    buttonLink: '링크 URL',
    imageTransform: {
      zoom: 125,           // 확대/축소 (%)
      positionX: 10.5,     // X 위치 (퍼센트)
      positionY: -5.2      // Y 위치 (퍼센트)
    },
    maskOpacity: 40        // 마스크 투명도 (0~100)
  }
]
```

---

## 알려진 이슈

### ⚠️ 현재 문제

#### 1. 편집 모달과 포스팅 카드 위치 불일치
**증상:**
- 편집 모달에서 이미지 위치를 조정하면
- 포스팅 카드에서 다른 위치로 표시됨
- 상하 위치가 맞지 않음

**원인:**
- 편집 모달: 1600px × 300px
- 포스팅 카드: 가변 너비 × 300px
- 화면 크기에 따라 비율이 달라짐
- CSS background-position의 % 계산 방식 차이

**임시 해결책:**
- 편집 모달에서 위치를 조정한 후
- 포스팅 카드를 확인하며 반복 조정
- 메인 페이지에서 최종 확인

---

## 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Storage**: localStorage (클라이언트 사이드)
- **Libraries**:
  - Font Awesome 6.4.0 (아이콘)
  - 없음 (바닐라 JavaScript)

---

## 파일 구조

```
/
├── index.html                          # 메인 페이지
├── pages/
│   ├── admin/
│   │   ├── posting-tool.html          # 포스팅 툴 (관리자 권한 필요)
│   │   ├── government-manager.html    # 유관기관 관리 (관리자 권한 필요)
│   │   ├── partners-manager.html      # 협력기관 관리 (관리자 권한 필요)
│   │   └── history-manager.html       # 히스토리 관리
│   └── mypage/
│       └── profile.html               # 회원정보 관리
├── js/
│   ├── password-utils.js              # 비밀번호 유틸리티 (해싱, 검증)
│   ├── signup.js                      # 회원가입 로직
│   ├── auth.js                        # 로그인/로그아웃 (Table API 기반)
│   ├── permission.js                  # 권한 관리
│   ├── custom-alert.js                # 커스텀 알림
│   ├── slide-utils.js                 # 슬라이드 유틸리티
│   ├── posting-tool.js                # 포스팅 툴 로직
│   └── image-editor.js                # 이미지 편집 모달
├── css/
│   ├── signup.css                     # 회원가입 모달 스타일
│   └── ...
└── README.md
```

---

## 데이터베이스 구조

### members 테이블
| 필드명 | 타입 | 설명 | 필수 |
|--------|------|------|------|
| id | text | 이메일 (Primary Key) | ✅ |
| password | text | SHA-256 해시된 비밀번호 | ✅ |
| name | text | 이름 | ✅ |
| name_en | text | 영문명 | ❌ |
| role | text | 권한 (super_admin/admin/user) | ✅ |
| status | text | 상태 (active/inactive/suspended) | ✅ |
| phone | text | 전화번호 | ❌ |
| affiliation | text | 소속 기관 | ❌ |
| department | text | 부서/학과 | ❌ |
| position | text | 직위 | ❌ |
| member_type | text | 회원 유형 (정회원/준회원/학생회원/명예회원) | ❌ |
| join_date | datetime | 가입일 | ✅ |
| last_login | datetime | 마지막 로그인 시간 | ❌ |

---

## API 엔드포인트

### 회원 관리
```javascript
// 회원가입
POST /tables/members
Body: { id, password(hash), name, role, status, ... }

// 로그인 (회원 조회)
GET /tables/members/{email}

// 이메일 중복 확인
GET /tables/members/{email}
→ 200 OK: 이메일 존재 (중복)
→ 404 Not Found: 사용 가능

// 마지막 로그인 시간 업데이트
PATCH /tables/members/{email}
Body: { last_login: "2025-01-21T10:00:00" }
```

---

## 권한 시스템

### 권한 계층
```javascript
{
  'super_admin': 3,  // 최고관리자
  'admin': 2,        // 관리자
  'user': 1          // 사용자
}
```

### 권한별 접근 가능 페이지
| 페이지 | 사용자 | 관리자 | 최고관리자 |
|--------|--------|--------|-----------|
| 포스팅 툴 | ❌ | ✅ | ✅ |
| 유관기관 관리 | ❌ | ✅ | ✅ |
| 협력기관 관리 | ❌ | ✅ | ✅ |
| 회원정보 관리 | ✅ | ✅ | ✅ |
| 일반 게시판 | ✅ | ✅ | ✅ |

### 권한 체크 함수
```javascript
// 페이지 접근 권한 체크
checkPagePermission('admin');  // 관리자 이상 필요

// 기능 권한 체크
hasPermission('admin');  // true/false 반환

// 최고관리자 체크
isSuperAdmin();  // true/false

// 관리자 이상 체크
isAdmin();  // true/false
```

---

## 파일 구조

```
/
├── index.html                          # 메인 페이지
├── pages/
│   └── admin/
│       ├── posting-tool.html          # 포스팅 툴
│       └── history-manager.html       # 히스토리 관리
├── js/
│   ├── custom-alert.js                # 커스텀 알림
│   ├── slide-utils.js                 # 슬라이드 유틸리티
│   ├── posting-tool.js                # 포스팅 툴 로직
│   ├── image-editor.js                # 이미지 편집 모달
│   └── reset-slide-1-position.js      # 슬라이드 초기화 (1회)
└── README.md
```

---

## 개발 가이드

### 이미지 압축 함수
```javascript
// js/posting-tool.js
async function compressImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
    // Canvas로 리사이즈 및 JPEG 압축
    // 반환: Base64 Data URL
}
```

### 이미지 위치 계산
```javascript
// js/slide-utils.js
const ImageTransformUtils = {
    // 픽셀 → 퍼센트 (1600px 기준)
    pixelToPercent(pixelValue, frameSize) {
        return (pixelValue / frameSize) * 100;
    },
    
    // localStorage → CSS
    storageToCSS(imageTransform, maskOpacity) {
        const posX = 50 + imageTransform.positionX;
        const posY = 50 + imageTransform.positionY;
        return {
            backgroundSize: `${imageTransform.zoom}%`,
            backgroundPosition: `${posX}% ${posY}%`,
            maskOpacity: maskOpacity / 100
        };
    }
};
```

### 편집 모달 크기
```javascript
// js/slide-utils.js
const FRAME_CONFIG = {
    EDITOR_WIDTH: 1600,   // 편집 모달 너비
    EDITOR_HEIGHT: 300    // 편집 모달 높이
};
```

---

## 향후 개선 사항

### 1. 이미지 위치 완전 일치 (우선순위: 높음)
**목표:** 편집 모달과 포스팅 카드의 이미지 위치를 100% 일치시키기

**방법 1: 편집 모달을 포스팅 카드와 동일한 크기로**
- 현재: 편집 모달 1600px 고정
- 변경: 편집 모달을 포스팅 카드의 실제 너비에 맞춤
- 장점: 완벽한 일치
- 단점: 화면 크기에 따라 편집 모달 크기 변경

**방법 2: 픽셀 절대값 저장 방식**
- 현재: 퍼센트로 저장
- 변경: 픽셀 절대값으로 저장
- 장점: 정확한 위치
- 단점: 반응형 대응 어려움

**방법 3: Transform 방식으로 통일**
- 현재: background-position 사용
- 변경: CSS transform: translate() 사용
- 장점: 픽셀 단위 정확도
- 단점: 대대적인 수정 필요

### 2. RESTful Table API 전환
- localStorage 용량 제한 해결
- 이미지를 별도 저장소에 업로드
- 데이터베이스 기반 관리

### 3. 이미지 최적화
- WebP 포맷 지원
- 반응형 이미지 (srcset)
- Lazy loading

### 4. UI/UX 개선
- 드래그 앤 드롭으로 슬라이드 순서 변경
- 실시간 미리보기
- 되돌리기/다시하기 (Undo/Redo)

---

## 배포

**Publish 탭**에서 원클릭 배포

---

## 테스트 가이드

### 1. 회원가입 테스트
1. 메인 페이지 접속
2. 헤더 > 마이페이지 > "회원가입" 클릭
3. 회원가입 모달 열림
4. 이메일 입력 후 "중복확인" 클릭
5. 비밀번호 입력 (강도 체크 확인)
6. 비밀번호 확인 입력 (일치 여부 확인)
7. 이름 입력
8. 필수 약관 체크
9. "가입하기" 클릭
10. 성공 메시지 확인
11. 자동으로 로그인 모달 열림

### 2. 로그인 테스트
**테스트 계정:**
- 이메일: `test@example.com` (회원가입 후)
- 비밀번호: 가입 시 입력한 비밀번호

**관리자 계정:**
- 이메일: `jongjean@naver.com`
- 비밀번호: `kjj468600!`
- 권한: 최고관리자

**테스트 절차:**
1. 헤더 > 마이페이지 > "로그인" 클릭
2. 이메일/비밀번호 입력
3. 로그인 성공 시 메뉴 자동 변경 확인
   - "회원가입" → 숨김
   - "로그인" → 숨김
   - "회원정보 관리" → 표시
   - "로그아웃" → 표시

### 3. 권한 테스트
**사용자 권한 (user):**
1. 일반 계정으로 로그인
2. 포스팅 툴 접근 시도 → "접근 권한 없음" 알림
3. 유관기관 관리 접근 시도 → "접근 권한 없음" 알림

**관리자 권한 (admin 이상):**
1. jongjean@naver.com 로그인
2. 마이페이지 > 회원정보 관리 > "관리자 메뉴" 표시 확인
3. 포스팅 툴 접근 → 정상 접근
4. 유관기관 관리 접근 → 정상 접근
5. 협력기관 관리 접근 → 정상 접근

### 4. 비밀번호 해싱 테스트
브라우저 콘솔에서:
```javascript
// 비밀번호 해싱 테스트
hashPassword('test123').then(hash => console.log(hash));

// 비밀번호 강도 테스트
checkPasswordStrength('weak');        // { strength: 1, text: '약함', color: '#e74c3c' }
checkPasswordStrength('Medium1!');    // { strength: 3, text: '강함', color: '#27ae60' }
```

### 5. 알려진 이슈 및 해결

#### ⚠️ 초기 관리자 계정 비밀번호
- **문제**: jongjean@naver.com 계정의 비밀번호가 placeholder로 되어 있음
- **해결**: 
  ```javascript
  // 브라우저 콘솔에서 실행
  hashPassword('kjj468600!').then(async hash => {
      const response = await fetch('tables/members/jongjean@naver.com', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: hash })
      });
      console.log('비밀번호 업데이트:', response.ok ? '성공' : '실패');
  });
  ```

---

## 배포

**Publish 탭**에서 원클릭 배포

---

## 라이선스

© 2025 한국ESG학회. All rights reserved.

---

## 작업 이력

### 2025-01-21 (회원 관리 시스템 구축)
- ✅ **회원가입 시스템**
  - members 테이블 스키마 생성 (13개 필드)
  - 회원가입 모달 HTML/CSS 구현
  - 비밀번호 해싱 (SHA-256)
  - 이메일 중복 확인 API 연동
  - 비밀번호 강도 체크 UI
  - 약관 동의 기능
  - **버그 수정**: 회원가입 완료 후 404 에러 (폼 제출 방지 추가)
  - **버그 수정**: 모달 내부 클릭 시 닫힘 (이벤트 전파 차단)
  - **버그 수정**: 로그인 후 자동 로그아웃 (페이지 새로고침 제거)
  - **기능 제거**: 자동 로그인 기능 제거 (sessionStorage만 사용)
  
- ✅ **로그인 시스템 개선**
  - Table API 기반 실제 회원 인증
  - 하드코딩에서 DB 기반으로 전환
  - 비밀번호 해시 검증
  - 계정 상태 확인 (active/inactive/suspended)
  - 마지막 로그인 시간 자동 업데이트
  - **세션 기반 로그인**: 브라우저 닫으면 자동 로그아웃
  
- ✅ **권한 관리 시스템**
  - 3단계 권한 구조 (최고관리자/관리자/사용자)
  - permission.js 구현
  - 관리 페이지 권한 보호 (포스팅 툴, 유관기관, 협력기관)
  - 권한 기반 UI 표시/숨김
  
- ✅ **초기 관리자 계정**
  - 이메일: jongjean@naver.com
  - 이름: 강종진
  - 권한: super_admin (최고관리자)
  - 회원 유형: 공동회장

- ✅ jongjean@naver.com 회원 정보 수정
  - 이름: 강종진
  - 회원 등급: 정회원 → 공동회장
  - 상태: 활동중 (유지)
  - 등급: VIP등급 → 최고관리자
  - 영문명: Kang Jong-Jin
  - 이메일: jongjean@naver.com

### 2025-01-20
- ✅ 이미지 자동 압축 구현
- ✅ 편집 모달 크기 조정 (960 → 1200 → 1600px)
- ✅ 커스텀 알림 시스템 구현
- ✅ 슬라이드 상태 유지 기능
- ✅ 드래그 방향 수정 (부드러운 드래그)
- ⚠️ 편집 모달-포스팅 카드 위치 불일치 (미해결)

---

**Note:** 편집 모달과 포스팅 카드의 위치 불일치 문제는 현재 조사 중입니다.
