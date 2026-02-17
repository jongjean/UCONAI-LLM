# 배포 체크리스트

## 📋 배포 전 체크리스트

### 1. 개발 환경 확인
- [ ] 개발 폴더 경로 확인: `/home/ucon/monggol`
- [ ] 모든 소스 파일이 개발 폴더에 있는지 확인
- [ ] `index.html` 파일 존재 확인
- [ ] `css/`, `js/`, `images/`, `pages/` 폴더 존재 확인

### 2. 파일 완성도 확인
- [ ] HTML 파일: 56개 (메인 1 + 서브 55)
- [ ] CSS 파일: 2개 (style.css, subpage.css)
- [ ] JavaScript 파일: 1개 (main.js)
- [ ] 이미지 파일: 4개 (logo-full.png, logo-symbol.png, partner-ken.png, partner-dbpia.png)

### 3. 빌드 스크립트 확인
- [ ] `build.sh` 파일 존재 확인
- [ ] 실행 권한 부여: `chmod +x build.sh`
- [ ] 스크립트 내 경로 확인:
  - DEV_DIR="/home/ucon/monggol"
  - DEPLOY_DIR="/var/www/monggol"

---

## 🚀 배포 실행

### 방법 1: 빌드 스크립트 실행 (권장)
```bash
cd /home/ucon/monggol
./build.sh
```

### 방법 2: 수동 배포
```bash
# 1. 배포 폴더 정리
sudo rm -rf /var/www/monggol/*

# 2. 디렉토리 생성
sudo mkdir -p /var/www/monggol/{css,js,images,pages}

# 3. 파일 복사
sudo cp /home/ucon/monggol/index.html /var/www/monggol/
sudo cp -r /home/ucon/monggol/css /var/www/monggol/
sudo cp -r /home/ucon/monggol/js /var/www/monggol/
sudo cp -r /home/ucon/monggol/images /var/www/monggol/
sudo cp -r /home/ucon/monggol/pages /var/www/monggol/

# 4. 권한 설정
sudo chmod -R 755 /var/www/monggol
sudo chown -R www-data:www-data /var/www/monggol
```

---

## ✅ 배포 후 체크리스트

### 1. 파일 시스템 확인
- [ ] 배포 폴더 확인: `ls -lah /var/www/monggol`
- [ ] index.html 존재 확인
- [ ] css/, js/, images/, pages/ 폴더 존재 확인
- [ ] 파일 권한 확인 (755)
- [ ] 소유자 확인 (www-data:www-data)

### 2. 웹 브라우저 테스트

#### 메인 페이지
- [ ] 메인 페이지 로딩: http://172.30.1.150/
- [ ] 외부 접속: https://uconai.ddns.net/esg/
- [ ] 헤더 로고 표시
- [ ] 네비게이션 메뉴 작동
- [ ] 히어로 슬라이더 자동 재생
- [ ] 푸터 표시
- [ ] 파트너 로고 섹션 표시

#### 드롭다운 메뉴 테스트
- [ ] 학회소개 (6개 하위 메뉴)
- [ ] 학회조직 (3개 하위 메뉴)
- [ ] 회원안내 (5개 하위 메뉴)
- [ ] 핵심사업 (4개 하위 메뉴)
- [ ] 학술지·논문 (5개 하위 메뉴)
- [ ] ESG정책·연구 (5개 하위 메뉴)
- [ ] ESG뉴스 (6개 하위 메뉴)
- [ ] 커뮤니티 (5개 하위 메뉴)
- [ ] 자료실 (5개 하위 메뉴)
- [ ] 후원·기부 (4개 하위 메뉴)
- [ ] 마이페이지 (6개 하위 메뉴)

#### 서브 페이지 테스트 (샘플)
- [ ] /pages/about/greeting.html
- [ ] /pages/organization/executives.html
- [ ] /pages/member/types.html
- [ ] /pages/core/forum.html
- [ ] /pages/journal/submission.html
- [ ] /pages/policy/research.html
- [ ] /pages/news/main.html
- [ ] /pages/community/notice.html
- [ ] /pages/materials/academic.html
- [ ] /pages/support/guide.html
- [ ] /pages/mypage/profile.html

### 3. 파트너 로고 & 외부 링크
- [ ] 코리아ESG뉴스 로고 표시
- [ ] 코리아ESG뉴스 클릭 → https://www.ken.io.kr/ (새 창)
- [ ] DBpia 로고 표시
- [ ] DBpia 클릭 → https://www.dbpia.co.kr/ (새 창)
- [ ] 외부 링크 새 창 열기 (`target="_blank"`)
- [ ] 외부 링크 보안 (`rel="noopener noreferrer"`)

