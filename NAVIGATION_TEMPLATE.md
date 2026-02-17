# 전체 페이지 드롭다운 네비게이션 템플릿

## 📋 작업 진행 상황

### ✅ 완료된 파일 (3개)
1. pages/about/purpose.html ✅
2. pages/about/history.html ✅
3. pages/about/greeting.html ✅ (이미 완료됨)

### 🔄 진행 중 - pages/about/ (4개 남음)
- [ ] pages/about/constitution.html
- [ ] pages/about/ci.html
- [ ] pages/about/location.html
- [ ] pages/about/greeting-new.html (이미 완료됨)

### ⏳ 대기 중 - 다른 섹션 (60개)

#### pages/organization/ (3개)
- [ ] pages/organization/executives.html
- [ ] pages/organization/committees.html
- [ ] pages/organization/divisions.html

#### pages/member/ (6개)
- [ ] pages/member/types-new.html (이미 완료됨?)
- [ ] pages/member/process.html
- [ ] pages/member/fee.html
- [ ] pages/member/benefits.html
- [ ] pages/member/companies.html
- [ ] pages/member/types.html

#### pages/core/ (8개)
- [ ] pages/core/forum-new.html (이미 완료됨?)
- [ ] pages/core/award.html
- [ ] pages/core/ordinance.html
- [ ] pages/core/seminar.html
- [ ] pages/core/forum.html
- [ ] pages/core/education.html
- [ ] pages/core/consulting.html
- [ ] pages/core/certification.html

#### pages/journal/ (6개)
- [ ] pages/journal/about.html
- [ ] pages/journal/submission.html
- [ ] pages/journal/editorial.html
- [ ] pages/journal/review.html
- [ ] pages/journal/archive.html
- [ ] pages/journal/dbpia-embed.html

#### pages/policy/ (5개)
- [ ] pages/policy/research.html
- [ ] pages/policy/standards.html
- [ ] pages/policy/law.html
- [ ] pages/policy/global.html
- [ ] pages/policy/reports.html

#### pages/news/ (7개)
- [ ] pages/news/main.html
- [ ] pages/news/policy.html
- [ ] pages/news/cases.html
- [ ] pages/news/press.html
- [ ] pages/news/column.html
- [ ] pages/news/video.html
- [ ] pages/news/esg-news-embed.html

#### pages/community/ (5개)
- [ ] pages/community/notice.html
- [ ] pages/community/forum.html
- [ ] pages/community/discussion.html
- [ ] pages/community/member-news.html
- [ ] pages/community/qna.html
- [ ] pages/community/notice-new.html (이미 완료됨?)

#### pages/materials/ (5개)
- [ ] pages/materials/academic.html
- [ ] pages/materials/policy.html
- [ ] pages/materials/presentation.html
- [ ] pages/materials/report.html
- [ ] pages/materials/video.html

#### pages/support/ (4개)
- [ ] pages/support/guide.html
- [ ] pages/support/corporate.html
- [ ] pages/support/personal.html
- [ ] pages/support/usage.html

#### pages/mypage/ (6개)
- [ ] pages/mypage/profile.html
- [ ] pages/mypage/payment.html
- [ ] pages/mypage/history.html
- [ ] pages/mypage/paper.html
- [ ] pages/mypage/event.html
- [ ] pages/mypage/certificate.html

---

## 📝 업데이트 전략

### 방법 1: 일괄 업데이트 스크립트 (빠름, 67개 파일)
- 장점: 가장 빠르고 효율적
- 단점: 에러 발생 시 디버깅 어려움
- 파일: `update_navigation.py` (이미 생성됨)

### 방법 2: 섹션별 수동 업데이트 (안정적, 11개 섹션)
- 장점: 안정적, 각 섹션별 검증 가능
- 단점: 시간이 많이 소요됨
- 현재 진행 중

### 방법 3: 템플릿 파일 생성 + 복사 (추천)
- 장점: 빠르고 안정적
- 단점: 수작업 필요
- 템플릿 파일을 각 섹션에 맞게 생성

---

## 🎯 추천 방법

**섹션별로 대표 파일 1개를 먼저 완전히 업데이트하고, 같은 폴더의 다른 파일들은 그 템플릿을 기반으로 빠르게 적용**

### 대표 파일 목록 (11개)
1. ✅ pages/about/purpose.html (완료)
2. pages/organization/executives.html
3. pages/member/process.html
4. pages/core/award.html
5. pages/journal/about.html
6. pages/policy/research.html
7. pages/news/main.html
8. pages/community/notice.html
9. pages/materials/academic.html
10. pages/support/guide.html
11. pages/mypage/profile.html

---

## 📌 다음 단계

1. **pages/about/** 폴더의 나머지 4개 파일 완료
2. **나머지 10개 섹션**의 대표 파일 1개씩 업데이트
3. **전체 테스트** 및 검증
4. **최종 보고서** 작성
