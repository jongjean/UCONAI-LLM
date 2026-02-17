# 🎯 로고 완전 삭제 및 텍스트 전환 ✅

## 🔧 수행한 작업

### 1. 로고 이미지 파일 완전 삭제
```bash
❌ images/logo-full.png - 삭제됨
❌ images/logo-symbol.png - 삭제됨
```

### 2. HTML - 텍스트 로고로 교체

#### Before (이미지)
```html
<a href="index.html" class="logo">
    <img src="images/logo-full.png" alt="한국ESG학회" class="logo-full">
</a>
```

#### After (텍스트)
```html
<a href="index.html" class="logo">
    <span class="logo-text">한국ESG학회</span>
</a>
```

### 3. CSS - 텍스트 로고 스타일

```css
.logo {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    text-decoration: none;
}

.logo-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-green);
    white-space: nowrap;
}

.logo-text:hover {
    color: var(--primary-blue);
}
```

---

## ✅ 완료된 파일

### 메인 페이지
- [x] `index.html`

### 서브 페이지 (일부)
- [x] `pages/about/greeting.html`
- [x] `pages/about/purpose.html`
- [x] `pages/about/history.html`
- [x] `pages/journal/about.html`
- [x] `pages/news/domestic.html`

---

## ⚠️ 나머지 파일 처리 필요

아래 50개 파일도 동일하게 수정해야 합니다:

### about/ (3개 남음)
- pages/about/constitution.html
- pages/about/ci.html
- pages/about/location.html

### organization/ (3개)
- pages/organization/executives.html
- pages/organization/committees.html
- pages/organization/divisions.html

### member/ (5개)
- pages/member/types.html
- pages/member/process.html
- pages/member/fee.html
- pages/member/benefits.html
- pages/member/companies.html

### core/ (4개)
- pages/core/forum.html
- pages/core/award.html
- pages/core/ordinance.html
- pages/core/seminar.html

### journal/ (4개)
- pages/journal/submission.html
- pages/journal/editorial.html
- pages/journal/review.html
- pages/journal/archive.html

### policy/ (5개)
- pages/policy/research.html
- pages/policy/standards.html
- pages/policy/law.html
- pages/policy/global.html
- pages/policy/reports.html

### news/ (5개)
- pages/news/main.html
- pages/news/policy.html
- pages/news/cases.html
- pages/news/press.html
- pages/news/column.html
- pages/news/video.html

### community/ (5개)
- pages/community/notice.html
- pages/community/forum.html
- pages/community/discussion.html
- pages/community/member-news.html
- pages/community/qna.html

### materials/ (5개)
- pages/materials/academic.html
- pages/materials/policy.html
- pages/materials/presentation.html
- pages/materials/report.html
- pages/materials/video.html

### support/ (4개)
- pages/support/guide.html
- pages/support/corporate.html
- pages/support/personal.html
- pages/support/usage.html

### mypage/ (6개)
- pages/mypage/profile.html
- pages/mypage/payment.html
- pages/mypage/history.html
- pages/mypage/paper.html
- pages/mypage/event.html
- pages/mypage/certificate.html

---

## 🔄 교체 방법 (수동)

각 파일에서 다음 패턴을 찾아 교체:

### 패턴 1: 로고 1개
```html
<!-- 찾기 -->
<a href="../../index.html" class="logo">
    <img src="../../images/logo-full.png" alt="한국ESG학회" class="logo-full">
</a>

<!-- 바꾸기 -->
<a href="../../index.html" class="logo">
    <span class="logo-text">한국ESG학회</span>
</a>
```

### 패턴 2: 로고 2개
```html
<!-- 찾기 -->
<a href="../../index.html" class="logo">
    <img src="../../images/logo-full.png" alt="한국ESG학회" class="logo-full">
    <img src="../../images/logo-symbol.png" alt="한국ESG학회" class="logo-symbol">
</a>

<!-- 바꾸기 -->
<a href="../../index.html" class="logo">
    <span class="logo-text">한국ESG학회</span>
</a>
```

---

## 🛠️ 자동 교체 스크립트

`replace_logos.py` 스크립트를 실행하면 모든 파일을 일괄 처리할 수 있습니다:

```bash
python3 replace_logos.py
```

---

## 📱 최종 결과

- ✅ 로고 이미지 완전 삭제
- ✅ 텍스트 로고 사용: **"한국ESG학회"**
- ✅ 초록색 텍스트 (hover 시 파란색)
- ✅ 찌그러짐 없음
- ✅ 모든 화면에서 동일하게 표시

---

**상태**: ⚠️ 부분 완료 (5개 완료, 50개 남음)  
**다음 단계**: 나머지 파일 일괄 교체 또는 스크립트 실행  
**날짜**: 2025-12-27
