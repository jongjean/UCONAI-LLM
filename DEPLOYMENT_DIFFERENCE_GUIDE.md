# 🔍 미리보기와 배포 후 화면 차이 문제 해결 가이드

## ⚠️ 문제 상황

**증상**: GenSpark 미리보기(샌드박스)에서는 정상적으로 보이는데, 배포 후에는 화면이 다르게 표시됨

---

## 🎯 주요 원인 및 해결 방법

### **원인 1: 상대 경로 문제** ⭐ 가장 흔한 원인

#### 📝 문제 설명
- GenSpark 미리보기 URL: `https://.../preview/PROJECT_ID/index.html`
- 배포 후 URL: `https://yourdomain.com/index.html` 또는 `https://yourdomain.com/`

**경로 구조가 다르면** CSS, JS, 이미지 파일을 못 찾을 수 있습니다.

#### ✅ 해결 방법

**현재 프로젝트 구조**:
```
index.html
├── css/
│   ├── style.css
│   ├── disable-edit.css
│   └── login.css
├── js/
│   └── main.js
├── images/
│   └── logo.png
└── pages/
    └── ...
```

**index.html의 경로 (현재 상태 - 정상)**:
```html
<!-- CSS -->
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/disable-edit.css">
<link rel="stylesheet" href="css/login.css">

<!-- Images -->
<img src="images/logo.png" alt="한국ESG학회">

<!-- JS -->
<script src="js/main.js"></script>
```

✅ 이 경로들은 **상대 경로**로 올바르게 설정되어 있습니다.

---

### **원인 2: Base Path 문제**

#### 📝 문제 설명
배포 환경에서 서브디렉토리에 설치된 경우:
- 예: `https://yourdomain.com/esg-website/`

이 경우 모든 경로가 `/esg-website/`를 포함해야 합니다.

#### ✅ 해결 방법

**방법 A: HTML에 `<base>` 태그 추가** (권장)

index.html의 `<head>` 섹션에 추가:
```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Base URL 설정 (배포 환경에 맞게 수정) -->
    <base href="/">
    <!-- 또는 서브디렉토리인 경우 -->
    <!-- <base href="/esg-website/"> -->
    
    <title>한국ESG학회</title>
    ...
</head>
```

**방법 B: 절대 경로 사용**

```html
<!-- 루트 기준 절대 경로 -->
<link rel="stylesheet" href="/css/style.css">
<img src="/images/logo.png" alt="한국ESG학회">
<script src="/js/main.js"></script>
```

---

### **원인 3: 동적 슬라이더 데이터 로딩 문제**

#### 📝 문제 설명
포스팅툴로 저장한 슬라이더 데이터가 LocalStorage에 저장되므로:
- 미리보기 환경: LocalStorage 데이터 존재 ✅
- 배포 후 새 브라우저: LocalStorage 데이터 없음 ❌

#### ✅ 해결 방법

**js/main.js 확인** - LocalStorage 폴백 로직이 있는지 확인

현재 슬라이더는 **정적 HTML**로 되어 있습니다 (index.html 173-202번 줄):
```html
<section class="hero-slider">
    <div class="slider-container">
        <div class="slide active">
            <div class="slide-content">
                <h1 class="slide-title">한국ESG학회</h1>
                <p class="slide-text">환경(Environment), 사회(Social), 거버넌스(Governance)를 선도하는 학회</p>
                <a href="pages/about/greeting-new.html" class="slide-btn">자세히 보기</a>
            </div>
        </div>
        <!-- 추가 슬라이드... -->
    </div>
</section>
```

이것은 **정적 콘텐츠**이므로 배포 후에도 동일하게 표시되어야 합니다.

**만약 포스팅툴 데이터를 사용 중이라면**:

배포 전에 기본 데이터를 하드코딩하거나 서버에 저장해야 합니다.

---

### **원인 4: 외부 리소스 로딩 실패**

#### 📝 문제 설명
- Google Fonts
- Font Awesome
- 기타 CDN 리소스

가 로딩되지 않으면 스타일이 깨집니다.

#### ✅ 해결 방법

**브라우저 콘솔(F12) 확인**:
```
Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
Mixed Content: The page was loaded over HTTPS, but requested an insecure...
```

