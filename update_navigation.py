#!/usr/bin/env python3
"""
모든 서브 페이지에 완전한 드롭다운 메뉴를 일괄 적용하는 스크립트
"""
import os
import re

# 완전한 드롭다운 네비게이션 메뉴 HTML
FULL_DROPDOWN_MENU = '''                    <ul class="nav-menu">
                        <li class="nav-item has-dropdown">
                            <a href="#" class="nav-link">학회소개</a>
                            <ul class="dropdown-menu">
                                <li><a href="{about_path}greeting.html">학회장 인사말</a></li>
                                <li><a href="{about_path}purpose.html">설립 목적·비전</a></li>
                                <li><a href="{about_path}history.html">연혁</a></li>
                                <li><a href="{about_path}constitution.html">정관·규정</a></li>
                                <li><a href="{about_path}ci.html">CI·BI</a></li>
                                <li><a href="{about_path}location.html">오시는 길</a></li>
                            </ul>
                        </li>
                        <li class="nav-item has-dropdown">
                            <a href="#" class="nav-link">학회조직</a>
                            <ul class="dropdown-menu">
                                <li><a href="{org_path}executives.html">임원진</a></li>
                                <li><a href="{org_path}committees.html">위원회</a></li>
                                <li><a href="{org_path}divisions.html">분과학회·연구회</a></li>
                            </ul>
                        </li>
                        <li class="nav-item has-dropdown">
                            <a href="#" class="nav-link">회원안내</a>
                            <ul class="dropdown-menu">
                                <li><a href="{member_path}types-new.html">회원 구분</a></li>
                                <li><a href="{member_path}process.html">가입 절차</a></li>
                                <li><a href="{member_path}fee.html">회비 안내</a></li>
                                <li><a href="{member_path}benefits.html">회원 혜택</a></li>
                                <li><a href="{member_path}companies.html">회원사 소개</a></li>
                            </ul>
                        </li>
                        <li class="nav-item has-dropdown">
                            <a href="#" class="nav-link">핵심사업</a>
                            <ul class="dropdown-menu">
                                <li><a href="{core_path}forum-new.html">월드ESG포럼</a></li>
                                <li><a href="{core_path}award.html">한국ESG대상</a></li>
                                <li><a href="{core_path}ordinance.html">한국ESG조례대상</a></li>
                                <li><a href="{core_path}seminar.html">월요학술세미나</a></li>
                            </ul>
                        </li>
                        <li class="nav-item has-dropdown">
                            <a href="#" class="nav-link">학술지·논문</a>
                            <ul class="dropdown-menu">
                                <li><a href="{journal_path}about.html">학술지 소개</a></li>
                                <li><a href="{journal_path}submission.html">논문 투고 안내</a></li>
                                <li><a href="{journal_path}editorial.html">편집위원회</a></li>
                                <li><a href="{journal_path}review.html">심사 규정</a></li>
                                <li><a href="{journal_path}archive.html">논문 아카이브</a></li>
                                <li><a href="{journal_path}dbpia-embed.html">DBPIA 논문 검색</a></li>
                            </ul>
                        </li>
                        <li class="nav-item has-dropdown">
                            <a href="#" class="nav-link">ESG정책·연구</a>
                            <ul class="dropdown-menu">
                                <li><a href="{policy_path}research.html">ESG 정책 연구</a></li>
                                <li><a href="{policy_path}standards.html">ESG 지표·표준</a></li>
                                <li><a href="{policy_path}law.html">법·제도 분석</a></li>
                                <li><a href="{policy_path}global.html">국제 ESG 동향</a></li>
                                <li><a href="{policy_path}reports.html">연구보고서</a></li>
                            </ul>
                        </li>
                        <li class="nav-item has-dropdown">
                            <a href="#" class="nav-link">ESG뉴스</a>
                            <ul class="dropdown-menu">
                                <li><a href="{news_path}main.html">ESG 주요 뉴스</a></li>
                                <li><a href="{news_path}policy.html">정책·입법 동향</a></li>
                                <li><a href="{news_path}cases.html">기업 ESG 사례</a></li>
                                <li><a href="{news_path}press.html">학회 보도자료</a></li>
                                <li><a href="{news_path}column.html">기고·칼럼</a></li>
                                <li><a href="{news_path}video.html">영상 콘텐츠</a></li>
                                <li><a href="{news_path}esg-news-embed.html">코리아ESG뉴스</a></li>
                            </ul>
                        </li>
                        <li class="nav-item has-dropdown">
                            <a href="#" class="nav-link">커뮤니티</a>
                            <ul class="dropdown-menu">
                                <li><a href="{community_path}notice.html">공지사항</a></li>
                                <li><a href="{community_path}forum.html">자유게시판</a></li>
                                <li><a href="{community_path}discussion.html">학술·정책 토론</a></li>
                                <li><a href="{community_path}member-news.html">회원 소식</a></li>
                                <li><a href="{community_path}qna.html">Q&A</a></li>
                            </ul>
                        </li>
                        <li class="nav-item has-dropdown">
                            <a href="#" class="nav-link">자료실</a>
                            <ul class="dropdown-menu">
                                <li><a href="{materials_path}academic.html">학술자료</a></li>
                                <li><a href="{materials_path}policy.html">정책자료</a></li>
                                <li><a href="{materials_path}presentation.html">발표자료</a></li>
                                <li><a href="{materials_path}report.html">ESG 리포트</a></li>
                                <li><a href="{materials_path}video.html">영상자료</a></li>
                            </ul>
                        </li>
                        <li class="nav-item has-dropdown">
                            <a href="#" class="nav-link">후원·기부</a>
                            <ul class="dropdown-menu">
                                <li><a href="{support_path}guide.html">후원 안내</a></li>
                                <li><a href="{support_path}corporate.html">기업 후원</a></li>
                                <li><a href="{support_path}personal.html">개인 기부</a></li>
                                <li><a href="{support_path}usage.html">기부금 사용 내역</a></li>
                            </ul>
                        </li>
                        <li class="nav-item has-dropdown">
                            <a href="#" class="nav-link">마이페이지</a>
                            <ul class="dropdown-menu">
                                <li><a href="{mypage_path}profile.html">회원정보 관리</a></li>
                                <li><a href="{mypage_path}payment.html">회비 납부</a></li>
                                <li><a href="{mypage_path}history.html">납부 내역</a></li>
                                <li><a href="{mypage_path}paper.html">논문 투고 현황</a></li>
                                <li><a href="{mypage_path}event.html">행사·세미나 신청 내역</a></li>
                                <li><a href="{mypage_path}certificate.html">회원증·증명서</a></li>
                            </ul>
                        </li>
                    </ul>'''

