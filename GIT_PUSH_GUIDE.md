# Git Push 가이드 - 한국ESG학회 공식 홈페이지

## 📦 저장소 정보
- **Repository**: https://github.com/jongjean/esg_www
- **프로젝트**: 한국ESG학회 공식 홈페이지
- **버전**: v2.1
- **날짜**: 2025-12-27

---

## 🚀 Git Push 명령어

### 1️⃣ 로컬에 저장소 클론 (최초 1회)
```bash
git clone https://github.com/jongjean/esg_www.git
cd esg_www
```

### 2️⃣ 기존 저장소에서 작업 중이라면
```bash
cd esg_www
git pull origin main
```

### 3️⃣ 변경사항 스테이징
```bash
# 모든 파일 추가
git add .

# 또는 특정 파일만
git add index.html css/style.css js/main.js
```

### 4️⃣ 커밋
```bash
git commit -m "feat: 한국ESG학회 홈페이지 메이저 업데이트 v2.1

주요 변경사항:
- 메뉴 UI: 버튼형 디자인, 간격 최소화 (다닥다닥 배치)
- 로그인 시스템: 최상단 우측 고정 위치, localStorage 기반
- 모바일 UI: 좌측 280px 사이드바 메뉴, 스와이프 제스처 지원
- 컬러 시스템: ESG 브랜드 컬러 전면 적용 (초록/파랑)
- 로고: 공식 로고 이미지로 전환, 푸터 흰색 테두리
- 임베드 연동: 코리아ESG뉴스, DBpia 논문 아카이브
- 푸터: 협력기관 섹션 제거, 2단 레이아웃

기술 개선:
- CSS: 반응형 브레이크포인트 900px 적용
- JS: 사이드바 터치 제스처, 로그인 상태 관리
- 문서: README.md, 기술 문서 8개 추가"
```

### 5️⃣ 원격 저장소에 푸시
```bash
# main 브랜치로 푸시
git push origin main

# 또는 강제 푸시 (신중하게 사용)
git push -f origin main
```

---

## 📋 이번 커밋 변경사항 요약

### 🎨 UI/UX 개선
- ✅ 메뉴 간격 최소화 (gap: 0, padding: 8px)
- ✅ 버튼형 메뉴 디자인 (배경색, 호버 효과)
- ✅ 모바일 좌측 사이드바 (280px, 스와이프)
- ✅ 로그인 상태창 우측 상단 고정

### 🎨 컬러 시스템
- ✅ ESG 컨셉 컬러 전체 적용
- ✅ 섹션별 배경색 (초록/파랑/회색)
- ✅ 그라데이션 히어로 배너

### 🖼️ 로고 & 이미지
- ✅ 공식 로고 교체 (images/logo.png)
- ✅ 헤더/푸터 로고 적용
- ✅ 푸터 로고 흰색 테두리 (5px)

### 🔗 외부 서비스 연동
- ✅ 코리아ESG뉴스 임베드 (pages/news/esg-news-embed.html)
- ✅ DBpia 논문 아카이브 (pages/journal/dbpia-embed.html)
- ✅ iframe + Fallback 하이브리드

### 🔐 로그인 기능
- ✅ localStorage 기반 상태 관리
- ✅ 로그인/로그아웃 토글
- ✅ 회원가입 링크

### 📱 반응형 개선
- ✅ 브레이크포인트: 900px (태블릿), 768px (모바일)
- ✅ 모바일 사이드바 메뉴
- ✅ 터치 제스처 (스와이프)

### 📝 문서화
- ✅ README.md 업데이트
- ✅ .gitignore 추가
- ✅ 기술 문서 8개 생성

---

## 📁 변경된 파일 목록

### 핵심 파일 (15개)
```
✅ .gitignore                        # Git 제외 파일
✅ README.md                         # 프로젝트 문서
✅ index.html                        # 메인 페이지
✅ css/style.css                     # 메인 스타일
✅ js/main.js                        # 메인 JavaScript
✅ images/logo.png                   # 공식 로고 (신규)
✅ pages/news/esg-news-embed.html    # 뉴스 임베드 (신규)
✅ pages/journal/dbpia-embed.html    # 논문 임베드 (신규)
```

### 문서 파일 (8개)
```
✅ GIT_PUSH_GUIDE.md                 # Git 푸시 가이드
✅ MENU_STYLE_UPDATE.md              # 메뉴 스타일
✅ MENU_FINAL.md                     # 메뉴 최종
✅ LOGIN_STATUS.md                   # 로그인 상태
✅ EMBED_INTEGRATION.md              # 임베드 연동
✅ COLOR_CONCEPT.md                  # 컬러 시스템
✅ LOGO_UPDATE.md                    # 로고 업데이트
✅ MOBILE_SIDEBAR_MENU.md            # 모바일 메뉴
```

---

## ⚠️ 주의사항

### 1. 푸시 전 확인
- ✅ 로컬에서 HTML 파일 열어서 확인
- ✅ 모바일 반응형 테스트 (DevTools)
- ✅ 로그인/로그아웃 테스트
- ✅ 사이드바 메뉴 동작 확인

### 2. 충돌 해결
원격 저장소와 충돌 시:
```bash
# 원격 변경사항 받기
git pull origin main

# 충돌 해결 후
git add .
git commit -m "fix: 충돌 해결"
git push origin main
```

### 3. 되돌리기 (필요시)
```bash
# 마지막 커밋 취소 (변경사항 유지)
git reset --soft HEAD~1

# 마지막 커밋 완전 취소
git reset --hard HEAD~1
```

---

## 🌐 배포 확인

### GitHub Pages 설정
1. GitHub 저장소 → Settings → Pages
2. Source: main branch
3. URL: https://jongjean.github.io/esg_www/

### 배포 확인 사항
- ✅ 메인 페이지 로딩
- ✅ 메뉴 동작
- ✅ 모바일 사이드바
- ✅ 로그인 기능
- ✅ 로고 표시

---

## 📞 문의

- **개발자**: 강종진
- **이메일**: mail@iuci.kr
- **학회 전화**: 010-4263-7715

---

## 🎯 다음 단계 (TODO)

### 미완료 작업
- ⏳ 서브페이지 55개 로고 교체 (현재 3개 완료)
- ⏳ 메뉴 링크 연결 (ESG뉴스, 학술지 임베드)
- ⏳ 실제 로그인 API 연동
- ⏳ 회원가입 페이지 개발

### 중장기 계획
- 🔮 코리아ESG뉴스 API 연동
- 🔮 DBpia API 연동
- 🔮 자체 게시판 시스템
- 🔮 관리자 페이지

---

<div align="center">
  <strong>✨ Push 완료 후 https://github.com/jongjean/esg_www 에서 확인하세요!</strong>
</div>
