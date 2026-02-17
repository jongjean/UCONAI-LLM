#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Breadcrumb 최적화 스크립트 - 옵션 1: page-header 하단 구조
전체 페이지의 Breadcrumb을 시맨틱 HTML 구조로 변경
"""

import os
import re
from pathlib import Path

def optimize_breadcrumb_structure(html_content, file_path):
    """
    Breadcrumb 구조를 최적화된 시맨틱 HTML로 변환
    
    기존 구조:
    <div class="breadcrumb">
        <a href="..."><i class="fas fa-home"></i> 홈</a>
        <i class="fas fa-chevron-right"></i>
        <a href="#">학회소개</a>
        <i class="fas fa-chevron-right"></i>
        <span class="current">학회장 인사말</span>
    </div>
    
    새로운 구조:
    <nav class="breadcrumb" aria-label="breadcrumb">
        <ol>
            <li><a href="..."><i class="fas fa-home"></i> 홈</a></li>
            <li><a href="#">학회소개</a></li>
            <li class="current" aria-current="page">학회장 인사말</li>
        </ol>
    </nav>
    """
    
    # Breadcrumb이 없는 페이지는 건너뛰기
    if '<div class="breadcrumb">' not in html_content and '<nav class="breadcrumb"' not in html_content:
        return html_content, False
    
    # 이미 최적화된 구조인지 확인
    if '<nav class="breadcrumb" aria-label="breadcrumb">' in html_content:
        print(f"  ✓ 이미 최적화됨: {file_path}")
        return html_content, False
    
    # 패턴 1: <div class="breadcrumb">...</div> 전체 추출
    breadcrumb_pattern = r'<div class="breadcrumb">(.*?)</div>'
    match = re.search(breadcrumb_pattern, html_content, re.DOTALL)
    
    if not match:
        return html_content, False
    
    old_breadcrumb = match.group(0)
    breadcrumb_content = match.group(1).strip()
    
    # Breadcrumb 항목 추출
    items = []
    
    # 홈 링크 추출
    home_match = re.search(r'<a href="([^"]+)"><i class="fas fa-home"></i>\s*홈</a>', breadcrumb_content)
    if home_match:
        home_link = home_match.group(1)
        items.append(f'<li><a href="{home_link}"><i class="fas fa-home"></i> 홈</a></li>')
    
    # 중간 링크 추출 (홈 제외, chevron으로 구분)
    middle_links = re.findall(r'<a href="([^"]*)">(.*?)</a>', breadcrumb_content)
    for link_href, link_text in middle_links:
        # 홈 링크는 이미 추가했으므로 건너뛰기
        if '<i class="fas fa-home"></i>' in link_text:
            continue
        # HTML 태그 제거
        clean_text = re.sub(r'<[^>]+>', '', link_text).strip()
        if clean_text:
            items.append(f'<li><a href="{link_href}">{clean_text}</a></li>')
    
    # 현재 페이지 (span.current 또는 span class="current")
    current_match = re.search(r'<span class="current">(.*?)</span>', breadcrumb_content)
    if current_match:
        current_text = current_match.group(1).strip()
        items.append(f'<li class="current" aria-current="page">{current_text}</li>')
    
    # 새로운 Breadcrumb 구조 생성
    new_breadcrumb = '''<!-- Breadcrumb Navigation -->
            <nav class="breadcrumb" aria-label="breadcrumb">
                <ol>
                    {}
                </ol>
            </nav>'''.format('\n                    '.join(items))
    
    # 기존 Breadcrumb을 새로운 구조로 교체
    html_content = html_content.replace(old_breadcrumb, new_breadcrumb)
    
    return html_content, True

def move_breadcrumb_to_page_header(html_content, file_path):
    """
    header 내부의 breadcrumb을 page-header 섹션으로 이동
    """
    
    # 패턴: </nav> 다음에 오는 breadcrumb을 찾아서 제거
    # header 내부에 breadcrumb이 있는 경우
    header_breadcrumb_pattern = r'</nav>\s*<(?:div|nav) class="breadcrumb"[^>]*>.*?</(?:div|nav)>\s*</header>'
    
    if re.search(header_breadcrumb_pattern, html_content, re.DOTALL):
        # breadcrumb 추출
        breadcrumb_match = re.search(r'<(?:div|nav) class="breadcrumb"[^>]*>(.*?)</(?:div|nav)>', html_content, re.DOTALL)
        if breadcrumb_match:
            breadcrumb_html = breadcrumb_match.group(0)
            
            # header에서 breadcrumb 제거
            html_content = re.sub(r'</nav>\s*<(?:div|nav) class="breadcrumb"[^>]*>.*?</(?:div|nav)>\s*</header>', 
                                  '</nav>\n    </header>', html_content, flags=re.DOTALL)
            
            # page-header 섹션을 찾아서 breadcrumb 추가
            # 패턴 1: <section class="page-header">...<p>...</p></div></section>
            page_header_pattern = r'(<section class="page-header">.*?<p[^>]*>.*?</p>)\s*(</div>\s*</section>)'
            
            if re.search(page_header_pattern, html_content, re.DOTALL):
                def add_breadcrumb(match):
                    before = match.group(1)
                    after = match.group(2)
                    return f'{before}\n            \n            {breadcrumb_html}\n        {after}'
                
                html_content = re.sub(page_header_pattern, add_breadcrumb, html_content, flags=re.DOTALL)
                return html_content, True
    
    return html_content, False

def process_html_file(file_path):
    """HTML 파일 처리"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 1단계: header에서 page-header로 이동
        content, moved = move_breadcrumb_to_page_header(content, file_path)
        
        # 2단계: 구조 최적화
        content, optimized = optimize_breadcrumb_structure(content, file_path)
        
        # 변경사항이 있으면 파일 저장
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            status = []
            if moved:
                status.append("이동")
            if optimized:
                status.append("최적화")
            
            print(f"  ✅ 업데이트: {file_path.name} ({', '.join(status)})")
            return True
        else:
            print(f"  ⏭️  변경없음: {file_path.name}")
            return False
            
    except Exception as e:
        print(f"  ❌ 오류 발생: {file_path.name} - {e}")
        return False

