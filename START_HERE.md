# 배포 준비 완료 ✅

## 📊 프로젝트 현황

### 파일 구성
- **HTML 파일**: 56개 (메인 1 + 서브 55)
- **CSS 파일**: 2개
- **JavaScript 파일**: 1개
- **이미지 파일**: 4개
- **문서 파일**: 6개
- **스크립트 파일**: 1개 (build.sh)

### 총 파일 개수: **70개**

---

## 🗂️ 폴더 구조

```
개발 폴더: /home/ucon/monggol/
배포 폴더: /var/www/monggol/
백업 폴더: /home/ucon/monggol-backup/
```

---

## 🚀 배포 방법

### 자동 배포 (권장) ⭐

서버 SSH 접속 후:

```bash
# 1. 개발 폴더로 이동
cd /home/ucon/monggol

# 2. 실행 권한 부여 (최초 1회만)
chmod +x build.sh

# 3. 빌드 & 배포 실행
./build.sh
```

### 빌드 스크립트 주요 기능
1. ✅ 배포 폴더 완전 정리 (`/var/www/monggol/*` 삭제)
2. ✅ 기존 파일 자동 백업 (`/home/ucon/monggol-backup/`)
3. ✅ 필수 디렉토리 생성
4. ✅ 개발 폴더 → 배포 폴더 파일 복사
5. ✅ 권한 자동 설정 (755, www-data:www-data)
6. ✅ 배포 결과 리포트 출력

---

## 📋 배포 체크리스트

### 배포 전 확인사항
- [ ] 개발 폴더 경로: `/home/ucon/monggol`
- [ ] index.html 파일 존재
- [ ] css/, js/, images/, pages/ 폴더 존재
- [ ] build.sh 파일 존재 및 실행 권한

### 배포 후 확인사항
- [ ] 배포 폴더에 모든 파일 복사: `ls -lah /var/www/monggol`
- [ ] 웹사이트 접속 테스트
  - 내부: http://172.30.1.150/
  - 외부: https://uconai.ddns.net/esg/
- [ ] 메인 페이지 로딩 확인
- [ ] 모든 메뉴 드롭다운 작동 확인
- [ ] 파트너 로고 표시 및 링크 작동 확인
- [ ] 모바일 반응형 확인

---

## 📄 배포 문서

자세한 내용은 아래 문서를 참조하세요:

1. **[README.md](README.md)** - 프로젝트 전체 개요
2. **[DEPLOY.md](DEPLOY.md)** - 상세 배포 가이드
3. **[DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md)** - 완전한 배포 체크리스트
4. **[DEV_SETUP.md](DEV_SETUP.md)** - 개발 환경 설정
5. **[FILES.md](FILES.md)** - 전체 파일 목록 및 구조

---

## 🌐 접속 URL

### 내부 네트워크
```
http://172.30.1.150/
```

### 외부 접속 (DDNS)
```
https://uconai.ddns.net/esg/
```

---

## 🛠️ 서버 파일 전송 방법

현재 프로젝트 파일을 서버 `/home/ucon/monggol`로 전송하는 방법:

### 방법 1: Publish 탭 사용 (가장 쉬움)
1. Publish 탭에서 프로젝트 배포
2. 배포된 파일 ZIP 다운로드
3. 서버로 전송:
   ```bash
   scp esg-website.zip user@172.30.1.150:/home/ucon/
   ssh user@172.30.1.150
   cd /home/ucon
   unzip esg-website.zip -d monggol
   ```

### 방법 2: SCP 직접 전송
```bash
# 로컬에서 (현재 프로젝트 폴더에서)
tar -czf esg-website.tar.gz index.html css/ js/ images/ pages/ build.sh

scp esg-website.tar.gz user@172.30.1.150:/home/ucon/

# 서버에서
ssh user@172.30.1.150
cd /home/ucon
mkdir -p monggol
tar -xzf esg-website.tar.gz -C monggol/
chmod +x monggol/build.sh
```

### 방법 3: SFTP 클라이언트 (FileZilla, WinSCP)
- **호스트**: sftp://172.30.1.150
- **원격 경로**: /home/ucon/monggol
- **전송 파일**: 
  - index.html
  - css/
  - js/
  - images/
  - pages/
  - build.sh

---

## ⚠️ 중요 사항

### 배포 폴더 정리
- build.sh는 배포할 때마다 `/var/www/monggol/*`의 모든 파일을 삭제합니다
- 기존 파일은 자동으로 `/home/ucon/monggol-backup/`에 백업됩니다
- 항상 깨끗한 상태로 최신 파일만 배포됩니다

### 권한 설정
- 배포 폴더 권한: 755
- 소유자: www-data:www-data
- 빌드 스크립트가 자동으로 설정합니다

### 문제 발생 시
- 웹 서버 재시작: `sudo systemctl restart nginx` 또는 `apache2`
- 권한 재설정: `sudo chmod -R 755 /var/www/monggol`
- 소유자 재설정: `sudo chown -R www-data:www-data /var/www/monggol`

---

## 📞 지원

문의사항이 있으시면:
- **담당자**: 강종진
- **이메일**: mail@iuci.kr

---

## ✅ 다음 단계

1. **현재 프로젝트 파일을 서버로 전송** (위의 방법 1-3 중 선택)
2. **서버에서 build.sh 실행**
   ```bash
   cd /home/ucon/monggol
   ./build.sh
   ```
3. **웹 브라우저에서 접속 확인**
   - http://172.30.1.150/
   - https://uconai.ddns.net/esg/
4. **[DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md)** 문서를 참고하여 전체 기능 테스트

---

**준비 완료 시간**: 2025-12-25
**버전**: 2.1
**상태**: ✅ 배포 준비 완료
