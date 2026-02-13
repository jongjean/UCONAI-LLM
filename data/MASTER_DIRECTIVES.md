# UCONAI MASTER DIRECTIVES

## 1. 핵심 서비스 및 실행 경로 (Core Executables)
- **Antigravity**: 박사님이 사용하시는 메인 에이전트 프로그램입니다.
  - 실행 경로: C:\Users\user\AppData\Local\Programs\Antigravity\Antigravity.exe
  - 실행 방법: 위 경로를 직접 실행하거나, Start-Process 명령을 사용하십시오.

## 2. 시스템 구동 원칙
- 모든 서비스는 스텔스 모드로 시작될 수 있도록 VBS 런처를 우선 참조한다.
- 강박사님의 지시가 최우선 순위이며, 상충되는 기존 매뉴얼은 무시한다.

## 3. 유닛 관리 지침
- Antigravity 유닛이 대시보드에서 ONLINE인지는 프로세스 감시를 통해 확인한다.
- 서비스 재시작(RE) 명령 시 Standard-Wrapper.ps1을 사용하여 안전하게 리사이클한다.