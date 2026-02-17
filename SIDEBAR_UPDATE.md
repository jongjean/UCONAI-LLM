# 한국ESG학회 웹사이트 - 사이드바 네비게이션 개선 완료

## 📋 업데이트 내용 (2024-12-29)

### ✅ 새로운 사이드바 네비게이션 시스템

깔끔하고 사용자 친화적인 사이드바 네비게이션 시스템을 구축했습니다.

## 🎨 사이드바 디자인 특징

### 1. **시각적 개선**
- 깔끔한 화이트 배경과 그린-블루 그라데이션 헤더
- 명확한 메뉴 구분선으로 가독성 향상
- 마우스 호버 시 부드러운 전환 효과
- 활성 메뉴 하이라이트 (녹색 좌측 보더 + 연녹색 배경)

### 2. **기능적 개선**
- **고정 위치 (Sticky)**: 스크롤 시 사이드바가 화면에 고정되어 편리한 네비게이션
- **반응형 디자인**: 모바일에서 접기/펼치기 기능 제공
- **부드러운 인터랙션**: 호버 시 왼쪽으로 살짝 이동하는 애니메이션
- **화살표 인디케이터**: 메뉴 선택 시 시각적 피드백

### 3. **실제 작동하는 링크**
모든 사이드바 메뉴가 실제 페이지로 연결되어 작동합니다.

## 📁 새로 생성된 파일

### CSS 파일
- **css/sidebar.css** - 사이드바 전용 스타일시트
  - 사이드바 레이아웃 스타일
  - 메뉴 호버 효과
  - 모바일 반응형 스타일
  - 브레드크럼 스타일

### 예제 페이지 (새 버전)
1. **pages/about/greeting-new.html** - 학회장 인사말 (사이드바 적용)
2. **pages/member/types-new.html** - 회원 구분 (사이드바 적용)
3. **pages/core/forum-new.html** - 월드ESG포럼 (사이드바 적용)

## 🎯 사이드바 메뉴 구성

### 학회소개 (About)
```
- 학회장 인사말
- 설립 목적·비전
- 연혁
- 정관·규정
- CI·BI
- 오시는 길
```

### 회원안내 (Member)
```
- 회원 구분
- 가입 절차
- 회비 안내
- 회원 혜택
- 회원사 소개
```

### 핵심사업 (Core Business)
```
- 월드ESG포럼
- 한국ESG대상
- 한국ESG조례대상
- 월요학술세미나
```

## 💻 사용 방법

### HTML 페이지에 사이드바 추가

```html
<!-- CSS 포함 -->
<link rel="stylesheet" href="../../css/sidebar.css">

<!-- 페이지 레이아웃 -->
<div class="page-layout">
    <!-- 사이드바 -->
    <aside class="sidebar">
        <div class="sidebar-title">메뉴 제목</div>
        <ul class="sidebar-menu">
            <li><a href="page1.html" class="active">메뉴 1</a></li>
            <li><a href="page2.html">메뉴 2</a></li>
            <li><a href="page3.html">메뉴 3</a></li>
        </ul>
    </aside>

    <!-- 메인 콘텐츠 -->
    <main class="main-content">
        <h2 class="content-title">페이지 제목</h2>
        <p class="content-subtitle">부제목</p>
        <!-- 콘텐츠 내용 -->
    </main>
</div>

<!-- 모바일 접기/펼치기 스크립트 -->
<script>
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

### 브레드크럼 추가

```html
<div class="container">
    <div class="breadcrumb">
        <a href="../../index.html"><i class="fas fa-home"></i> 홈</a>
        <i class="fas fa-chevron-right"></i>
        <a href="#">카테고리</a>
        <i class="fas fa-chevron-right"></i>
        <span class="current">현재 페이지</span>
    </div>
