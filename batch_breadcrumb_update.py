#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Breadcrumb 일괄 최적화 스크립트 - 간소화 버전
모든 HTML 파일의 Breadcrumb을 자동으로 최적화
"""

import re
from pathlib import Path

# 파일별 Breadcrumb 정보 (섹션명, 페이지명)
FILE_MAPPINGS = {
    # about 섹션
    'pages/about/constitution.html': ('학회소개', '정관·규정'),
    'pages/about/ci.html': ('학회소개', 'CI·BI'),
    'pages/about/location.html': ('학회소개', '오시는 길'),
    'pages/about/greeting.html': ('학회소개', '학회장 인사말'),
    
    # organization 섹션
    'pages/organization/executives.html': ('학회조직', '임원진'),
    'pages/organization/committees.html': ('학회조직', '위원회'),
    'pages/organization/divisions.html': ('학회조직', '분과학회·연구회'),
    
    # member 섹션
    'pages/member/types.html': ('회원안내', '회원 구분'),
    'pages/member/types-new.html': ('회원안내', '회원 구분'),
    'pages/member/fee.html': ('회원안내', '회비 안내'),
    'pages/member/benefits.html': ('회원안내', '회원 혜택'),
    'pages/member/companies.html': ('회원안내', '회원사 소개'),
    'pages/member/application.html': ('회원안내', '회원가입 신청'),
    
    # core 섹션
    'pages/core/forum-new.html': ('핵심사업', '월드ESG포럼'),
    'pages/core/award.html': ('핵심사업', '한국ESG대상'),
    'pages/core/ordinance.html': ('핵심사업', '한국ESG조례대상'),
    'pages/core/seminar.html': ('핵심사업', '월요학술세미나'),
    'pages/core/certification.html': ('핵심사업', 'ESG 인증'),
    'pages/core/consulting.html': ('핵심사업', 'ESG 컨설팅'),
    'pages/core/education.html': ('핵심사업', 'ESG 교육'),
    
    # journal 섹션
    'pages/journal/about.html': ('학술지·논문', '학술지 소개'),
    'pages/journal/submission.html': ('학술지·논문', '논문 투고 안내'),
    'pages/journal/editorial.html': ('학술지·논문', '편집위원회'),
    'pages/journal/review.html': ('학술지·논문', '심사 규정'),
    'pages/journal/archive.html': ('학술지·논문', '논문 아카이브'),
    'pages/journal/editorial-board.html': ('학술지·논문', '편집위원회'),
    'pages/journal/search.html': ('학술지·논문', '논문 검색'),
    
    # policy 섹션
    'pages/policy/research.html': ('ESG정책·연구', 'ESG 정책 연구'),
    'pages/policy/standards.html': ('ESG정책·연구', 'ESG 지표·표준'),
    'pages/policy/law.html': ('ESG정책·연구', '법·제도 분석'),
    'pages/policy/global.html': ('ESG정책·연구', '국제 ESG 동향'),
    'pages/policy/reports.html': ('ESG정책·연구', '연구보고서'),
    
    # news 섹션
    'pages/news/main.html': ('ESG뉴스', 'ESG 주요 뉴스'),
    'pages/news/policy.html': ('ESG뉴스', '정책·입법 동향'),
    'pages/news/cases.html': ('ESG뉴스', '기업 ESG 사례'),
    'pages/news/press.html': ('ESG뉴스', '학회 보도자료'),
    'pages/news/column.html': ('ESG뉴스', '기고·칼럼'),
    'pages/news/video.html': ('ESG뉴스', '영상 콘텐츠'),
    'pages/news/domestic.html': ('ESG뉴스', '국내 뉴스'),
    'pages/news/esg-news-embed.html': ('ESG뉴스', '코리아ESG뉴스'),
    
    # community 섹션
    'pages/community/notice-new.html': ('커뮤니티', '공지사항'),
    'pages/community/forum.html': ('커뮤니티', '자유게시판'),
    'pages/community/discussion.html': ('커뮤니티', '학술·정책 토론'),
    'pages/community/member-news.html': ('커뮤니티', '회원 소식'),
    'pages/community/qna.html': ('커뮤니티', 'Q&A'),
    
    # materials 섹션 (자료실)
    'pages/materials/academic.html': ('자료실', '학술자료'),
    'pages/materials/policy.html': ('자료실', '정책자료'),
    'pages/materials/presentation.html': ('자료실', '발표자료'),
    'pages/materials/report.html': ('자료실', 'ESG 리포트'),
    'pages/materials/video.html': ('자료실', '영상자료'),
    
    # support 섹션
    'pages/support/guide.html': ('후원·기부', '후원 안내'),
    'pages/support/corporate.html': ('후원·기부', '기업 후원'),
    'pages/support/personal.html': ('후원·기부', '개인 기부'),
    'pages/support/usage.html': ('후원·기부', '기부금 사용 내역'),
    
    # mypage 섹션
    'pages/mypage/payment.html': ('마이페이지', '회비 납부'),
    'pages/mypage/history.html': ('마이페이지', '납부 내역'),
    'pages/mypage/paper.html': ('마이페이지', '논문 투고 현황'),
    'pages/mypage/event.html': ('마이페이지', '행사·세미나 신청 내역'),
    'pages/mypage/certificate.html': ('마이페이지', '회원증·증명서'),
}

def optimize_breadcrumb(file_path, section_kr, page_kr):
    """Breadcrumb 최적화"""
    try:
        path = Path(file_path)
        if not path.exists():
            print(f"  ⚠️  파일 없음: {file_path}")
            return False
        
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 패턴 1: <div class="breadcrumb">...</div> 구조
        pattern1 = r'<div class="breadcrumb">\s*<a href="[^"]+"><i class="fas fa-home"></i> 홈</a>\s*<i class="fas fa-chevron-right"></i>\s*<a href="#">' + re.escape(section_kr) + r'</a>\s*<i class="fas fa-chevron-right"></i>\s*<span class="current">' + re.escape(page_kr) + r'</span>\s*</div>'
        
        replacement = f'''<!-- Breadcrumb Navigation -->
            <nav class="breadcrumb" aria-label="breadcrumb">
                <ol>
                    <li><a href="../../index.html"><i class="fas fa-home"></i> 홈</a></li>
                    <li><a href="#">{section_kr}</a></li>
                    <li class="current" aria-current="page">{page_kr}</li>
                </ol>
            </nav>'''
        
        new_content = re.sub(pattern1, replacement, content, flags=re.DOTALL)
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"  ✅ {path.name}")
            return True
        else:
            print(f"  ⏭️  {path.name} (변경없음 또는 이미 최적화됨)")
            return False
            
    except Exception as e:
        print(f"  ❌ {file_path}: {e}")
        return False

def main():
    print("=" * 80)
    print("Breadcrumb 일괄 최적화 스크립트")
    print("=" * 80)
    print()
    
    updated = 0
    skipped = 0
    
    # 섹션별로 그룹화
    sections = {}
    for file_path, (section, page) in FILE_MAPPINGS.items():
        if section not in sections:
            sections[section] = []
        sections[section].append((file_path, section, page))
    
    # 섹션별 처리
    for section, files in sorted(sections.items()):
        print(f"\n📁 [{section}] 섹션 ({len(files)}개 파일)")
        print("-" * 80)
        
        for file_path, section_kr, page_kr in files:
            if optimize_breadcrumb(file_path, section_kr, page_kr):
                updated += 1
            else:
                skipped += 1
    
    print("\n" + "=" * 80)
    print("✅ 최적화 완료!")
    print("=" * 80)
    print(f"✅ 업데이트: {updated}개")
    print(f"⏭️  건너뜀: {skipped}개")
    print(f"📊 총 처리: {len(FILE_MAPPINGS)}개")
    print()

if __name__ == '__main__':
    main()