**현재 프로젝트의 외부 리소스** (index.html 10-14번 줄):
```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">

<!-- Font Awesome -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

✅ 모두 HTTPS이므로 문제없습니다.

**문제 발생 시**:
1. 네트워크 탭에서 로딩 상태 확인
2. CDN 서버 응답 확인
3. 필요 시 로컬 파일로 교체

---

### **원인 5: JavaScript 오류**

#### 📝 문제 설명
JavaScript 오류로 인해 동적 기능이 작동하지 않음

#### ✅ 해결 방법

**브라우저 콘솔(F12) 확인**:
```javascript
Uncaught ReferenceError: functionName is not defined
Uncaught TypeError: Cannot read property 'xxx' of null
```

**디버깅**:
1. F12 → Console 탭
2. 오류 메시지 확인
3. 해당 파일 및 라인 수정

---

### **원인 6: 캐시 문제**

#### 📝 문제 설명
브라우저가 이전 버전의 CSS/JS를 캐시하고 있음

#### ✅ 해결 방법

**방법 A: 강제 새로고침**
- Windows: Ctrl + Shift + R
- Mac: Cmd + Shift + R

**방법 B: 버전 쿼리 스트링 추가**

```html
<link rel="stylesheet" href="css/style.css?v=1.0.1">
<script src="js/main.js?v=1.0.1"></script>
```

배포할 때마다 버전 번호 변경

**방법 C: .htaccess 캐시 제어** (Apache 서버)

```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 week"
  ExpiresByType application/javascript "access plus 1 week"
  ExpiresByType image/* "access plus 1 month"
</IfModule>
```

---

### **원인 7: 환경 변수 및 API 엔드포인트**

#### 📝 문제 설명
개발 환경과 프로덕션 환경의 API URL이 다름

#### ✅ 해결 방법

**환경별 설정 파일 생성**:

```javascript
// js/config.js
const CONFIG = {
    development: {
        baseURL: 'http://localhost:8000',
        apiURL: 'http://localhost:3000/api'
    },
    production: {
        baseURL: 'https://yourdomain.com',
        apiURL: 'https://api.yourdomain.com'
    }
};

// 현재 환경 감지
const ENV = window.location.hostname === 'localhost' ? 'development' : 'production';
const currentConfig = CONFIG[ENV];
```

---

## 🔧 배포 전 체크리스트

### ✅ **1. 경로 확인**
- [ ] 모든 CSS 파일 경로 상대 경로로 설정
- [ ] 모든 JS 파일 경로 상대 경로로 설정
- [ ] 모든 이미지 경로 상대 경로로 설정
- [ ] 페이지 간 링크 상대 경로로 설정

### ✅ **2. 파일 존재 확인**
- [ ] css/ 폴더 내 모든 파일 존재
- [ ] js/ 폴더 내 모든 파일 존재
- [ ] images/ 폴더 내 모든 파일 존재
- [ ] pages/ 폴더 내 모든 HTML 파일 존재

### ✅ **3. 외부 리소스 확인**
- [ ] Google Fonts HTTPS 사용
- [ ] Font Awesome HTTPS 사용
- [ ] 기타 CDN 리소스 HTTPS 사용

### ✅ **4. 브라우저 테스트**
- [ ] Chrome에서 테스트
- [ ] Firefox에서 테스트
- [ ] Safari에서 테스트 (Mac)
- [ ] Edge에서 테스트

### ✅ **5. 반응형 테스트**
- [ ] 데스크톱 (1920x1080)
- [ ] 태블릿 (768x1024)
- [ ] 모바일 (375x667)

### ✅ **6. 콘솔 오류 확인**
- [ ] F12 → Console 탭에 오류 없음
- [ ] F12 → Network 탭에서 404 에러 없음

---

## 🧪 배포 후 디버깅 단계

### **1단계: 브라우저 개발자 도구 열기**
F12 또는 우클릭 → 검사

### **2단계: Console 탭 확인**
```
오류 메시지가 있는지 확인
```

### **3단계: Network 탭 확인**
```
1. Network 탭 열기
2. Ctrl+R (새로고침)
3. 빨간색 항목 (404, 500 에러) 확인
4. 실패한 리소스의 URL 확인
```

### **4단계: Elements 탭 확인**
```
1. Elements 탭 열기
2. <head> 섹션 확인
3. CSS/JS 링크 확인
4. 외부 리소스 로딩 상태 확인
```

### **5단계: 경로 수정**
실패한 리소스의 경로를 올바르게 수정

---

## 📊 미리보기 vs 배포 차이점 비교

| 항목 | GenSpark 미리보기 | 배포 환경 |
|------|------------------|-----------|
| **Base URL** | `.../preview/PROJECT_ID/` | `https://yourdomain.com/` |
| **LocalStorage** | 개발 데이터 존재 | 비어있음 |
| **CORS** | 제한 없음 | 정책 적용됨 |
| **HTTPS** | 자동 적용 | 수동 설정 필요 |
| **도메인** | GenSpark 도메인 | 커스텀 도메인 |

---

## 🎯 권장 해결 순서

### **1. 경로 문제 해결** (가장 우선)

```html
<!-- index.html 헤더 확인 -->
<link rel="stylesheet" href="css/style.css">  ✅ 상대 경로
<link rel="stylesheet" href="/css/style.css"> ❌ 절대 경로 (서브디렉토리 문제 가능)
```

### **2. 브라우저 콘솔 확인**

```
F12 → Console → 오류 메시지 확인
```

### **3. 네트워크 탭 확인**

```
F12 → Network → 404/500 에러 확인
```

### **4. 캐시 클리어**

```
Ctrl+Shift+R (강제 새로고침)
```

### **5. 버전 쿼리 스트링 추가**

```html
<link rel="stylesheet" href="css/style.css?v=1.0.1">
```

---

## 📞 추가 지원

### **문제가 계속되면 공유해주세요:**

1. **배포 URL**: 실제 배포된 웹사이트 주소
2. **스크린샷**: 미리보기 vs 배포 후 비교
3. **브라우저 콘솔 로그**: F12 → Console 탭 전체 내용
4. **Network 탭**: 404 에러 목록
5. **배포 환경**: Netlify, Vercel, 자체 서버 등

---

## 🚀 빠른 해결책 (임시)

현재 프로젝트는 **상대 경로**로 올바르게 설정되어 있으므로, 대부분의 배포 환경에서 정상 작동해야 합니다.

**만약 문제가 발생한다면**:

1. 배포 후 URL을 공유해주세요
2. 브라우저 콘솔(F12) 오류 메시지를 공유해주세요
3. 구체적으로 어떤 부분이 다른지 설명해주세요 (예: "슬라이더가 안 보임", "스타일이 깨짐" 등)

---

**마지막 업데이트**: 2025년 12월 31일  
**버전**: v1.0  
**프로젝트**: 한국ESG학회 공식 웹사이트
