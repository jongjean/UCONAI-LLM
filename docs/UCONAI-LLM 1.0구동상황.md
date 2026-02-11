# UCONAI-LLM 1.0 시스템 구동 상황 보고서 (v1.2)

**최종 업데이트:** 2026-02-11 14:25 (KST)
**현재 상태:** 정상 가동 중 (Stable - 18080 Port Unified Policy)

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


---
**UCONAI-LLM Ops Team 기록**
