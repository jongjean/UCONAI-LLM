# 🛡️ Phase 5: Multi-Tenancy & Identity Scaling Development Plan

## **1. 전략적 목표 (Strategic Objectives)**
- **정밀한 식별**: 모든 요청의 발신자를 API Key 단위로 100% 식별.
- **리소스 격리**: 팀(Team) 및 프로젝트(Project) 단위의 논리적 격리벽(Partition) 구축.
- **거버넌스 자동화**: 관리자 개입 없는 사용자 등록 및 키 라이프사이클 관리.
- **외부 연동**: 기업용 레거시 인증 환경(OAuth2, LDAP)과의 결합 기반 마련.

---

## **2. 세부 마일스톤 및 스프린트 계획**

### **🗓️ Sprint 1: Identity & Key Governance (고도화)**
- **M5-1.1: API Key Auth**: 모든 엔드포인트에 `x-api-key` 인증 레이어 적용 (완료).
- **M5-1.2: Key Lifecycle**: API Key의 만료(Expiration), 취소(Revocation), 재발급 로직 구현.
- **M5-1.3: Secure Context**: 실행 엔진(Executor) 내부에서 `user_id` 컨텍스트를 유지하여 파일 작업 시 소유권 확인.

### **🗓️ Sprint 2: Team & Resource Isolation (핵심 공정)**
- **M5-2.1: Tenant Namespace**: `C:\OpenClaw\workspace\{tenant_id}` 형태의 물리적/논리적 폴더 격리.
- **M5-2.2: Group Quotas**: 개인이 아닌 팀 단위의 일일 할당량(Global Team Quota) 적용.
- **M5-2.3: Cross-Tenant Protection**: 타 팀의 파일이나 로그에 접근하려 할 때 즉시 차단하는 인터셉터 구현.

### **🗓️ Sprint 3: Admin Operations & UI (Visibility)**
- **M5-3.1: Admin Registration v2**: 웹 UI 기반의 사용자 생성 및 권한 부여 기능.
- **M5-3.2: Real-time Kill Switch**: 특정 유저나 API Key의 활동을 즉시 중단시키는 긴급 차단 기능.
- **M5-3.3: Cost/Token Analytics**: 사용자 및 프로젝트별 LLM 토큰 소모량 및 비용 추적 시스템.

### **🗓️ Sprint 4: External Identity Bridge (Expansion)**
- **M5-4.1: OAuth2/OIDC Adapter**: Google Workspace, GitHub Enterprise 등과 연동되는 인증 브릿지.
- **M5-4.2: Audit Export**: 감사 로그를 외부 SIEM(Splunk, ELK 등)으로 실시간 스트리밍하는 어댑터 개발.

---

## **3. 데이터 아키텍처 및 보안 레이어**
- **Users Table**: `id, username, api_key, role, team_id, status`
- **Teams Table**: `id, team_name, daily_quota, storage_limit`
- **SecureFS v2**: Team ID 기반의 동적 경로 바인딩 루틴 도입.
