#!/usr/bin/env python3
"""
후원·기부 페이지들의 헤더와 breadcrumb을 일관된 디자인으로 수정하는 스크립트
"""

import re

# 전체 네비게이션 메뉴 (드롭다운 포함)
FULL_NAVIGATION = '''                    <ul class="nav-menu">
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
                        <li class="nav-item has-dropdown">
                            <a href="#" class="nav-link">학회조직</a>
                            <ul class="dropdown-menu">
                                <li><a href="../organization/executives.html">임원진</a></li>
                                <li><a href="../organization/committees.html">위원회</a></li>
                                <li><a href="../organization/divisions.html">분과학회·연구회</a></li>
                            </ul>
                        </li>
                        <li class="nav-item has-dropdown">
                            <a href="#" class="nav-link">회원안내</a>
                            <ul class="dropdown-menu">
                                <li><a href="../member/types-new.html">회원 구분</a></li>
                                <li><a href="../member/process.html">가입 절차</a></li>
                                <li><a href="../member/fee.html">회비 안내</a></li>
                                <li><a href="../member/benefits.html">회원 혜택</a></li>
                                <li><a href="../member/companies.html">회원사 소개</a></li>
                            </ul>
                        </li>
                        <li class="nav-item has-dropdown">
                            <a href="#" class="nav-link">핵심사업</a>
                            <ul class="dropdown-menu">
                                <li><a href="../core/forum-new.html">월드ESG포럼</a></li>
                                <li><a href="../core/award.html">한국ESG대상</a></li>
                                <li><a href="../core/ordinance.html">한국ESG조례대상</a></li>
                                <li><a href="../core/seminar.html">월요학술세미나</a></li>
                            </ul>
                        </li>
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
                        <li class="nav-item has-dropdown">
                            <a href="#" class="nav-link">후원·기부</a>
                            <ul class="dropdown-menu">
                                <li><a href="guide.html">후원 안내</a></li>
                                <li><a href="corporate.html">기업 후원</a></li>
                                <li><a href="personal.html">개인 기부</a></li>
                                <li><a href="usage.html">기부금 사용 내역</a></li>
                            </ul>
                        </li>
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
                    </ul>'''

# 간단한 네비게이션 메뉴 패턴
SIMPLE_NAV_PATTERN = r'<ul class="nav-menu">.*?</ul>'

# 각 페이지별 설정
PAGES = {
    'guide.html': {
        'title': '후원 안내',
        'description': '한국ESG학회는 여러분의 소중한 후원으로 지속가능한 미래를 위한 ESG 연구와 실천 활동을 이어갑니다'
    },
    'corporate.html': {
        'title': '기업 후원',
        'description': '기업의 ESG 가치를 실천하고 사회적 책임을 다하는 파트너십을 함께 만들어갑니다'
    },
    'usage.html': {
        'title': '기부금 사용 내역',
        'description': '여러분의 소중한 후원이 어떻게 사용되고 있는지 투명하게 공개합니다'
    }
}

def fix_navigation(content):
    """간단한 네비게이션을 전체 드롭다운 메뉴로 교체"""
    content = re.sub(
        SIMPLE_NAV_PATTERN,
        FULL_NAVIGATION,
        content,
        flags=re.DOTALL
    )
    return content

def create_page_header(title, description):
    """page-header 섹션 생성"""
    return f'''    <!-- Page Header with Breadcrumb -->
    <section class="page-header">
        <div class="container">
            <h1>{title}</h1>
            <p>{description}</p>
            <div class="breadcrumb">
                <a href="../../index.html">홈</a><span>/</span>
                <a href="#">후원·기부</a><span>/</span>
                <span>{title}</span>
            </div>
        </div>
    </section>

    <!-- Main Content -->
    <main class="main-content">
        <div class="container">'''

def process_file(filename):
    """파일 처리"""
    filepath = f'pages/support/{filename}'
    print(f'\n처리 중: {filename}')
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. 네비게이션 메뉴 교체
        print('  - 네비게이션 메뉴 업데이트...')
        content = fix_navigation(content)
        
        # 2. hero-section 또는 support-hero를 제거하고 page-header로 교체
        print('  - Hero 섹션을 page-header로 교체...')
        
        page_config = PAGES[filename]
        new_header = create_page_header(page_config['title'], page_config['description'])
        
        # hero-section 또는 support-hero 패턴 찾기
        hero_pattern = r'<!-- Main Content -->.*?<main class="main-content">.*?<div class="container">.*?<!-- Hero Section -->.*?</div>'
        
        if filename == 'guide.html':
            # guide.html은 support-hero 사용
            hero_pattern = r'<!-- Main Content -->.*?<main class="main-content">.*?<div class="container">.*?<!-- Hero Section -->.*?<div class="support-hero">.*?</div>.*?<!-- Stats Bar -->'
            replacement = new_header + '\n            <!-- Stats Bar -->'
        else:
            # corporate.html, usage.html은 hero-section 사용
            hero_pattern = r'<!-- Main Content -->.*?<main class="main-content">.*?<div class="container">.*?<div class="hero-section">.*?</div>'
            replacement = new_header
        
        content = re.sub(hero_pattern, replacement, content, flags=re.DOTALL)
        
        # 3. CSS에서 hero 관련 스타일 제거
        print('  - CSS에서 hero 스타일 제거...')
        if filename == 'guide.html':
            # support-hero 스타일 제거
            content = re.sub(
                r'\.support-hero \{.*?\}.*?\.support-hero h1 \{.*?\}.*?\.support-hero p \{.*?\}',
                '',
                content,
                flags=re.DOTALL
            )
            # 미디어 쿼리에서도 제거
            content = re.sub(
                r'\.support-hero h1 \{.*?\}.*?\.support-hero \{.*?\}',
                '',
                content,
                flags=re.DOTALL
            )
        else:
            # hero-section 스타일 제거
            content = re.sub(
                r'\.hero-section \{.*?\}.*?(\.hero-section h1 \{.*?\})?.*?(\.hero-section p \{.*?\})?.*?(\.hero-section \.subtitle \{.*?\})?',
                '',
                content,
                flags=re.DOTALL
            )
        
        # 파일 저장
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f'  ✓ {filename} 수정 완료')
        
    except Exception as e:
        print(f'  ✗ 오류 발생: {e}')

if __name__ == '__main__':
    print('=' * 60)
    print('후원·기부 페이지 일괄 수정 스크립트')
    print('=' * 60)
    
    for filename in PAGES.keys():
        process_file(filename)
    
    print('\n' + '=' * 60)
    print('모든 파일 처리 완료!')
    print('=' * 60)
