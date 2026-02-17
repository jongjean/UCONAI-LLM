# 개발 환경 설정 가이드

## 📋 개요

이 문서는 한국ESG학회 웹사이트의 개발 환경을 `/home/ucon/monggol` 폴더에 설정하는 방법을 안내합니다.

---

## 📁 폴더 구조

### 개발 폴더: `/home/ucon/monggol`

```
/home/ucon/monggol/
├── index.html                # 메인 페이지
├── css/
│   ├── style.css            # 메인 스타일
│   └── subpage.css          # 서브페이지 스타일
├── js/
│   └── main.js              # JavaScript
├── images/
│   ├── logo-full.png        # 학회 로고 (전체)
│   ├── logo-symbol.png      # 학회 심볼
│   ├── partner-ken.png      # 코리아ESG뉴스 로고
│   └── partner-dbpia.png    # DBpia 로고
├── pages/
│   ├── about/               # 학회소개 (6개 페이지)
│   │   ├── greeting.html
│   │   ├── purpose.html
│   │   ├── history.html
│   │   ├── constitution.html
│   │   ├── ci.html
│   │   └── location.html
│   ├── organization/        # 학회조직 (3개 페이지)
│   │   ├── executives.html
│   │   ├── committees.html
│   │   └── divisions.html
│   ├── member/              # 회원안내 (5개 페이지)
│   │   ├── types.html
│   │   ├── process.html
│   │   ├── fee.html
│   │   ├── benefits.html
│   │   └── companies.html
│   ├── core/                # 핵심사업 (4개 페이지)
│   │   ├── forum.html
│   │   ├── award.html
│   │   ├── ordinance.html
│   │   └── seminar.html
│   ├── journal/             # 학술지·논문 (5개 페이지)
│   │   ├── about.html
│   │   ├── submission.html
│   │   ├── editorial.html
│   │   ├── review.html
│   │   └── archive.html
│   ├── policy/              # ESG정책·연구 (5개 페이지)
│   │   ├── research.html
│   │   ├── standards.html
│   │   ├── law.html
│   │   ├── global.html
│   │   └── reports.html
│   ├── news/                # ESG뉴스 (6개 페이지)
│   │   ├── main.html
│   │   ├── policy.html
│   │   ├── cases.html
│   │   ├── press.html
│   │   ├── column.html
│   │   └── video.html
│   ├── community/           # 커뮤니티 (5개 페이지)
│   │   ├── notice.html
│   │   ├── forum.html
│   │   ├── discussion.html
│   │   ├── member-news.html
│   │   └── qna.html
│   ├── materials/           # 자료실 (5개 페이지)
│   │   ├── academic.html
│   │   ├── policy.html
│   │   ├── presentation.html
│   │   ├── report.html
│   │   └── video.html
│   ├── support/             # 후원·기부 (4개 페이지)
│   │   ├── guide.html
│   │   ├── corporate.html
│   │   ├── personal.html
│   │   └── usage.html
│   └── mypage/              # 마이페이지 (6개 페이지)
│       ├── profile.html
│       ├── payment.html
│       ├── history.html
│       ├── paper.html
│       ├── event.html
│       └── certificate.html
├── build.sh                 # 빌드 스크립트
├── README.md                # 프로젝트 문서
├── DEPLOY.md                # 배포 가이드
├── DEPLOY_CHECKLIST.md      # 배포 체크리스트
└── DEV_SETUP.md             # 이 문서
```

---

## 🚀 설치 방법

### 방법 1: 현재 프로젝트 파일을 서버로 전송

#### 1-1. Publish 탭 사용 (권장)
1. Publish 탭에서 프로젝트 배포
2. 배포된 파일을 ZIP으로 다운로드
3. 서버로 업로드:
```bash
# 로컬에서
scp esg-website.zip user@172.30.1.150:/home/ucon/

# 서버에서
cd /home/ucon
unzip esg-website.zip -d monggol
```

#### 1-2. SCP로 직접 전송
```bash
# 로컬 프로젝트 폴더에서
tar -czf esg-website.tar.gz index.html css/ js/ images/ pages/
scp esg-website.tar.gz user@172.30.1.150:/home/ucon/

# 서버에서
cd /home/ucon
mkdir -p monggol
tar -xzf esg-website.tar.gz -C monggol/
```

#### 1-3. SFTP 사용 (FileZilla, WinSCP 등)
- 호스트: `sftp://172.30.1.150`
- 원격 경로: `/home/ucon/monggol`
- 로컬에서 모든 파일 전송

---

### 방법 2: 서버에서 직접 생성

