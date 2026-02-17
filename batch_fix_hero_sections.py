#!/usr/bin/env python3
"""
Hero 섹션을 page-header 안으로 통합하거나 깔끔하게 변경하는 스크립트
"""
import re

# 수정할 파일과 정보
pages = [
    # consulting.html
    {
        'file': 'pages/core/consulting.html',
        'hero_class': 'consulting-hero',
        'css_pattern': r'\.consulting-hero\s*\{[^}]+\}\s*\.consulting-hero\s+h2\s*\{[^}]+\}\s*\.consulting-hero\s+p\s*\{[^}]+\}',
        'html_pattern': r'(<div class="content-wrapper">)\s*<div class="consulting-hero">.*?</div>',
        'subtitle': 'ESG 전문 컨설팅 - 기업의 규모와 업종에 맞춘 체계적인 ESG 경영 시스템 구축'
    },
    # education.html
    {
        'file': 'pages/core/education.html',
        'hero_class': 'education-hero',
        'css_pattern': r'\.education-hero\s*\{[^}]+\}\s*\.education-hero\s+h2\s*\{[^}]+\}\s*\.education-hero\s+p\s*\{[^}]+\}',
        'html_pattern': r'(<div class="content-wrapper">)\s*<div class="education-hero">.*?</div>',
        'subtitle': 'ESG 교육 - 체계적인 ESG 교육 프로그램으로 전문성을 키워보세요'
    },
    # editorial-board.html
    {
        'file': 'pages/journal/editorial-board.html',
        'hero_class': 'editorial-hero',
        'css_pattern': r'\.editorial-hero\s*\{[^}]+\}\s*\.editorial-hero\s+h2\s*\{[^}]+\}\s*\.editorial-hero\s+p\s*\{[^}]+\}',
        'html_pattern': r'(<div class="content-wrapper">)\s*<div class="editorial-hero">.*?</div>',
        'subtitle': '편집위원회 - 학술지의 품질을 책임지는 전문가 그룹입니다'
    },
    # search.html
    {
        'file': 'pages/journal/search.html',
        'hero_class': 'search-hero',
        'css_pattern': r'\.search-hero\s*\{[^}]+\}\s*\.search-hero\s+h2\s*\{[^}]+\}\s*\.search-hero\s+p\s*\{[^}]+\}',
        'html_pattern': r'(<div class="content-wrapper">)\s*<div class="search-hero">.*?</div>',
        'subtitle': '논문 아카이브 - 학회 학술지에 게재된 논문을 검색하고 열람하세요'
    },
    # main-services.html
    {
        'file': 'pages/core/main-services.html',
        'hero_class': 'services-hero',
        'css_pattern': r'\.services-hero\s*\{[^}]+\}\s*\.services-hero\s+h[12]\s*\{[^}]+\}\s*\.services-hero\s+p\s*\{[^}]+\}',
        'html_pattern': r'(<div class="content-wrapper">)\s*<div class="services-hero">.*?</div>',
        'subtitle': '핵심 사업 - 한국ESG학회의 핵심 사업 영역을 소개합니다'
    }
]

def fix_page(page_info):
    """페이지 수정"""
    try:
        with open(page_info['file'], 'r', encoding='utf-8') as f:
            content = f.read()
        
        # CSS에서 hero 클래스 제거
        content = re.sub(
            page_info['css_pattern'],
            '',
            content,
            flags=re.DOTALL
        )
        
        # HTML에서 hero div 제거
        content = re.sub(
            page_info['html_pattern'],
            r'\1',
            content,
            flags=re.DOTALL
        )
        
        # 파일 저장
        with open(page_info['file'], 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ {page_info['file']} 수정 완료")
        return True
        
    except Exception as e:
        print(f"❌ {page_info['file']} 수정 실패: {str(e)}")
        return False

def main():
    print("🔧 Hero 섹션 제거 작업 시작...\n")
    
    success_count = 0
    fail_count = 0
    
    for page_info in pages:
        result = fix_page(page_info)
        
        if result:
            success_count += 1
        else:
            fail_count += 1
    
    print(f"\n✅ 완료: {success_count}개")
    print(f"❌ 실패: {fail_count}개")
    print(f"📊 총 {len(pages)}개 페이지 처리")

if __name__ == '__main__':
    main()
