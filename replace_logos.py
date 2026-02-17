#!/usr/bin/env python3
"""
모든 HTML 파일에서 로고 이미지를 텍스트로 교체하는 스크립트
"""
import os
import re

# 교체할 패턴들
patterns = [
    # 패턴 1: 로고 2개 (logo-full + logo-symbol)
    (
        r'<a href="../../index\.html" class="logo">\s*<img src="../../images/logo-full\.png"[^>]*>\s*<img src="../../images/logo-symbol\.png"[^>]*>\s*</a>',
        '<a href="../../index.html" class="logo">\n                        <span class="logo-text">한국ESG학회</span>\n                    </a>'
    ),
    # 패턴 2: 로고 1개만 (logo-full)
    (
        r'<a href="../../index\.html" class="logo">\s*<img src="../../images/logo-full\.png"[^>]*>\s*</a>',
        '<a href="../../index.html" class="logo">\n                    <span class="logo-text">한국ESG학회</span>\n                </a>'
    ),
]

# pages 폴더의 모든 HTML 파일 처리
pages_dir = 'pages'
count = 0

for root, dirs, files in os.walk(pages_dir):
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # 모든 패턴 적용
            for pattern, replacement in patterns:
                content = re.sub(pattern, replacement, content)
            
            # 변경사항이 있으면 파일 저장
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                count += 1
                print(f"✓ {filepath}")

print(f"\n총 {count}개 파일 수정 완료!")
