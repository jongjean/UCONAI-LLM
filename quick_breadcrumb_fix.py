"""
Breadcrumb 대량 업데이트 - 전체 페이지 일괄 처리
"""

import os, re

# 처리할 파일과 경로 정보
files_data = [
    ('pages/about/ci.html', '학회소개', 'CI·BI'),
    ('pages/about/location.html', '학회소개', '오시는 길'),
    ('pages/organization/executives.html', '학회조직', '임원진'),
    ('pages/organization/committees.html', '학회조직', '위원회'),
    ('pages/organization/divisions.html', '학회조직', '분과학회·연구회'),
    ('pages/member/types.html', '회원안내', '회원 구분'),
    ('pages/member/types-new.html', '회원안내', '회원 구분'),
    ('pages/member/fee.html', '회원안내', '회비 안내'),
    ('pages/member/benefits.html', '회원안내', '회원 혜택'),
    ('pages/member/companies.html', '회원안내', '회원사 소개'),
    ('pages/member/application.html', '회원안내', '회원가입 신청'),
    ('pages/core/forum-new.html', '핵심사업', '월드ESG포럼'),
    ('pages/core/award.html', '핵심사업', '한국ESG대상'),
    ('pages/core/ordinance.html', '핵심사업', '한국ESG조례대상'),
    ('pages/core/seminar.html', '핵심사업', '월요학술세미나'),
    ('pages/core/certification.html', '핵심사업', 'ESG 인증'),
    ('pages/core/consulting.html', '핵심사업', 'ESG 컨설팅'),
    ('pages/core/education.html', '핵심사업', 'ESG 교육'),
    ('pages/journal/about.html', '학술지·논문', '학술지 소개'),
    ('pages/journal/submission.html', '학술지·논문', '논문 투고 안내'),
    ('pages/journal/editorial.html', '학술지·논문', '편집위원회'),
    ('pages/journal/review.html', '학술지·논문', '심사 규정'),
    ('pages/journal/archive.html', '학술지·논문', '논문 아카이브'),
    ('pages/policy/research.html', 'ESG정책·연구', 'ESG 정책 연구'),
    ('pages/policy/standards.html', 'ESG정책·연구', 'ESG 지표·표준'),
    ('pages/policy/law.html', 'ESG정책·연구', '법·제도 분석'),
    ('pages/policy/global.html', 'ESG정책·연구', '국제 ESG 동향'),
    ('pages/policy/reports.html', 'ESG정책·연구', '연구보고서'),
    ('pages/news/main.html', 'ESG뉴스', 'ESG 주요 뉴스'),
    ('pages/news/policy.html', 'ESG뉴스', '정책·입법 동향'),
    ('pages/news/cases.html', 'ESG뉴스', '기업 ESG 사례'),
    ('pages/news/press.html', 'ESG뉴스', '학회 보도자료'),
    ('pages/news/column.html', 'ESG뉴스', '기고·칼럼'),
    ('pages/news/video.html', 'ESG뉴스', '영상 콘텐츠'),
    ('pages/community/notice-new.html', '커뮤니티', '공지사항'),
    ('pages/community/forum.html', '커뮤니티', '자유게시판'),
    ('pages/community/discussion.html', '커뮤니티', '학술·정책 토론'),
    ('pages/community/member-news.html', '커뮤니티', '회원 소식'),
    ('pages/community/qna.html', '커뮤니티', 'Q&A'),
    ('pages/materials/academic.html', '자료실', '학술자료'),
    ('pages/materials/policy.html', '자료실', '정책자료'),
    ('pages/materials/presentation.html', '자료실', '발표자료'),
    ('pages/materials/report.html', '자료실', 'ESG 리포트'),
    ('pages/materials/video.html', '자료실', '영상자료'),
    ('pages/support/guide.html', '후원·기부', '후원 안내'),
    ('pages/support/corporate.html', '후원·기부', '기업 후원'),
    ('pages/support/personal.html', '후원·기부', '개인 기부'),
    ('pages/support/usage.html', '후원·기부', '기부금 사용 내역'),
    ('pages/mypage/payment.html', '마이페이지', '회비 납부'),
    ('pages/mypage/history.html', '마이페이지', '납부 내역'),
    ('pages/mypage/paper.html', '마이페이지', '논문 투고 현황'),
    ('pages/mypage/event.html', '마이페이지', '행사·세미나 신청 내역'),
    ('pages/mypage/certificate.html', '마이페이지', '회원증·증명서'),
]

count = 0
for filepath, section, page in files_data:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        old_pattern = f'<div class="breadcrumb">\\s*<a href="[^"]+"><i class="fas fa-home"></i> 홈</a>\\s*<i class="fas fa-chevron-right"></i>\\s*<a href="#">{re.escape(section)}</a>\\s*<i class="fas fa-chevron-right"></i>\\s*<span class="current">{re.escape(page)}</span>\\s*</div>'
        
        new_breadcrumb = f'''<!-- Breadcrumb Navigation -->
            <nav class="breadcrumb" aria-label="breadcrumb">
                <ol>
                    <li><a href="../../index.html"><i class="fas fa-home"></i> 홈</a></li>
                    <li><a href="#">{section}</a></li>
                    <li class="current" aria-current="page">{page}</li>
                </ol>
            </nav>'''
        
        new_content = re.sub(old_pattern, new_breadcrumb, content, flags=re.DOTALL)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print(f"✅ {filepath}")

print(f"\n총 {count}개 파일 업데이트 완료!")
