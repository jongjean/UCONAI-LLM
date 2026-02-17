#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Breadcrumb 일괄 수정 스크립트 - 간단 버전
모든 <span>/</span>를 <i class="fas fa-chevron-right"></i>로 변경
모든 breadcrumb의 마지막 <span>에 class="current" 추가
"""

import os
import re

# 수정할 파일 목록
files_to_fix = [
    # 학회소개
    'pages/about/greeting.html',
    'pages/about/greeting-new.html',
    'pages/about/purpose.html',
    'pages/about/history.html',
    'pages/about/constitution.html',
    'pages/about/ci.html',
    'pages/about/location.html',
    
    # 조직
    'pages/organization/executives.html',
    'pages/organization/committees.html',
    'pages/organization/divisions.html',
    
    # 회원안내
    'pages/member/types-new.html',
    'pages/member/process.html',
    'pages/member/fee.html',
    'pages/member/benefits.html',
    
    # 학술행사
    'pages/core/forum.html',
    'pages/core/forum-new.html',
    
    # 학회지
    'pages/journal/about.html',
    'pages/journal/archive.html',
    
    # 정책정보
    'pages/policy/research.html',
    'pages/policy/standards.html',
    'pages/policy/law.html',
    'pages/policy/global.html',
    'pages/policy/reports.html',
    
    # 뉴스·홍보
    'pages/news/policy.html',
    'pages/news/cases.html',
    'pages/news/press.html',
    'pages/news/column.html',
    'pages/news/video.html',
    'pages/news/domestic.html',
    
    # 커뮤니티
    'pages/community/notice.html',
    'pages/community/notice-new.html',
    'pages/community/forum.html',
    'pages/community/discussion.html',
    'pages/community/member-news.html',
    'pages/community/qna.html',
    'pages/community/free-board.html',
    
    # 자료실
    'pages/materials/academic.html',
    'pages/materials/policy.html',
    'pages/materials/presentation.html',
    'pages/materials/report.html',
    'pages/materials/video.html',
    
    # 후원안내
    'pages/support/guide.html',
    'pages/support/corporate.html',
    'pages/support/personal.html',
    'pages/support/usage.html',
    
    # 마이페이지
    'pages/mypage/profile.html',
    'pages/mypage/payment.html',
    'pages/mypage/history.html',
    'pages/mypage/paper.html',
    'pages/mypage/event.html',
    'pages/mypage/certificate.html',
]

def fix_breadcrumb(file_path):
    """파일의 breadcrumb 수정"""
    if not os.path.exists(file_path):
        print(f"❌ 파일 없음: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 1. <span>/</span>를 chevron-right 아이콘으로 변경
    content = content.replace('<span>/</span>', '<i class="fas fa-chevron-right"></i>')
    content = content.replace('</a><span>/', '</a>\n            <i class="fas fa-chevron-right"></i>\n            <span>')
    content = content.replace('</a> <span>/', '</a>\n            <i class="fas fa-chevron-right"></i>\n            <span>')
    
    # 2. breadcrumb 내의 마지막 <span>XXX</span>를 <span class="current">XXX</span>로 변경
    # breadcrumb 블록 찾기
    breadcrumb_pattern = r'(<(?:div|nav) class="breadcrumb"[^>]*>)(.*?)(</(?:div|nav)>)'
    
    def replace_breadcrumb(match):
        opening = match.group(1)
        content_part = match.group(2)
        closing = match.group(3)
        
        # 마지막 <span>에 class="current" 추가 (이미 class가 없는 경우만)
        # 뒤에서부터 찾아서 마지막 span만 수정
        last_span_pattern = r'<span>([^<]+)</span>(?!.*<span>)'
        content_part = re.sub(last_span_pattern, r'<span class="current">\1</span>', content_part)
        
        return opening + content_part + closing
    
    content = re.sub(breadcrumb_pattern, replace_breadcrumb, content, flags=re.DOTALL)
    
    # 3. <nav class="breadcrumb">를 <div class="breadcrumb">로 통일
    content = content.replace('<nav class="breadcrumb">', '<div class="breadcrumb">')
    content = content.replace('</nav>', '</div>', 1)  # breadcrumb 뒤의 첫 번째 </nav>만 변경
    
    if content == original_content:
        print(f"⚠️  변경 사항 없음: {file_path}")
        return False
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ 수정 완료: {file_path}")
    return True

def main():
    """메인 실행 함수"""
    print("=" * 60)
    print("Breadcrumb 일괄 수정 시작")
    print("=" * 60)
    
    success_count = 0
    skip_count = 0
    fail_count = 0
    
    for file_path in files_to_fix:
        try:
            if fix_breadcrumb(file_path):
                success_count += 1
            else:
                skip_count += 1
        except Exception as e:
            print(f"❌ 오류 발생: {file_path} - {e}")
            fail_count += 1
    
    print("\n" + "=" * 60)
    print(f"완료: {success_count}개 수정, {skip_count}개 건너뜀, {fail_count}개 실패")
    print("=" * 60)

if __name__ == '__main__':
    main()
