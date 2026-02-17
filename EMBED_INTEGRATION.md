# 임베드 연동 페이지 구축 - 2025-12-27

## 🎯 작업 내용

### 1. 협력기관 섹션 제거
- 메인 페이지(index.html)에서 "협력 기관" 섹션 완전 제거
- 코리아ESG뉴스, DBpia는 협력기관이 아닌 **임베드 연동 서비스**

### 2. 임베드 페이지 생성

#### A. ESG 뉴스 임베드 페이지
**파일**: `pages/news/esg-news-embed.html`

**기능**:
- 코리아ESG뉴스 (https://www.ken.io.kr/) iframe 임베드
- X-Frame-Options 제한 대응
- 임베드 실패 시 자동 대체 컨텐츠 표시
- 외부 링크 제공

**특징**:
```html
<iframe 
    src="https://www.ken.io.kr/"
    sandbox="allow-same-origin allow-scripts allow-popups allow-forms">
</iframe>
```

#### B. DBpia 논문 아카이브 임베드 페이지
**파일**: `pages/journal/dbpia-embed.html`

**기능**:
- DBpia (https://www.dbpia.co.kr/) iframe 임베드
- 논문 검색/투고 빠른 버튼
- 임베드 실패 시 대체 방법 안내
- 이용 가이드 제공

**특징**:
```html
<iframe 
    src="https://www.dbpia.co.kr/"
    sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox">
</iframe>
```

## 📋 임베드 전략

### 방법 1: iframe 기본 임베드 (우선 시도)
```html
<iframe src="외부사이트URL"></iframe>
```

### 방법 2: X-Frame-Options 제한 대응
대부분의 외부 사이트는 보안상 iframe 임베드를 차단합니다.

**대응 방안**:

#### 옵션 A: 대체 컨텐츠 자동 표시
```javascript
iframe.addEventListener('error', function() {
    // fallback 컨텐츠 표시
    showFallbackContent();
});
```

#### 옵션 B: 프록시 서버 (서버 필요)
- 자체 백엔드에서 외부 컨텐츠를 가져와 제공
- CORS 우회 가능
- **단점**: 저작권 문제, 서버 부하

#### 옵션 C: API 연동 (권장)
- 코리아ESG뉴스/DBpia에서 API 제공 시
- RSS 피드 또는 JSON 데이터 활용
- 자체 디자인으로 컨텐츠 표시

#### 옵션 D: 웹뷰 앱 (모바일)
- React Native, Flutter 등으로 네이티브 앱 제작
- WebView에서 X-Frame-Options 무시 가능

## 🔧 현재 구현 방식

### iframe + Fallback 하이브리드

```javascript
// 1. iframe 로드 시도
<iframe src="https://www.ken.io.kr/"></iframe>

// 2. 실패 감지
iframe.addEventListener('error', showFallback);

// 3. 대체 컨텐츠 표시
<div class="embed-fallback">
    <a href="외부사이트" target="_blank">
        바로가기
    </a>
</div>
```

## 📱 페이지 구조

### ESG 뉴스 페이지
```
┌─────────────────────────────────────┐
│ ESG 뉴스 (코리아ESG뉴스)            │
├─────────────────────────────────────┤
│ [임베드 정보 안내]                  │
│                                     │
│ ┌─────────────────────────────┐   │
│ │                             │   │
│ │  iframe 임베드 영역         │   │
│ │  (코리아ESG뉴스)            │   │
│ │                             │   │
│ └─────────────────────────────┘   │
│                                     │
│ 또는                                │
│                                     │
│ [임베드 실패 - 대체 컨텐츠]         │
│ [바로가기 버튼]                     │
│                                     │
│ [코리아ESG뉴스 소개 및 안내]        │
└─────────────────────────────────────┘
```

### DBpia 논문 아카이브 페이지
```
┌─────────────────────────────────────┐
│ 논문 아카이브 (DBpia)                │
├─────────────────────────────────────┤
│ [임베드 정보 안내]                  │
│                                     │
│ [논문검색] [논문투고] [바로가기]    │
│                                     │
│ ┌─────────────────────────────┐   │
│ │                             │   │
│ │  iframe 임베드 영역         │   │
│ │  (DBpia)                    │   │
│ │                             │   │
│ └─────────────────────────────┘   │
│                                     │
│ [DBpia 이용 안내]                   │
│ [논문 검색 방법]                    │
│ [논문 투고 안내]                    │
└─────────────────────────────────────┘
```

## 🚨 예상 문제 및 해결

### 문제 1: X-Frame-Options 차단
**증상**: iframe에 컨텐츠가 표시되지 않음

**해결책**:
1. ✅ 대체 컨텐츠 표시 (현재 구현)
2. 외부 사이트에 iframe 허용 요청
3. API 연동 방식으로 변경

### 문제 2: CORS 정책 제한
**증상**: JavaScript로 iframe 내부 접근 불가

**해결책**:
- 정상 동작 (다른 도메인이므로 CORS는 예상됨)
- postMessage API 사용 (양측 협의 필요)

### 문제 3: 모바일 반응형
**증상**: iframe이 모바일에서 잘림

**해결책**:
```css
.embed-container {
    height: calc(100vh - 200px);
    min-height: 600px; /* 최소 높이 보장 */
}
```

## 📂 파일 구조

```
pages/
├── news/
│   └── esg-news-embed.html    (코리아ESG뉴스 임베드)
└── journal/
    └── dbpia-embed.html        (DBpia 임베드)
```

## 🔗 메뉴 연결 (TODO)

index.html의 메뉴 링크를 수정해야 합니다:

```html
<!-- ESG뉴스 메뉴 -->
<li><a href="pages/news/esg-news-embed.html">ESG 뉴스</a></li>

<!-- 학술지·논문 메뉴 -->
<li><a href="pages/journal/dbpia-embed.html">논문 아카이브</a></li>
```

## 💡 권장 사항

### 단기 (현재)
1. ✅ iframe + Fallback 하이브리드 방식 사용
2. 임베드 실패 시 외부 링크로 우회
3. 사용자 안내 명확히 제공

### 중기 (3개월 이내)
1. 코리아ESG뉴스/DBpia에 API 연동 문의
2. RSS 피드 활용 검토
3. 자체 뉴스 큐레이션 시스템 구축

### 장기 (6개월 이후)
1. 자체 논문 관리 시스템 구축
2. 학회 전용 뉴스 섹션 개발
3. 회원 전용 컨텐츠 제공

## 🚀 배포

**Publish 탭**에서 다운로드 후:
1. 메뉴 링크 업데이트 필요
2. 실제 임베드 동작 테스트
3. 대체 컨텐츠 작동 확인

---

**작성일**: 2025-12-27  
**상태**: ✅ 임베드 페이지 생성 완료  
**참고**: X-Frame-Options 제한 시 대체 방안 자동 작동
