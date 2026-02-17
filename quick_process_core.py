#!/usr/bin/env python3
"""
Breadcrumb 대량 이동 - 즉시 실행
"""
import re
from pathlib import Path

def process_file(filepath, category, page_name):
    """파일 처리"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 패턴 1: container 안의 breadcrumb
        pattern1 = r'(<!-- Breadcrumb -->\s*)?<div class="container">\s*<div class="breadcrumb">\s*<a href="../../index.html"><i class="fas fa-home"></i> 홈</a>\s*<i class="fas fa-chevron-right"></i>\s*<a href="#">' + re.escape(category) + r'</a>\s*<i class="fas fa-chevron-right"></i>\s*<span class="current">' + re.escape(page_name) + r'</span>\s*</div>\s*</div>'
        
        # Breadcrumb 찾기
        match = re.search(pattern1, content, re.DOTALL)
        if not match:
            return False, "No match"
        
        # </header> 위치 확인
        header_pos = content.find('</header>')
        breadcrumb_pos = match.start()
        
        if breadcrumb_pos < header_pos:
            return False, "Already in header"
        
        # Breadcrumb HTML 생성
        breadcrumb_html = f'''        <div class="breadcrumb">
            <a href="../../index.html"><i class="fas fa-home"></i> 홈</a>
            <i class="fas fa-chevron-right"></i>
            <a href="#">{category}</a>
            <i class="fas fa-chevron-right"></i>
            <span class="current">{page_name}</span>
        </div>'''
        
        # 기존 breadcrumb 제거
        content = content[:match.start()] + content[match.end():]
        
        # 공백 정리
        content = re.sub(r'\n\n\n+', '\n\n', content)
        
        # </header> 앞에 삽입
        header_pos = content.find('</header>')
        content = content[:header_pos] + '\n' + breadcrumb_html + '\n    ' + content[header_pos:]
        
        # 저장
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return True, "Success"
    except Exception as e:
        return False, str(e)

# 처리할 파일 정의
files = [
    # 핵심사업
    ('pages/core/forum.html', '핵심사업', '월드ESG포럼'),
    ('pages/core/forum-new.html', '핵심사업', '월드ESG포럼'),
    ('pages/core/award.html', '핵심사업', '한국ESG대상'),
    ('pages/core/ordinance.html', '핵심사업', '한국ESG조례대상'),
    ('pages/core/seminar.html', '핵심사업', '월요학술세미나'),
    ('pages/core/certification.html', '핵심사업', 'ESG 인증'),
    ('pages/core/consulting.html', '핵심사업', 'ESG 컨설팅'),
    ('pages/core/education.html', '핵심사업', 'ESG 교육'),
]

print("=" * 70)
print("Breadcrumb 대량 이동 시작")
print("=" * 70)

success = 0
fail = 0

for filepath, category, page_name in files:
    result, msg = process_file(Path(filepath), category, page_name)
    if result:
        print(f"✓ {filepath}")
        success += 1
    else:
        if msg != "Already in header":
            print(f"✗ {filepath}: {msg}")
            fail += 1

print(f"\n완료: {success}개 성공, {fail}개 실패")
