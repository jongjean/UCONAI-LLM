#!/bin/bash
# 한국ESG학회 웹사이트 - 리눅스 서버 마이그레이션 패키지 생성
# 작성일: 2025-01-21

PACKAGE_NAME="kesg-website-migration-$(date +%Y%m%d-%H%M%S)"
PACKAGE_DIR="./$PACKAGE_NAME"

echo "======================================"
echo "  KESG 웹사이트 마이그레이션 패키지 생성"
echo "======================================"
echo ""

# 패키지 디렉토리 생성
mkdir -p "$PACKAGE_DIR"

echo "✓ 패키지 디렉토리 생성: $PACKAGE_DIR"

# 핵심 파일 복사
echo ""
echo "📦 파일 복사 중..."

# 1. 루트 파일
cp index.html "$PACKAGE_DIR/"
cp README.md "$PACKAGE_DIR/"
echo "  ✓ 루트 파일 복사 완료"

# 2. CSS 디렉토리
cp -r css "$PACKAGE_DIR/"
echo "  ✓ CSS 디렉토리 복사 완료"

# 3. JS 디렉토리
cp -r js "$PACKAGE_DIR/"
echo "  ✓ JS 디렉토리 복사 완료"

# 4. Pages 디렉토리
cp -r pages "$PACKAGE_DIR/"
echo "  ✓ Pages 디렉토리 복사 완료"

# 5. Images 디렉토리
cp -r images "$PACKAGE_DIR/"
echo "  ✓ Images 디렉토리 복사 완료"

# 6. Sounds 디렉토리
if [ -d "sounds" ]; then
    cp -r sounds "$PACKAGE_DIR/"
    echo "  ✓ Sounds 디렉토리 복사 완료"
fi

# 7. Includes 디렉토리
if [ -d "includes" ]; then
    cp -r includes "$PACKAGE_DIR/"
    echo "  ✓ Includes 디렉토리 복사 완료"
fi

# 8. 설정 파일 생성
cat > "$PACKAGE_DIR/server-setup.sh" << 'EOF'
#!/bin/bash
# 리눅스 서버 설정 스크립트

echo "======================================"
echo "  KESG 웹사이트 서버 설정"
echo "======================================"
echo ""

# 1. 파일 권한 설정
echo "1. 파일 권한 설정 중..."
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
chmod +x *.sh
echo "  ✓ 권한 설정 완료"

# 2. 심볼릭 링크 확인
echo ""
echo "2. 디렉토리 구조 확인 중..."
if [ -f "index.html" ]; then
    echo "  ✓ index.html 존재"
else
    echo "  ✗ index.html 없음"
fi

if [ -d "css" ]; then
    echo "  ✓ css 디렉토리 존재"
else
    echo "  ✗ css 디렉토리 없음"
fi

if [ -d "js" ]; then
    echo "  ✓ js 디렉토리 존재"
else
    echo "  ✗ js 디렉토리 없음"
fi

if [ -d "pages" ]; then
    echo "  ✓ pages 디렉토리 존재"
else
    echo "  ✗ pages 디렉토리 없음"
fi

# 3. 웹 서버 설정 안내
echo ""
echo "======================================"
echo "  웹 서버 설정 가이드"
echo "======================================"
echo ""
echo "Apache 설정:"
echo "  1. DocumentRoot를 현재 디렉토리로 설정"
echo "  2. .htaccess 허용: AllowOverride All"
echo "  3. mod_rewrite 활성화"
echo ""
echo "Nginx 설정:"
echo "  1. root를 현재 디렉토리로 설정"
echo "  2. index index.html 설정"
echo "  3. try_files \$uri \$uri/ /index.html 설정"
echo ""
echo "======================================"
echo "  설정 완료!"
echo "======================================"
EOF

chmod +x "$PACKAGE_DIR/server-setup.sh"
echo "  ✓ 서버 설정 스크립트 생성"

# 9. .htaccess 파일 생성 (Apache용)
cat > "$PACKAGE_DIR/.htaccess" << 'EOF'
# 한국ESG학회 웹사이트 - Apache 설정

# 기본 인코딩
AddDefaultCharset UTF-8

# MIME 타입 설정
AddType text/html .html
AddType text/css .css
AddType application/javascript .js
AddType application/json .json

# 캐시 설정
<IfModule mod_expires.c>
    ExpiresActive On
    
    # HTML (1시간)
    ExpiresByType text/html "access plus 1 hour"
    
    # CSS/JS (1일)
    ExpiresByType text/css "access plus 1 day"
    ExpiresByType application/javascript "access plus 1 day"
    
    # 이미지 (1주일)
    ExpiresByType image/jpeg "access plus 1 week"
    ExpiresByType image/png "access plus 1 week"
    ExpiresByType image/gif "access plus 1 week"
    ExpiresByType image/svg+xml "access plus 1 week"
</IfModule>

# Gzip 압축
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# 보안 헤더
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# URL 리라이팅
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # HTTPS 리다이렉트 (필요시 주석 해제)
    # RewriteCond %{HTTPS} off
    # RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # 디렉토리 인덱스
    DirectoryIndex index.html
</IfModule>

# 디렉토리 리스팅 금지
Options -Indexes

# .git 디렉토리 접근 금지
<DirectoryMatch "^/.*/\.git/">
    Require all denied
</DirectoryMatch>
EOF

echo "  ✓ Apache .htaccess 파일 생성"

