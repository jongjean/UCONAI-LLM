# Breadcrumb 위치 수정 계획

## 목표
모든 페이지의 Breadcrumb를 `<section class="page-header">` 안쪽으로 이동

## 올바른 구조 (참고: pages/news/domestic.html)
```html
<section class="page-header">
    <div class="container">
        <h1>페이지 제목</h1>
        <p>페이지 설명</p>
        <div class="breadcrumb">
            <a href="../../index.html"><i class="fas fa-home"></i> 홈</a>
            <i class="fas fa-chevron-right"></i>
            <a href="#">카테고리</a>
            <i class="fas fa-chevron-right"></i>
            <span class="current">현재 페이지</span>
        </div>
    </div>
</section>
```

## 수정 대상 페이지 (총 67개)

### 패턴 A: header 안에 breadcrumb (page-header 밖)
- pages/about/ci.html
- pages/about/location.html
- pages/about/greeting.html
- pages/about/greeting-new.html
- pages/about/purpose.html
- pages/about/history.html
- pages/about/constitution.html
- pages/member/types.html
- pages/member/process.html
- pages/member/fee.html
- pages/member/benefits.html
- pages/member/types-new.html
- pages/organization/committees.html
- pages/organization/divisions.html
- pages/core/forum.html
- pages/core/ordinance.html
- pages/core/forum-new.html
- 등...

### 패턴 B: page-header 밖(뒤)에 breadcrumb
- pages/organization/executives.html
- pages/journal/dbpia-embed.html
- pages/news/esg-news-embed.html
- 등...

### 패턴 C: 이미 올바른 위치 (page-header 안)
- pages/news/domestic.html
- 확인 필요...

## 수정 방법
각 페이지를:
1. breadcrumb 요소 찾기
2. breadcrumb를 page-header 섹션 안의 container div 끝으로 이동
3. 위치가 제목과 설명 아래에 오도록 배치
