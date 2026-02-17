#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
학회소개 드롭다운 메뉴에 '웹 둘러보기' 추가 스크립트
- 모든 HTML 파일의 학회소개 메뉴에 sitemap.html 링크 추가
"""

import os
import re
from pathlib import Path

def get_relative_path(file_path, target='sitemap.html'):
    """파일 위치에 따른 상대 경로 계산"""
    depth = len(Path(file_path).relative_to('.').parts) - 1
    if depth == 0:  # 루트 레벨
        return f'pages/{target}'
    else:  # pages 하위
        return '../' * (depth - 1) + target

def add_web_tour_to_file(file_path):
    """단일 파일에 웹 둘러보기 메뉴 추가"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 이미 웹 둘러보기가 있는지 확인
        if '웹 둘러보기' in content or 'sitemap.html' in content:
            return False, "이미 추가됨"
        
        # 학회소개 메뉴 찾기 (다양한 패턴)
        patterns = [
            # 패턴 1: 아이콘이 있는 경우
            (
                r'(<li class="nav-item has-dropdown">\s*<a[^>]*class="nav-link"[^>]*>(?:<i[^>]*></i>\s*)?학회소개</a>\s*<ul class="dropdown-menu">\s*)(<li><a href="[^"]*(?:greeting|about)',
                r'\1<li><a href="{sitemap}"><i class="fas fa-sitemap"></i> 웹 둘러보기</a></li>\n                                \2'
            ),
            # 패턴 2: 아이콘이 없는 경우
            (
                r'(<li class="nav-item has-dropdown">\s*<a[^>]*>학회소개</a>\s*<ul class="dropdown-menu">\s*)(<li><a href="[^"]*(?:greeting|about)',
                r'\1<li><a href="{sitemap}"><i class="fas fa-sitemap"></i> 웹 둘러보기</a></li>\n                                \2'
            ),
        ]
        
        # 상대 경로 계산
        sitemap_path = get_relative_path(file_path)
        
        updated = False
        for pattern, replacement in patterns:
            replacement_with_path = replacement.format(sitemap=sitemap_path)
            new_content, count = re.subn(pattern, replacement_with_path, content)
            if count > 0:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                updated = True
                break
        
        if updated:
            return True, "추가 완료"
        else:
            return False, "패턴 매칭 실패"
            
    except Exception as e:
        return False, f"오류: {str(e)}"

def process_all_html_files():
    """모든 HTML 파일 처리"""
    results = {
        'success': [],
        'skipped': [],
        'failed': []
    }
    
    # HTML 파일 찾기
    html_files = []
    
    # 루트 레벨
    if os.path.exists('index.html'):
        html_files.append('index.html')
    
    # pages 디렉토리
    if os.path.exists('pages'):
        for root, dirs, files in os.walk('pages'):
            for file in files:
                if file.endswith('.html'):
                    html_files.append(os.path.join(root, file))
    
    print(f"총 {len(html_files)}개 HTML 파일 발견\n")
    
    # 각 파일 처리
    for file_path in html_files:
        success, message = add_web_tour_to_file(file_path)
        
        if success:
            results['success'].append(file_path)
            print(f"✅ {file_path}: {message}")
        elif "이미 추가됨" in message:
            results['skipped'].append(file_path)
            print(f"⏭️  {file_path}: {message}")
        else:
            results['failed'].append(file_path)
            print(f"❌ {file_path}: {message}")
    
    # 결과 요약
    print("\n" + "="*60)
    print("처리 결과 요약")
    print("="*60)
    print(f"✅ 성공: {len(results['success'])}개")
    print(f"⏭️  건너뜀: {len(results['skipped'])}개")
    print(f"❌ 실패: {len(results['failed'])}개")
    print(f"📊 총: {len(html_files)}개")
    
    if results['failed']:
        print("\n실패한 파일 목록:")
        for f in results['failed']:
            print(f"  - {f}")
    
    return results

if __name__ == '__main__':
    print("="*60)
    print("학회소개 메뉴에 '웹 둘러보기' 추가 스크립트")
    print("="*60)
    print()
    
    results = process_all_html_files()
    
    print("\n작업 완료!")
