#!/usr/bin/env python3
"""
Breadcrumb 일괄 이동 스크립트 - 즉시 실행
"""

import re
from pathlib import Path

def move_breadcrumb(file_path):
    """Breadcrumb을 헤더 안으로 이동"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # </header> 위치 찾기
        header_match = re.search(r'</header>', content)
        if not header_match:
            return False, "No header"
        
        header_pos = header_match.start()
        
        # Breadcrumb 찾기 (여러 패턴)
        patterns = [
            # container 안의 breadcrumb
            (r'<!-- Breadcrumb -->\s*<div class="container">\s*<div class="breadcrumb">(.*?)</div>\s*</div>', 'container'),
            # 단독 breadcrumb
            (r'<div class="breadcrumb">(.*?)</div>', 'simple'),
        ]
        
        breadcrumb_match = None
        breadcrumb_content = None
        pattern_type = None
        
        for pattern, ptype in patterns:
            match = re.search(pattern, content[header_pos:], re.DOTALL)
            if match:
                breadcrumb_match = match
                if ptype == 'container':
                    breadcrumb_content = '<div class="breadcrumb">' + match.group(1) + '</div>'
                else:
                    breadcrumb_content = match.group(0)
                pattern_type = ptype
                break
        
        if not breadcrumb_match:
            return False, "No breadcrumb"
        
        # Breadcrumb이 이미 헤더 안에 있는지 확인
        breadcrumb_abs_pos = header_pos + breadcrumb_match.start()
        if breadcrumb_abs_pos < header_pos:
            return False, "Already in header"
        
        # Breadcrumb 제거
        before = content[:breadcrumb_abs_pos]
        after = content[breadcrumb_abs_pos + len(breadcrumb_match.group(0)):]
        
        # 앞뒤 공백 정리
        before = before.rstrip()
        after = after.lstrip()
        
        # 빈 줄 제거
        while before.endswith('\n\n\n'):
            before = before[:-1]
        while after.startswith('\n\n\n'):
            after = after[1:]
        
        content = before + '\n\n' + after
        
        # </header> 위치 다시 찾기
        header_match = re.search(r'</header>', content)
        if not header_match:
            return False, "Header lost"
        
        header_pos = header_match.start()
        
        # Breadcrumb 삽입
        before_header = content[:header_pos].rstrip()
        after_header = content[header_pos:]
        
        breadcrumb_formatted = '\n        ' + breadcrumb_content.strip() + '\n    '
        new_content = before_header + breadcrumb_formatted + after_header
        
        # 저장
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True, "Success"
        
    except Exception as e:
        return False, str(e)

# 처리할 파일 목록
files_to_process = [
    # 회원안내
    'pages/member/benefits.html',
    'pages/member/types-new.html',
    'pages/member/companies.html',
    'pages/member/application.html',
    # 핵심사업
    'pages/core/forum.html',
    'pages/core/forum-new.html',
    'pages/core/award.html',
    'pages/core/ordinance.html',
    'pages/core/seminar.html',
    'pages/core/certification.html',
    'pages/core/consulting.html',
    'pages/core/education.html',
    # 조직
    'pages/organization/executives.html',
    'pages/organization/committees.html',
    'pages/organization/divisions.html',
    # 학술지
    'pages/journal/about.html',
    'pages/journal/submission.html',
    'pages/journal/editorial.html',
    'pages/journal/editorial-board.html',
    'pages/journal/review.html',
    'pages/journal/archive.html',
    # 정책
    'pages/policy/research.html',
    'pages/policy/standards.html',
    'pages/policy/law.html',
    'pages/policy/global.html',
    'pages/policy/reports.html',
    # 뉴스
    'pages/news/main.html',
    'pages/news/policy.html',
    'pages/news/cases.html',
    'pages/news/press.html',
    'pages/news/column.html',
    'pages/news/video.html',
    'pages/news/domestic.html',
    # 후원
    'pages/support/guide.html',
    'pages/support/corporate.html',
    'pages/support/personal.html',
    'pages/support/usage.html',
    # 커뮤니티 추가
    'pages/community/notice-new.html',
]

print("=" * 70)
print("Breadcrumb 일괄 이동 시작")
print("=" * 70)

success = 0
skip = 0
fail = 0

for file_path in files_to_process:
    path = Path(file_path)
    if not path.exists():
        print(f"⚠ 파일 없음: {file_path}")
        skip += 1
        continue
    
    result, message = move_breadcrumb(path)
    
    if result:
        print(f"✓ {file_path}")
        success += 1
    else:
        if message in ["No breadcrumb", "Already in header"]:
            skip += 1
        else:
            print(f"✗ {file_path}: {message}")
            fail += 1

print("\n" + "=" * 70)
print(f"완료: {success}개 성공, {skip}개 스킵, {fail}개 실패")
print("=" * 70)
