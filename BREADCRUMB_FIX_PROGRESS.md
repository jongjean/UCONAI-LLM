# Breadcrumb 위치 수정 진행 상황

## ✅ 수정 완료 (14개)

### About 폴더 (7개)
- [x] pages/about/ci.html
- [x] pages/about/location.html
- [x] pages/about/greeting.html
- [x] pages/about/greeting-new.html
- [x] pages/about/purpose.html
- [x] pages/about/history.html
- [x] pages/about/constitution.html

### Organization 폴더 (3개)
- [x] pages/organization/executives.html
- [x] pages/organization/committees.html
- [x] pages/organization/divisions.html

### Journal 폴더 (1개)
- [x] pages/journal/dbpia-embed.html

### News 폴더 (1개)
- [x] pages/news/esg-news-embed.html

### News 폴더 - 이미 올바름 (2개)
- [x] pages/news/domestic.html (이미 올바른 위치)

## 🔄 수정 필요 (53개)

### Member 폴더 (7개)
- [ ] pages/member/types.html
- [ ] pages/member/process.html
- [ ] pages/member/fee.html
- [ ] pages/member/benefits.html
- [ ] pages/member/companies.html
- [ ] pages/member/types-new.html
- [ ] pages/member/application.html

### Core 폴더 (9개)
- [ ] pages/core/forum.html
- [ ] pages/core/award.html
- [ ] pages/core/ordinance.html
- [ ] pages/core/seminar.html
- [ ] pages/core/certification.html
- [ ] pages/core/consulting.html
- [ ] pages/core/education.html
- [ ] pages/core/forum-new.html

### Journal 폴더 (6개)
- [ ] pages/journal/submission.html
- [ ] pages/journal/editorial.html
- [ ] pages/journal/review.html
- [ ] pages/journal/archive.html
- [ ] pages/journal/editorial-board.html
- [ ] pages/journal/about.html

### Policy 폴더 (5개)
- [ ] pages/policy/research.html
- [ ] pages/policy/standards.html
- [ ] pages/policy/law.html
- [ ] pages/policy/global.html
- [ ] pages/policy/reports.html

### News 폴더 (6개)
- [ ] pages/news/main.html
- [ ] pages/news/policy.html
- [ ] pages/news/cases.html
- [ ] pages/news/press.html
- [ ] pages/news/column.html
- [ ] pages/news/video.html

### Community 폴더 (7개)
- [ ] pages/community/notice.html
- [ ] pages/community/forum.html
- [ ] pages/community/discussion.html
- [ ] pages/community/member-news.html
- [ ] pages/community/qna.html
- [ ] pages/community/free-board.html
- [ ] pages/community/notice-new.html

### Materials 폴더 (5개)
- [ ] pages/materials/academic.html
- [ ] pages/materials/policy.html
- [ ] pages/materials/presentation.html
- [ ] pages/materials/report.html
- [ ] pages/materials/video.html

### Support 폴더 (4개)
- [ ] pages/support/guide.html
- [ ] pages/support/corporate.html
- [ ] pages/support/personal.html
- [ ] pages/support/usage.html

### Mypage 폴더 (6개)
- [ ] pages/mypage/profile.html
- [ ] pages/mypage/payment.html
- [ ] pages/mypage/history.html
- [ ] pages/mypage/paper.html
- [ ] pages/mypage/event.html
- [ ] pages/mypage/certificate.html

## 수정 패턴

### 패턴 A: header 안에 breadcrumb (page-header 전)
```html
<!-- 잘못된 위치 -->
</nav>
<div class="breadcrumb">...</div>
</header>
<section class="page-header">...</section>

<!-- 올바른 위치 -->
</nav>
</header>
<section class="page-header">
    <div class="container">
        <h1>제목</h1>
        <p>설명</p>
        <div class="breadcrumb">...</div>
    </div>
</section>
```

### 패턴 B: page-header 뒤에 breadcrumb
```html
<!-- 잘못된 위치 -->
<section class="page-header">...</section>
<div class="container"><div class="breadcrumb">...</div></div>
<section class="main-content">...</section>

<!-- 올바른 위치 -->
<section class="page-header">
    <div class="container">
        <h1>제목</h1>
        <p>설명</p>
        <div class="breadcrumb">...</div>
    </div>
</section>
<section class="main-content">...</section>
```
