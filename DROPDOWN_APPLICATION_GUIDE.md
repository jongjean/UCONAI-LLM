# 🚀 모든 페이지 드롭다운 메뉴 활성화 가이드

## 📊 전체 현황

**총 67개 페이지**에 드롭다운 메뉴를 추가해야 합니다.

### 📁 섹션별 페이지 수
- pages/about/ (학회소개): 7개
- pages/organization/ (학회조직): 3개  
- pages/member/ (회원안내): 5개
- pages/core/ (핵심사업): 8개
- pages/journal/ (학술지·논문): 8개
- pages/policy/ (ESG정책·연구): 5개
- pages/news/ (ESG뉴스): 8개
- pages/community/ (커뮤니티): 6개
- pages/materials/ (자료실): 5개
- pages/support/ (후원·기부): 4개
- pages/mypage/ (마이페이지): 6개

---

## 🔧 빠른 적용 방법

### 방법 1: 찾기/바꾸기 (가장 빠름)

#### Step 1: 기존 코드 찾기
```html
<li class="nav-item has-dropdown"><a href="#" class="nav-link">학회소개</a></li>
```

#### Step 2: 새 코드로 바꾸기
```html
<li class="nav-item has-dropdown">
    <a href="#" class="nav-link">학회소개</a>
    <ul class="dropdown-menu">
        <li><a href="../about/greeting.html">학회장 인사말</a></li>
        <li><a href="../about/purpose.html">설립 목적·비전</a></li>
        <li><a href="../about/history.html">연혁</a></li>
        <li><a href="../about/constitution.html">정관·규정</a></li>
        <li><a href="../about/ci.html">CI·BI</a></li>
        <li><a href="../about/location.html">오시는 길</a></li>
    </ul>
</li>
```

---

## 📝 전체 드롭다운 메뉴 코드

`DROPDOWN_MENU_TEMPLATE.html` 파일에서 전체 코드를 확인하세요.

### 적용 순서:

**1. 학회소개 드롭다운**
```html
<li class="nav-item has-dropdown">
    <a href="#" class="nav-link">학회소개</a>
    <ul class="dropdown-menu">
        <li><a href="../about/greeting.html">학회장 인사말</a></li>
        <li><a href="../about/purpose.html">설립 목적·비전</a></li>
        <li><a href="../about/history.html">연혁</a></li>
        <li><a href="../about/constitution.html">정관·규정</a></li>
        <li><a href="../about/ci.html">CI·BI</a></li>
        <li><a href="../about/location.html">오시는 길</a></li>
    </ul>
</li>
```

**2. 학회조직 드롭다운**
```html
<li class="nav-item has-dropdown">
    <a href="#" class="nav-link">학회조직</a>
    <ul class="dropdown-menu">
        <li><a href="../organization/executives.html">임원진</a></li>
        <li><a href="../organization/committees.html">위원회</a></li>
        <li><a href="../organization/divisions.html">분과학회·연구회</a></li>
    </ul>
</li>
```

**3. 회원안내 드롭다운**
```html
<li class="nav-item has-dropdown">
    <a href="#" class="nav-link">회원안내</a>
    <ul class="dropdown-menu">
        <li><a href="../member/types.html">회원 구분</a></li>
        <li><a href="../member/process.html">가입 절차</a></li>
        <li><a href="../member/fee.html">회비 안내</a></li>
        <li><a href="../member/benefits.html">회원 혜택</a></li>
        <li><a href="../member/companies.html">회원사 소개</a></li>
    </ul>
</li>
```

**4. 핵심사업 드롭다운**
```html
<li class="nav-item has-dropdown">
    <a href="#" class="nav-link">핵심사업</a>
    <ul class="dropdown-menu">
        <li><a href="../core/forum.html">월드ESG포럼</a></li>
        <li><a href="../core/award.html">한국ESG대상</a></li>
        <li><a href="../core/ordinance.html">한국ESG조례대상</a></li>
        <li><a href="../core/seminar.html">월요학술세미나</a></li>
    </ul>
</li>
```

**5. 학술지·논문 드롭다운**
```html
<li class="nav-item has-dropdown">
    <a href="#" class="nav-link">학술지·논문</a>
    <ul class="dropdown-menu">
        <li><a href="../journal/about.html">학술지 소개</a></li>
        <li><a href="../journal/submission.html">논문 투고 안내</a></li>
        <li><a href="../journal/editorial.html">편집위원회</a></li>
        <li><a href="../journal/review.html">심사 규정</a></li>
        <li><a href="../journal/archive.html">논문 아카이브</a></li>
        <li><a href="../journal/dbpia-embed.html">DBPIA 논문 검색</a></li>
    </ul>
</li>
```

**6. ESG정책·연구 드롭다운**
```html
<li class="nav-item has-dropdown">
    <a href="#" class="nav-link">ESG정책·연구</a>
    <ul class="dropdown-menu">
        <li><a href="../policy/research.html">ESG 정책 연구</a></li>
        <li><a href="../policy/standards.html">ESG 지표·표준</a></li>
        <li><a href="../policy/law.html">법·제도 분석</a></li>
        <li><a href="../policy/global.html">국제 ESG 동향</a></li>
        <li><a href="../policy/reports.html">연구보고서</a></li>
    </ul>
</li>
```

