#!/usr/bin/env python3
"""
서브페이지의 top-bar 제거 스크립트
"""
import os
import re

pages_files = [
    "pages/materials/report.html",
    "pages/materials/policy.html",
    "pages/news/cases.html",
    "pages/news/video.html",
    "pages/news/policy.html",
    "pages/news/press.html",
    "pages/news/column.html",
    "pages/core/forum.html",
    "pages/member/benefits.html",
    "pages/member/types.html",
    "pages/about/greeting.html",
    "pages/about/ci.html",
    "pages/about/history.html",
    "pages/about/purpose.html",
    "pages/core/seminar.html",
    "pages/core/ordinance.html",
    "pages/core/award.html",
    "pages/materials/presentation.html",
    "pages/materials/video.html",
    "pages/materials/academic.html",
    "pages/community/qna.html",
    "pages/community/member-news.html",
    "pages/community/free-board.html",
    "pages/community/notice.html",
    "pages/journal/review.html",
    "pages/journal/submission.html",
    "pages/about/greeting-new.html",
    "pages/core/consulting.html",
    "pages/journal/search.html",
    "pages/journal/editorial-board.html",
    "pages/core/education.html",
    "pages/core/certification.html",
    "pages/community/forum.html",
    "pages/news/domestic.html",
    "pages/support/usage.html",
    "pages/support/personal.html",
    "pages/support/corporate.html",
    "pages/support/guide.html",
    "pages/community/notice-new.html",
    "pages/news/main.html",
    "pages/core/forum-new.html",
    "pages/member/fee.html",
    "pages/member/process.html",
    "pages/member/types-new.html",
    "pages/organization/divisions.html",
    "pages/organization/committees.html",
    "pages/organization/executives.html",
    "pages/about/location.html",
    "pages/about/constitution.html",
    "pages/sitemap.html",
    "pages/journal/archive.html",
    "pages/journal/editorial.html",
    "pages/policy/reports.html",
    "pages/policy/global.html",
    "pages/policy/law.html",
    "pages/policy/standards.html",
    "pages/policy/research.html",
    "pages/journal/about.html",
]

def remove_topbar(file_path):
    """top-bar 섹션 제거"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # top-bar 전체 블록 제거 (여러 패턴 시도)
        patterns = [
            r'<div class="top-bar">.*?</div>\s*</div>',  # 기본 패턴
            r'<div class="top-bar"[^>]*>.*?<div class="top-bar-content">.*?</div>\s*</div>\s*</div>',  # 중첩 div
        ]
        
        for pattern in patterns:
            content = re.sub(pattern, '', content, flags=re.DOTALL)
        
        # 저장
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return True
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    print("🚀 서브페이지 top-bar 제거 시작...\n")
    
    success_count = 0
    fail_count = 0
    
    for file_path in pages_files:
        if os.path.exists(file_path):
            if remove_topbar(file_path):
                print(f"✅ {file_path}")
                success_count += 1
            else:
                print(f"❌ {file_path}")
                fail_count += 1
        else:
            print(f"⚠️  파일 없음: {file_path}")
            fail_count += 1
    
    print(f"\n{'='*60}")
    print(f"✅ 성공: {success_count}개")
    print(f"❌ 실패: {fail_count}개")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
