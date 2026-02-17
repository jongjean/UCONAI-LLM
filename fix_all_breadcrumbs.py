#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Breadcrumb 통일 스크립트 v2
모든 페이지의 Breadcrumb을 표준 형식으로 통일합니다.
"""

import os
import re

# 페이지별 Breadcrumb 매핑
BREADCRUMB_MAP = {
    # 학회소개
    'pages/about/greeting.html': ('학회소개', '학회장 인사말'),
    'pages/about/greeting-new.html': ('학회소개', '학회장 인사말'),
    'pages/about/purpose.html': ('학회소개', '설립 목적·비전'),
    'pages/about/history.html': ('학회소개', '연혁'),
    'pages/about/constitution.html': ('학회소개', '정관·규정'),
    'pages/about/ci.html': ('학회소개', 'CI·BI'),
    'pages/about/location.html': ('학회소개', '오시는 길'),
    
    # 학회조직
    'pages/organization/executives.html': ('학회조직', '임원진'),
    'pages/organization/committees.html': ('학회조직', '위원회'),
    'pages/organization/divisions.html': ('학회조직', '분과학회·연구회'),
    
    # 회원안내
    'pages/member/types.html': ('회원안내', '회원 구분'),
    'pages/member/types-new.html': ('회원안내', '회원 구분'),
    'pages/member/process.html': ('회원안내', '가입 절차'),
    'pages/member/fee.html': ('회원안내', '회비 안내'),
    'pages/member/benefits.html': ('회원안내', '회원 혜택'),
    'pages/member/companies.html': ('회원안내', '회원사 소개'),
    'pages/member/application.html': ('회원안내', '온라인 가입 신청서'),
    
    # 핵심사업
    'pages/core/forum.html': ('핵심사업', '월드ESG포럼'),
    'pages/core/forum-new.html': ('핵심사업', '월드ESG포럼'),
    'pages/core/award.html': ('핵심사업', '한국ESG대상'),
    'pages/core/ordinance.html': ('핵심사업', '한국ESG조례대상'),
    'pages/core/seminar.html': ('핵심사업', '월요학술세미나'),
    'pages/core/education.html': ('핵심사업', 'ESG 교육'),
    'pages/core/consulting.html': ('핵심사업', 'ESG 컨설팅'),
    'pages/core/certification.html': ('핵심사업', 'ESG 인증'),
    
    # 학술지·논문
    'pages/journal/about.html': ('학술지·논문', '학술지 소개'),
    'pages/journal/archive.html': ('학술지·논문', '논문 아카이브'),
    'pages/journal/editorial.html': ('학술지·논문', '편집위원회'),
    'pages/journal/editorial-board.html': ('학술지·논문', '편집위원'),
    'pages/journal/submission.html': ('학술지·논문', '논문 투고'),
    'pages/journal/review.html': ('학술지·논문', '심사 절차'),
    'pages/journal/search.html': ('학술지·논문', '논문 검색'),
    'pages/journal/dbpia-embed.html': ('학술지·논문', 'DBpia 논문'),
    
    # ESG정책·연구
    'pages/policy/research.html': ('ESG정책·연구', '정책 연구'),
    'pages/policy/standards.html': ('ESG정책·연구', '국제 기준'),
    'pages/policy/law.html': ('ESG정책·연구', '법규·제도'),
    'pages/policy/global.html': ('ESG정책·연구', '글로벌 동향'),
    'pages/policy/reports.html': ('ESG정책·연구', '정책 보고서'),
    
    # ESG뉴스
    'pages/news/main.html': ('ESG뉴스', '뉴스 메인'),
    'pages/news/domestic.html': ('ESG뉴스', '국내 뉴스'),
    'pages/news/policy.html': ('ESG뉴스', '정책 뉴스'),
    'pages/news/cases.html': ('ESG뉴스', '사례·사건'),
    'pages/news/press.html': ('ESG뉴스', '보도자료'),
    'pages/news/column.html': ('ESG뉴스', '칼럼·기고'),
    'pages/news/video.html': ('ESG뉴스', '영상 뉴스'),
    'pages/news/esg-news-embed.html': ('ESG뉴스', 'ESG뉴스'),
    
    # 커뮤니티
    'pages/community/notice.html': ('커뮤니티', '공지사항'),
    'pages/community/notice-new.html': ('커뮤니티', '공지사항'),
    'pages/community/forum.html': ('커뮤니티', '자유게시판'),
    'pages/community/free-board.html': ('커뮤니티', '자유게시판'),
    'pages/community/qna.html': ('커뮤니티', 'Q&A'),
    'pages/community/discussion.html': ('커뮤니티', '토론방'),
    'pages/community/member-news.html': ('커뮤니티', '회원 소식'),
    
    # 자료실
    'pages/materials/academic.html': ('자료실', '학술 자료'),
    'pages/materials/policy.html': ('자료실', '정책 자료'),
    'pages/materials/presentation.html': ('자료실', '발표 자료'),
    'pages/materials/report.html': ('자료실', '보고서'),
    'pages/materials/video.html': ('자료실', '영상 자료'),
    
    # 후원·기부
    'pages/support/guide.html': ('후원·기부', '후원 안내'),
    'pages/support/personal.html': ('후원·기부', '개인 후원'),
    'pages/support/corporate.html': ('후원·기부', '기업 후원'),
    'pages/support/usage.html': ('후원·기부', '후원금 사용내역'),
    
    # 마이페이지
    'pages/mypage/profile.html': ('마이페이지', '내 정보'),
    'pages/mypage/payment.html': ('마이페이지', '결제 내역'),
    'pages/mypage/history.html': ('마이페이지', '활동 내역'),
    'pages/mypage/paper.html': ('마이페이지', '논문 관리'),
    'pages/mypage/event.html': ('마이페이지', '행사 신청'),
    'pages/mypage/certificate.html': ('마이페이지', '증명서 발급'),
}

def create_breadcrumb(category, page_title):
    """표준 Breadcrumb HTML 생성"""
    return f'''    <!-- Breadcrumb -->
    <div class="container">
        <div class="breadcrumb">
            <a href="../../index.html"><i class="fas fa-home"></i> 홈</a>
            <i class="fas fa-chevron-right"></i>
            <a href="#">{category}</a>
            <i class="fas fa-chevron-right"></i>
            <span class="current">{page_title}</span>
        </div>
    </div>'''

def fix_breadcrumb(file_path, category, page_title):
    """파일의 Breadcrumb을 표준 형식으로 수정"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Breadcrumb 패턴 찾기 (여러 변형 지원)
        patterns = [
            # 패턴 1: <!-- Breadcrumb -->부터 </div></div>까지
            r'<!-- Breadcrumb -->.*?</div>\s*</div>',
            # 패턴 2: <nav class="breadcrumb">...</nav>
            r'<nav class="breadcrumb">.*?</nav>',
            # 패턴 3: 컨테이너 안의 breadcrumb div
            r'<div class="container">\s*<div class="breadcrumb">.*?</div>\s*</div>',
        ]
        
        new_breadcrumb = create_breadcrumb(category, page_title)
        
        modified = False
        for pattern in patterns:
            if re.search(pattern, content, re.DOTALL):
                content = re.sub(pattern, new_breadcrumb.strip(), content, count=1, flags=re.DOTALL)
                modified = True
                break
        
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ {file_path} - Breadcrumb 수정 완료")
            return True
        else:
            print(f"⚠️  {file_path} - Breadcrumb 패턴을 찾을 수 없음")
            return False
            
    except Exception as e:
        print(f"❌ {file_path} - 오류: {e}")
        return False

def main():
    """메인 실행 함수"""
    print("=" * 60)
    print("Breadcrumb 통일 작업 시작")
    print("=" * 60)
    
    success_count = 0
    fail_count = 0
    
    for file_path, (category, page_title) in BREADCRUMB_MAP.items():
        if os.path.exists(file_path):
            if fix_breadcrumb(file_path, category, page_title):
                success_count += 1
            else:
                fail_count += 1
        else:
            print(f"⚠️  {file_path} - 파일이 존재하지 않음")
            fail_count += 1
    
    print("\n" + "=" * 60)
    print(f"작업 완료: 성공 {success_count}개, 실패 {fail_count}개")
    print("=" * 60)

if __name__ == "__main__":
    main()
