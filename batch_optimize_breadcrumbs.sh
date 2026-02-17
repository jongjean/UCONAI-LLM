#!/bin/bash
# Breadcrumb 일괄 최적화 스크립트

echo "================================="
echo "Breadcrumb 일괄 최적화 시작"
echo "================================="
echo ""

# about 섹션
echo "[about] 섹션 처리 중..."
python3 << 'EOF'
import re
from pathlib import Path

files = [
    'pages/about/constitution.html',
    'pages/about/ci.html',
    'pages/about/location.html'
]

def optimize(file_path, section_kr, page_kr):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Breadcrumb 패턴 찾기
    pattern = r'<div class="breadcrumb">\s*<a href="[^"]+"><i class="fas fa-home"></i> 홈</a>\s*<i class="fas fa-chevron-right"></i>\s*<a href="#">' + section_kr + r'</a>\s*<i class="fas fa-chevron-right"></i>\s*<span class="current">' + page_kr + r'</span>\s*</div>'
    
    replacement = f'''<!-- Breadcrumb Navigation -->
            <nav class="breadcrumb" aria-label="breadcrumb">
                <ol>
                    <li><a href="../../index.html"><i class="fas fa-home"></i> 홈</a></li>
                    <li><a href="#">{section_kr}</a></li>
                    <li class="current" aria-current="page">{page_kr}</li>
                </ol>
            </nav>'''
    
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  ✅ {Path(file_path).name}")
    else:
        print(f"  ⏭️  {Path(file_path).name}")

optimize('pages/about/constitution.html', '학회소개', '정관·규정')
optimize('pages/about/ci.html', '학회소개', 'CI·BI')
optimize('pages/about/location.html', '학회소개', '오시는 길')

EOF

echo ""
echo "✅ 처리 완료!"
