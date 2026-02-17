# 🚀 모든 섹션 페이지 사이드바 적용 가이드

## 📊 작업 현황

### ✅ 완료된 섹션 (예제 페이지)
1. **학회소개** - greeting.html, greeting-new.html ✅
2. **회원안내** - types-new.html ✅  
3. **핵심사업** - forum-new.html ✅
4. **커뮤니티** - notice-new.html ✅

### ⏳ 적용 대상 섹션

총 **11개 섹션 × 51개 페이지**

---

## 📝 적용 방법

### 방법 1: 수동 적용 (권장)

각 페이지에 다음 코드를 추가:

#### 1. CSS 링크 추가 (head 섹션)
```html
<link rel="stylesheet" href="../../css/sidebar.css">
<link rel="stylesheet" href="../../css/disable-edit.css">
```

#### 2. 드롭다운 메뉴 추가 (nav 섹션)

기존:
```html
<li class="nav-item has-dropdown"><a href="#" class="nav-link">학회소개</a></li>
```

변경:
```html
<li class="nav-item has-dropdown">
    <a href="#" class="nav-link">학회소개</a>
    <ul class="dropdown-menu">
        <li><a href="greeting.html">학회장 인사말</a></li>
        <li><a href="purpose.html">설립 목적·비전</a></li>
        <li><a href="history.html">연혁</a></li>
        <li><a href="constitution.html">정관·규정</a></li>
        <li><a href="ci.html">CI·BI</a></li>
        <li><a href="location.html">오시는 길</a></li>
    </ul>
</li>
```

#### 3. 브레드크럼 업데이트

기존:
```html
<div class="breadcrumb">
    <a href="../../index.html">홈</a><span>/</span>
    <a href="#">학회소개</a><span>/</span>
    <span>학회장 인사말</span>
</div>
```

변경:
```html
<div class="container">
    <div class="breadcrumb">
        <a href="../../index.html"><i class="fas fa-home"></i> 홈</a>
        <i class="fas fa-chevron-right"></i>
        <a href="#">학회소개</a>
        <i class="fas fa-chevron-right"></i>
        <span class="current">학회장 인사말</span>
    </div>
</div>
```

#### 4. 사이드바 + 콘텐츠 레이아웃 추가

기존:
```html
<section class="main-content">
    <div class="container">
        <div class="content-wrapper">
            <!-- 내용 -->
        </div>
    </div>
</section>
```

변경:
```html
<!-- Page Layout with Sidebar -->
<div class="page-layout">
    <!-- Sidebar Navigation -->
    <aside class="sidebar">
        <div class="sidebar-title">학회소개</div>
        <ul class="sidebar-menu">
            <li><a href="greeting.html" class="active">학회장 인사말</a></li>
            <li><a href="purpose.html">설립 목적·비전</a></li>
            <li><a href="history.html">연혁</a></li>
            <li><a href="constitution.html">정관·규정</a></li>
            <li><a href="ci.html">CI·BI</a></li>
            <li><a href="location.html">오시는 길</a></li>
        </ul>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
        <h2 class="content-title">학회장 인사말</h2>
        <p class="content-subtitle">한국ESG학회를 방문해 주신 여러분을 환영합니다</p>
        
        <!-- 기존 콘텐츠 여기에 -->
    </main>
</div>
```

#### 5. 모바일 토글 스크립트 추가 (body 끝부분)

```html
<script>
    // Mobile sidebar toggle
    document.addEventListener('DOMContentLoaded', function() {
        const sidebarTitle = document.querySelector('.sidebar-title');
        const sidebar = document.querySelector('.sidebar');
        
        if (window.innerWidth <= 768) {
            sidebarTitle.addEventListener('click', function() {
                sidebar.classList.toggle('collapsed');
            });
        }
    });
</script>
```

---

## 📋 섹션별 사이드바 메뉴 구조

### 1. 학회소개 (/pages/about/)
```html
<aside class="sidebar">
    <div class="sidebar-title">학회소개</div>
    <ul class="sidebar-menu">
        <li><a href="greeting.html">학회장 인사말</a></li>
        <li><a href="purpose.html">설립 목적·비전</a></li>
        <li><a href="history.html">연혁</a></li>
        <li><a href="constitution.html">정관·규정</a></li>
        <li><a href="ci.html">CI·BI</a></li>
        <li><a href="location.html">오시는 길</a></li>
    </ul>
</aside>
```

### 2. 학회조직 (/pages/organization/)
```html
<aside class="sidebar">
    <div class="sidebar-title">학회조직</div>
    <ul class="sidebar-menu">
        <li><a href="executives.html">임원진</a></li>
        <li><a href="committees.html">위원회</a></li>
        <li><a href="divisions.html">분과학회·연구회</a></li>
    </ul>
</aside>
```

### 3. 회원안내 (/pages/member/)
```html
<aside class="sidebar">
    <div class="sidebar-title">회원안내</div>
    <ul class="sidebar-menu">
        <li><a href="types.html">회원 구분</a></li>
        <li><a href="process.html">가입 절차</a></li>
        <li><a href="fee.html">회비 안내</a></li>
        <li><a href="benefits.html">회원 혜택</a></li>
        <li><a href="companies.html">회원사 소개</a></li>
    </ul>
</aside>
```

