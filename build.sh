#!/bin/bash

# ==========================================
# 한국ESG학회 웹사이트 빌드 & 배포 스크립트
# ==========================================
# 개발 폴더: /home/ucon/monggol
# 배포 폴더: /var/www/monggol
# ==========================================

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 폴더 경로 설정
DEV_DIR="/home/ucon/monggol"
DEPLOY_DIR="/var/www/monggol"
BACKUP_DIR="/home/ucon/monggol-backup"

# 타임스탬프
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo ""
echo -e "${BLUE}======================================"
echo "한국ESG학회 웹사이트 빌드"
echo "======================================${NC}"
echo ""
echo "개발 폴더: $DEV_DIR"
echo "배포 폴더: $DEPLOY_DIR"
echo "시작 시간: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# ==========================================
# 1. 개발 폴더 확인
# ==========================================
echo -e "${YELLOW}[1/7] 개발 폴더 확인...${NC}"

if [ ! -d "$DEV_DIR" ]; then
    echo -e "${RED}❌ 오류: 개발 폴더($DEV_DIR)가 존재하지 않습니다.${NC}"
    exit 1
fi

if [ ! -f "$DEV_DIR/index.html" ]; then
    echo -e "${RED}❌ 오류: index.html 파일이 존재하지 않습니다.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 개발 폴더 확인 완료${NC}"
echo ""

# ==========================================
# 2. 배포 폴더 백업 (선택)
# ==========================================
echo -e "${YELLOW}[2/7] 기존 배포 폴더 백업...${NC}"

