# Breadcrumb 위치 통일 - CSS 솔루션

## 📋 작업 개요
모든 페이지의 Breadcrumb를 page-header 하단에 시각적으로 통일되도록 CSS로 조정 완료

## 🎯 문제점
- 67개 페이지에 Breadcrumb가 각각 다른 위치에 존재
  - **패턴 A**: `<header>` 안에 위치 (page-header 전)
  - **패턴 B**: `<section class="page-header">` 뒤에 위치
  - **패턴 C**: `<section class="page-header">` 안에 위치 (올바름)

## ✅ 해결 방법 - CSS 기반 위치 통일

### 수정 파일
`css/subpage.css`

### 주요 변경사항

#### 1. **page-header 패딩 조정**
```css
.page-header {
    padding-bottom: 70px; /* breadcrumb 공간 확보 */
    position: relative;
}
```

#### 2. **page-header 안의 breadcrumb (올바른 위치)**
```css
.page-header .breadcrumb {
    margin-top: 25px;
    margin-bottom: 0;
    color: rgba(255, 255, 255, 0.9);
}
```

#### 3. **header 안의 breadcrumb (CSS로 위치 이동)**
```css
header .breadcrumb {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -60px; /* page-header 하단으로 이동 */
    z-index: 100;
    width: 100%;
    text-align: center;
    color: rgba(255, 255, 255, 0.9);
}
```

#### 4. **page-header 밖(뒤)의 breadcrumb (시각적 통일)**
```css
.page-header + .container > .breadcrumb,
.page-header + div > .breadcrumb {
    background: linear-gradient(135deg, var(--primary-green), var(--primary-blue));
    margin-top: -30px;
    padding: 15px 0 25px 0;
    margin-bottom: 0;
    color: rgba(255, 255, 255, 0.9);
    text-align: center;
}
```

#### 5. **Breadcrumb 스타일 통일**
```css
.breadcrumb a {
    color: rgba(255, 255, 255, 0.8);
}

.breadcrumb a:hover {
    color: rgba(255, 255, 255, 1);
}

.breadcrumb i {
    color: rgba(255, 255, 255, 0.5);
}

.breadcrumb .current {
    color: rgba(255, 255, 255, 1);
    font-weight: 500;
}

.breadcrumb .fa-home {
    display: inline; /* 홈 아이콘 표시 */
    margin-right: 5px;
}
```

## 🎨 시각적 효과

### Before
- Breadcrumb가 페이지마다 다른 위치에 표시
- 색상이 회색 (#999)으로 가독성 낮음
- 일부 페이지는 page-header 밖에 위치

### After
- 모든 페이지에서 Breadcrumb가 page-header 하단에 통일
- 흰색 계열 (rgba(255, 255, 255, 0.8~1))로 가독성 향상
- page-header의 gradient 배경과 조화
- 중앙 정렬로 깔끔한 레이아웃

## 📊 적용 범위
- ✅ **67개 모든 HTML 페이지**에 자동 적용
- ✅ HTML 수정 없이 CSS만으로 해결
- ✅ 반응형 디자인 유지

## 🔧 기술적 특징
1. **절대 위치 (Absolute Positioning)**: header 안의 breadcrumb을 page-header 영역으로 이동
2. **음수 마진 (Negative Margin)**: page-header 밖의 breadcrumb을 시각적으로 안쪽처럼 배치
3. **CSS 셀렉터**: 위치별로 다른 스타일 적용하여 통일된 결과 제공

## 🎯 장점
1. **유지보수 용이**: HTML 구조 변경 없이 CSS만 수정
2. **일괄 적용**: 모든 페이지에 자동으로 적용
3. **확장성**: 새 페이지 추가 시 자동으로 스타일 적용
4. **성능**: JavaScript 없이 순수 CSS로 구현

## 📝 참고사항
- Breadcrumb는 항상 page-header 배경색 (gradient)과 동일한 영역에 표시
- 모든 링크와 아이콘이 흰색 계열로 통일
- 현재 페이지는 font-weight: 500으로 강조
- 홈 아이콘이 모든 페이지에서 표시됨

## 🔍 테스트 필요 페이지
샘플 테스트 권장:
- pages/about/ci.html (header 안에 breadcrumb)
- pages/organization/executives.html (page-header 뒤에 breadcrumb)
- pages/news/domestic.html (page-header 안에 breadcrumb - 올바른 위치)
- pages/journal/dbpia-embed.html
- pages/news/esg-news-embed.html
