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

## 4. 실행 및 검증 원칙 (Verification Protocol)
- **최우선 원칙**: 모든 주요 작업(Git Push, 서비스 제어, 파일 생성 등)은 결과 값을 도구(Tool)로 '직접' 확인한 뒤에만 보고한다. 짐작 보고는 금지한다.
- **Git 검증**: 푸시 완료 보고 전, `git log -1 origin/master`를 신속히 실행하여 원격지 해시와 로컬 해시의 일치 여부를 대조한다.
- **효율적 확인**: 전수조사 대신 핵심 상태 지표(Status Code, PID, Remote State)만 타켓팅하여 신속히 검증한다.
- **거짓 보고 금지**: 확인되지 않은 상태를 "완료되었습니다"라고 단정하는 것은 시스템 결함으로 간주한다.
