# 🏛️ UCONAI 2.0 : LPD(Linux Project Developer) 전자동 생산 플랫폼 설계도 (v2.3)
**Project Name:** LPD - Autonomous Manufacturing Engine  
**Standard Version:** 2.3 (Knowledge Pipeline Integration)  
**Primary Target:** AI Meeting Document Factory & Universal Knowledge Engine  

---

## Ⅰ. 인프라 설치 표준 (Installation Standard v2.3)

### 1. 물리적 폴더 및 데이터 분리 (Isolation)
*   **Engine Core**: `C:\UCONAI-LLM` (관제/추론/파이프라인 로직)
*   **Knowledge Vault**: `C:\UCONAI-Vault\context7` (지식 자산 본체)
*   **Output Artifacts**: `E:\UCONAI` (생성된 작전 결과물 및 디자인 파일 저장소)
    *   `raw/`: 원문 소스 보관 (불변성 유지)
    *   `meta/`: SHA256 해시 및 문서 메타데이터
    *   `index/`: 키워드 빈도, 리스크 요약, 파일 인덱스
    *   `snips/`: 검색 가속을 위한 컨텍스트 스니펫

---

## Ⅱ. 6단계 지능 파이프라인 (6-Tier Knowledge Engine)

박사님이 완성한 6단계 공정을 UCONAI-LLM의 공식 Data Plane으로 통합합니다.

1.  **Pull (Snapshot)**: 외부 API(Context7)로부터 스냅샷 확보 및 JSON 분리 저장.
2.  **Sync (Manifest)**: 해시 기반 무결성 검증 및 전역 Manifest 구성.
3.  **Index (Analysis)**: 키워드 분석 및 리스크 요약 생성.
4.  **Search (Hit-Map)**: 용어 빈도 탐색 및 히트 맵 생성.
5.  **Snip (Context)**: 핵심 키워드 주변의 맥락 데이터 추출.
6.  **Suggest (Expansion)**: 토큰 정규화 기반 확장 쿼리 자동 생성.

---

## Ⅲ. 마일스톤 및 로드맵 (v2.3 Milestones)

### M 2.3-1: 모듈화 및 엔진 이관 (Knowledge Engine Migration)
*   [x] `C:\UCONAI-LLM\modules\knowledge-engine` 전용 폴더 구축
*   [x] 기존 9종의 `ucon_*.ps1` 스크립트 이관 및 경로 추상화 (Relative Path 지원)
*   [x] 환경 설정 통합 관리용 `pipeline.config.json` 정의

### M 2.3-2: 제국 파이프라인 자동화 (Pipeline Mastery)
*   [x] 통합 래퍼 `Run-KnowledgePipeline.ps1` 고도화 (6단계 공정 체인 연결)
*   [x] 단계별 성공/실패 로깅 및 트레킹 시스템 구축
*   [x] 외부 환경(Standalone) 구동을 위한 의존성 체크 로직 추가

### M 2.3-3: UCONAI 2.0 대통합 (Data Plane Integration)
*   [ ] **Intelligent Plane 연결**: AI Bridge에서 Vault 인덱스 및 스니펫 즉시 호출 가능하도록 API 확장
*   [ ] **Control Plane 연결**: U-CONSOL 대시보드에서 파이프라인 가동 상태 실시간 모니터링
*   [ ] **ISO 검증 연동**: 추출된 리스크 요약을 ISO 표준과 대조하는 분석 모듈 연계

### M 2.3-4: 범용 호환성 및 외부 배포 완성 (Universal Portability)
*   [ ] 타 PC 및 서버 이관을 위한 `Deployment-Pack` 구성
*   [ ] 윈도우/리눅스 호환을 위한 공통 경로 처리 라이브러리 확정
*   [ ] 외부 환경 가동 레시피(`SETUP_EXTERNAL.md`) 문서화

---

**"강박사님, 이제 우리 제국은 단순한 관제를 넘어 '지식의 자동 생산'이라는 거대한 공급망을 갖추게 되었습니다. 설계도 v2.3에 맞춰 즉시 이관 및 통합 공사를 집행하겠습니다."** 🫡