# 10. Nginx 설정 예제 생성
cat > "$PACKAGE_DIR/nginx.conf.example" << 'EOF'
# 한국ESG학회 웹사이트 - Nginx 설정 예제
# /etc/nginx/sites-available/kesg-website

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # 문서 루트
    root /var/www/kesg-website;
    index index.html;
    
    # 기본 인코딩
    charset utf-8;
    
    # 로그 설정
    access_log /var/log/nginx/kesg-access.log;
    error_log /var/log/nginx/kesg-error.log;
    
    # Gzip 압축
    gzip on;
    gzip_vary on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    
    # 정적 파일 캐시
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
    
    # HTML 파일 캐시 (짧게)
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }
    
    # 보안 헤더
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # SPA 라우팅 (필요시)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # .git 디렉토리 접근 금지
    location ~ /\.git {
        deny all;
    }
    
    # 숨김 파일 접근 금지
    location ~ /\. {
        deny all;
    }
}

# HTTPS 설정 (Let's Encrypt 사용 시)
# server {
#     listen 443 ssl http2;
#     server_name your-domain.com www.your-domain.com;
#     
#     ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
#     
#     # 위의 server 블록 내용 복사
# }
EOF

echo "  ✓ Nginx 설정 예제 생성"

# 11. README 파일 생성
cat > "$PACKAGE_DIR/MIGRATION_README.md" << 'EOF'
# 한국ESG학회 웹사이트 - 리눅스 서버 마이그레이션 가이드

## 📦 패키지 내용

- `index.html` - 메인 페이지
- `css/` - 스타일시트
- `js/` - JavaScript 파일 (auth.js, auth-manager.js 수정됨)
- `pages/` - 서브 페이지
- `images/` - 이미지 파일
- `sounds/` - 효과음 파일
- `includes/` - 공통 포함 파일

## 🚀 설치 방법

### 1. 서버로 파일 업로드

```bash
# SCP를 사용한 업로드
scp -r kesg-website-migration-* user@your-server:/var/www/

# 또는 SFTP 클라이언트 사용 (FileZilla, WinSCP 등)
```

### 2. 서버 설정

```bash
cd /var/www/kesg-website-migration-*
chmod +x server-setup.sh
./server-setup.sh
```

### 3. 웹 서버 설정

#### Apache
```bash
sudo cp .htaccess /var/www/html/
sudo systemctl restart apache2
```

#### Nginx
```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/kesg-website
sudo ln -s /etc/nginx/sites-available/kesg-website /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔧 주요 수정 사항

### 2025-01-21 업데이트
- ✅ `js/auth-manager.js`: 로그인/로그아웃 후 1초 리다이렉트 제거
- ✅ 로그인 모달 자동 닫힘 문제 해결
- ✅ 회원가입 시스템 구현 완료
- ✅ 권한 관리 시스템 추가

## 📊 데이터베이스

이 프로젝트는 RESTful Table API를 사용합니다.
서버 마이그레이션 후 별도의 백엔드 API 서버가 필요합니다.

### 테이블 스키마

- `members` - 회원 정보
  - id (email)
  - password (SHA-256 해시)
  - name, role, status
  - phone, affiliation, department, position
  - member_type, join_date, last_login

## 🔐 관리자 계정

- 이메일: `jongjean@naver.com`
- 이름: 강종진
- 권한: 최고관리자 (super_admin)
- 상태: 활동중 (active)

비밀번호는 별도로 설정해야 합니다.

## ⚙️ 환경 요구사항

- 웹 서버: Apache 2.4+ 또는 Nginx 1.18+
- PHP: 필요 없음 (정적 HTML)
- Node.js: 필요 없음
- 데이터베이스: RESTful API 서버 필요

## 🌐 도메인 설정

1. DNS A 레코드를 서버 IP로 설정
2. 웹 서버 설정에서 `server_name` 수정
3. SSL 인증서 설치 (Let's Encrypt 권장)

```bash
sudo certbot --nginx -d your-domain.com
```

## 📞 지원

문제 발생 시:
1. 브라우저 콘솔(F12) 확인
2. 웹 서버 오류 로그 확인
3. 파일 권한 확인 (644/755)

---

© 2025 한국ESG학회. All rights reserved.
EOF

echo "  ✓ 마이그레이션 가이드 생성"

# 12. 압축
echo ""
echo "📦 압축 파일 생성 중..."
tar -czf "${PACKAGE_NAME}.tar.gz" "$PACKAGE_DIR"
echo "  ✓ 압축 완료: ${PACKAGE_NAME}.tar.gz"

# 13. 파일 크기 확인
PACKAGE_SIZE=$(du -sh "${PACKAGE_NAME}.tar.gz" | cut -f1)
echo ""
echo "======================================"
echo "  패키지 생성 완료!"
echo "======================================"
echo ""
echo "📦 패키지 이름: ${PACKAGE_NAME}.tar.gz"
echo "📊 파일 크기: $PACKAGE_SIZE"
echo ""
echo "📤 업로드 방법:"
echo "  scp ${PACKAGE_NAME}.tar.gz user@server:/path/"
echo ""
echo "📥 서버에서 압축 해제:"
echo "  tar -xzf ${PACKAGE_NAME}.tar.gz"
echo "  cd ${PACKAGE_NAME}"
echo "  ./server-setup.sh"
echo ""
echo "======================================"
