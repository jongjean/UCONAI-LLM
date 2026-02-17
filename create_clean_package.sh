#!/bin/bash
# 한국ESG학회 웹사이트 - 클린 마이그레이션 패키지 생성
# 필수 파일만 포함 (문서, 스크립트 제외)
# 작성일: 2025-01-21

PACKAGE_NAME="kesg-website-clean-$(date +%Y%m%d-%H%M%S)"
PACKAGE_DIR="./$PACKAGE_NAME"

echo "======================================"
echo "  KESG 클린 마이그레이션 패키지 생성"
echo "  (필수 파일만 포함)"
echo "======================================"
echo ""

# 패키지 디렉토리 생성
mkdir -p "$PACKAGE_DIR"
echo "✓ 패키지 디렉토리 생성: $PACKAGE_DIR"

echo ""
echo "📦 필수 파일만 복사 중..."

# 1. 루트 HTML 파일
cp index.html "$PACKAGE_DIR/" 2>/dev/null && echo "  ✓ index.html"

# 2. CSS 디렉토리 전체
if [ -d "css" ]; then
    cp -r css "$PACKAGE_DIR/"
    echo "  ✓ css/ (8개 파일)"
fi

# 3. JS 디렉토리 전체
if [ -d "js" ]; then
    cp -r js "$PACKAGE_DIR/"
    echo "  ✓ js/ (23개 파일)"
fi

# 4. Pages 디렉토리 전체
if [ -d "pages" ]; then
    cp -r pages "$PACKAGE_DIR/"
    # pages 내 테스트 파일 제거
    find "$PACKAGE_DIR/pages" -name "test-*.html" -delete
    find "$PACKAGE_DIR/pages" -name "*-test-*.html" -delete
    echo "  ✓ pages/ (80개 HTML 페이지)"
fi

# 5. Images 디렉토리
if [ -d "images" ]; then
    cp -r images "$PACKAGE_DIR/"
    echo "  ✓ images/ (로고 및 아이콘)"
fi

# 6. Sounds 디렉토리 (있으면)
if [ -d "sounds" ]; then
    cp -r sounds "$PACKAGE_DIR/"
    echo "  ✓ sounds/ (효과음)"
fi

# 7. Includes 디렉토리 (있으면)
if [ -d "includes" ]; then
    cp -r includes "$PACKAGE_DIR/"
    echo "  ✓ includes/ (공통 포함 파일)"
fi

# 8. 필수 문서만 복사
cp README.md "$PACKAGE_DIR/" 2>/dev/null && echo "  ✓ README.md"

# 9. 설정 파일 생성
echo ""
echo "⚙️  서버 설정 파일 생성 중..."

# .htaccess (Apache)
cat > "$PACKAGE_DIR/.htaccess" << 'EOF'
# 한국ESG학회 웹사이트 - Apache 설정
AddDefaultCharset UTF-8

# MIME 타입
AddType text/html .html
AddType text/css .css
AddType application/javascript .js
AddType application/json .json

# 캐시 설정
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/html "access plus 1 hour"
    ExpiresByType text/css "access plus 1 day"
    ExpiresByType application/javascript "access plus 1 day"
    ExpiresByType image/jpeg "access plus 1 week"
    ExpiresByType image/png "access plus 1 week"
    ExpiresByType image/svg+xml "access plus 1 week"
</IfModule>

# Gzip 압축
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>

# 보안 헤더
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# 디렉토리 인덱스
DirectoryIndex index.html

# 디렉토리 리스팅 금지
Options -Indexes
EOF
echo "  ✓ .htaccess (Apache 설정)"

# nginx 설정
cat > "$PACKAGE_DIR/nginx.conf.example" << 'EOF'
# 한국ESG학회 웹사이트 - Nginx 설정 예제
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/kesg-website;
    index index.html;
    charset utf-8;
    
    # 로그
    access_log /var/log/nginx/kesg-access.log;
    error_log /var/log/nginx/kesg-error.log;
    
    # Gzip 압축
    gzip on;
    gzip_types text/css application/javascript image/svg+xml;
    
    # 정적 파일 캐시
    location ~* \.(css|js|jpg|png|gif|svg|woff|woff2)$ {
        expires 7d;
        add_header Cache-Control "public";
    }
    
    # 보안 헤더
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    
    # SPA 라우팅
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF
echo "  ✓ nginx.conf.example (Nginx 설정)"

