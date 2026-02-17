#!/usr/bin/env python3
"""
Breadcrumb Home Icon Fix Script
- '홈' 앞에 home 아이콘 추가
"""

import os
import re

# 수정할 파일 목록
files_to_fix = [
    "pages/support/usage.html",
    "pages/support/guide.html",
    "pages/support/corporate.html",
    "pages/support/personal.html",
    "pages/mypage/certificate.html",
    "pages/mypage/event.html",
    "pages/mypage/paper.html",
    "pages/mypage/history.html",
    "pages/mypage/payment.html",
    "pages/journal/archive.html",
    "pages/policy/reports.html",
    "pages/policy/global.html",
    "pages/policy/law.html",
    "pages/policy/standards.html",
    "pages/materials/video.html",
    "pages/materials/report.html",
    "pages/materials/presentation.html",
    "pages/materials/policy.html",
    "pages/community/free-board.html",
    "pages/community/member-news.html",
    "pages/community/qna.html",
    "pages/community/discussion.html",
    "pages/mypage/profile.html",
    "pages/journal/about.html",
    "pages/policy/research.html",
    "pages/materials/academic.html",
    "pages/community/forum.html",
    "pages/community/notice.html",
    "pages/core/forum.html",
    "pages/organization/committees.html",
    "pages/organization/divisions.html",
    "pages/organization/executives.html",
    "pages/about/location.html",
    "pages/about/ci.html",
    "pages/about/constitution.html",
    "pages/about/history.html",
    "pages/about/purpose.html",
    "pages/member/benefits.html",
    "pages/member/fee.html",
    "pages/member/process.html",
    "pages/news/domestic.html",
    "pages/news/video.html",
    "pages/news/column.html",
    "pages/news/press.html",
    "pages/news/cases.html",
    "pages/news/policy.html",
    "pages/news/main.html",
    "pages/member/types.html"
]

def fix_breadcrumb_home(file_path):
    """breadcrumb의 '홈' 앞에 home 아이콘 추가"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 패턴: <a href="../../index.html">홈</a>
        # 변경: <a href="../../index.html"><i class="fas fa-home"></i> 홈</a>
        old_pattern = r'<a href="\.\.\/\.\.\/index\.html">홈</a>'
        new_pattern = r'<a href="../../index.html"><i class="fas fa-home"></i> 홈</a>'
        
        if re.search(old_pattern, content):
            content = re.sub(old_pattern, new_pattern, content)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            return True
        else:
            print(f"  ⚠️  Pattern not found: {file_path}")
            return False
            
    except Exception as e:
        print(f"  ❌ Error processing {file_path}: {e}")
        return False

# 메인 실행
print("=" * 60)
print("Breadcrumb Home Icon Fix")
print("=" * 60)

success_count = 0
fail_count = 0

for file_path in files_to_fix:
    if os.path.exists(file_path):
        if fix_breadcrumb_home(file_path):
            print(f"✅ {file_path}")
            success_count += 1
        else:
            fail_count += 1
    else:
        print(f"❌ File not found: {file_path}")
        fail_count += 1

print("\n" + "=" * 60)
print(f"✅ Success: {success_count} files")
print(f"❌ Failed: {fail_count} files")
print("=" * 60)
