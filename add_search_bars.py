#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ESG뉴스, 자료실, 커뮤니티 페이지에 통일된 검색창 추가 스크립트
작성일: 2025-12-30
"""

import os
import re

# 통일된 검색창 HTML 컴포넌트
SEARCH_BAR_HTML = '''        <!-- 검색 기능 -->
        <div class="search-section">
            <div class="search-box">
                <div class="search-form">
                    <select class="search-select" id="searchType">
                        <option value="all">전체</option>
                        <option value="title">제목</option>
                        <option value="content">내용</option>
                        <option value="author">작성자</option>
                    </select>
                    <input type="text" class="search-input" id="searchInput" placeholder="검색어를 입력하세요...">
                    <button class="search-btn" onclick="performSearch()">
                        <i class="fas fa-search"></i> 검색
                    </button>
                </div>
            </div>
        </div>
'''

# 통일된 검색창 CSS
SEARCH_BAR_CSS = '''        /* 검색 섹션 스타일 */
        .search-section {
            margin-bottom: 30px;
        }
        .search-box {
            background: #fff;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 3px 15px rgba(0,0,0,0.08);
        }
        .search-form {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            align-items: center;
        }
        .search-select {
            padding: 12px 20px;
            border: 2px solid var(--bg-light);
            border-radius: 8px;
            font-size: 1rem;
            min-width: 120px;
            background: white;
            cursor: pointer;
            transition: border-color 0.3s;
        }
        .search-select:focus {
            outline: none;
            border-color: var(--primary-green);
        }
        .search-input {
            flex: 1;
            min-width: 250px;
            padding: 12px 20px;
            border: 2px solid var(--bg-light);
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }
        .search-input:focus {
            outline: none;
            border-color: var(--primary-green);
        }
        .search-btn {
            padding: 12px 30px;
            background: var(--primary-green);
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .search-btn:hover {
            background: #155724;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(30, 126, 52, 0.3);
        }
        .search-btn i {
            font-size: 0.9rem;
        }
        @media (max-width: 768px) {
            .search-form {
                flex-direction: column;
            }
            .search-select, .search-input, .search-btn {
                width: 100%;
            }
        }
'''

# 검색 JavaScript 함수
SEARCH_JS = '''        // 검색 기능
        function performSearch() {
            const searchType = document.getElementById('searchType').value;
            const searchInput = document.getElementById('searchInput').value.trim();
            
            if (!searchInput) {
                alert('검색어를 입력해주세요.');
                return;
            }
            
            console.log(`검색 유형: ${searchType}, 검색어: ${searchInput}`);
            
            // 실제 검색 로직 구현 예정
            alert(`"${searchInput}" 검색 결과를 표시합니다.\\n(검색 기능은 추후 구현 예정)`);
        }
        
        // Enter 키로 검색
        document.addEventListener('DOMContentLoaded', function() {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        performSearch();
                    }
                });
            }
        });
'''

def add_search_bar_to_file(filepath, section_name):
    """파일에 검색창 추가"""
    
    if not os.path.exists(filepath):
        print(f"❌ 파일 없음: {filepath}")
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 이미 search-section이 있는지 확인
    if 'search-section' in content or 'search-box' in content:
        print(f"⏭️  이미 검색창 존재: {filepath}")
        return False
    
    # CSS 추가 위치 찾기 (</style> 태그 직전)
    style_end = content.rfind('</style>')
    if style_end == -1:
        print(f"❌ <style> 태그 없음: {filepath}")
        return False
    
    # CSS 추가
    content = content[:style_end] + SEARCH_BAR_CSS + '\n' + content[style_end:]
    
    # HTML 추가 위치 찾기 (content-wrapper 안, 첫 번째 섹션 전)
    # 여러 패턴 시도
    patterns = [
        (r'(<div class="content-wrapper">.*?<main>.*?)\n([ \t]*<!-- )', r'\1\n\n' + SEARCH_BAR_HTML + r'\n\2'),
        (r'(<div class="content-wrapper">.*?<main>.*?)\n([ \t]*<div class="[^"]*(?:list|grid|table|section)[^"]*")', r'\1\n\n' + SEARCH_BAR_HTML + r'\n\2'),
        (r'(<div class="content-wrapper">.*?<main>.*?)\n([ \t]*<section)', r'\1\n\n' + SEARCH_BAR_HTML + r'\n\2'),
    ]
    
    html_added = False
    for pattern, replacement in patterns:
        if re.search(pattern, content, re.DOTALL):
            content = re.sub(pattern, replacement, content, count=1, flags=re.DOTALL)
            html_added = True
            break
    
    if not html_added:
        print(f"⚠️  HTML 삽입 위치를 찾지 못함: {filepath}")
        return False
    
    # JavaScript 추가 위치 찾기 (</script> 태그 직전 또는 </body> 태그 직전)
    script_end = content.rfind('</script>')
    if script_end != -1:
        # 기존 script 태그가 있으면 그 안에 추가
        content = content[:script_end] + SEARCH_JS + '\n' + content[script_end:]
    else:
        # script 태그가 없으면 body 닫기 전에 새로 추가
        body_end = content.rfind('</body>')
        if body_end != -1:
            script_tag = f'\n    <script>\n{SEARCH_JS}\n    </script>\n'
            content = content[:body_end] + script_tag + content[body_end:]
    
    # 파일 저장
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ 검색창 추가 완료: {filepath}")
    return True


def main():
    """메인 실행 함수"""
    
    print("=" * 70)
    print("ESG 웹사이트 검색창 일괄 추가 스크립트")
    print("=" * 70)
    print()
    
    # 대상 페이지 정의
    pages = {
        'ESG뉴스': [
            'pages/news/main.html',
            'pages/news/domestic.html',
            'pages/news/policy.html',
            'pages/news/cases.html',
            'pages/news/press.html',
            'pages/news/column.html',
            'pages/news/video.html',
            # 'pages/news/esg-news-embed.html'  # 임베드 페이지는 제외
        ],
        '자료실': [
            'pages/materials/academic.html',
            'pages/materials/policy.html',
            'pages/materials/report.html',
            'pages/materials/presentation.html',
            'pages/materials/video.html',
        ],
        '커뮤니티': [
            'pages/community/notice.html',
            'pages/community/free-board.html',
            'pages/community/forum.html',
            'pages/community/member-news.html',
            'pages/community/qna.html',
            'pages/community/discussion.html',
        ]
    }
    
    results = {'success': 0, 'skipped': 0, 'failed': 0}
    
    for section, files in pages.items():
        print(f"\n📁 {section} 섹션 처리 중...")
        print("-" * 70)
        
        for filepath in files:
            result = add_search_bar_to_file(filepath, section)
            if result:
                results['success'] += 1
            elif result is False:
                results['skipped'] += 1
            else:
                results['failed'] += 1
    
    print()
    print("=" * 70)
    print("작업 완료 요약")
    print("=" * 70)
    print(f"✅ 성공: {results['success']}개")
    print(f"⏭️  건너뜀: {results['skipped']}개")
    print(f"❌ 실패: {results['failed']}개")
    print()
    print("총 처리 파일:", sum(results.values()))
    print("=" * 70)


if __name__ == '__main__':
    main()