### 4. 반응형 디자인 테스트
- [ ] 데스크톱 (1920px 이상)
- [ ] 노트북 (1366px ~ 1920px)
- [ ] 태블릿 (768px ~ 1024px)
- [ ] 모바일 (375px ~ 768px)
- [ ] 모바일 메뉴 버튼 작동
- [ ] 모바일 드롭다운 메뉴 작동

### 5. 이미지 로딩 확인
- [ ] 메인 로고 (images/logo-full.png) - 데스크톱
- [ ] 심볼 로고 (images/logo-symbol.png) - 모바일
- [ ] 파트너 로고 (images/partner-ken.png)
- [ ] 파트너 로고 (images/partner-dbpia.png)
- [ ] 이미지 404 에러 없음

### 6. JavaScript 기능 확인
- [ ] 히어로 슬라이더 자동 재생
- [ ] 히어로 슬라이더 내비게이션 버튼
- [ ] 모바일 메뉴 토글
- [ ] 드롭다운 메뉴 호버 효과
- [ ] Scroll to Top 버튼
- [ ] 콘솔 에러 없음 (F12 개발자 도구)

### 7. CSS 스타일 확인
- [ ] 헤더 스타일 정상
- [ ] 네비게이션 스타일 정상
- [ ] 파트너 카드 스타일 정상
- [ ] 푸터 스타일 정상
- [ ] 호버 효과 작동
- [ ] 애니메이션 작동

### 8. SEO & 메타 태그
- [ ] `<title>` 태그 확인
- [ ] `<meta name="description">` 확인
- [ ] `<meta name="keywords">` 확인
- [ ] 파비콘 표시
- [ ] Open Graph 태그 (선택)

### 9. 성능 테스트
- [ ] 페이지 로딩 속도 (3초 이내)
- [ ] 이미지 최적화 확인
- [ ] CSS/JS 파일 크기 확인
- [ ] 불필요한 리소스 없음

### 10. 크로스 브라우저 테스트
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] 모바일 Safari (iOS)
- [ ] 모바일 Chrome (Android)

---

## 🐛 문제 해결

### 문제 1: 페이지가 표시되지 않음
```bash
# 웹 서버 상태 확인
sudo systemctl status nginx
# 또는
sudo systemctl status apache2

# 웹 서버 재시작
sudo systemctl restart nginx
# 또는
sudo systemctl restart apache2
```

### 문제 2: 이미지가 표시되지 않음
```bash
# 이미지 파일 존재 확인
ls -lh /var/www/monggol/images/

# 권한 확인
ls -l /var/www/monggol/images/

# 권한 재설정
sudo chmod -R 755 /var/www/monggol/images/
```

### 문제 3: CSS/JS 파일이 로딩되지 않음
```bash
# 파일 존재 확인
ls -lh /var/www/monggol/css/
ls -lh /var/www/monggol/js/

# 브라우저 캐시 삭제
# Chrome: Ctrl + Shift + Delete
# Firefox: Ctrl + Shift + Delete
```

### 문제 4: 권한 에러
```bash
# 소유자 변경
sudo chown -R www-data:www-data /var/www/monggol

# 권한 변경
sudo chmod -R 755 /var/www/monggol
```

---

## 📝 배포 완료 보고

### 배포 정보
- **배포 일시**: [날짜/시간 기입]
- **배포자**: [이름 기입]
- **배포 경로**: `/var/www/monggol`
- **웹사이트 URL**: 
  - 내부: http://172.30.1.150/
  - 외부: https://uconai.ddns.net/esg/

### 배포 통계
- **HTML 파일**: 56개
- **CSS 파일**: 2개
- **JavaScript 파일**: 1개
- **이미지 파일**: 4개
- **총 용량**: [용량 기입]

### 테스트 결과
- [ ] 모든 페이지 정상 작동
- [ ] 외부 링크 정상 작동
- [ ] 반응형 디자인 정상
- [ ] 파트너 로고 정상 표시
- [ ] 콘솔 에러 없음

### 비고
[특이사항 기입]

---

## 🔄 재배포 방법

배포 후 수정사항이 있을 경우:

```bash
# 1. 개발 폴더에서 파일 수정
cd /home/ucon/monggol
# [파일 수정]

# 2. 빌드 스크립트 재실행
./build.sh

# 3. 브라우저 캐시 삭제 후 확인
```

---

## 📞 지원

문제가 발생하거나 도움이 필요한 경우:
- **담당자**: 강종진
- **이메일**: mail@iuci.kr

---

**마지막 업데이트**: 2025-12-25
