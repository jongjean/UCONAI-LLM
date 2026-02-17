#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
전체 사이트 메뉴에 '웹 둘러보기' 일괄 추가 스크립트
"""

import os
import re

def update_html_file(filepath):
    """HTML 파일의 학회소개 메뉴에 웹 둘러보기 추가"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 이미 웹 둘러보기가 있으면 스킵
        if '웹 둘러보기' in content:
            return 'skip'
        
        # 파일 경로에 따라 sitemap.html 상대 경로 결정
        if filepath == 'index.html':
            sitemap_path = 'pages/sitemap.html'
        elif filepath.startswith('pages/'):
            depth = filepath.count('/') - 1
            sitemap_path = '../' * depth + 'sitemap.html'
        else:
            return 'skip'
        
        # 패턴들
        patterns = [
            # 패턴 1: pages/about, pages/organization 등 (greeting.html 링크)
            (
                r'(<li class="nav-item has-dropdown">\s*<a[^>]*>\s*학회소개\s*</a>\s*<ul class="dropdown-menu">\s*)(<li><a href="[^"]*greeting[^"]*\.html">)',
                f'\\1<li><a href="{sitemap_path}"><i class="fas fa-sitemap"></i> 웹 둘러보기</a></li>\\n                                \\2'
            ),
            # 패턴 2: index.html (greeting-new.html 링크)
            (
                r'(<li class="nav-item has-dropdown">\s*<a[^>]*>\s*<i[^>]*></i>\s*학회소개\s*</a>\s*<ul class="dropdown-menu">\s*)(<li><a href="pages/about/greeting-new\.html">)',
                f'\\1<li><a href="{sitemap_path}"><i class="fas fa-sitemap"></i> 웹 둘러보기</a></li>\\n                                \\2'
            ),
        ]
        
        updated = False
        for pattern, replacement in patterns:
            if re.search(pattern, content):
                content = re.sub(pattern, replacement, content)
                updated = True
                break
        
        if updated:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return 'updated'
        else:
            return 'no_match'
            
    except Exception as e:
        return f'error: {str(e)}'

def main():
    """모든 HTML 파일 처리"""
    print("="*70)
    print("전체 사이트 메뉴에 '웹 둘러보기' 추가 스크립트")
    print("="*70)
    print()
    
    stats = {'updated': 0, 'skip': 0, 'no_match': 0, 'error': 0}
    
    # index.html 처리
    if os.path.exists('index.html'):
        result = update_html_file('index.html')
        stats[result if result in stats else 'error'] += 1
        status = "✅" if result == 'updated' else "⏭️" if result == 'skip' else "❌"
        print(f"{status} index.html: {result}")
    
    # pages 디렉토리의 모든 HTML 파일 처리
    if os.path.exists('pages'):
        for root, dirs, files in os.walk('pages'):
            for filename in sorted(files):
                if filename.endswith('.html'):
                    filepath = os.path.join(root, filename)
                    result = update_html_file(filepath)
                    
                    if result in stats:
                        stats[result] += 1
                    else:
                        stats['error'] += 1
                    
                    status = "✅" if result == 'updated' else "⏭️" if result == 'skip' else "❌"
                    print(f"{status} {filepath}: {result}")
    
    # 결과 요약
    print()
    print("="*70)
    print("처리 결과 요약")
    print("="*70)
    print(f"✅ 업데이트됨: {stats['updated']}개")
    print(f"⏭️  건너뜀: {stats['skip']}개")
    print(f"❌ 매칭 실패: {stats['no_match']}개")
    print(f"🔥 오류: {stats['error']}개")
    print(f"📊 총: {sum(stats.values())}개")
    print()
    print("작업 완료!")

if __name__ == '__main__':
    main()
