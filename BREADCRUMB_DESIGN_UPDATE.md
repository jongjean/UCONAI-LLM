# Breadcrumb 디자인 업데이트 보고서

## 작업 개요
스크린샷 디자인에 맞춰 breadcrumb 네비게이션의 폰트와 디자인을 수정했습니다.

## 수정 내용

### 1. 디자인 변경사항

#### 배경 및 패딩 제거
- **변경 전**: `background: #f8f9fa; padding: 15px 20px; border-radius: 6px;`
- **변경 후**: `background: transparent; padding: 0;`
- **이유**: 스크린샷에서 배경 없이 깔끔한 디자인

#### 폰트 크기 및 색상 조정
- **폰트 크기**: `14px` (기존 0.9rem에서 고정 픽셀로)
- **링크 색상**: `#999` (중간 회색)
- **hover 색상**: `#28a745` (녹색)
- **현재 페이지 색상**: `#28a745` (녹색)
- **구분자 색상**: `#ccc` (밝은 회색)

#### 구분자(Separator) 스타일
- **마진**: `0 10px`
- **색상**: `#ccc`
- **폰트 크기**: `12px`
- **종류**: Font Awesome chevron-right 아이콘 (>)

#### 홈 아이콘 숨김
- **추가**: `.breadcrumb .fa-home { display: none; }`
- **이유**: 스크린샷에는 홈 아이콘이 없고 "홈" 텍스트만 표시됨

### 2. 수정된 파일

#### css/sidebar.css
```css
.breadcrumb {
    margin-bottom: 30px;
    padding: 0;
    background: transparent;
    font-size: 14px;
    color: #999;
}

.breadcrumb a {
    color: #999;
    text-decoration: none;
    transition: color 0.3s ease;
    font-weight: normal;
}

.breadcrumb a:hover {
    color: #28a745;
}

.breadcrumb i {
    margin: 0 10px;
    color: #ccc;
    font-size: 12px;
    font-weight: normal;
}

/* 홈 아이콘 숨기기 */
.breadcrumb .fa-home {
    display: none;
}

.breadcrumb .current {
    color: #28a745;
    font-weight: normal;
}
```

#### css/subpage.css
```css
.breadcrumb {
    margin-top: 20px;
    margin-bottom: 20px;
    padding: 0;
    background: transparent;
    font-size: 14px;
    color: #999;
}

.breadcrumb a {
    color: #999;
    text-decoration: none;
    opacity: 1;
    font-weight: normal;
    transition: color 0.3s ease;
}

.breadcrumb a:hover {
    color: #28a745;
    opacity: 1;
}

.breadcrumb span {
    margin: 0 10px;
    color: #ccc;
    font-size: 12px;
}

/* 홈 아이콘 숨기기 */
.breadcrumb .fa-home {
    display: none;
}

.breadcrumb i {
    margin: 0 10px;
    color: #ccc;
    font-size: 12px;
    font-weight: normal;
}

.breadcrumb .current {
    color: #28a745;
    font-weight: normal;
}
```

### 3. 적용 범위

이 변경사항은 다음 53개의 HTML 페이지에 적용됩니다:

**학회소개 (About)**
- greeting.html, greeting-new.html
- purpose.html, history.html, constitution.html
- ci.html, location.html

**조직 (Organization)**
- executives.html, committees.html, divisions.html

**회원 (Member)**
- types.html, types-new.html
- process.html, fee.html, benefits.html

**학술행사 (Core)**
- forum.html, forum-new.html

**학회지 (Journal)**
- about.html, archive.html

**정책정보 (Policy)**
- research.html, standards.html, law.html
- global.html, reports.html

**뉴스·홍보 (News)**
- main.html, policy.html, cases.html
- press.html, column.html, video.html
- domestic.html

**커뮤니티 (Community)**
- notice.html, notice-new.html
- forum.html, discussion.html
- member-news.html, qna.html, free-board.html

**자료실 (Materials)**
- academic.html, policy.html
- presentation.html, report.html, video.html

**후원안내 (Support)**
- guide.html, corporate.html
- personal.html, usage.html

**마이페이지 (MyPage)**
- profile.html, payment.html, history.html
- paper.html, event.html, certificate.html

## 최종 결과

### 시각적 특징
✅ **깔끔한 디자인**: 배경 제거로 심플한 모습
✅ **일관된 색상**: 회색(#999) → 녹색(#28a745) 전환
✅ **적절한 간격**: 구분자 좌우 10px 마진
✅ **작은 구분자**: 12px 크기의 ">" 아이콘
✅ **홈 아이콘 숨김**: "홈" 텍스트만 표시

### 디자인 일치도
- ✅ 배경: 투명 (흰색)
- ✅ 링크 색상: 회색 (#999)
- ✅ 현재 페이지: 녹색 (#28a745)
- ✅ 구분자: 회색 ">" 아이콘
- ✅ 폰트 무게: normal (굵지 않음)

## 테스트 권장사항

다음 페이지에서 breadcrumb이 올바르게 표시되는지 확인:
1. pages/about/greeting.html
2. pages/member/types.html
3. pages/community/notice.html
4. pages/support/guide.html

## 완료 날짜
2025-12-30
