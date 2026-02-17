#!/bin/bash

# 한국ESG학회 웹사이트 압축 스크립트
# 실행: bash create_archive.sh

echo "================================================"
echo "한국ESG학회 웹사이트 압축 시작..."
echo "================================================"

# 압축 파일명 (타임스탬프 포함)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE_NAME="esg-website-${TIMESTAMP}.tar.gz"

echo ""
echo "📦 압축 파일명: ${ARCHIVE_NAME}"
echo ""

# 제외할 파일/폴더 목록
EXCLUDE_LIST=(
    "node_modules"
    ".git"
    ".gitignore"
    "*.pyc"
    "__pycache__"
    ".DS_Store"
    "Thumbs.db"
    "*.log"
    "*.tmp"
    ".env"
    "create_archive.sh"
)

# 압축할 파일 및 폴더
echo "📁 압축 대상:"
echo "  - index.html"
echo "  - css/"
echo "  - js/"
echo "  - images/"
echo "  - sounds/"
echo "  - includes/"
echo "  - pages/"
echo "  - README.md"
echo "  - 기타 문서 파일들"
echo ""

# tar 명령어로 압축
echo "⏳ 압축 중..."
tar -czf "${ARCHIVE_NAME}" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.gitignore' \
    --exclude='*.pyc' \
    --exclude='__pycache__' \
    --exclude='.DS_Store' \
    --exclude='Thumbs.db' \
    --exclude='*.log' \
    --exclude='*.tmp' \
    --exclude='.env' \
    --exclude='create_archive.sh' \
    .

# 압축 결과 확인
if [ -f "${ARCHIVE_NAME}" ]; then
    FILE_SIZE=$(du -h "${ARCHIVE_NAME}" | cut -f1)
    echo ""
    echo "================================================"
    echo "✅ 압축 완료!"
    echo "================================================"
    echo "📦 파일명: ${ARCHIVE_NAME}"
    echo "📊 크기: ${FILE_SIZE}"
    echo ""
    echo "📍 위치: $(pwd)/${ARCHIVE_NAME}"
    echo ""
    echo "================================================"
    echo "🚀 마이그레이션 가이드"
    echo "================================================"
    echo ""
    echo "1. 파일 다운로드:"
    echo "   - GenSpark에서 ${ARCHIVE_NAME} 다운로드"
    echo ""
    echo "2. 리눅스 서버로 업로드:"
    echo "   scp ${ARCHIVE_NAME} user@server-ip:/var/www/"
    echo ""
    echo "3. 서버에서 압축 해제:"
    echo "   ssh user@server-ip"
    echo "   cd /var/www/"
    echo "   tar -xzf ${ARCHIVE_NAME}"
    echo ""
    echo "4. 권한 설정:"
    echo "   sudo chown -R www-data:www-data /var/www/esg-website"
    echo "   sudo chmod -R 755 /var/www/esg-website"
    echo ""
    echo "5. 웹 서버 설정:"
    echo "   - Nginx: /etc/nginx/sites-available/esg-website"
    echo "   - Apache: /etc/apache2/sites-available/esg-website.conf"
    echo ""
    echo "자세한 내용은 MIGRATION_GUIDE.md를 참고하세요."
    echo "================================================"
else
    echo ""
    echo "❌ 압축 실패!"
    echo "오류가 발생했습니다."
fi

echo ""
