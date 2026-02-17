# 한국ESG학회 웹사이트 파일 목록

## 📦 전체 구조

```
esg-website/
├── index.html                          # 메인 페이지
│
├── css/                                # 스타일시트
│   ├── style.css                       # 메인 스타일
│   ├── subpage.css                     # 서브페이지 스타일
│   ├── disable-edit.css                # 편집 비활성화
│   ├── login.css                       # 로그인 스타일
│   ├── modal.css                       # 모달 스타일
│   └── posting-tool.css                # 포스팅툴 스타일
│
├── js/                                 # JavaScript
│   ├── main.js                         # 메인 로직
│   ├── auth.js                         # 인증 시스템
│   ├── auth-manager.js                 # 인증 관리
│   ├── header-loader.js                # 헤더 로더
│   ├── sound-effects.js                # 사운드 효과
│   ├── modal.js                        # 모달 관리
│   ├── posting-tool.js                 # 포스팅툴 로직
│   ├── history-manager.js              # 히스토리 관리
│   ├── application.js                  # 가입 신청
│   └── subpage-login.js                # 서브페이지 로그인
│
├── images/                             # 이미지 파일
│   ├── logo.png                        # 로고
│   ├── logo-symbol.png                 # 심볼 로고
│   └── (기타 이미지 파일들)
│
├── sounds/                             # 사운드 효과
│   └── (효과음 파일들)
│
├── includes/                           # 공통 컴포넌트
│   └── header.html                     # 공통 헤더
│
├── pages/                              # 전체 페이지 (77개)
│   │
│   ├── about/                          # 학회소개 (6개)
│   │   ├── greeting.html
│   │   ├── greeting-new.html
│   │   ├── purpose.html
│   │   ├── history.html
│   │   ├── constitution.html
│   │   ├── ci.html
│   │   └── location.html
│   │
│   ├── organization/                   # 학회조직 (3개)
│   │   ├── executives.html
│   │   ├── committees.html
│   │   └── divisions.html
│   │
│   ├── member/                         # 회원안내 (6개)
│   │   ├── types.html
│   │   ├── types-new.html
│   │   ├── process.html
│   │   ├── fee.html
│   │   ├── benefits.html
│   │   ├── companies.html
│   │   └── application.html
│   │
│   ├── core/                           # 핵심사업 (8개)
│   │   ├── main-services.html
│   │   ├── forum.html
│   │   ├── forum-new.html
│   │   ├── award.html
│   │   ├── ordinance.html
│   │   ├── seminar.html
│   │   ├── consulting.html
│   │   ├── education.html
│   │   └── certification.html
│   │
│   ├── journal/                        # 학술지·논문 (7개)
│   │   ├── about.html
│   │   ├── submission.html
│   │   ├── editorial.html
│   │   ├── editorial-board.html
│   │   ├── review.html
│   │   ├── archive.html
│   │   ├── search.html
│   │   └── dbpia-embed.html
│   │
│   ├── policy/                         # ESG정책·연구 (5개)
│   │   ├── research.html
│   │   ├── standards.html
│   │   ├── law.html
│   │   ├── global.html
│   │   └── reports.html
│   │
│   ├── news/                           # ESG뉴스 (8개)
│   │   ├── main.html
│   │   ├── domestic.html
│   │   ├── policy.html
│   │   ├── cases.html
│   │   ├── press.html
│   │   ├── column.html
│   │   ├── video.html
│   │   └── esg-news-embed.html
│   │
│   ├── community/                      # 커뮤니티 (6개)
│   │   ├── notice.html
│   │   ├── notice-new.html
│   │   ├── free-board.html
│   │   ├── discussion.html
│   │   ├── member-news.html
│   │   ├── qna.html
│   │   └── forum.html
│   │
│   ├── materials/                      # 자료실 (5개)
│   │   ├── academic.html
│   │   ├── policy.html
│   │   ├── report.html
│   │   ├── presentation.html
│   │   └── video.html
│   │
│   ├── support/                        # 후원·기부 (4개)
│   │   ├── personal.html
│   │   ├── corporate.html
│   │   ├── guide.html
│   │   └── usage.html
│   │
│   ├── mypage/                         # 마이페이지 (7개)
│   │   ├── profile.html
│   │   ├── payment.html
│   │   ├── payment-success.html
│   │   ├── history.html
│   │   ├── paper.html
│   │   ├── event.html
│   │   └── certificate.html
│   │
│   ├── auth/                           # 인증 (2개)
│   │   ├── login.html
│   │   └── signup.html
│   │
│   ├── admin/                          # 관리자 (2개) ⭐ NEW
│   │   ├── posting-tool.html
│   │   └── history-manager.html
│   │
│   └── sitemap.html                    # 사이트맵
│
└── 문서 파일들/
    ├── README.md                       # 프로젝트 개요
    ├── POSTING_TOOL_GUIDE.md           # 포스팅툴 가이드
    ├── POSTING_TOOL_COMPLETION.md      # 포스팅툴 완료 보고서
    ├── MIGRATION_GUIDE.md              # 마이그레이션 가이드
    ├── DEPLOY.md                       # 배포 가이드
    ├── DEMO_GUIDE.md                   # 시연 가이드
    └── (기타 개발 문서들)
```

---

## 📊 통계

- **총 페이지**: 77개 HTML
- **CSS 파일**: 6개
- **JavaScript 파일**: 10개
- **총 폴더**: 15개

---

## 🎯 핵심 파일

### 필수 파일 (반드시 포함)
1. `index.html` - 메인 페이지
2. `css/style.css` - 메인 스타일
3. `js/main.js` - 메인 로직
4. `images/logo.png` - 로고
5. 전체 `pages/` 폴더 (77개 페이지)

### 관리자 기능 (v4.0)
1. `pages/admin/posting-tool.html`
2. `pages/admin/history-manager.html`
3. `js/posting-tool.js`
4. `js/history-manager.js`
5. `css/posting-tool.css`

### 인증 시스템
1. `pages/auth/login.html`
2. `pages/auth/signup.html`
3. `js/auth.js`
4. `js/auth-manager.js`

---

## 📦 압축 파일 생성 방법

### 방법 1: GenSpark Export
```
GenSpark 인터페이스 → Export Project → ZIP 다운로드
```

### 방법 2: 리눅스/Mac 터미널
```bash
tar -czf esg-website.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    index.html \
    css/ \
    js/ \
    images/ \
    sounds/ \
    includes/ \
    pages/ \
    *.md
```

### 방법 3: Windows PowerShell
```powershell
Compress-Archive -Path * -DestinationPath esg-website.zip
```

---

## 🚀 다운로드 후 서버 업로드

```bash
# 서버로 업로드
scp esg-website.tar.gz user@server-ip:/var/www/

# 서버에서 압축 해제
ssh user@server-ip
cd /var/www
tar -xzf esg-website.tar.gz
mv esg-website-* esg-website
```

---

© 2025 Korean ESG Association. All Rights Reserved.