**7. ESG뉴스 드롭다운**
```html
<li class="nav-item has-dropdown">
    <a href="#" class="nav-link">ESG뉴스</a>
    <ul class="dropdown-menu">
        <li><a href="../news/main.html">ESG 주요 뉴스</a></li>
        <li><a href="../news/policy.html">정책·입법 동향</a></li>
        <li><a href="../news/cases.html">기업 ESG 사례</a></li>
        <li><a href="../news/press.html">학회 보도자료</a></li>
        <li><a href="../news/column.html">기고·칼럼</a></li>
        <li><a href="../news/video.html">영상 콘텐츠</a></li>
        <li><a href="../news/esg-news-embed.html">코리아ESG뉴스</a></li>
    </ul>
</li>
```

**8. 커뮤니티 드롭다운**
```html
<li class="nav-item has-dropdown">
    <a href="#" class="nav-link">커뮤니티</a>
    <ul class="dropdown-menu">
        <li><a href="../community/notice.html">공지사항</a></li>
        <li><a href="../community/forum.html">자유게시판</a></li>
        <li><a href="../community/discussion.html">학술·정책 토론</a></li>
        <li><a href="../community/member-news.html">회원 소식</a></li>
        <li><a href="../community/qna.html">Q&A</a></li>
    </ul>
</li>
```

**9. 자료실 드롭다운**
```html
<li class="nav-item has-dropdown">
    <a href="#" class="nav-link">자료실</a>
    <ul class="dropdown-menu">
        <li><a href="../materials/academic.html">학술자료</a></li>
        <li><a href="../materials/policy.html">정책자료</a></li>
        <li><a href="../materials/presentation.html">발표자료</a></li>
        <li><a href="../materials/report.html">ESG 리포트</a></li>
        <li><a href="../materials/video.html">영상자료</a></li>
    </ul>
</li>
```

**10. 후원·기부 드롭다운**
```html
<li class="nav-item has-dropdown">
    <a href="#" class="nav-link">후원·기부</a>
    <ul class="dropdown-menu">
        <li><a href="../support/guide.html">후원 안내</a></li>
        <li><a href="../support/corporate.html">기업 후원</a></li>
        <li><a href="../support/personal.html">개인 기부</a></li>
        <li><a href="../support/usage.html">기부금 사용 내역</a></li>
    </ul>
</li>
```

**11. 마이페이지 드롭다운**
```html
<li class="nav-item has-dropdown">
    <a href="#" class="nav-link">마이페이지</a>
    <ul class="dropdown-menu">
        <li><a href="../mypage/profile.html">회원정보 관리</a></li>
        <li><a href="../mypage/payment.html">회비 납부</a></li>
        <li><a href="../mypage/history.html">납부 내역</a></li>
        <li><a href="../mypage/paper.html">논문 투고 현황</a></li>
        <li><a href="../mypage/event.html">행사·세미나 신청 내역</a></li>
        <li><a href="../mypage/certificate.html">회원증·증명서</a></li>
    </ul>
</li>
```

---

## ⚙️ VS Code / 에디터 사용 시

### 다중 파일 찾기/바꾸기

1. **Ctrl + Shift + H** (찾기/바꾸기 열기)
2. **파일 패턴**: `pages/**/*.html`
3. **찾기**: `<li class="nav-item has-dropdown"><a href="#" class="nav-link">학회소개</a></li>`
4. **바꾸기**: 위의 드롭다운 코드 전체 복사
5. **모두 바꾸기** 클릭

이 과정을 11개 메뉴 모두 반복하세요.

---

## ✅ 체크리스트

각 페이지 수정 후 확인:

- [ ] 11개 드롭다운 메뉴 모두 추가
- [ ] 상대 경로 확인 (`../folder/file.html`)
- [ ] 호버 시 드롭다운 표시 확인
- [ ] 링크 클릭 시 정상 작동 확인
- [ ] 모바일에서도 작동 확인

---

## 🎯 우선순위

### High (먼저 적용)
1. pages/about/ (학회소개) - 7개
2. pages/member/ (회원안내) - 5개
3. pages/core/ (핵심사업) - 8개

### Medium
4. pages/journal/ (학술지·논문) - 8개
5. pages/policy/ (ESG정책·연구) - 5개
6. pages/news/ (ESG뉴스) - 8개
7. pages/community/ (커뮤니티) - 6개

### Low (나중에)
8. pages/materials/ (자료실) - 5개
9. pages/support/ (후원·기부) - 4개
10. pages/mypage/ (마이페이지) - 6개

---

## 💡 팁

1. **복사/붙여넣기**: `DROPDOWN_MENU_TEMPLATE.html` 파일의 전체 코드를 복사해서 기존 `<ul class="nav-menu">` 부분을 통째로 바꾸세요.

2. **자동화 도구**: 텍스트 에디터의 다중 커서 기능을 사용하면 빠릅니다.

3. **백업**: 수정 전 원본 파일을 백업하세요.

---

## 🎉 완료 후

모든 페이지에 드롭다운을 추가하면:
- ✅ 어느 페이지에서든 드롭다운 메뉴 작동
- ✅ 11개 카테고리 × 62개 링크
- ✅ 통일된 네비게이션 경험