def main():
    """메인 실행 함수"""
    print("=" * 80)
    print("Breadcrumb 최적화 스크립트 - 옵션 1: page-header 하단 구조")
    print("=" * 80)
    print()
    
    # pages 디렉토리 내의 모든 HTML 파일 찾기
    pages_dir = Path('pages')
    html_files = list(pages_dir.rglob('*.html'))
    
    # 제외할 파일
    exclude_files = ['dbpia-embed.html', 'esg-news-embed.html']
    html_files = [f for f in html_files if f.name not in exclude_files]
    
    print(f"📂 총 {len(html_files)}개의 HTML 파일 발견\n")
    
    updated_count = 0
    skipped_count = 0
    
    # 섹션별로 그룹화
    sections = {}
    for file_path in html_files:
        section = file_path.parent.name
        if section not in sections:
            sections[section] = []
        sections[section].append(file_path)
    
    # 섹션별 처리
    for section, files in sorted(sections.items()):
        print(f"\n📁 [{section}] 섹션 처리 중... ({len(files)}개 파일)")
        print("-" * 80)
        
        for file_path in sorted(files):
            if process_html_file(file_path):
                updated_count += 1
            else:
                skipped_count += 1
    
    # 최종 결과
    print("\n" + "=" * 80)
    print("✅ Breadcrumb 최적화 완료!")
    print("=" * 80)
    print(f"✅ 업데이트된 파일: {updated_count}개")
    print(f"⏭️  변경없는 파일: {skipped_count}개")
    print(f"📊 전체 처리 파일: {len(html_files)}개")
    print()
    print("🎨 적용된 개선사항:")
    print("  • <nav> 태그와 aria-label 속성 추가 (웹 접근성)")
    print("  • <ol>/<li> 시맨틱 HTML 구조")
    print("  • aria-current='page' 속성으로 현재 페이지 명시")
    print("  • CSS ::after 구분자 처리 (chevron 아이콘 제거)")
    print("  • page-header 섹션 하단에 배치")
    print()

if __name__ == '__main__':
    main()