# 설치 가이드
cat > "$PACKAGE_DIR/INSTALL.md" << 'EOF'
# 한국ESG학회 웹사이트 - 설치 가이드

## 📦 포함된 파일

- `index.html` - 메인 페이지
- `css/` - 스타일시트 (8개)
- `js/` - JavaScript (23개)
- `pages/` - 서브 페이지 (80개)
- `images/` - 이미지
- `sounds/` - 효과음 (선택)
- `includes/` - 공통 파일

**총 약 120개의 웹사이트 실행 필수 파일**

## 🚀 설치 방법

### 1. 서버 업로드
```bash
scp -r kesg-website-clean-* user@server:/var/www/
```

### 2. 권한 설정
```bash
cd /var/www/kesg-website-clean-*/
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
```

### 3. 웹 서버 설정

#### Apache
```bash
# .htaccess 이미 포함됨
sudo systemctl restart apache2
```

#### Nginx
```bash
# nginx.conf.example 참고하여 설정
sudo nano /etc/nginx/sites-available/kesg-website
sudo systemctl restart nginx
```

## 🔧 2025-01-21 주요 수정사항

- ✅ `js/auth-manager.js`: 로그인 후 1초 리다이렉트 제거
- ✅ 로그인 모달 자동 닫힘 문제 해결
- ✅ 회원가입 시스템 완성
- ✅ 권한 관리 시스템 추가

## 🔐 관리자 계정

- 이메일: jongjean@naver.com
- 이름: 강종진
- 권한: 최고관리자
- 상태: 활동중

## 📞 지원

문제 발생 시:
1. 브라우저 F12 콘솔 확인
2. 웹 서버 로그 확인
3. 파일 권한 확인

© 2025 한국ESG학회
EOF
echo "  ✓ INSTALL.md (설치 가이드)"

# 10. 파일 개수 세기
echo ""
echo "📊 패키지 내용 분석 중..."
HTML_COUNT=$(find "$PACKAGE_DIR" -name "*.html" | wc -l)
CSS_COUNT=$(find "$PACKAGE_DIR" -name "*.css" | wc -l)
JS_COUNT=$(find "$PACKAGE_DIR" -name "*.js" | wc -l)
TOTAL_FILES=$(find "$PACKAGE_DIR" -type f | wc -l)

echo "  ✓ HTML 파일: $HTML_COUNT 개"
echo "  ✓ CSS 파일: $CSS_COUNT 개"
echo "  ✓ JS 파일: $JS_COUNT 개"
echo "  ✓ 총 파일: $TOTAL_FILES 개"

# 11. 압축
echo ""
echo "🗜️  압축 파일 생성 중..."
tar -czf "${PACKAGE_NAME}.tar.gz" "$PACKAGE_DIR"
PACKAGE_SIZE=$(du -sh "${PACKAGE_NAME}.tar.gz" | cut -f1)
echo "  ✓ 압축 완료"

# 12. 완료 메시지
echo ""
echo "======================================"
echo "  ✅ 클린 패키지 생성 완료!"
echo "======================================"
echo ""
echo "📦 파일 이름: ${PACKAGE_NAME}.tar.gz"
echo "📊 파일 크기: $PACKAGE_SIZE"
echo "📁 포함 파일: $TOTAL_FILES 개 (필수 파일만)"
echo ""
echo "🚀 서버 업로드 명령:"
echo "   scp ${PACKAGE_NAME}.tar.gz user@server:/var/www/"
echo ""
echo "📥 서버에서 압축 해제:"
echo "   tar -xzf ${PACKAGE_NAME}.tar.gz"
echo "   cd ${PACKAGE_NAME}"
echo "   cat INSTALL.md"
echo ""
echo "======================================"
echo "  모든 개발 문서와 스크립트 제외됨"
echo "  웹사이트 실행에 필요한 파일만 포함"
echo "======================================"
