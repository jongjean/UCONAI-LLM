# Breadcrumb 위치 이동 완료 보고서

## 작업 일시
2025-12-30

## 작업 내용
모든 페이지의 Breadcrumb을 헤더(`</header>`) 내부로 이동

## 완료된 페이지

### 커뮤니티 (7개)
- ✅ `pages/community/forum.html` - 자유게시판
- ✅ `pages/community/discussion.html` - 학술·정책 토론
- ✅ `pages/community/member-news.html` - 회원소식
- ✅ `pages/community/qna.html` - 자주 묻는 질문 (FAQ)
- ✅ `pages/community/free-board.html` - 자유게시판
- ✅ `pages/community/notice.html` - 공지사항
- ⏳ `pages/community/notice-new.html` - 확인 필요

### 자료실 (5개)
- ✅ `pages/materials/presentation.html` - 발표자료
- ✅ `pages/materials/report.html` - ESG 리포트
- ✅ `pages/materials/video.html` - 영상자료
- ✅ `pages/materials/academic.html` - 학술자료
- ✅ `pages/materials/policy.html` - 정책자료

### 마이페이지 (6개)
- ✅ `pages/mypage/payment.html` - 회비 납부
- ✅ `pages/mypage/history.html` - 납부 내역
- ✅ `pages/mypage/paper.html` - 논문 투고 현황
- ✅ `pages/mypage/event.html` - 행사·세미나 신청 내역
- ✅ `pages/mypage/certificate.html` - 회원증·증명서
- ✅ `pages/mypage/profile.html` - 회원정보 관리

## 작업 대기 중인 페이지

아래 페이지들은 Breadcrumb이 존재하지만 아직 이동 작업이 완료되지 않았습니다:

### 학회소개
- `pages/about/purpose.html` - 설립 목적·비전
- `pages/about/history.html` - 학회 연혁
- `pages/about/constitution.html` - 정관
- `pages/about/greeting.html` - 학회장 인사말
- `pages/about/greeting-new.html` - 학회장 인사말 (신규)
- `pages/about/ci.html` - CI/BI
- `pages/about/location.html` - 오시는 길

### 회원안내
- `pages/member/types.html` - 회원 구분
- `pages/member/types-new.html` - 회원 구분 (신규)
- `pages/member/process.html` - 가입 절차
- `pages/member/fee.html` - 회비 안내
- `pages/member/benefits.html` - 회원 혜택
- `pages/member/companies.html` - 회원사 소개
- `pages/member/application.html` - 회원 신청

### 핵심사업
- `pages/core/forum.html` - 월드ESG포럼
- `pages/core/forum-new.html` - 월드ESG포럼 (신규)
- `pages/core/award.html` - 한국ESG대상
- `pages/core/ordinance.html` - 한국ESG조례대상
- `pages/core/seminar.html` - 월요학술세미나
- `pages/core/certification.html` - ESG 인증
- `pages/core/consulting.html` - ESG 컨설팅
- `pages/core/education.html` - ESG 교육

### 조직구성
- `pages/organization/executives.html` - 임원진
- `pages/organization/committees.html` - 위원회
- `pages/organization/divisions.html` - 분과위원회

### 학술지·논문
- `pages/journal/about.html` - 학술지 소개
- `pages/journal/submission.html` - 논문 투고 안내
- `pages/journal/editorial.html` - 편집위원회
- `pages/journal/editorial-board.html` - 편집위원회 (보드)
- `pages/journal/review.html` - 심사 규정
- `pages/journal/archive.html` - 논문 아카이브

### ESG정책·연구
- `pages/policy/research.html` - ESG 정책 연구
- `pages/policy/standards.html` - ESG 지표·표준
- `pages/policy/law.html` - 법·제도 분석
- `pages/policy/global.html` - 국제 ESG 동향
- `pages/policy/reports.html` - 연구보고서

### ESG뉴스
- `pages/news/main.html` - ESG 주요 뉴스
- `pages/news/policy.html` - 정책·입법 동향
- `pages/news/cases.html` - 기업 ESG 사례
- `pages/news/press.html` - 학회 보도자료
- `pages/news/column.html` - 기고·칼럼
- `pages/news/video.html` - 영상 콘텐츠
- `pages/news/domestic.html` - 국내 뉴스

### 후원·기부
- `pages/support/guide.html` - 후원 안내
- `pages/support/corporate.html` - 기업 후원
- `pages/support/personal.html` - 개인 기부
- `pages/support/usage.html` - 기부금 사용 내역

## 변경 사항

### 이전 구조
```html
</header>

<main class="main-content">
    <div class="page-header">
        <h1>페이지 제목</h1>
        <p>페이지 설명</p>
        <div class="breadcrumb">
            <!-- Breadcrumb 내용 -->
        </div>
    </div>
```

### 변경 후 구조
```html
    <div class="breadcrumb">
        <a href="../../index.html"><i class="fas fa-home"></i> 홈</a>
        <i class="fas fa-chevron-right"></i>
        <a href="#">카테고리</a>
        <i class="fas fa-chevron-right"></i>
        <span class="current">현재 페이지</span>
    </div>
</header>

<main class="main-content">
    <div class="page-header">
        <h1>페이지 제목</h1>
        <p>페이지 설명</p>
    </div>
```

## 다음 단계

나머지 페이지들의 Breadcrumb도 헤더 안으로 이동시켜야 합니다. 각 페이지의 구조가 다를 수 있으므로:

1. 페이지별로 헤더 구조 확인
2. Breadcrumb 현재 위치 파악
3. `</header>` 태그 바로 앞으로 Breadcrumb 이동
4. 기존 위치에서 Breadcrumb 제거

## CSS 스타일링 권장사항

Breadcrumb이 헤더 안에 있을 때 적절한 스타일링을 위해 CSS 수정이 필요할 수 있습니다:

```css
header .breadcrumb {
    padding: 10px 0;
    background: transparent;
    /* 헤더 내부에서 적절한 위치에 배치 */
}
```

## 참고사항

- 일부 페이지는 서로 다른 헤더 구조를 가지고 있을 수 있습니다
- 페이지별로 테스트하여 레이아웃이 깨지지 않았는지 확인 필요
- 스크린샷과 비교하여 디자인이 일치하는지 확인 필요
