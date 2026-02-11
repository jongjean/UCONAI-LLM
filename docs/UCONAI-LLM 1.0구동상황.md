# UCONAI-LLM 1.1 시스템 구동 상황 보고서 (Milestone: Stable v1.1)

**최종 업데이트:** 2026-02-11 14:30 (KST)
**현재 상태:** 💎 **v1.1 완벽 안정화 완료 (Golden State Locked)**


## 1. 포트 정책 (Port Policy)
시스템의 안정성을 위해 다음과 같이 포트 범위를 고정합니다.
- **Controller (Health/Exec):** 18080
- **AI Bridge (Chat/Logic):** 18081
- **Gateway (Infrastructure):** 18082

## 2. 레이어별 상세 가동 현황

### 2.1 화면 계층 (Frontend UI)
- **로컬 경로:** C:\UCONAI-LLM\frontend
- **구동 환경:** Node.js / Vite
- **서비스 포트:** 5173
- **특이사항:** App.tsx 내 모든 API 엔드포인트를 18080/18081로 통일 완료.

### 2.2 데이터 및 제어 계층 (System Controller)
- **로컬 경로:** C:\UCONAI-LLM\scripts\controller\openclaw_controller.ps1
- **서비스 포트:** 18080 (Primary Backend)

### 2.3 지능형 브릿지 계층 (AI Bridge)
- **로컬 경로:** C:\OpenClaw\controller\ai-bridge.js
- **서비스 포트:** 18081 (AI 중계)

### 2.4 인체공학적 게이트웨이 (OpenClaw Gateway)
- **로컬 경로:** C:\Users\user\.openclaw
- **서비스 포트:** 18082 (인프라 제어)

## 3. 핵심 파일 (Core Configs)
- **Wrapper**: C:\UCONAI-LLM\scripts\core\Standard-Wrapper.ps1
- **Config**: C:\UCONAI-LLM\config\scope.yaml
- **Backup**: C:\UCONAI-LLM\backups\Golden_20260211_0612 (포트 변경 전 안정본)


## 4. 즉시 복구 지침 (Recovery Guide)
시스템이 꼬이거나 문제가 생겼을 경우, 다음 단계를 통해 **v1.1 마침표 상태**로 즉시 복원할 수 있습니다.

1.  **복구 스크립트 실행**: `C:\UCONAI-LLM\RECOVERY_v1.1.ps1`을 관리자 권한으로 실행.
2.  **자동 조치 내용**:
    *   기존 프로세스 모두 Kill
    *   `C:\UCONAI-LLM` 내의 소스 및 설정을 백업본(`FINAL_STABLE_v1.1`)으로 완전 교체
    *   18080 포트 컨트롤러 및 프론트엔드 자동 복구
3.  **복구 후**: 브라우저(5173) 새로고침 시 즉시 원상복구 확인 가능.

---
**UCONAI-LLM Ops Team 기록 (2026-02-11):** 
"마침표 도장 찍음. 이 위치는 철저히 검증된 Stable Ground임."
