#!/usr/bin/env python3
"""
모든 페이지의 Breadcrumb을 헤더 안으로 자동 이동
다양한 HTML 구조를 지원하는 범용 스크립트
"""

import os
import re
from pathlib import Path

def find_breadcrumb(content):
    """Breadcrumb HTML 찾기"""
    # 여러 가지 Breadcrumb 패턴
    patterns = [
        # 기본 패턴
        r'<div class="breadcrumb">.*?</div>',
        # container 안에 있는 경우
        r'<div class="container">\s*<div class="breadcrumb">.*?</div>\s*</div>',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, content, re.DOTALL)
        if match:
            return match.group(0), match.start(), match.end()
    
    return None, None, None

def find_header_end(content):
    """</header> 태그 위치 찾기"""
    match = re.search(r'</header>', content)
    if match:
        return match.start()
    return None

def extract_breadcrumb_content(breadcrumb_html):
    """Breadcrumb HTML에서 순수 breadcrumb div만 추출"""
    match = re.search(r'<div class="breadcrumb">(.*?)</div>', breadcrumb_html, re.DOTALL)
    if match:
        return match.group(0)
    return breadcrumb_html

def move_breadcrumb_to_header(file_path):
    """HTML 파일에서 Breadcrumb을 헤더 안으로 이동"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Breadcrumb 찾기
        breadcrumb_html, breadcrumb_start, breadcrumb_end = find_breadcrumb(content)
        
        if not breadcrumb_html:
            print(f"  ⚠ Breadcrumb을 찾을 수 없음: {file_path}")
            return False
        
        # </header> 위치 찾기
        header_end_pos = find_header_end(content)
        
        if header_end_pos is None:
            print(f"  ⚠ </header> 태그를 찾을 수 없음: {file_path}")
            return False
        
        # Breadcrumb이 이미 헤더 안에 있는지 확인
        if breadcrumb_start < header_end_pos:
            print(f"  - 이미 헤더 안에 있음: {file_path}")
            return False
        
        # Breadcrumb 순수 내용만 추출
        breadcrumb_clean = extract_breadcrumb_content(breadcrumb_html)
        
        # Breadcrumb을 원래 위치에서 제거
        # 주변 공백과 주석도 함께 제거
        before_breadcrumb = content[:breadcrumb_start].rstrip()
        after_breadcrumb = content[breadcrumb_end:].lstrip()
        
        # <!-- Breadcrumb --> 주석도 제거
        before_breadcrumb = re.sub(r'<!-- Breadcrumb -->\s*$', '', before_breadcrumb, flags=re.MULTILINE).rstrip()
        
        content = before_breadcrumb + '\n\n' + after_breadcrumb
        
        # </header> 위치 다시 찾기 (위치가 변경되었을 수 있음)
        header_end_pos = find_header_end(content)
        
        # Breadcrumb을 </header> 바로 앞에 삽입
        before_header_end = content[:header_end_pos].rstrip()
        after_header_end = content[header_end_pos:]
        
        # 적절한 들여쓰기 추가
        breadcrumb_with_indent = '\n        ' + breadcrumb_clean.strip() + '\n    '
        
        content = before_header_end + breadcrumb_with_indent + after_header_end
        
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
    # 이미 처리된 파일들
    completed_files = [
        'pages/community/forum.html',
        'pages/community/discussion.html',
        'pages/community/member-news.html',
        'pages/community/qna.html',
        'pages/community/free-board.html',
        'pages/community/notice.html',
        'pages/materials/presentation.html',
        'pages/materials/report.html',
        'pages/materials/video.html',
        'pages/materials/academic.html',
        'pages/materials/policy.html',
        'pages/mypage/payment.html',
        'pages/mypage/history.html',
        'pages/mypage/paper.html',
        'pages/mypage/event.html',
        'pages/mypage/certificate.html',
        'pages/mypage/profile.html',
    ]
    
    print("=" * 60)
    print("Breadcrumb을 헤더 안으로 이동 - 전체 페이지 처리")
    print("=" * 60)
    
    # Breadcrumb이 있는 모든 파일 찾기
    pages_dir = Path('pages')
    all_html_files = list(pages_dir.rglob('*.html'))
    
    success_count = 0
    skip_count = 0
    fail_count = 0
    
    for file_path in sorted(all_html_files):
        file_path_str = str(file_path).replace('\\', '/')
        
        # 이미 처리된 파일은 건너뛰기
        if file_path_str in completed_files:
            print(f"\n⏭ 이미 처리됨: {file_path_str}")
            skip_count += 1
            continue
        
        # embed 페이지는 건너뛰기 (특수 페이지)
        if 'embed' in file_path_str:
            print(f"\n⏭ 특수 페이지 건너뛰기: {file_path_str}")
            skip_count += 1
            continue
        
        print(f"\n처리 중: {file_path_str}")
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
    
    if success_count > 0:
        print("\n✅ Breadcrumb 이동이 완료되었습니다!")
        print("⚠ 각 페이지를 브라우저에서 확인하여 레이아웃이 정상인지 테스트하세요.")

if __name__ == '__main__':
    main()
