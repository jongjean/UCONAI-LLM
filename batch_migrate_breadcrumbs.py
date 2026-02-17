#!/usr/bin/env python3
"""
모든 페이지의 Breadcrumb을 헤더 안으로 자동 이동
개선된 버전 - 다양한 HTML 구조 지원
"""

import os
import re
from pathlib import Path

def find_breadcrumb(content):
    """Breadcrumb HTML 찾기 - 개선된 버전"""
    # section 내부의 breadcrumb도 찾을 수 있도록 개선
    patterns = [
        # page-header section 내부
        r'<section class="page-header">.*?<div class="breadcrumb">.*?</div>.*?</section>',
        # container 안에 있는 경우
        r'<div class="container">\s*<div class="breadcrumb">.*?</div>\s*</div>',
        # 기본 패턴
        r'<div class="breadcrumb">.*?</div>',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, content, re.DOTALL)
        if match:
            # breadcrumb div만 추출
            breadcrumb_match = re.search(r'<div class="breadcrumb">.*?</div>', match.group(0), re.DOTALL)
            if breadcrumb_match:
                return breadcrumb_match.group(0), breadcrumb_match.start(0) + match.start(0), breadcrumb_match.end(0) + match.start(0)
    
    return None, None, None

def find_header_end(content):
    """</header> 태그 위치 찾기"""
    match = re.search(r'</header>', content)
    if match:
        return match.start()
    return None

def move_breadcrumb_to_header(file_path):
    """HTML 파일에서 Breadcrumb을 헤더 안으로 이동"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Breadcrumb 찾기
        breadcrumb_html, breadcrumb_start, breadcrumb_end = find_breadcrumb(content)
        
        if not breadcrumb_html:
            return None  # Breadcrumb 없음
        
        # </header> 위치 찾기
        header_end_pos = find_header_end(content)
        
        if header_end_pos is None:
            print(f"  ⚠ </header> 태그를 찾을 수 없음: {file_path}")
            return False
        
        # Breadcrumb이 이미 헤더 안에 있는지 확인
        if breadcrumb_start < header_end_pos:
            return None  # 이미 헤더 안에 있음
        
        # Breadcrumb을 원래 위치에서 제거
        before_breadcrumb = content[:breadcrumb_start]
        after_breadcrumb = content[breadcrumb_end:]
        
        # 앞뒤 공백 정리
        before_breadcrumb = before_breadcrumb.rstrip()
        after_breadcrumb = after_breadcrumb.lstrip()
        
        # <!-- Breadcrumb --> 주석도 제거
        before_breadcrumb = re.sub(r'<!-- Breadcrumb -->\s*$', '', before_breadcrumb, flags=re.MULTILINE).rstrip()
        
        # container div가 비어있으면 제거
        before_breadcrumb = re.sub(r'<div class="container">\s*</div>\s*$', '', before_breadcrumb, flags=re.MULTILINE).rstrip()
        
        content = before_breadcrumb + '\n\n' + after_breadcrumb
        
        # </header> 위치 다시 찾기
        header_end_pos = find_header_end(content)
        
        # Breadcrumb을 </header> 바로 앞에 삽입
        before_header_end = content[:header_end_pos].rstrip()
        after_header_end = content[header_end_pos:]
        
        # 적절한 들여쓰기 추가
        breadcrumb_formatted = '\n        ' + breadcrumb_html.strip() + '\n    '
        
        content = before_header_end + breadcrumb_formatted + after_header_end
        
        # 파일이 실제로 변경되었는지 확인
        if content == original_content:
            return False
        
        # 파일 저장
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return True
        
    except Exception as e:
        print(f"  ✗ 오류 발생 {file_path}: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """모든 HTML 파일 처리"""
    # 이미 처리된 파일들
    completed_files = {
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
        'pages/about/purpose.html',
        'pages/about/history.html',
        'pages/about/constitution.html',
    }
    
    print("=" * 70)
    print("Breadcrumb을 헤더 안으로 이동 - 전체 페이지 처리")
    print("=" * 70)
    
    # Breadcrumb이 있는 모든 파일 찾기
    pages_dir = Path('pages')
    all_html_files = list(pages_dir.rglob('*.html'))
    
    success_count = 0
    skip_count = 0
    fail_count = 0
    no_breadcrumb_count = 0
    already_done_count = 0
    
    processed_files = []
    
    for file_path in sorted(all_html_files):
        file_path_str = str(file_path).replace('\\', '/')
        
        # 이미 처리된 파일은 건너뛰기
        if file_path_str in completed_files:
            already_done_count += 1
            continue
        
        # embed 페이지는 건너뛰기 (특수 페이지)
        if 'embed' in file_path_str:
            skip_count += 1
            continue
        
        result = move_breadcrumb_to_header(file_path)
        
        if result is True:
            print(f"✓ 성공: {file_path_str}")
            success_count += 1
            processed_files.append(file_path_str)
        elif result is None:
            # Breadcrumb 없음 또는 이미 헤더 안에 있음
            no_breadcrumb_count += 1
        elif result is False:
            print(f"✗ 실패: {file_path_str}")
            fail_count += 1
    
    print("\n" + "=" * 70)
    print(f"처리 결과:")
    print(f"  - 새로 처리됨: {success_count}개")
    print(f"  - 이미 처리됨: {already_done_count}개")
    print(f"  - Breadcrumb 없음: {no_breadcrumb_count}개")
    print(f"  - 건너뜀: {skip_count}개")
    print(f"  - 실패: {fail_count}개")
    print("=" * 70)
    
    if success_count > 0:
        print(f"\n✅ {success_count}개 페이지의 Breadcrumb 이동이 완료되었습니다!")
        print("\n처리된 파일:")
        for f in processed_files:
            print(f"  - {f}")
        print("\n⚠ 각 페이지를 브라우저에서 확인하여 레이아웃이 정상인지 테스트하세요.")
    elif already_done_count > 0:
        print(f"\n✅ 모든 페이지가 이미 처리되어 있습니다! (총 {already_done_count}개)")

if __name__ == '__main__':
    main()