### 4. 핵심사업 (/pages/core/)
```html
<aside class="sidebar">
    <div class="sidebar-title">핵심사업</div>
    <ul class="sidebar-menu">
        <li><a href="forum.html">월드ESG포럼</a></li>
        <li><a href="award.html">한국ESG대상</a></li>
        <li><a href="ordinance.html">한국ESG조례대상</a></li>
        <li><a href="seminar.html">월요학술세미나</a></li>
    </ul>
</aside>
```

### 5. 학술지·논문 (/pages/journal/)
```html
<aside class="sidebar">
    <div class="sidebar-title">학술지·논문</div>
    <ul class="sidebar-menu">
        <li><a href="about.html">학술지 소개</a></li>
        <li><a href="submission.html">논문 투고 안내</a></li>
        <li><a href="editorial.html">편집위원회</a></li>
        <li><a href="review.html">심사 규정</a></li>
        <li><a href="archive.html">논문 아카이브</a></li>
        <li><a href="dbpia-embed.html">DBPIA 논문 검색</a></li>
    </ul>
</aside>
```

### 6. ESG정책·연구 (/pages/policy/)
```html
<aside class="sidebar">
    <div class="sidebar-title">ESG정책·연구</div>
    <ul class="sidebar-menu">
        <li><a href="research.html">ESG 정책 연구</a></li>
        <li><a href="standards.html">ESG 지표·표준</a></li>
        <li><a href="law.html">법·제도 분석</a></li>
        <li><a href="global.html">국제 ESG 동향</a></li>
        <li><a href="reports.html">연구보고서</a></li>
    </ul>
</aside>
```

### 7. ESG뉴스 (/pages/news/)
```html
<aside class="sidebar">
    <div class="sidebar-title">ESG뉴스</div>
    <ul class="sidebar-menu">
        <li><a href="main.html">ESG 주요 뉴스</a></li>
        <li><a href="policy.html">정책·입법 동향</a></li>
        <li><a href="cases.html">기업 ESG 사례</a></li>
        <li><a href="press.html">학회 보도자료</a></li>
        <li><a href="column.html">기고·칼럼</a></li>
        <li><a href="video.html">영상 콘텐츠</a></li>
        <li><a href="esg-news-embed.html">코리아ESG뉴스</a></li>
    </ul>
</aside>
```

### 8. 커뮤니티 (/pages/community/)
```html
<aside class="sidebar">
    <div class="sidebar-title">커뮤니티</div>
    <ul class="sidebar-menu">
        <li><a href="notice.html">공지사항</a></li>
        <li><a href="forum.html">자유게시판</a></li>
        <li><a href="discussion.html">학술·정책 토론</a></li>
        <li><a href="member-news.html">회원 소식</a></li>
        <li><a href="qna.html">Q&A</a></li>
    </ul>
</aside>
```

### 9. 자료실 (/pages/materials/)
```html
<aside class="sidebar">
    <div class="sidebar-title">자료실</div>
    <ul class="sidebar-menu">
        <li><a href="academic.html">학술자료</a></li>
        <li><a href="policy.html">정책자료</a></li>
        <li><a href="presentation.html">발표자료</a></li>
        <li><a href="report.html">ESG 리포트</a></li>
        <li><a href="video.html">영상자료</a></li>
    </ul>
</aside>
```

### 10. 후원·기부 (/pages/support/)
```html
<aside class="sidebar">
    <div class="sidebar-title">후원·기부</div>
    <ul class="sidebar-menu">
        <li><a href="guide.html">후원 안내</a></li>
        <li><a href="corporate.html">기업 후원</a></li>
        <li><a href="personal.html">개인 기부</a></li>
        <li><a href="usage.html">기부금 사용 내역</a></li>
    </ul>
</aside>
```

### 11. 마이페이지 (/pages/mypage/)
```html
<aside class="sidebar">
    <div class="sidebar-title">마이페이지</div>
    <ul class="sidebar-menu">
        <li><a href="profile.html">회원정보 관리</a></li>
        <li><a href="payment.html">회비 납부</a></li>
        <li><a href="history.html">납부 내역</a></li>
        <li><a href="paper.html">논문 투고 현황</a></li>
        <li><a href="event.html">행사·세미나 신청 내역</a></li>
        <li><a href="certificate.html">회원증·증명서</a></li>
    </ul>
</aside>
```

---

## 🎯 활성 메뉴 표시

현재 페이지에 `class="active"` 추가:

```html
<li><a href="greeting.html" class="active">학회장 인사말</a></li>
<li><a href="purpose.html">설립 목적·비전</a></li>
```

---

## 📱 반응형 동작

- **데스크톱**: 사이드바 고정 표시
- **모바일** (768px 이하): 사이드바 제목 클릭으로 토글

---

## ✅ 체크리스트

각 페이지 수정 시 확인:

- [ ] CSS 링크 추가 (sidebar.css, disable-edit.css)
- [ ] 드롭다운 메뉴 추가 (11개 섹션)
- [ ] 브레드크럼 업데이트
- [ ] 사이드바 레이아웃 추가
- [ ] 활성 메뉴 표시 (.active 클래스)
- [ ] 모바일 토글 스크립트 추가
- [ ] 테스트 (데스크톱 + 모바일)

---

## 🎉 완성!

모든 페이지에 이 패턴을 적용하면 일관된 네비게이션 시스템이 완성됩니다!