# 모든 서브 페이지 폴더 목록
FOLDERS = [
    'pages/about',
    'pages/organization',
    'pages/member',
    'pages/core',
    'pages/journal',
    'pages/policy',
    'pages/news',
    'pages/community',
    'pages/materials',
    'pages/support',
    'pages/mypage'
]

def get_relative_paths(current_folder):
    """
    현재 폴더 기준으로 다른 폴더들로의 상대 경로 반환
    """
    folder_map = {
        'pages/about': '',
        'pages/organization': '../organization/',
        'pages/member': '../member/',
        'pages/core': '../core/',
        'pages/journal': '../journal/',
        'pages/policy': '../policy/',
        'pages/news': '../news/',
        'pages/community': '../community/',
        'pages/materials': '../materials/',
        'pages/support': '../support/',
        'pages/mypage': '../mypage/'
    }
    
    # 현재 폴더가 about이면 같은 폴더, 아니면 ../about/
    if current_folder == 'pages/about':
        folder_map['pages/about'] = ''
    else:
        folder_map['pages/about'] = '../about/'
    
    # 현재 폴더가 자기 자신이면 빈 문자열
    folder_map[current_folder] = ''
    
    return {
        'about_path': folder_map['pages/about'],
        'org_path': folder_map['pages/organization'],
        'member_path': folder_map['pages/member'],
        'core_path': folder_map['pages/core'],
        'journal_path': folder_map['pages/journal'],
        'policy_path': folder_map['pages/policy'],
        'news_path': folder_map['pages/news'],
        'community_path': folder_map['pages/community'],
        'materials_path': folder_map['pages/materials'],
        'support_path': folder_map['pages/support'],
        'mypage_path': folder_map['pages/mypage']
    }

