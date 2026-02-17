#!/usr/bin/env python3
"""
Hero 섹션을 page-header 안으로 통합하는 스크립트
"""
import re

pages_to_fix = [
    {
        'file': 'pages/community/forum.html',
        'hero_class': 'forum-hero',
        'title': '토론방',
        'icon': 'fas fa-comments',
        'subtitle_icon': 'fas fa-users',
        'subtitle_text': 'ESG 전문가들과 함께 다양한 주제로 토론하고 의견을 나눌 수 있습니다'
    },
    {
        'file': 'pages/community/free-board.html',
        'hero_class': 'forum-hero',
        'title': '자유게시판',
        'icon': 'fas fa-comments',
        'subtitle_icon': 'fas fa-pen',
        'subtitle_text': '회원님들의 자유로운 소통 공간입니다'
    },
    {
        'file': 'pages/community/member-news.html',
        'hero_class': 'news-hero',
        'title': '회원소식',
        'icon': 'fas fa-newspaper',
        'subtitle_icon': 'fas fa-star',
        'subtitle_text': '회원님들의 소식과 성과를 함께 나누는 공간입니다'
    },
    {
        'file': 'pages/community/qna.html',
        'hero_class': 'faq-hero',
        'title': 'FAQ',
        'icon': 'fas fa-question-circle',
        'subtitle_icon': 'fas fa-lightbulb',
        'subtitle_text': '자주 묻는 질문과 답변을 확인하세요'
    },
    {
        'file': 'pages/core/certification.html',
        'hero_class': 'cert-hero',
        'title': 'ESG 인증',
        'icon': 'fas fa-certificate',
        'subtitle_icon': 'fas fa-award',
        'subtitle_text': '기업의 ESG 경영 수준을 공신력 있게 평가하고 인증합니다'
    },
    {
        'file': 'pages/core/consulting.html',
        'hero_class': 'consulting-hero',
        'title': 'ESG 컨설팅',
        'icon': 'fas fa-handshake',
        'subtitle_icon': 'fas fa-chart-line',
        'subtitle_text': '전문가와 함께 지속가능한 ESG 경영 전략을 수립하세요'
    },
    {
        'file': 'pages/core/education.html',
        'hero_class': 'education-hero',
        'title': 'ESG 교육',
        'icon': 'fas fa-graduation-cap',
        'subtitle_icon': 'fas fa-book-open',
        'subtitle_text': '체계적인 ESG 교육 프로그램으로 전문성을 키워보세요'
    },
    {
        'file': 'pages/journal/editorial-board.html',
        'hero_class': 'editorial-hero',
        'title': '편집위원회',
        'icon': 'fas fa-users-cog',
        'subtitle_icon': 'fas fa-user-tie',
        'subtitle_text': '학술지의 품질을 책임지는 전문가 그룹입니다'
    },
    {
        'file': 'pages/journal/search.html',
        'hero_class': 'search-hero',
        'title': '논문 아카이브',
        'icon': 'fas fa-search',
        'subtitle_icon': 'fas fa-book',
        'subtitle_text': '학회 학술지에 게재된 논문을 검색하고 열람하세요'
    },
    {
        'file': 'pages/core/main-services.html',
        'hero_class': 'services-hero',
        'title': '핵심 사업',
        'icon': 'fas fa-briefcase',
        'subtitle_icon': 'fas fa-star',
        'subtitle_text': '한국ESG학회의 핵심 사업 영역을 소개합니다'
    }
]

def fix_hero_section(file_path, hero_class, title, icon, subtitle_icon, subtitle_text):
    """Hero 섹션을 page-header로 통합"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # CSS 스타일에서 hero 클래스 제거하고 subtitle 스타일 추가
        hero_css_pattern = rf'\.{hero_class}\s*\{{[^}}]+\}}\s*\.{hero_class}\s+h[12]\s*\{{[^}}]+\}}\s*\.{hero_class}\s+p\s*\{{[^}}]+\}}'
        
        new_css = '''        .page-header .subtitle {
            margin-top: 25px;
            padding-top: 25px;
            border-top: 1px solid rgba(255, 255, 255, 0.3);
            font-size: 1.2rem;
            line-height: 1.8;
            opacity: 0.95;
        }
        .page-header .subtitle i {
            margin-right: 8px;
            font-size: 1.1rem;
        }'''
        
        content = re.sub(hero_css_pattern, new_css, content, flags=re.DOTALL)
        
        # HTML에서 hero div 제거하고 page-header에 subtitle 추가
        # page-header 찾기
        page_header_pattern = r'(<div class="page-header">.*?</div>)\s*(<div class="content-wrapper">)\s*<div class="' + hero_class + r'">.*?</div>'
        
        def replace_header(match):
            header_content = match.group(1)
            content_wrapper = match.group(2)
            
            # page-header 안에 subtitle 추가
            new_header = header_content.replace('</div>', 
                f'            <p class="subtitle"><i class="{subtitle_icon}"></i>{subtitle_text}</p>\n        </div>')
            
            return new_header + '\n\n        ' + content_wrapper
        
        content = re.sub(page_header_pattern, replace_header, content, flags=re.DOTALL)
        
        # 파일 저장
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ {file_path} 수정 완료")
        return True
        
    except Exception as e:
        print(f"❌ {file_path} 수정 실패: {str(e)}")
        return False

def main():
    print("🔧 Hero 섹션 통합 작업 시작...\n")
    
    success_count = 0
    fail_count = 0
    
    for page_info in pages_to_fix:
        result = fix_hero_section(
            page_info['file'],
            page_info['hero_class'],
            page_info['title'],
            page_info['icon'],
            page_info['subtitle_icon'],
            page_info['subtitle_text']
        )
        
        if result:
            success_count += 1
        else:
            fail_count += 1
    
    print(f"\n✅ 완료: {success_count}개")
    print(f"❌ 실패: {fail_count}개")
    print(f"📊 총 {len(pages_to_fix)}개 페이지 처리")

if __name__ == '__main__':
    main()
