# 한국ESG학회 공식 홈페이지 - 프로젝트 완전 상태 기록

## 🎯 프로젝트 정체성
- **프로젝트명**: 한국ESG학회 공식 홈페이지 (ESG 뉴스 사이트 ❌)
- **목적**: 학회의 랜딩 페이지 겸 공식 포털
- **개발 환경**: 샌드박스 (AI 개발 환경)
- **개발자**: 강종진 (총괄 책임자)
- **GitHub**: https://github.com/jongjean/esg_www
- **버전**: v2.2 (2025-12-29)

---

## 📂 저장소 & 배포 구조

### Git 저장소
```
Repository: https://github.com/jongjean/esg_www
Branch: main
Owner: jongjean
```

### 서버 환경 (실제 배포)
```
개발 폴더: /home/ucon/monggol
배포 폴더: /var/www/monggol
배포 스크립트: ./build.sh

내부 URL: http://172.30.1.150/
외부 URL: https://uconai.ddns.net/esg/
```

### 빌드 프로세스
- **빌드 도구**: 없음 (순수 정적 파일)
- **개발버전 = 배포버전**: 동일함
- **배포 방법**: build.sh로 파일 복사만 수행

---

## 🎨 현재 UI/UX 상태

### 1. 메뉴 시스템
- **데스크톱 메뉴**: 11개 최상위 메뉴, 다닥다닥 붙은 버튼형 디자인
- **간격**: gap: 0, padding: 8px 12px
- **스타일**: 배경색 var(--bg-light), 호버 시 초록색 + 위로 2px 이동
- **드롭다운 화살표**: 제거됨
- **반응형**: 900px 이하에서 좌측 사이드바로 전환

### 2. 모바일 사이드바 메뉴
- **위치**: 좌측에서 슬라이드 인
- **폭**: 280px 고정
- **제스처**: 
  - 오버레이 클릭으로 닫기
  - 햄버거 버튼 클릭으로 토글
  - 왼쪽으로 스와이프(50px 이상)로 닫기
- **헤더**: 초록색 배경에 "메뉴" 텍스트

### 3. 로그인 상태창
- **위치**: 화면 최상단 우측 고정 (position: fixed)
- **z-index**: 1001 (헤더 위)
- **스타일**: 텍스트 링크만 (버튼 스타일 제거)
- **구분선**: 없음 (회원가입  로그인)
- **폰트**: 0.75rem (데스크톱), 0.7rem (모바일)
- **간격**: right: 30px, gap: 10px
- **로그인 후**: 👤 홍길동님 [마이페이지] [로그아웃]
- **데이터**: localStorage 키 'user'에 저장

