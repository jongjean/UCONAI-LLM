# 한국ESG학회 웹사이트 배포 가이드

## 📋 목차
1. [폴더 구조](#폴더-구조)
2. [배포 프로세스](#배포-프로세스)
3. [빌드 스크립트](#빌드-스크립트)
4. [수동 배포](#수동-배포)
5. [체크리스트](#체크리스트)
6. [트러블슈팅](#트러블슈팅)

---

## 📁 폴더 구조

### 개발 폴더
```
/home/ucon/monggol/
├── index.html
├── css/
│   ├── style.css
│   └── subpage.css
├── js/
│   └── main.js
├── images/
│   ├── logo-full.png
│   ├── logo-symbol.png
│   ├── partner-ken.png
│   └── partner-dbpia.png
├── pages/
│   ├── about/        (6개 페이지)
│   ├── organization/ (3개 페이지)
│   ├── member/       (5개 페이지)
│   ├── core/         (4개 페이지)
│   ├── journal/      (5개 페이지)
│   ├── policy/       (5개 페이지)
│   ├── news/         (6개 페이지)
│   ├── community/    (5개 페이지)
│   ├── materials/    (5개 페이지)
│   ├── support/      (4개 페이지)
│   └── mypage/       (6개 페이지)
├── build.sh          # 빌드 스크립트
└── README.md
```

### 배포 폴더
```
/var/www/monggol/
└── (빌드 시 개발 폴더에서 복사된 모든 파일)
```

---

## 🚀 배포 프로세스

### 1. 자동 배포 (권장)

```bash
# 개발 폴더로 이동
cd /home/ucon/monggol

# 빌드 스크립트 실행 (배포 폴더 자동 클린 + 복사)
./build.sh
```

### 2. 빌드 프로세스 상세

```bash
# 1단계: 배포 폴더 완전 정리
rm -rf /var/www/monggol/*

# 2단계: 필수 디렉토리 생성
mkdir -p /var/www/monggol/{css,js,images,pages}

# 3단계: 파일 복사
cp -r /home/ucon/monggol/{index.html,css,js,images,pages} /var/www/monggol/

# 4단계: 권한 설정
chmod -R 755 /var/www/monggol
chown -R www-data:www-data /var/www/monggol

# 5단계: 배포 완료 확인
ls -lah /var/www/monggol
```

---

## 📜 빌드 스크립트

`build.sh` 파일이 자동으로 생성됩니다:

```bash
#!/bin/bash
# 한국ESG학회 웹사이트 빌드 스크립트

DEV_DIR="/home/ucon/monggol"
DEPLOY_DIR="/var/www/monggol"

echo "======================================"
echo "한국ESG학회 웹사이트 빌드 시작"
echo "======================================"
echo ""

# 1. 개발 폴더 확인
if [ ! -d "$DEV_DIR" ]; then
    echo "❌ 오류: 개발 폴더($DEV_DIR)가 존재하지 않습니다."
    exit 1
fi

echo "✅ 개발 폴더 확인: $DEV_DIR"

# 2. 배포 폴더 완전 삭제
echo "🗑️  배포 폴더 정리 중..."
if [ -d "$DEPLOY_DIR" ]; then
    rm -rf "$DEPLOY_DIR"/*
    echo "✅ 배포 폴더의 모든 파일 삭제 완료"
else
    echo "⚠️  배포 폴더가 존재하지 않습니다. 생성합니다."
    sudo mkdir -p "$DEPLOY_DIR"
fi

# 3. 필수 디렉토리 생성
echo "📁 디렉토리 구조 생성 중..."
sudo mkdir -p "$DEPLOY_DIR"/{css,js,images,pages}

# 4. 파일 복사
echo "📦 파일 복사 중..."
sudo cp "$DEV_DIR/index.html" "$DEPLOY_DIR/"
sudo cp -r "$DEV_DIR/css" "$DEPLOY_DIR/"
sudo cp -r "$DEV_DIR/js" "$DEPLOY_DIR/"
sudo cp -r "$DEV_DIR/images" "$DEPLOY_DIR/"
sudo cp -r "$DEV_DIR/pages" "$DEPLOY_DIR/"

echo "✅ 파일 복사 완료"

# 5. 권한 설정
echo "🔐 권한 설정 중..."
sudo chmod -R 755 "$DEPLOY_DIR"
sudo chown -R www-data:www-data "$DEPLOY_DIR"

echo "✅ 권한 설정 완료"

# 6. 배포 결과 확인
echo ""
echo "======================================"
echo "📊 배포 결과"
echo "======================================"
echo "배포 경로: $DEPLOY_DIR"
echo ""
ls -lh "$DEPLOY_DIR"
echo ""

# 7. 파일 개수 확인
HTML_COUNT=$(find "$DEPLOY_DIR" -name "*.html" | wc -l)
CSS_COUNT=$(find "$DEPLOY_DIR" -name "*.css" | wc -l)
JS_COUNT=$(find "$DEPLOY_DIR" -name "*.js" | wc -l)
IMG_COUNT=$(find "$DEPLOY_DIR/images" -type f 2>/dev/null | wc -l)

echo "📄 HTML 파일: $HTML_COUNT개"
echo "🎨 CSS 파일: $CSS_COUNT개"
echo "⚡ JS 파일: $JS_COUNT개"
echo "🖼️  이미지 파일: $IMG_COUNT개"
echo ""

echo "======================================"
echo "✅ 빌드 완료!"
echo "======================================"
echo ""
echo "🌐 웹사이트 접속:"
echo "   - 내부: http://172.30.1.150/"
echo "   - 외부: https://uconai.ddns.net/esg/"
echo ""
