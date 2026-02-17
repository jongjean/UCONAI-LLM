#!/usr/bin/env python3
"""
모든 페이지의 Breadcrumb을 헤더 안으로 이동
"""

import os
import re
from pathlib import Path

def move_breadcrumb_to_header(file_path):
    """HTML 파일에서 Breadcrumb을 헤더 안으로 이동"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Breadcrumb 패턴 찾기
        breadcrumb_pattern = r'<div class="breadcrumb">\s*<a href="[^"]+"><i class="fas fa-home"></i> 홈</a>\s*<i class="fas fa-chevron-right"></i>\s*<a href="#">[^<]+</a>\s*<i class="fas fa-chevron-right"></i>\s*<span class="current">[^<]+</span>\s*</div>'
        
        breadcrumb_match = re.search(breadcrumb_pattern, content, re.DOTALL)
        if not breadcrumb_match:
            print(f"  ⚠ Breadcrumb을 찾을 수 없음: {file_path}")
            return False
        
        breadcrumb_html = breadcrumb_match.group(0)
        
        # </header> 태그가 있는지 확인
        if '</header>' not in content:
            print(f"  ⚠ </header> 태그를 찾을 수 없음: {file_path}")
            return False
        
        # Breadcrumb이 이미 헤더 안에 있는지 확인
        header_end_pos = content.find('</header>')
        breadcrumb_pos = content.find(breadcrumb_html)
        
        if breadcrumb_pos < header_end_pos:
            print(f"  - 이미 헤더 안에 있음: {file_path}")
            return False
        
        # Breadcrumb을 원래 위치에서 제거
        content = content.replace(breadcrumb_html, '', 1)
        
        # </header> 바로 앞에 Breadcrumb 삽입
        # 적절한 형식으로 정리
        breadcrumb_formatted = f'''        <div class="breadcrumb">
            <a href="../../index.html"><i class="fas fa-home"></i> 홈</a>
            <i class="fas fa-chevron-right"></i>
            <a href="#">{extract_category(breadcrumb_html)}</a>
            <i class="fas fa-chevron-right"></i>
            <span class="current">{extract_current(breadcrumb_html)}</span>
        </div>
    </header>'''
        
        content = content.replace('    </header>', breadcrumb_formatted)
        
        # 파일이 실제로 변경되었는지 확인
        if content == original_content:
            print(f"  - 변경사항 없음: {file_path}")
            return False
        
        # 파일 저장
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"  ✓ 성공: {file_path}")
        return True
        
    except Exception as e:
        print(f"  ✗ 오류 발생 {file_path}: {e}")
        return False

def extract_category(breadcrumb_html):
    """Breadcrumb HTML에서 카테고리 추출"""
    match = re.search(r'<a href="#">([^<]+)</a>', breadcrumb_html)
    if match:
        return match.group(1)
    return "카테고리"

def extract_current(breadcrumb_html):
    """Breadcrumb HTML에서 현재 페이지명 추출"""
    match = re.search(r'<span class="current">([^<]+)</span>', breadcrumb_html)
    if match:
        return match.group(1)
    return "페이지"

def find_all_html_files(directory):
    """디렉토리에서 모든 HTML 파일 찾기"""
    html_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html') and file != 'index.html':
                html_files.append(os.path.join(root, file))
    return html_files

def main():
    """모든 HTML 파일 처리"""
    pages_dir = 'pages'
    
    print("=" * 60)
    print("Breadcrumb을 헤더 안으로 이동")
    print("=" * 60)
    
    html_files = find_all_html_files(pages_dir)
    
    success_count = 0
    fail_count = 0
    skip_count = 0
    
    for file_path in sorted(html_files):
        print(f"\n처리 중: {file_path}")
        result = move_breadcrumb_to_header(file_path)
        if result:
            success_count += 1
        elif result is False:
            skip_count += 1
        else:
            fail_count += 1
    
    print("\n" + "=" * 60)
    print(f"완료: {success_count}개 성공, {skip_count}개 스킵, {fail_count}개 실패")
    print("=" * 60)

if __name__ == '__main__':
    main()