def update_navigation(file_path):
    """
    파일의 네비게이션 메뉴를 완전한 드롭다운 메뉴로 업데이트
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 현재 폴더 결정
        current_folder = os.path.dirname(file_path)
        paths = get_relative_paths(current_folder)
        
        # 네비게이션 메뉴 생성
        new_menu = FULL_DROPDOWN_MENU.format(**paths)
        
        # 기존 nav-menu를 찾아서 교체
        # 패턴 1: 드롭다운이 없는 간단한 메뉴
        pattern1 = r'<ul class="nav-menu">\s*<li class="nav-item has-dropdown"><a[^>]*>학회소개</a></li>\s*<li class="nav-item has-dropdown"><a[^>]*>학회조직</a></li>\s*<li class="nav-item has-dropdown"><a[^>]*>회원안내</a></li>\s*<li class="nav-item has-dropdown"><a[^>]*>핵심사업</a></li>\s*<li class="nav-item has-dropdown"><a[^>]*>학술지·논문</a></li>\s*<li class="nav-item has-dropdown"><a[^>]*>ESG정책·연구</a></li>\s*<li class="nav-item has-dropdown"><a[^>]*>ESG뉴스</a></li>\s*<li class="nav-item has-dropdown"><a[^>]*>커뮤니티</a></li>\s*<li class="nav-item has-dropdown"><a[^>]*>자료실</a></li>\s*<li class="nav-item has-dropdown"><a[^>]*>후원·기부</a></li>\s*<li class="nav-item has-dropdown"><a[^>]*>마이페이지</a></li>\s*</ul>'
        
        # 패턴 2: 이미 드롭다운이 있는 경우 (전체 nav-menu 블록 교체)
        pattern2 = r'<ul class="nav-menu">.*?</ul>\s*</div>\s*</div>\s*</nav>'
        
        if re.search(pattern1, content, re.DOTALL):
            content = re.sub(pattern1, new_menu, content, flags=re.DOTALL)
            updated = True
        elif re.search(r'<ul class="nav-menu">.*?<li class="nav-item has-dropdown">.*?</ul>', content, re.DOTALL):
            # 기존 메뉴를 찾아서 교체
            menu_pattern = r'(<ul class="nav-menu">)(.*?)(</ul>)'
            match = re.search(menu_pattern, content, re.DOTALL)
            if match:
                # 새 메뉴에서 <ul>과 </ul> 제거
                new_menu_content = new_menu.replace('<ul class="nav-menu">', '').replace('</ul>', '').strip()
                content = content[:match.start(2)] + '\n' + new_menu_content + '\n                    ' + content[match.end(2):]
                updated = True
            else:
                updated = False
        else:
            updated = False
        
        if updated:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        else:
            print(f"⚠️  메뉴 패턴을 찾을 수 없음: {file_path}")
            return False
            
    except Exception as e:
        print(f"❌ 에러 발생: {file_path} - {str(e)}")
        return False

def main():
    """메인 실행 함수"""
    print("=" * 70)
    print("🚀 드롭다운 네비게이션 메뉴 일괄 업데이트 시작")
    print("=" * 70)
    
    total_files = 0
    updated_files = 0
    skipped_files = []
    
    for folder in FOLDERS:
        if not os.path.exists(folder):
            print(f"\n⚠️  폴더가 존재하지 않음: {folder}")
            continue
        
        html_files = [f for f in os.listdir(folder) if f.endswith('.html')]
        print(f"\n📁 {folder} ({len(html_files)}개 파일)")
        
        for filename in html_files:
            file_path = os.path.join(folder, filename)
            total_files += 1
            
            if update_navigation(file_path):
                print(f"   ✅ {filename}")
                updated_files += 1
            else:
                print(f"   ⏭️  {filename} (스킵)")
                skipped_files.append(file_path)
    
    print("\n" + "=" * 70)
    print("📊 업데이트 완료!")
    print("=" * 70)
    print(f"✅ 업데이트 성공: {updated_files}개")
    print(f"⏭️  스킵된 파일: {len(skipped_files)}개")
    print(f"📁 총 파일: {total_files}개")
    
    if skipped_files:
        print("\n⚠️  스킵된 파일 목록:")
        for f in skipped_files:
            print(f"   - {f}")

if __name__ == '__main__':
    main()