### 4. 헤더/푸터 로고
- **파일**: images/logo.png (31KB)
- **헤더 크기**: 45px (데스크톱), 38px (모바일 ≤900px), 35px (≤480px)
- **푸터 크기**: 60px
- **푸터 스타일**: 흰색 테두리 5px, 패딩 5px, 둥근 모서리 8px
- **배경**: 푸터는 어두운 회색(#2c3e50)

### 5. 컬러 시스템
```css
--primary-green: #1e7e34;        /* ESG 초록 */
--primary-blue: #2874a6;         /* ESG 파랑 */
--bg-green-light: #e8f5e9;       /* 연한 초록 (환경) */
--bg-blue-light: #e3f2fd;        /* 연한 파랑 (사회) */
--bg-light: #f8f9fa;             /* 연한 회색 */
--text-dark: #333333;
--white: #ffffff;
```

### 6. 섹션별 배경색
- **Body**: #f8f9fa (연한 회색)
- **Header**: #ffffff (흰색)
- **Hero**: 그라데이션 (135deg, #f8f9fa, #ffffff)
- **ESG Values**: #e8f5e9 (연한 초록 - 환경)
- **News**: #ffffff (흰색)
- **Quick Links**: #e3f2fd (연한 파랑 - 사회)
- **Footer**: #2c3e50 (어두운 회색)

---

## 📱 반응형 브레이크포인트

```css
/* 데스크톱 */
@media (min-width: 901px) {
  - 전체 메뉴 가로 배열
  - 로고 45px
  - 로그인 상태창 우측 상단
}

/* 태블릿 & 모바일 */
@media (max-width: 900px) {
  - 좌측 280px 사이드바 메뉴
  - 로고 38px
  - 햄버거 버튼 표시
  - 로그인 상태창 우측 상단 유지
}

/* 소형 모바일 */
@media (max-width: 480px) {
  - 로고 35px
  - 폰트 크기 추가 축소
}
```

---

## 🗂️ 사이트맵 (12개 섹션, 55개 페이지)

### 1. 학회소개 (6개)
- pages/about/greeting.html - 학회장 인사말
- pages/about/purpose.html - 설립 목적·비전
- pages/about/history.html - 연혁
- pages/about/constitution.html - 정관·규정
- pages/about/ci.html - CI·BI
- pages/about/location.html - 오시는 길

### 2. 학회조직 (3개)
- pages/organization/executives.html - 임원진
- pages/organization/committees.html - 위원회
- pages/organization/divisions.html - 분과학회·연구회

### 3. 회원안내 (5개)
- pages/member/types.html - 회원 구분
- pages/member/process.html - 가입 절차
- pages/member/fee.html - 회비 안내
- pages/member/benefits.html - 회원 혜택
- pages/member/companies.html - 회원사 소개

### 4. 핵심사업 (4개)
- pages/core/world-forum.html - 월드ESG포럼
- pages/core/esg-awards.html - 한국ESG대상
- pages/core/ordinance-awards.html - 한국ESG조례대상
- pages/core/seminar.html - 월요학술세미나

### 5. 학술지·논문 (6개)
- pages/journal/about.html - 학술지 소개
- pages/journal/submission.html - 논문 투고
- pages/journal/editorial.html - 편집위원회
- pages/journal/guidelines.html - 심사 규정
- pages/journal/archive.html - 논문 아카이브
- **pages/journal/dbpia-embed.html** - DBpia 연동 (신규 ✨)

### 6. ESG정책·연구 (5개)
- pages/policy/research.html - 정책 연구
- pages/policy/standards.html - 지표·표준
- pages/policy/legislation.html - 법·제도
- pages/policy/global.html - 국제 동향
- pages/policy/reports.html - 보고서

### 7. ESG뉴스 (6개)
- pages/news/main.html - 주요 뉴스
- pages/news/policy.html - 정책 동향
- pages/news/cases.html - 기업 사례
- pages/news/press.html - 보도자료
- pages/news/column.html - 칼럼
- **pages/news/esg-news-embed.html** - 코리아ESG뉴스 연동 (신규 ✨)

### 8. 커뮤니티 (5개)
- pages/community/notice.html - 공지사항
- pages/community/forum.html - 자유게시판
- pages/community/discussion.html - 학술·정책 토론
- pages/community/members.html - 회원 소식
- pages/community/qna.html - Q&A

### 9. 자료실 (5개)
- pages/materials/academic.html - 학술자료
- pages/materials/policy.html - 정책자료
- pages/materials/presentation.html - 발표자료
- pages/materials/esg.html - ESG 리포트
- pages/materials/video.html - 영상자료

### 10. 후원·기부 (4개)
- pages/support/guide.html - 후원 안내
- pages/support/corporate.html - 기업 후원
- pages/support/personal.html - 개인 기부
- pages/support/usage.html - 기부금 사용 내역

### 11. 마이페이지 (6개)
- pages/mypage/profile.html - 회원정보 관리
- pages/mypage/payment.html - 회비 납부
- pages/mypage/history.html - 납부 내역
- pages/mypage/papers.html - 논문 투고 현황
- pages/mypage/events.html - 행사·세미나 신청 내역
- pages/mypage/certificate.html - 회원증·증명서

### 12. 메인 페이지
- **index.html** - 홈페이지

---

## 🔗 외부 서비스 임베드 연동

### 1. 코리아ESG뉴스
- **파일**: pages/news/esg-news-embed.html
- **URL**: https://www.ken.io.kr/
- **방식**: iframe + Fallback 하이브리드
- **특징**: X-Frame-Options 차단 시 자동 대체 컨텐츠 표시

### 2. DBpia (논문 데이터베이스)
- **파일**: pages/journal/dbpia-embed.html
- **URL**: https://www.dbpia.co.kr/
- **방식**: iframe + Fallback 하이브리드
- **기능**: 논문 검색, 논문 투고, 바로가기 버튼

### 임베드 페이지 구조
```html
<div class="embed-container">
  <iframe src="외부URL"></iframe>
  <div class="fallback-content" style="display:none;">
    <!-- 차단 시 대체 컨텐츠 -->
    <a href="외부URL" class="btn">바로가기</a>
  </div>
</div>
```

### JavaScript 로직
```javascript
iframe.onerror = function() {
  iframe.style.display = 'none';
  fallback.style.display = 'block';
};
```

---

## 🖼️ 이미지 파일

### 로고
- **images/logo.png** - 한국ESG학회 공식 로고 (31KB)
  - 컬러풀 ESG 심볼 (E=초록, S=분홍, G=파랑)
  - 한국ESG학회 한글/영문 표기

### 파트너 로고 (사용 안 함 - 푸터에서 제거됨)
- images/partner-ken.png - 코리아ESG뉴스 (참고용)
- images/partner-dbpia.png - DBpia (참고용)

---

## 📝 핵심 파일 구조

```
esg_www/
├── index.html                     # 메인 페이지 (24KB)
├── css/
│   ├── style.css                 # 메인 스타일 (전체 사이트)
│   └── subpage.css               # 서브페이지 스타일
├── js/
│   └── main.js                   # 메인 JavaScript
│       - 히어로 슬라이더
│       - 모바일 메뉴 토글
│       - 사이드바 스와이프 제스처
│       - 로그인 상태 관리
│       - 스크롤 효과
├── images/
│   ├── logo.png                  # 공식 로고 (31KB) ✨
│   ├── partner-ken.png           # 참고용
│   └── partner-dbpia.png         # 참고용
├── pages/
│   ├── about/ (6개)
│   ├── organization/ (3개)
│   ├── member/ (5개)
│   ├── core/ (4개)
│   ├── journal/ (6개)
│   │   └── dbpia-embed.html      # DBpia 연동 ✨
│   ├── policy/ (5개)
│   ├── news/ (6개)
│   │   └── esg-news-embed.html   # 뉴스 연동 ✨
│   ├── community/ (5개)
│   ├── materials/ (5개)
│   ├── support/ (4개)
│   └── mypage/ (6개)
├── build.sh                       # 서버 배포 스크립트
├── .gitignore                     # Git 제외 파일
├── README.md                      # 프로젝트 문서
└── GIT_PUSH_GUIDE.md             # Git 푸시 가이드
```

---

## 🔧 JavaScript 기능 (js/main.js)

### 1. 히어로 슬라이더
```javascript
- 자동 전환 (5초 간격)
- 좌우 버튼 네비게이션
- 도트 인디케이터
- 호버 시 일시정지
```

### 2. 모바일 사이드바 메뉴
```javascript
// 햄버거 버튼 토글
.mobile-menu-btn 클릭 → .nav-menu.active 토글

// 오버레이 클릭 닫기
.sidebar-overlay 클릭 → 사이드바 닫기

// 스와이프 제스처
touchstart → touchmove → touchend
50px 이상 왼쪽 스와이프 시 사이드바 닫기
```

### 3. 로그인 상태 관리
```javascript
// 로컬스토리지 구조
localStorage.setItem('user', JSON.stringify({
  name: '홍길동',
  email: 'hong@example.com'
}));

// 테스트 함수
function testLogin(userData) { ... }

// 로그아웃
function logout() {
  localStorage.removeItem('user');
  location.reload();
}

// 페이지 로드 시 상태 확인
window.addEventListener('DOMContentLoaded', updateLoginStatus);
```

### 4. 드롭다운 메뉴
```javascript
// 데스크톱: 호버로 드롭다운 표시
.has-dropdown:hover .dropdown-menu { opacity: 1; visibility: visible; }

// 모바일: 클릭으로 토글
.has-dropdown .nav-link 클릭 → .dropdown-menu.active 토글
```

---

## 🎨 CSS 주요 스타일 (css/style.css)

### 메뉴 스타일
```css
.nav-menu {
  display: flex;
  gap: 0;  /* 완전 밀착 */
  list-style: none;
}

.nav-link {
  padding: 8px 12px;
  font-size: 0.75rem;
  background: var(--bg-light);
  border-radius: 0;
  border: 2px solid transparent;
  border-right: 1px solid rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.nav-link:hover {
  background: var(--primary-green);
  color: white;
  transform: translateY(-2px);
}

.nav-item:first-child .nav-link {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.nav-item:last-child .nav-link {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  border-right: 2px solid transparent;
}
```

### 모바일 사이드바
```css
@media (max-width: 900px) {
  .nav-menu {
    position: fixed;
    top: 0;
    left: -280px;  /* 숨김 */
    width: 280px;
    height: 100vh;
    flex-direction: column;
    background: white;
    transition: left 0.3s ease;
    z-index: 1002;
  }
  
  .nav-menu.active {
    left: 0;  /* 표시 */
  }
  
  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 1001;
    display: none;
  }
  
  .sidebar-overlay.active {
    display: block;
  }
}
```

### 로그인 상태창
```css
.user-status-fixed {
  position: fixed;
  top: 10px;
  right: 30px;
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
}

.status-link {
  font-size: 0.75rem;
  color: var(--text-dark);
  font-weight: 500;
  text-decoration: none;
  transition: color 0.3s ease;
}

.status-link:hover {
  color: var(--primary-green);
  text-decoration: underline;
}
```

### 푸터 로고
```css
.footer-logo-img {
  height: 60px;
  width: auto;
  object-fit: contain;
  border: 5px solid white;
  padding: 5px;
  background: white;
  border-radius: 8px;
}
```

---

## 📚 중요 문서 파일들

### 기술 문서
1. **README.md** - 프로젝트 전체 가이드
2. **GIT_PUSH_GUIDE.md** - Git 푸시 상세 가이드
3. **PROJECT_MEMORY.md** - 이 파일 (완전 상태 기록)

### 개발 과정 문서
4. **MENU_STYLE_UPDATE.md** - 메뉴 스타일 변경 기록
5. **MENU_FINAL.md** - 메뉴 최종 디자인
6. **LOGIN_STATUS.md** - 로그인 기능 구현
7. **LOGIN_FIXED_TOP.md** - 로그인 상단 고정
8. **LOGIN_TEXT_ONLY.md** - 로그인 텍스트 링크화
9. **MOBILE_SIDEBAR_MENU.md** - 모바일 사이드바 개발
10. **EMBED_INTEGRATION.md** - 외부 서비스 임베드 연동
11. **LOGO_UPDATE.md** - 로고 교체 작업
12. **FOOTER_LOGO_BORDER.md** - 푸터 로고 스타일
13. **COLOR_CONCEPT.md** - 컬러 시스템 구축
14. **SPACING_FINAL.md** - 간격 조정 최종

### 서버 배포 문서
15. **DEPLOY.md** - 배포 가이드
16. **DEPLOY_CHECKLIST.md** - 배포 체크리스트
17. **DEV_SETUP.md** - 개발 환경 설정
18. **build.sh** - 배포 스크립트

---

## 🚨 중요 주의사항

### 1. 협력기관 섹션 푸터 통합 완료 ✅
- 푸터에 협력기관 섹션 추가됨 (2025-12-29)
- **코리아ESG뉴스**: 메뉴 + 푸터 모두 표시
- **DBpia**: 메뉴 + 푸터 모두 표시
- 파트너 로고 이미지: images/partner-ken.png, images/partner-dbpia.png

### 2. 메뉴 드롭다운 화살표 제거 ⚠️
```css
.has-dropdown .nav-link::after {
  display: none;  /* 화살표 완전 제거 */
}
```

### 3. 로그인 상태창 위치 고정 ⚠️
- position: fixed로 항상 최상단 우측에 고정
- 스크롤해도 따라다님
- 햄버거 메뉴와 독립적으로 동작

### 4. 모바일 메뉴 방향 변경 ⚠️
- 이전: 상단에서 아래로 펼침
- 현재: 좌측에서 우측으로 슬라이드

### 5. 간격 최소화 ⚠️
- 메뉴 간격: gap: 0 (완전 밀착)
- 로그인과 메뉴 간격: 18px
- 메뉴 패딩: 8px (최소화)

---

## 🔄 워크플로우

### 개발 → 배포 프로세스
```
1. 샌드박스에서 개발 (현재 위치)
   ↓
2. Publish 탭 → Download ZIP
   ↓
3. 로컬 PC에서 압축 해제
   ↓
4. Git Push
   cd esg_www
   git add .
   git commit -m "feat: v2.1 업데이트"
   git push origin main
   ↓
5. 서버에서 Git Pull
   cd /home/ucon/monggol
   git pull origin main
   ↓
6. 빌드 & 배포
   ./build.sh
   ↓
7. 웹사이트 확인
   https://uconai.ddns.net/esg/
```

---

## ✅ 완료된 작업 (v2.2)

### v2.2 업데이트 (2025-12-29)
- ✅ **전체 서브페이지 로고 통일화 (56개 페이지)**
  - index.html + 서브페이지 55개 모두 images/logo.png 사용
  - logo-full.png 완전 제거
  - logo-text 스타일 제거
- ✅ **메뉴 링크 연결 완료**
  - ESG뉴스 메뉴에 "코리아ESG뉴스" 추가 → pages/news/esg-news-embed.html
  - 학술지·논문 메뉴에 "DBPIA 논문 검색" 임베드 연결 → pages/journal/dbpia-embed.html
- ✅ **파트너 기관 로고 푸터 통합**
  - 코리아ESG뉴스, DBpia 로고 표시
  - 5개 페이지 적용 (index.html + 주요 서브페이지 4개)
  - 반응형 디자인 및 호버 애니메이션
  - 외부 링크 연결 (새 탭 열기)

### v2.1 업데이트 (2025-12-27)

### UI/UX
- ✅ 메뉴 간격 최소화 (다닥다닥 배치)
- ✅ 버튼형 메뉴 디자인 (배경, 호버 효과)
- ✅ 드롭다운 화살표 제거
- ✅ 모바일 좌측 사이드바 메뉴 (280px)
- ✅ 스와이프 제스처 지원
- ✅ 로그인 상태창 최상단 우측 고정
- ✅ 로그인 텍스트 링크화 (버튼 스타일 제거)
- ✅ 회원가입/로그인 구분선 제거

### 디자인
- ✅ ESG 컨셉 컬러 전면 적용
- ✅ 섹션별 배경색 차별화 (초록/파랑/회색)
- ✅ 공식 로고 교체 (images/logo.png)
- ✅ 푸터 로고 흰색 테두리 5px
- ✅ 협력기관 섹션 푸터에서 제거

### 기능
- ✅ 임베드 연동 페이지 생성 (코리아ESG뉴스, DBpia)
- ✅ 로그인 상태 관리 (localStorage)
- ✅ 모바일 사이드바 터치 제스처

### 문서
- ✅ README.md 업데이트
- ✅ GIT_PUSH_GUIDE.md 작성
- ✅ PROJECT_MEMORY.md 작성 (이 파일)
- ✅ .gitignore 추가

---

## ⏳ 미완료 작업 (TODO)

### 메뉴 링크 연결 ✅ 완료
- ✅ ESG뉴스 메뉴 → pages/news/esg-news-embed.html 연결
- ✅ 학술지·논문 메뉴 → pages/journal/dbpia-embed.html 연결

### 로그인 기능
- ⏳ 실제 로그인 API 연동
- ⏳ 회원가입 페이지 개발
- ⏳ 비밀번호 찾기 기능

### 게시판 시스템
- ⏳ 공지사항 게시판
- ⏳ 자유게시판
- ⏳ Q&A 게시판

### API 연동
- ⏳ 코리아ESG뉴스 RSS/API
- ⏳ DBpia API 연동
- ⏳ 관리자 페이지

---

## 📞 연락처 정보

### 학회 정보
- **회장**: 고문현
- **전화**: 010-4263-7715
- **이메일**: kohmh@ssu.ac.kr
- **주소**: [06978] 서울특별시 동작구 상도로 369, 숭실대학교 진리관 508호

### 홈페이지 관리
- **개발자**: 강종진
- **이메일**: mail@iuci.kr
- **역할**: 총괄 책임자

---

## 🎯 새 창에서 작업 시작 시 확인사항

### 1. 프로젝트 정체성 확인
- ❓ 이것은 ESG 뉴스 사이트인가? → ❌ 한국ESG학회 공식 홈페이지
- ❓ 개발 환경은? → 샌드박스 (AI 개발 환경)
- ❓ Git 저장소는? → https://github.com/jongjean/esg_www

### 2. 현재 상태 파악
- 이 문서(PROJECT_MEMORY.md) 전체 읽기
- README.md 확인
- index.html 열어서 로고/메뉴/로그인 확인

### 3. 작업 우선순위
1. 🔴 **높음**: 서브페이지 로고 교체
2. 🟡 **중간**: 메뉴 링크 연결
3. 🟢 **낮음**: 로그인 API 연동, 게시판 시스템

### 4. 배포 방법
- Publish 탭 → Download ZIP → Git Push
- 서버에서 git pull → ./build.sh

---

## 💡 개발 원칙

### UI/UX
- 메뉴는 **최대한 붙여서** 배치
- 로그인 상태창은 **항상 최상단 우측 고정**
- 모바일은 **좌측 사이드바** 메뉴
- ESG 컬러(초록/파랑)를 **적극 활용**

### 코드
- 순수 HTML/CSS/JavaScript (번들러 없음)
- 개발버전 = 배포버전 (빌드 없음)
- CDN 사용 (Google Fonts, Font Awesome)

### 용어
- "거버넌스" 사용 (지배구조 ❌)
- ESG = Environment, Social, Governance

---

## 🔑 핵심 키워드 (검색용)

```
한국ESG학회
공식 홈페이지
샌드박스 개발
Git: jongjean/esg_www
로고: images/logo.png
메뉴: 다닥다닥 버튼형
모바일: 좌측 280px 사이드바
로그인: 최상단 우측 고정
컬러: 초록(#1e7e34) 파랑(#2874a6)
임베드: 코리아ESG뉴스, DBpia
배포: ./build.sh
버전: v2.1
```

---

## 📊 프로젝트 통계

- **총 페이지**: 56개 (메인 1 + 서브 55)
- **메뉴 섹션**: 12개
- **메뉴 항목**: 55개
- **CSS 파일**: 2개
- **JS 파일**: 1개
- **이미지**: 3개 (로고 1 + 파트너 2)
- **문서**: 18개 이상
- **총 파일**: 70개 이상
- **개발 기간**: 2024 ~ 2025-12-27
- **현재 버전**: v2.1

---

<div align="center">
  <strong>✨ 이 문서를 새 창에서 읽고 작업을 이어가세요! ✨</strong>
  <br><br>
  <em>모든 정보가 완벽하게 기록되어 있습니다.</em>
</div>
