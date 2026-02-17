#!/usr/bin/env python3
"""
Breadcrumb 위치 통일 스크립트
page-header 안에 있는 breadcrumb을 page-header 밖으로 이동
"""

import re
import os
from pathlib import Path

def process_html_file(file_path):
    """HTML 파일에서 breadcrumb을 page-header 밖으로 이동"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # page-header 섹션 안에 breadcrumb이 있는지 확인
    # Pattern 1: <nav class="breadcrumb">...</nav> inside page-header
    pattern1 = re.compile(
        r'(<section class="page-header">.*?<div class="container">.*?<h1>.*?</h1>.*?<p>.*?</p>)'
        r'(\s*<nav class="breadcrumb">.*?</nav>)'
        r'(\s*</div>\s*</section>)',
        re.DOTALL
    )
    
    # Pattern 2: <div class="breadcrumb">...</div> inside page-header
    pattern2 = re.compile(
        r'(<section class="page-header">.*?<div class="container">.*?<h1>.*?</h1>.*?<p>.*?</p>)'
        r'(\s*<div class="breadcrumb">.*?</div>)'
        r'(\s*</div>\s*</section>)',
        re.DOTALL
    )
    
    # Pattern 3: <div class="page-header"> 형식도 확인 (section이 아닌 div)
    pattern3 = re.compile(
        r'(<div class="page-header">.*?<div class="container">.*?<h1>.*?</h1>.*?<p>.*?</p>)'
        r'(\s*<nav class="breadcrumb">.*?</nav>)'
        r'(\s*</div>\s*</div>)',
        re.DOTALL
    )
    
    pattern4 = re.compile(
        r'(<div class="page-header">.*?<div class="container">.*?<h1>.*?</h1>.*?<p>.*?</p>)'
        r'(\s*<div class="breadcrumb"[^>]*>.*?</div>)'
        r'(\s*</div>\s*</div>)',
        re.DOTALL
    )
    
    original_content = content
    changed = False
    
    # Pattern 1 처리
    if pattern1.search(content):
        def replace1(match):
            return match.group(1) + match.group(3) + '\n\n    <!-- Breadcrumb -->\n    <div class="container">' + match.group(2).strip() + '\n    </div>'
        content = pattern1.sub(replace1, content)
        changed = True
        print(f"  ✓ Pattern 1 (<nav> in <section>) 처리됨")
    
    # Pattern 2 처리
    if pattern2.search(content):
        def replace2(match):
            return match.group(1) + match.group(3) + '\n\n    <!-- Breadcrumb -->\n    <div class="container">\n        ' + match.group(2).strip() + '\n    </div>'
        content = pattern2.sub(replace2, content)
        changed = True
        print(f"  ✓ Pattern 2 (<div> in <section>) 처리됨")
    
    # Pattern 3 처리
    if pattern3.search(content):
        def replace3(match):
            return match.group(1) + match.group(3) + '\n\n    <!-- Breadcrumb -->\n    <div class="container">' + match.group(2).strip() + '\n    </div>'
        content = pattern3.sub(replace3, content)
        changed = True
        print(f"  ✓ Pattern 3 (<nav> in <div>) 처리됨")
    
    # Pattern 4 처리
    if pattern4.search(content):
        def replace4(match):
            return match.group(1) + match.group(3) + '\n\n    <!-- Breadcrumb -->\n    <div class="container">\n        ' + match.group(2).strip() + '\n    </div>'
        content = pattern4.sub(replace4, content)
        changed = True
        print(f"  ✓ Pattern 4 (<div> with attributes in <div>) 처리됨")
    
    # 변경사항이 있으면 파일 저장
    if changed and content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    
    return False

def main():
    """메인 함수"""
    pages_dir = Path('pages')
    
    # 모든 HTML 파일 찾기
    html_files = list(pages_dir.rglob('*.html'))
    
    print(f"총 {len(html_files)}개의 HTML 파일을 검사합니다...\n")
    
    processed_count = 0
    
    for html_file in html_files:
        # page-header가 있는 파일만 처리
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
            if 'page-header' not in content or 'breadcrumb' not in content:
                continue
        
        print(f"처리 중: {html_file}")
        if process_html_file(html_file):
            processed_count += 1
            print(f"  ✅ 변경 완료\n")
        else:
            print(f"  ⏭️  변경 불필요 (breadcrumb이 이미 밖에 있음)\n")
    
    print(f"\n{'='*60}")
    print(f"처리 완료: {processed_count}개 파일 수정됨")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
