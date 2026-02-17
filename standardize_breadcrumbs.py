#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Breadcrumb 표준화 스크립트
모든 페이지의 breadcrumb를 스크린샷 형태로 통일
"""

import os
import re
from pathlib import Path

# 페이지별 breadcrumb 경로 정의
breadcrumb_map = {
    # 학회소개
    'pages/about/greeting.html': ['홈', '학회소개', '학회장 인사말'],
    'pages/about/greeting-new.html': ['홈', '학회소개', '학회장 인사말'],
    'pages/about/purpose.html': ['홈', '학회소개', '학회 목적'],
    'pages/about/history.html': ['홈', '학회소개', '학회 연혁'],
    'pages/about/constitution.html': ['홈', '학회소개', '정관'],
    'pages/about/ci.html': ['홈', '학회소개', 'CI'],
    'pages/about/location.html': ['홈', '학회소개', '찾아오시는 길'],
    
    # 조직
    'pages/organization/executives.html': ['홈', '조직', '임원진'],
    'pages/organization/committees.html': ['홈', '조직', '위원회'],
    'pages/organization/divisions.html': ['홈', '조직', '분과'],
    
    # 회원안내
    'pages/member/types.html': ['홈', '회원안내', '회원 구분'],
    'pages/member/types-new.html': ['홈', '회원안내', '회원 구분'],
    'pages/member/process.html': ['홈', '회원안내', '가입 절차'],
    'pages/member/fee.html': ['홈', '회원안내', '회비 안내'],
    'pages/member/benefits.html': ['홈', '회원안내', '회원 혜택'],
    
    # 학술행사
    'pages/core/forum.html': ['홈', '학술행사', '학술대회'],
    'pages/core/forum-new.html': ['홈', '학술행사', '학술대회'],
    
    # 학회지
    'pages/journal/about.html': ['홈', '학회지', '학회지 소개'],
    'pages/journal/archive.html': ['홈', '학회지', '논문 검색'],
    
    # 정책정보
    'pages/policy/research.html': ['홈', '정책정보', '연구보고서'],
    'pages/policy/standards.html': ['홈', '정책정보', '표준·지침'],
    'pages/policy/law.html': ['홈', '정책정보', '법령·고시'],
    'pages/policy/global.html': ['홈', '정책정보', '국제 동향'],
    'pages/policy/reports.html': ['홈', '정책정보', '정책 보고서'],
    
    # 뉴스·홍보
    'pages/news/main.html': ['홈', 'ESG뉴스', 'ESG 주요 뉴스'],
    'pages/news/policy.html': ['홈', 'ESG뉴스', 'ESG 정책 뉴스'],
    'pages/news/cases.html': ['홈', 'ESG뉴스', 'ESG 사례'],
    'pages/news/press.html': ['홈', 'ESG뉴스', '보도자료'],
    'pages/news/column.html': ['홈', 'ESG뉴스', '칼럼'],
    'pages/news/video.html': ['홈', 'ESG뉴스', '영상자료'],
    'pages/news/domestic.html': ['홈', 'ESG뉴스', '국내 뉴스'],
    
    # 커뮤니티
    'pages/community/notice.html': ['홈', '커뮤니티', '공지사항'],
    'pages/community/notice-new.html': ['홈', '커뮤니티', '공지사항'],
    'pages/community/forum.html': ['홈', '커뮤니티', '포럼'],
    'pages/community/discussion.html': ['홈', '커뮤니티', '토론방'],
    'pages/community/member-news.html': ['홈', '커뮤니티', '회원 소식'],
    'pages/community/qna.html': ['홈', '커뮤니티', 'Q&A'],
    'pages/community/free-board.html': ['홈', '커뮤니티', '자유게시판'],
    
    # 자료실
    'pages/materials/academic.html': ['홈', '자료실', '학술자료'],
    'pages/materials/policy.html': ['홈', '자료실', '정책자료'],
    'pages/materials/presentation.html': ['홈', '자료실', '발표자료'],
    'pages/materials/report.html': ['홈', '자료실', '보고서'],
    'pages/materials/video.html': ['홈', '자료실', '영상자료'],
    
    # 후원안내
    'pages/support/guide.html': ['홈', '후원안내', '후원 안내'],
    'pages/support/corporate.html': ['홈', '후원안내', '기업 후원'],
    'pages/support/personal.html': ['홈', '후원안내', '개인 후원'],
    'pages/support/usage.html': ['홈', '후원안내', '후원금 사용내역'],
    
    # 마이페이지
    'pages/mypage/profile.html': ['홈', '마이페이지', '회원정보'],
    'pages/mypage/payment.html': ['홈', '마이페이지', '회비 납부'],
    'pages/mypage/history.html': ['홈', '마이페이지', '활동 내역'],
    'pages/mypage/paper.html': ['홈', '마이페이지', '논문 관리'],
    'pages/mypage/event.html': ['홈', '마이페이지', '행사 신청'],
    'pages/mypage/certificate.html': ['홈', '마이페이지', '증명서 발급'],
}

def generate_breadcrumb_html(path_list):
    """breadcrumb HTML 생성"""
    result = []
    
    for i, item in enumerate(path_list):
        if i > 0:
            # 구분자 추가 (첫 번째 항목 제외)
            result.append('            <i class="fas fa-chevron-right"></i>')
        
        if i == 0:
            # 첫 번째 항목 (홈)
            result.append(f'            <a href="../../index.html">{item}</a>')
        elif i == len(path_list) - 1:
            # 마지막 항목 (현재 페이지)
            result.append(f'            <span class="current">{item}</span>')
        else:
            # 중간 항목
            result.append(f'            <a href="#">{item}</a>')
    
    return '\n'.join(result)

def update_breadcrumb(file_path, breadcrumb_items):
    """파일의 breadcrumb 업데이트"""
    if not os.path.exists(file_path):
        print(f"❌ 파일 없음: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # breadcrumb 패턴 찾기 (여러 형태 대응)
    patterns = [
        r'<div class="breadcrumb"[^>]*>.*?</div>',
        r'<nav class="breadcrumb"[^>]*>.*?</nav>',
    ]
    
    new_breadcrumb = f'''<div class="breadcrumb">
{generate_breadcrumb_html(breadcrumb_items)}
        </div>'''
    
    found = False
    for pattern in patterns:
        if re.search(pattern, content, re.DOTALL):
            content = re.sub(pattern, new_breadcrumb, content, flags=re.DOTALL)
            found = True
            break
    
    if not found:
        print(f"⚠️  Breadcrumb 패턴을 찾을 수 없음: {file_path}")
        return False
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ 업데이트 완료: {file_path}")
    return True

def main():
    """메인 실행 함수"""
    print("=" * 60)
    print("Breadcrumb 표준화 시작")
    print("=" * 60)
    
    success_count = 0
    fail_count = 0
    
    for file_path, breadcrumb_items in breadcrumb_map.items():
        if update_breadcrumb(file_path, breadcrumb_items):
            success_count += 1
        else:
            fail_count += 1
    
    print("\n" + "=" * 60)
    print(f"완료: {success_count}개 성공, {fail_count}개 실패")
    print("=" * 60)

if __name__ == '__main__':
    main()
