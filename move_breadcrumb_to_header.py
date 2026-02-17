#!/usr/bin/env python3
"""
Breadcrumb을 헤더 안으로 이동시키는 스크립트
모든 HTML 파일에서 Breadcrumb을 찾아서 </header> 태그 바로 앞으로 이동
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
        
        # Breadcrumb 패턴 찾기 (여러 형태 지원)
        # 1. Hero section 안에 있는 breadcrumb
        hero_pattern = r'(<div class="[^"]*hero[^"]*">.*?)(</div>)'
        breadcrumb_in_hero_pattern = r'(<div class="breadcrumb">.*?</div>)'
        
        # 2. Page header 안에 있는 breadcrumb  
        page_header_pattern = r'(<div class="page-header">.*?)(</div>)'
        
        # 3. materials-header 안에 있는 breadcrumb
        materials_header_pattern = r'(<div class="materials-header">.*?<div class="container">.*?)(</div>\s*</div>)'
        
        # 각 패턴에 대해 처리
        breadcrumb_extracted = None
        
        # Hero section에서 breadcrumb 추출
        hero_match = re.search(hero_pattern, content, re.DOTALL)
        if hero_match:
            hero_content = hero_match.group(0)
            breadcrumb_match = re.search(breadcrumb_in_hero_pattern, hero_content, re.DOTALL)
            if breadcrumb_match:
                breadcrumb_extracted = breadcrumb_match.group(1)
                # Hero section에서 breadcrumb 제거
                content = content.replace(hero_content, hero_content.replace(breadcrumb_extracted, ''))
        
        # Page header에서 breadcrumb 추출
        if not breadcrumb_extracted:
            page_header_match = re.search(page_header_pattern, content, re.DOTALL)
            if page_header_match:
                page_header_content = page_header_match.group(0)
                breadcrumb_match = re.search(breadcrumb_in_hero_pattern, page_header_content, re.DOTALL)
                if breadcrumb_match:
                    breadcrumb_extracted = breadcrumb_match.group(1)
                    # Page header에서 breadcrumb 제거
                    content = content.replace(page_header_content, page_header_content.replace(breadcrumb_extracted, ''))
        
        # Materials header에서 breadcrumb 추출
        if not breadcrumb_extracted:
            materials_match = re.search(materials_header_pattern, content, re.DOTALL)
            if materials_match:
                materials_content = materials_match.group(0)
                breadcrumb_match = re.search(breadcrumb_in_hero_pattern, materials_content, re.DOTALL)
                if breadcrumb_match:
                    breadcrumb_extracted = breadcrumb_match.group(1)
                    # Materials header에서 breadcrumb 제거
                    content = content.replace(materials_content, materials_content.replace(breadcrumb_extracted, ''))
        
        if not breadcrumb_extracted:
            print(f"  ⚠ Breadcrumb을 찾을 수 없음: {file_path}")
            return False
        
        # </header> 태그 찾기
        header_end_pattern = r'(</header>)'
        if not re.search(header_end_pattern, content):
            print(f"  ⚠ </header> 태그를 찾을 수 없음: {file_path}")
            return False
        
        # Breadcrumb을 </header> 바로 앞에 삽입
        # 적절한 들여쓰기 추가
        breadcrumb_with_indent = '\n            ' + breadcrumb_extracted.strip() + '\n        '
        content = re.sub(header_end_pattern, breadcrumb_with_indent + r'\1', content)
        
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

def main():
    """모든 HTML 파일 처리"""
    pages_dir = Path('pages')
    
    # 처리할 페이지 목록
    target_pages = [
        # 커뮤니티
        'community/forum.html',
        'community/discussion.html', 
        'community/member-news.html',
        'community/qna.html',
        'community/free-board.html',
        'community/notice.html',
        'community/notice-new.html',
        
        # 자료실
        'materials/presentation.html',
        'materials/report.html',
        'materials/video.html',
        'materials/academic.html',
        'materials/policy.html',
        
        # 마이페이지
        'mypage/payment.html',
        'mypage/history.html',
        'mypage/paper.html',
        'mypage/event.html',
        'mypage/certificate.html',
        'mypage/profile.html',
    ]
    
    print("=" * 60)
    print("Breadcrumb을 헤더 안으로 이동")
    print("=" * 60)
    
    success_count = 0
    fail_count = 0
    
    for page in target_pages:
        file_path = pages_dir / page
        if file_path.exists():
            print(f"\n처리 중: {page}")
            if move_breadcrumb_to_header(file_path):
                success_count += 1
            else:
                fail_count += 1
        else:
            print(f"\n⚠ 파일 없음: {page}")
            fail_count += 1
    
    print("\n" + "=" * 60)
    print(f"완료: {success_count}개 성공, {fail_count}개 실패")
    print("=" * 60)

if __name__ == '__main__':
    main()