</div>
```

## 🎨 CSS 클래스 설명

### 레이아웃 클래스
- `.page-layout` - 사이드바와 메인 콘텐츠를 포함하는 플렉스 컨테이너
- `.sidebar` - 사이드바 컨테이너 (250px 고정폭, sticky 포지션)
- `.main-content` - 메인 콘텐츠 영역 (플렉스 1)

### 사이드바 클래스
- `.sidebar-title` - 사이드바 헤더 (그라데이션 배경)
- `.sidebar-menu` - 메뉴 목록
- `.sidebar-menu a` - 메뉴 아이템
- `.sidebar-menu a.active` - 활성 메뉴 (녹색 좌측 보더)
- `.sidebar-menu a:hover` - 호버 효과 (왼쪽 이동)

### 콘텐츠 클래스
- `.content-title` - 페이지 제목 (녹색, 하단 보더)
- `.content-subtitle` - 페이지 부제목
- `.breadcrumb` - 브레드크럼 네비게이션

## 📱 반응형 동작

### 데스크톱 (768px 이상)
- 사이드바가 왼쪽에 고정 (250px)
- 스크롤 시 상단에 고정 (sticky)
- 메인 콘텐츠가 오른쪽을 채움

### 모바일 (768px 이하)
- 사이드바가 상단에 위치
- 사이드바 제목 클릭 시 메뉴 펼침/접힘
- 사이드바 제목에 화살표 아이콘 표시
- 메뉴가 접힌 상태로 시작

## 🚀 다음 단계 (권장사항)

### 1. 모든 서브 페이지에 사이드바 적용
현재 생성된 예제를 참고하여 다음 섹션들에 사이드바를 적용하세요:

- **학회조직**: 임원진, 위원회, 분과학회·연구회
- **학술지·논문**: 학술지 소개, 논문 투고, 편집위원회, 심사 규정, 논문 아카이브
- **ESG정책·연구**: 정책 연구, 지표·표준, 법·제도 분석, 국제 동향, 연구보고서
- **ESG뉴스**: 주요 뉴스, 정책 동향, 기업 사례, 보도자료, 칼럼, 영상 콘텐츠
- **커뮤니티**: 공지사항, 자유게시판, 토론, 회원 소식, Q&A
- **자료실**: 학술자료, 정책자료, 발표자료, ESG 리포트, 영상자료
- **후원·기부**: 후원 안내, 기업 후원, 개인 기부, 기부금 사용 내역
- **마이페이지**: 회원정보, 회비 납부, 납부 내역, 논문 투고, 행사 신청, 증명서

### 2. 기존 페이지 업데이트
- 기존 페이지들을 새로운 사이드바 구조로 마이그레이션
- greeting.html → greeting-new.html 형식으로 백업하며 진행

### 3. 네비게이션 일관성 확보
- 모든 페이지에서 동일한 사이드바 스타일 적용
- 활성 메뉴 하이라이트가 정확히 표시되도록 설정

## 🎨 디자인 커스터마이징

### 색상 변경
CSS 파일에서 다음 색상을 수정할 수 있습니다:

```css
/* 사이드바 헤더 그라데이션 */
background: linear-gradient(135deg, #1e7e34 0%, #2874a6 100%);

/* 활성 메뉴 배경 */
background: #e8f5e9;

/* 활성 메뉴 보더 */
border-left: 4px solid #1e7e34;

/* 호버 배경 */
background: #f8f9fa;
```

## 📞 문의사항

사이드바 구현 및 적용에 대한 문의사항이 있으시면 다음으로 연락주세요:

- **회장**: 고문현 (010-4263-7715, kohmh@ssu.ac.kr)
- **홈페이지 관리**: 강종진 (mail@iuci.kr)

## 📝 업데이트 히스토리

- **2024-12-29**: 사이드바 네비게이션 시스템 구축
  - sidebar.css 생성
  - 3개 예제 페이지 생성
  - 모바일 반응형 기능 추가
  - 브레드크럼 네비게이션 구현
