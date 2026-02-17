#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Breadcrumb 일괄 수정 스크립트 - 최종 버전
모든 breadcrumb를 표준 형식으로 변환
"""

import os
import re

# 수정할 파일과 breadcrumb 경로 매핑
FILE_BREADCRUMBS = {
    # 커뮤니티
    'pages/community/discussion.html': ['홈', '커뮤니티', '토론방'],
    'pages/community/member-news.html': ['홈', '커뮤니티', '회원 소식'],
    'pages/community/qna.html': ['홈', '커뮤니티', 'Q&A'],
    'pages/community/free-board.html': ['홈', '커뮤니티', '자유게시판'],
    
    # 자료실
    'pages/materials/policy.html': ['홈', '자료실', '정책자료'],
    'pages/materials/presentation.html': ['홈', '자료실', '발표자료'],
    'pages/materials/report.html': ['홈', '자료실', '보고서'],
    'pages/materials/video.html': ['홈', '자료실', '영상자료'],
    
    # 정책정보
    'pages/policy/standards.html': ['홈', 'ESG정책·연구', 'ESG 표준·지침'],
    'pages/policy/law.html': ['홈', 'ESG정책·연구', 'ESG 법령·고시'],
    'pages/policy/global.html': ['홈', 'ESG정책·연구', 'ESG 국제 동향'],
    'pages/policy/reports.html': ['홈', 'ESG정책·연구', 'ESG 정책 보고서'],
    
    # 학회지
    'pages/journal/archive.html': ['홈', '학술지·논문', '논문 검색'],
    
    # 후원안내
    'pages/support/corporate.html': ['홈', '후원·기부', '기업 후원'],
    'pages/support/personal.html': ['홈', '후원·기부', '개인 후원'],
    'pages/support/usage.html': ['홈', '후원·기부', '후원금 사용내역'],
    
    # 마이페이지
    'pages/mypage/payment.html': ['홈', '마이페이지', '회비 납부'],
    'pages/mypage/history.html': ['홈', '마이페이지', '활동 내역'],
    'pages/mypage/paper.html': ['홈', '마이페이지', '논문 관리'],
    'pages/mypage/event.html': ['홈', '마이페이지', '행사 신청'],
    'pages/mypage/certificate.html': ['홈', '마이페이지', '증명서 발급'],
}

def generate_breadcrumb_html(paths, indent='            '):
    """breadcrumb HTML 생성"""
    lines = []
    lines.append(f'{indent}<a href="../../index.html">{paths[0]}</a>')
    
    for i in range(1, len(paths)):
        lines.append(f'{indent}<i class="fas fa-chevron-right"></i>')
        if i == len(paths) - 1:
            # 마지막 항목
            lines.append(f'{indent}<span class="current">{paths[i]}</span>')
        else:
            # 중간 항목
            lines.append(f'{indent}<a href="#">{paths[i]}</a>')
    
    return '\n'.join(lines)

def fix_breadcrumb(file_path, breadcrumb_paths):
    """파일의 breadcrumb 수정"""
    if not os.path.exists(file_path):
        print(f"❌ 파일 없음: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # breadcrumb 블록 패턴 (다양한 형태 지원)
    patterns = [
        # <div class="breadcrumb"> 또는 <nav class="breadcrumb">
        r'<(div|nav)\s+class="breadcrumb"[^>]*>(.*?)</\1>',
    ]
    
    new_breadcrumb_html = generate_breadcrumb_html(breadcrumb_paths)
    new_breadcrumb = f'<div class="breadcrumb">\n{new_breadcrumb_html}\n        </div>'
    
    replaced = False
    for pattern in patterns:
        match = re.search(pattern, content, re.DOTALL)
        if match:
            content = re.sub(pattern, new_breadcrumb, content, count=1, flags=re.DOTALL)
            replaced = True
            break
    
    if not replaced:
        print(f"⚠️  Breadcrumb 패턴을 찾을 수 없음: {file_path}")
        return False
    
    if content == original_content:
        print(f"⚠️  변경 사항 없음: {file_path}")
        return False
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ 수정 완료: {file_path}")
    return True

def main():
    """메인 실행 함수"""
    print("=" * 70)
    print("Breadcrumb 일괄 수정 시작")
    print("=" * 70)
    print()
    
    success_count = 0
    skip_count = 0
    fail_count = 0
    
    for file_path, breadcrumb_paths in FILE_BREADCRUMBS.items():
        try:
            if fix_breadcrumb(file_path, breadcrumb_paths):
                success_count += 1
            else:
                skip_count += 1
        except Exception as e:
            print(f"❌ 오류 발생: {file_path} - {e}")
            fail_count += 1
    
    print()
    print("=" * 70)
    print(f"완료: {success_count}개 수정, {skip_count}개 건너뜀, {fail_count}개 실패")
    print("=" * 70)
    print()
    print("✅ 모든 breadcrumb이 표준 형식으로 변경되었습니다!")
    print()

if __name__ == '__main__':
    main()