#### 2-1. 기본 폴더 구조 생성
```bash
# 서버 SSH 접속
ssh user@172.30.1.150

# 개발 폴더 생성
mkdir -p /home/ucon/monggol/{css,js,images,pages/{about,organization,member,core,journal,policy,news,community,materials,support,mypage}}

# 폴더 확인
tree -L 3 /home/ucon/monggol
```

#### 2-2. 파일 생성
```bash
cd /home/ucon/monggol

# index.html, CSS, JS 파일 생성
# (파일 내용은 Read 도구로 확인 후 복사)
```

---

## 🛠️ 개발 환경 설정

### 1. 권한 설정
```bash
# 개발 폴더 소유자 설정
sudo chown -R $(whoami):$(whoami) /home/ucon/monggol

# 개발 폴더 권한 설정
chmod -R 755 /home/ucon/monggol

# 빌드 스크립트 실행 권한
chmod +x /home/ucon/monggol/build.sh
```

### 2. 웹 서버 설정 (선택)

개발 중 테스트를 위해 간단한 웹 서버를 실행할 수 있습니다.

#### Python 웹 서버
```bash
cd /home/ucon/monggol
python3 -m http.server 8000
# 접속: http://localhost:8000
```

#### PHP 웹 서버
```bash
cd /home/ucon/monggol
php -S localhost:8000
# 접속: http://localhost:8000
```

#### Node.js 웹 서버
```bash
cd /home/ucon/monggol
npx http-server -p 8000
# 접속: http://localhost:8000
```

---

## 📝 개발 워크플로우

### 1. 파일 수정
```bash
cd /home/ucon/monggol

# 에디터로 파일 수정
vim index.html
vim css/style.css
vim js/main.js
```

### 2. 로컬 테스트 (선택)
```bash
# 간단한 웹 서버 실행
python3 -m http.server 8000

# 브라우저에서 http://localhost:8000 접속
```

### 3. 배포
```bash
# 빌드 스크립트 실행
./build.sh
```

### 4. 확인
```bash
# 배포 폴더 확인
ls -lah /var/www/monggol

# 웹사이트 접속
# - 내부: http://172.30.1.150/
# - 외부: https://uconai.ddns.net/esg/
```

---

## 🔧 유용한 명령어

### 파일 확인
```bash
# 전체 파일 목록
find /home/ucon/monggol -type f

# HTML 파일만
find /home/ucon/monggol -name "*.html"

# 파일 개수
find /home/ucon/monggol -type f | wc -l

# 폴더 크기
du -sh /home/ucon/monggol
```

### 파일 검색
```bash
# 파일 내용 검색
grep -r "search_term" /home/ucon/monggol

# HTML 파일에서만 검색
find /home/ucon/monggol -name "*.html" -exec grep -l "search_term" {} \;
```

### 파일 비교
```bash
# 개발 폴더와 배포 폴더 비교
diff -r /home/ucon/monggol /var/www/monggol
```

### 백업
```bash
# 개발 폴더 백업
tar -czf monggol-backup-$(date +%Y%m%d).tar.gz /home/ucon/monggol

# 백업 복원
tar -xzf monggol-backup-20251225.tar.gz -C /home/ucon/
```

---

## 🐛 트러블슈팅

### 문제 1: 빌드 스크립트 권한 에러
```bash
chmod +x /home/ucon/monggol/build.sh
```

### 문제 2: 배포 폴더 접근 권한 에러
```bash
sudo chown -R www-data:www-data /var/www/monggol
sudo chmod -R 755 /var/www/monggol
```

### 문제 3: 파일이 보이지 않음
```bash
# 숨김 파일 확인
ls -lah /home/ucon/monggol

# 파일 시스템 권한 확인
namei -l /home/ucon/monggol/index.html
```

---

## 📊 개발 환경 정보

### 폴더 경로
- **개발 폴더**: `/home/ucon/monggol`
- **배포 폴더**: `/var/www/monggol`
- **백업 폴더**: `/home/ucon/monggol-backup`

### 웹사이트 URL
- **내부 접속**: http://172.30.1.150/
- **외부 접속**: https://uconai.ddns.net/esg/

### 파일 통계
- **총 파일 개수**: 70개
- **HTML 파일**: 56개
- **CSS 파일**: 2개
- **JavaScript 파일**: 1개
- **이미지 파일**: 4개
- **문서 파일**: 7개

---

## 📖 추가 문서

- `README.md`: 프로젝트 개요 및 기능
- `DEPLOY.md`: 배포 가이드
- `DEPLOY_CHECKLIST.md`: 배포 체크리스트
- `FILES.md`: 전체 파일 목록

---

## 📞 지원

문제가 발생하거나 도움이 필요한 경우:
- **담당자**: 강종진
- **이메일**: mail@iuci.kr

---

**마지막 업데이트**: 2025-12-25
