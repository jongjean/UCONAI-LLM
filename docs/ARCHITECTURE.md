# DCP Unified Control Architecture
# Chapter 2-8: 문서화

## 1. 개요
DCP 통합관제 시스템은 11개의 상이한 레거시 및 최신 시스템을 하나의 인터페이스로 통합하여 관리하고, AI(OpenClaw) 기반의 자동 장애 복구 토대를 마련하는 것을 목표로 합니다.

## 2. 레이어 구조 (3-Layer Architecture)

### Layer 1: Intelligent Plane (AI/UI)
- **UCONAI Frontend**: React 기반 웹 인터페이스.
- **OpenClaw (Ollama)**: 현황 분석 및 장애 복구 전략 수립.

### Layer 2: Control Plane (Gateway/Controller)
- **OpenClaw Gateway**: 외부 통신 및 라우팅.
- **Local Controller**: 윈도우 로컬 자원 제어 API (PowerShell 기반).
- **Watchdog**: Controller의 생존을 감시하고 자동 복구.

### Layer 3: Execution Plane (DCP Systems)
- **Core (6개)**: OpenClaw, Infotech, Finger, KED, KWIC, STT.
- **Support (4개)**: NIA, WGear, IMICIH, IIS.

## 3. 핵심 메커니즘
- **런타임 계약서 (`systems.yaml`)**: 모든 시스템의 기동/정지/헬스체크 규약 정의.
- **보안 체계 (RBAC)**: 역할에 따른 차등적 시스템 접근 권한 부여.
- **비밀 관리 (CredMan)**: Windows Credential Manager를 통한 API 토큰 및 비밀번호 보호.
- **운영 자동화 (Orchestration)**: 우선순위에 따른 Start-All / Stop-All 시퀀스.

## 4. 데이터 흐름
1. `Health Check` -> `Local Controller` -> `systems.yaml` 참조 -> `결과 수집`
2. `수집 데이터` -> `ml_data/events/*.jsonl` 저장 (학습용 데이터)
3. `UI/CLI` -> `대시보드 출력`
