#!/usr/bin/env python3
import os
import re

# 로고를 텍스트로 교체할 패턴
patterns = [
    # 패턴 1: 단일 로고 이미지
    (
        r'<a href="../../index\.html" class="logo">\s*<img src="../../images/logo-full\.png" alt="한국ESG학회" class="logo-full">\s*</a>',
        '<a href="../../index.html" class="logo">\n                    <span class="logo-text">한국ESG학회</span>\n                </a>'
    ),
    # 패턴 2: 2개의 로고 이미지 (full + symbol)
    (
        r'<a href="../../index\.html" class="logo">\s*<img src="../../images/logo-full\.png" alt="한국ESG학회" class="logo-full">\s*<img src="../../images/logo-symbol\.png" alt="한국ESG학회" class="logo-symbol">\s*</a>',
        '<a href="../../index.html" class="logo">\n                    <span class="logo-text">한국ESG학회</span>\n                </a>'
    ),
    # 패턴 3: Footer 로고 이미지
    (
        r'<img src="../../images/logo-full\.png" alt="한국ESG학회" class="footer-logo-img">',
        '<span class="logo-text">한국ESG학회</span>'
    ),
]

# 서브 페이지 디렉토리 목록
subdirs = [
    'pages/about',
    'pages/organization',
    'pages/member',
    'pages/core',
    'pages/journal',
    'pages/policy',
    'pages/news',
    'pages/community',
    'pages/materials',
    'pages/support',
    'pages/mypage',
]

# 파일 교체 함수
def replace_logos_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 각 패턴에 대해 교체 수행
        for pattern, replacement in patterns:
            content = re.sub(pattern, replacement, content, flags=re.DOTALL)
        
        # 내용이 변경되었을 때만 파일에 쓰기
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'✅ Updated: {filepath}')
            return True
        else:
            print(f'⏭️  No change: {filepath}')
            return False
            
    except Exception as e:
        print(f'❌ Error processing {filepath}: {e}')
        return False

# 메인 실행
if __name__ == '__main__':
    total_files = 0
    updated_files = 0
    
    for subdir in subdirs:
        if os.path.exists(subdir):
            for filename in os.listdir(subdir):
                if filename.endswith('.html'):
                    filepath = os.path.join(subdir, filename)
                    total_files += 1
                    if replace_logos_in_file(filepath):
                        updated_files += 1
    
    print(f'\n📊 Summary:')
    print(f'   Total files processed: {total_files}')
    print(f'   Updated files: {updated_files}')
    print(f'   Unchanged files: {total_files - updated_files}')