if [ -d "$DEPLOY_DIR" ] && [ "$(ls -A $DEPLOY_DIR)" ]; then
    BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"
    sudo mkdir -p "$BACKUP_PATH"
    sudo cp -r "$DEPLOY_DIR"/* "$BACKUP_PATH/"
    echo -e "${GREEN}✅ 백업 완료: $BACKUP_PATH${NC}"
else
    echo -e "${BLUE}ℹ️  백업할 파일이 없습니다.${NC}"
fi
echo ""

# ==========================================
# 3. 배포 폴더 완전 삭제
# ==========================================
echo -e "${YELLOW}[3/7] 배포 폴더 정리...${NC}"

if [ -d "$DEPLOY_DIR" ]; then
    sudo rm -rf "$DEPLOY_DIR"/*
    echo -e "${GREEN}✅ 배포 폴더의 모든 파일 삭제 완료${NC}"
else
    echo -e "${BLUE}ℹ️  배포 폴더가 존재하지 않습니다. 생성합니다.${NC}"
    sudo mkdir -p "$DEPLOY_DIR"
fi
echo ""

# ==========================================
# 4. 필수 디렉토리 생성
# ==========================================
echo -e "${YELLOW}[4/7] 디렉토리 구조 생성...${NC}"

sudo mkdir -p "$DEPLOY_DIR"/{css,js,images,pages/{about,organization,member,core,journal,policy,news,community,materials,support,mypage}}

echo -e "${GREEN}✅ 디렉토리 구조 생성 완료${NC}"
echo ""

# ==========================================
# 5. 파일 복사
# ==========================================
echo -e "${YELLOW}[5/7] 파일 복사 중...${NC}"

# index.html 복사
if [ -f "$DEV_DIR/index.html" ]; then
    sudo cp "$DEV_DIR/index.html" "$DEPLOY_DIR/"
    echo "  ✓ index.html"
fi

# CSS 파일 복사
if [ -d "$DEV_DIR/css" ]; then
    sudo cp -r "$DEV_DIR/css"/* "$DEPLOY_DIR/css/"
    echo "  ✓ CSS 파일"
fi

# JavaScript 파일 복사
if [ -d "$DEV_DIR/js" ]; then
    sudo cp -r "$DEV_DIR/js"/* "$DEPLOY_DIR/js/"
    echo "  ✓ JavaScript 파일"
fi

# 이미지 파일 복사
if [ -d "$DEV_DIR/images" ]; then
    sudo cp -r "$DEV_DIR/images"/* "$DEPLOY_DIR/images/"
    echo "  ✓ 이미지 파일"
fi

# 페이지 파일 복사
if [ -d "$DEV_DIR/pages" ]; then
    sudo cp -r "$DEV_DIR/pages"/* "$DEPLOY_DIR/pages/"
    echo "  ✓ 서브 페이지"
fi

echo -e "${GREEN}✅ 파일 복사 완료${NC}"
echo ""

# ==========================================
# 6. 권한 설정
# ==========================================
echo -e "${YELLOW}[6/7] 권한 설정...${NC}"

sudo chmod -R 755 "$DEPLOY_DIR"
sudo chown -R www-data:www-data "$DEPLOY_DIR" 2>/dev/null || sudo chown -R $(whoami):$(whoami) "$DEPLOY_DIR"

echo -e "${GREEN}✅ 권한 설정 완료${NC}"
echo ""

# ==========================================
# 7. 배포 결과 확인
# ==========================================
echo -e "${YELLOW}[7/7] 배포 결과 확인...${NC}"
echo ""

# 파일 개수 확인
HTML_COUNT=$(find "$DEPLOY_DIR" -name "*.html" | wc -l)
CSS_COUNT=$(find "$DEPLOY_DIR" -name "*.css" | wc -l)
JS_COUNT=$(find "$DEPLOY_DIR" -name "*.js" | wc -l)
IMG_COUNT=$(find "$DEPLOY_DIR/images" -type f 2>/dev/null | wc -l)

# 파일 크기 확인
TOTAL_SIZE=$(du -sh "$DEPLOY_DIR" | cut -f1)

echo -e "${BLUE}======================================"
echo "📊 배포 통계"
echo "======================================${NC}"
echo "배포 경로: $DEPLOY_DIR"
echo "총 용량: $TOTAL_SIZE"
echo ""
echo "📄 HTML 파일: $HTML_COUNT개"
echo "🎨 CSS 파일: $CSS_COUNT개"
echo "⚡ JS 파일: $JS_COUNT개"
echo "🖼️  이미지 파일: $IMG_COUNT개"
echo ""

# 메인 페이지 확인
if [ -f "$DEPLOY_DIR/index.html" ]; then
    echo -e "${GREEN}✅ 메인 페이지(index.html) 존재${NC}"
else
    echo -e "${RED}❌ 메인 페이지(index.html) 없음${NC}"
fi

# CSS 파일 확인
if [ -f "$DEPLOY_DIR/css/style.css" ]; then
    echo -e "${GREEN}✅ CSS 파일(style.css) 존재${NC}"
else
    echo -e "${RED}❌ CSS 파일(style.css) 없음${NC}"
fi

# JavaScript 파일 확인
if [ -f "$DEPLOY_DIR/js/main.js" ]; then
    echo -e "${GREEN}✅ JavaScript 파일(main.js) 존재${NC}"
else
    echo -e "${RED}❌ JavaScript 파일(main.js) 없음${NC}"
fi

# 로고 파일 확인
if [ -f "$DEPLOY_DIR/images/logo-full.png" ]; then
    echo -e "${GREEN}✅ 로고 파일(logo-full.png) 존재${NC}"
else
    echo -e "${RED}❌ 로고 파일(logo-full.png) 없음${NC}"
fi

echo ""
echo -e "${BLUE}======================================"
echo "✅ 빌드 완료!"
echo "======================================${NC}"
echo ""
echo "완료 시간: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo -e "${GREEN}🌐 웹사이트 접속:${NC}"
echo "   - 내부: http://172.30.1.150/"
echo "   - 외부: https://uconai.ddns.net/esg/"
echo ""
echo -e "${BLUE}📝 다음 단계:${NC}"
echo "   1. 웹 브라우저에서 사이트 접속"
echo "   2. 모든 링크 및 페이지 테스트"
echo "   3. 모바일 반응형 확인"
echo "   4. 파트너 로고 링크 확인"
echo ""
