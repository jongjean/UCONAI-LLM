# 한국ESG학회 웹사이트 마이그레이션 가이드

## 📦 Git을 통한 마이그레이션 (권장)

### 1단계: Git 저장소 생성

#### GitHub에서:
```bash
# 1. GitHub에 새 저장소 생성
# 저장소명: esg-website
# 공개/비공개 선택
```

#### 샌드박스에서 (GenSpark):
```bash
# Git 초기화 (이미 .gitignore 있음)
git init
git add .
git commit -m "Initial commit: 한국ESG학회 웹사이트 v4.0"

# GitHub 저장소 연결
git remote add origin https://github.com/your-username/esg-website.git
git branch -M main
git push -u origin main
```

### 2단계: 리눅스 서버에서 Clone

```bash
# SSH로 서버 접속
ssh user@your-server-ip

# 프로젝트 폴더로 이동
cd /var/www

# Git Clone
sudo git clone https://github.com/your-username/esg-website.git

# 폴더 이동
cd esg-website

# 권한 설정
sudo chown -R www-data:www-data /var/www/esg-website
sudo chmod -R 755 /var/www/esg-website
```

---

## 📥 직접 다운로드 방법

### GenSpark에서 파일 다운로드

GenSpark의 **Export/Download 기능**을 사용하세요:

1. **프로젝트 메뉴** → **Export Project**
2. **ZIP 또는 TAR.GZ** 선택
3. 다운로드 완료 대기
4. 로컬에 저장

---

## 🚀 서버 마이그레이션 전체 가이드

### 1단계: 서버 준비 (Ubuntu 기준)

```bash
# 서버 업데이트
sudo apt update
sudo apt upgrade -y

# 필수 패키지 설치
sudo apt install -y nginx nodejs npm mysql-server git

# Node.js 최신 버전 (선택)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 프로젝트 폴더 생성
sudo mkdir -p /var/www/esg-website
```

---

### 2단계: 파일 업로드

#### 옵션 A: SCP 사용
```bash
# 로컬에서 실행
scp -r ./esg-website/* user@your-server-ip:/var/www/esg-website/

# 또는 압축 파일 전송
scp esg-website.tar.gz user@your-server-ip:/var/www/
```

#### 옵션 B: Git Clone (권장)
```bash
# 서버에서 실행
cd /var/www
sudo git clone https://github.com/your-username/esg-website.git
```

#### 옵션 C: FTP/SFTP
```
FileZilla, WinSCP 등 사용
- 호스트: your-server-ip
- 사용자: user
- 포트: 22 (SFTP)
- 업로드 경로: /var/www/esg-website
```

---

### 3단계: Nginx 설정

```bash
# Nginx 설정 파일 생성
sudo nano /etc/nginx/sites-available/esg-website
```

**설정 내용:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    root /var/www/esg-website;
    index index.html;

    # 정적 파일 캐싱
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 메인 라우팅
    location / {
        try_files $uri $uri/ =404;
    }

    # Gzip 압축
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

**설정 활성화:**
```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/esg-website /etc/nginx/sites-enabled/

# 기본 사이트 비활성화 (선택)
sudo rm /etc/nginx/sites-enabled/default

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

---

### 4단계: 권한 설정

```bash
# 소유권 변경
sudo chown -R www-data:www-data /var/www/esg-website

# 권한 설정
sudo chmod -R 755 /var/www/esg-website

# 특정 폴더 쓰기 권한 (필요시)
sudo chmod -R 775 /var/www/esg-website/images
sudo chmod -R 775 /var/www/esg-website/uploads
```

---

### 5단계: SSL 인증서 설정 (HTTPS)

```bash
# Certbot 설치
sudo apt install -y certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 자동 갱신 설정 확인
sudo certbot renew --dry-run
```

---

## 🗄️ 데이터베이스 마이그레이션

### MySQL 설정

```bash
# MySQL 접속
sudo mysql -u root -p

# 데이터베이스 생성
CREATE DATABASE esg_website CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 사용자 생성
CREATE USER 'esg_user'@'localhost' IDENTIFIED BY 'your_password';

# 권한 부여
GRANT ALL PRIVILEGES ON esg_website.* TO 'esg_user'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

### 테이블 생성 (예시)

```sql
-- 사용자 테이블
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('SUPER_ADMIN', 'MAIN_EDITOR', 'EDITOR', 'USER') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 히어로 슬라이드 테이블
CREATE TABLE hero_slides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slide_order INT NOT NULL,
    image_url TEXT,
    title VARCHAR(255),
    description TEXT,
    button_text VARCHAR(100),
    button_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 히스토리 테이블
CREATE TABLE hero_slide_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    version INT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    author_id INT,
    slides_data JSON,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);
```

---

## 🔧 백엔드 API 구축 (Node.js + Express)

### 설치

```bash
cd /var/www/esg-website

# package.json 생성
npm init -y

# 필수 패키지 설치
npm install express mysql2 dotenv cors body-parser bcrypt jsonwebtoken
```

### server.js 생성

```javascript
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// 데이터베이스 연결
const pool = mysql.createPool({
    host: 'localhost',
    user: 'esg_user',
    password: process.env.DB_PASSWORD,
    database: 'esg_website',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// API 라우트
app.get('/api/slides', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM hero_slides ORDER BY slide_order');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/slides', async (req, res) => {
    // 슬라이드 생성 로직
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### PM2로 프로세스 관리

```bash
# PM2 설치
sudo npm install -g pm2

# 서버 실행
pm2 start server.js --name esg-api

# 부팅 시 자동 시작
pm2 startup
pm2 save

# 상태 확인
pm2 status
pm2 logs
```

---

## 📋 체크리스트

### ✅ 마이그레이션 전

- [ ] 모든 파일 백업 완료
- [ ] Git 저장소 생성 (권장)
- [ ] 서버 준비 완료
- [ ] 도메인 준비 (선택)

### ✅ 마이그레이션 중

- [ ] 파일 업로드 완료
- [ ] 권한 설정 완료
- [ ] Nginx 설정 완료
- [ ] SSL 인증서 설치 (선택)
- [ ] 데이터베이스 설정 (필요시)

### ✅ 마이그레이션 후

- [ ] 웹사이트 접속 테스트
- [ ] 모든 페이지 로딩 확인
- [ ] 이미지/CSS/JS 로딩 확인
- [ ] 포스팅툴 동작 확인
- [ ] 결제 시뮬레이션 확인
- [ ] 모바일 반응형 확인

---

## 🆘 문제 해결

### 403 Forbidden
```bash
sudo chown -R www-data:www-data /var/www/esg-website
sudo chmod -R 755 /var/www/esg-website
```

### 404 Not Found
```bash
# Nginx 설정 확인
sudo nginx -t
sudo systemctl restart nginx
```

### CSS/JS 로딩 안 됨
```bash
# MIME 타입 확인
sudo nano /etc/nginx/nginx.conf

# include mime.types; 확인
```

---

## 📞 지원

문의사항:
- 이메일: admin@esg.or.kr
- 전화: 010-4263-7715

---

© 2025 Korean ESG Association. All Rights Reserved.
