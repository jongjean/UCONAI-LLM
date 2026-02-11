# DCP Unified Control Architecture V2
# 4계층 아키텍처 재정의
# Chapter 2-8: 문서화 (개정판)

**버전**: 2.0  
**작성일**: 2026-02-10  
**기반**: 실무 피드백 반영  
**목적**: Frontend 비핵심화 + Control Plane 강화

---

## 🎯 V1 → V2 주요 변경사항

### V1 (3계층)
```
[Intelligent Plane] - AI/UI
[Control Plane]     - Gateway/Controller
[Execution Plane]   - 11개 DCP 시스템
```
**문제**: Frontend를 Intelligent Plane에 포함 → 핵심으로 오인

### V2 (4계층)
```
[Intelligence Plane] - AI 판단 (OpenClaw, Ollama)
[Control Plane]      - 실행 통제 (Gateway, Controller, Rules)
[View Plane]         - 사용자 인터페이스 (Frontend, CLI, API)
[Execution Plane]    - 실제 시스템 (11개 DCP)
```
**개선**: View를 별도 계층으로 분리 → 비핵심 명확화

---

## 📊 4계층 아키텍처 상세

### Layer 0: Intelligence Plane (AI 두뇌)
**역할**: 판단, 분석, 전략 수립  
**핵심 원칙**: **실행하지 않음, 제안만 함**

#### 구성 요소
1. **OpenClaw AI (Ollama)**
   - 모델: Llama 3 8B, Qwen 3 8B
   - 포트: 11434
   - 역할: 장애 분석, 복구 전략 수립

2. **UCONAI-LLM (도메인 특화)**
   - 모델: dcp-slm-v1-alpha (92% 정확도)
   - 학습 데이터: ml_data/lake (Bronze/Silver/Gold)
   - 역할: DCP 특화 패턴 인식

3. **AI Bridge**
   - 포트: 18081
   - 역할: Frontend ↔ Ollama 중계
   - 특수 기능: `[[RUN:]]`, `[[KILL:]]` 태그 파싱

#### 데이터 흐름
```
사용자 질문
  ↓
AI Bridge (18081)
  ↓
Ollama (11434) → AI 응답 생성
  ↓
태그 파싱 → Controller 호출 (실행 요청)
  ↓
결과 반환
```

---

### Layer 1: Control Plane (제어 핵심)
**역할**: 실행 통제, 정책 적용, 안전 검증  
**핵심 원칙**: **판단의 결과를 안전하게 실행**

이것이 **진짜 핵심**입니다. UI가 없어도, AI가 없어도, 이것만 있으면 시스템 운영 가능.

#### 구성 요소

##### 1. OpenClaw Gateway
- **포트**: 18789
- **위치**: `C:\Users\user\.openclaw`
- **역할**: 
  - 외부 통신 라우팅
  - 요청 검증 (RBAC)
  - 로그 수집

##### 2. OpenClaw Local Controller
- **포트**: 17777, 18082
- **위치**: `C:\OpenClaw\controller`
- **역할**:
  - Windows 로컬 자원 제어 API
  - 프로세스 실행/종료 (`/exec`, `/kill`)
  - Health Check 엔드포인트

##### 3. 정책 및 규칙 (Policy Engine)
```
config/
  ├── systems.yaml         # 런타임 계약서
  ├── scope.yaml          # 안전 경계 (NEW!)
  ├── recovery_rules.yaml # 자동 복구 규칙
  └── rbac_policy.yaml    # 접근 제어
```

##### 4. Watchdog
- **역할**: Controller 생존 감시
- **주기**: 5분마다 체크
- **복구**: Controller 정지 시 자동 재시작

#### Control Plane의 핵심 메커니즘

**3단계 검증**:
```
1. RBAC 검증
   → "이 사용자가 이 작업을 할 권한이 있는가?"
   
2. Scope 검증
   → "이 경로/시스템이 제어 가능한 영역인가?"
   
3. Recovery Rules 검증
   → "이 상황에서 이 액션이 적절한가?"
```

**모두 통과** → 실행  
**하나라도 실패** → 거부 + 로그

---

### Layer 2: View Plane (사용자 인터페이스)
**역할**: 정보 표시, 사용자 입력 수집  
**핵심 원칙**: **비핵심, 언제든 교체 가능**

이 계층이 완전히 없어져도 **Control Plane은 정상 작동**.

#### 구성 요소

##### 1. UCONAI Frontend (웹 UI) ⭐ 비핵심
- **포트**: 5173 (Vite dev server)
- **위치**: `C:\home\ucon\UCONAI_gpt-ISO\frontend`
- **기술**: React + TypeScript + Vite
- **역할**:
  - 대시보드 (시스템 상태 시각화)
  - AI 채팅 인터페이스
  - 로그 뷰어

**중요**: 빌드 오류가 있어도 프로젝트 블로커 아님!

##### 2. CLI Dashboard (터미널 UI)
- **위치**: `scripts/ops/status-dashboard.ps1`
- **역할**:
  - 터미널 기반 실시간 모니터링
  - Frontend 대체재

##### 3. REST API (프로그래매틱 접근)
- **엔드포인트**: Controller API (17777, 18082)
- **역할**:
  - 외부 시스템 통합
  - 자동화 스크립트 연동

##### 4. Telegram Bot (선택적)
- **미구현** (향후 고려)
- **역할**: 모바일 알림 및 원격 제어

#### View Plane 교체 시나리오
```
시나리오: Frontend 빌드 실패
  ↓
대안 1: CLI Dashboard 사용
대안 2: curl/Postman으로 API 직접 호출
대안 3: PowerShell 스크립트로 제어
  ↓
결론: 운영에 영향 없음 ✅
```

---

### Layer 3: Execution Plane (실제 시스템)
**역할**: DCP 시스템 실행  
**핵심 원칙**: **Control Plane의 명령만 수행**

#### 시스템 분류 (우선순위 기반)

##### 🔴 Core Systems (Priority 8-10)
절대 중단 불가, 자동 복구 필수

1. **OpenClaw Gateway** (Priority 10)
   - Control Plane의 일부이지만 Execution으로도 분류
   
2. **OpenClaw Controller** (Priority 9)
   - 마찬가지로 이중 역할

3. **UCONAI AI Bridge** (Priority 9)
   - Intelligence와 Control 사이 중계

4. **Infotech Monitor** (Priority 8)
   - `C:\infotech\iftNxService`
   - Windows Service: iftExWeb

##### 🟡 Standard Systems (Priority 6-7)
중요하지만 단기 중단 허용

5. **Finger Scraper** (Priority 7)
   - `C:\Finger\FSWSS`
   - SQLite 기반 웹 스크래핑

6. **KED Agent** (Priority 7)
   - `C:\KED\FindAgent`
   - 모니터링 에이전트

7. **KWIC KISS** (Priority 6)
   - `C:\KWIC\KISS`
   - 금융 통합 (자동 복구 비활성)

##### 🟢 Optional Systems (Priority 3-5)
필요에 따라 실행

8. **STT Engine** (Priority 5)
   - `C:\stt`
   - Python venv 기반

9. **IIS Web Server** (Priority 3)
   - `C:\inetpub`
   - 현재 비활성

10-12. **Unknown Systems** (Priority 2-3)
   - NIA Security, WGear, IMICIH
   - 용도 확인 후 재분류

---

## 🔄 데이터 흐름 (전체)

### 시나리오 1: 사용자가 웹 UI에서 시스템 재시작
```
1. 사용자 클릭: "Infotech Monitor 재시작"
   ↓
2. [View Plane] UCONAI Frontend (5173)
   → HTTP POST to AI Bridge (18081)
   
3. [Intelligence Plane] AI Bridge
   → Ollama에 "재시작 방법" 질문
   → "[[RUN:Restart-Service -Name 'iftExWeb']]" 응답
   
4. [Intelligence Plane] AI Bridge 태그 파싱
   → Controller API 호출 (18082/exec)
   
5. [Control Plane] Controller
   → RBAC 체크 (사용자 권한)
   → Scope 체크 (C:\infotech 경로)
   → Recovery Rules 체크
   → 모두 통과 ✅
   
6. [Control Plane] Controller
   → PowerShell 실행: Restart-Service -Name 'iftExWeb'
   
7. [Execution Plane] Infotech Monitor
   → 서비스 재시작
   
8. [Control Plane] Health Check
   → 30초 후 상태 확인
   
9. [View Plane] Frontend 업데이트
   → 상태 "Running" 표시
```

### 시나리오 2: AI 자동 복구 (사용자 개입 없음)
```
1. [Control Plane] Health Check (매분)
   → Infotech Monitor: FAIL
   
2. [Control Plane] Recovery Engine
   → recovery_rules.yaml 확인
   → R003-SERVICE-AUTO-HEAL 매칭
   
3. [Control Plane] Scope 검증
   → C:\infotech: manage 영역 ✅
   → auto_recovery: true ✅
   
4. [Intelligence Plane] AI 판단 (선택적)
   → 단순 재시작은 AI 판단 불필요
   → 복잡한 오류만 AI에 문의
   
5. [Control Plane] 자동 실행
   → Start-Service -Name 'iftExWeb'
   
6. [Execution Plane] 서비스 재시작
   
7. [Control Plane] 검증 및 로그
   → Health Check 재확인
   → ml_data/events/ 기록
   
8. [View Plane] 알림 (선택적)
   → Dashboard에 "자동 복구 완료" 표시
```

---

## 🛡️ 안전 메커니즘 (Layer별)

### Intelligence Plane 안전장치
- AI는 **제안만**, 실행 권한 없음
- 모든 AI 응답은 Control Plane 검증 통과 필요

### Control Plane 안전장치
1. **RBAC** (역할 기반)
   - admin, operator, auditor, uconai-bot
   
2. **Scope** (영역 기반) ⭐ NEW!
   - manage, observe, deny
   
3. **Recovery Rules** (상황 기반)
   - 조건 매칭, cooldown, 재시도 제한

### View Plane 안전장치
- View는 읽기 전용 + 요청 전송만
- 직접 실행 권한 없음

### Execution Plane 안전장치
- 직접 제어 API 없음
- Controller를 통해서만 제어 가능

---

## 📈 우선순위 매트릭스 (계층별)

### 절대 중단 불가 (Tier 1)
```
Control Plane Core:
  - OpenClaw Controller
  - recovery_rules.yaml
  - scope.yaml
  - systems.yaml
```

### 중단 시 복구 필요 (Tier 2)
```
Control Plane Extended:
  - OpenClaw Gateway
  - Watchdog

Execution Plane Core:
  - Infotech Monitor
  - AI Bridge
```

### 중단 허용 (Tier 3)
```
View Plane:
  - UCONAI Frontend (웹 UI)
  - CLI Dashboard

Execution Plane Standard:
  - Finger Scraper
  - KED Agent
```

### 선택적 (Tier 4)
```
Intelligence Plane:
  - AI 분석 (복잡한 오류만)
  
Execution Plane Optional:
  - STT, IIS, Unknown Systems
```

---

## 🔧 계층별 기술 스택

### Intelligence Plane
- **AI 모델**: Ollama (Llama 3, Qwen 3)
- **학습**: Python (PyTorch, Transformers)
- **데이터**: JSONL (Bronze/Silver/Gold)

### Control Plane
- **현재**: PowerShell (24개 스크립트)
- **권장**: Node.js/Python으로 점진 전환
- **설정**: YAML

### View Plane
- **Frontend**: React + TypeScript + Vite
- **CLI**: PowerShell
- **API**: REST (JSON)

### Execution Plane
- **다양함**: 
  - Windows Services (Infotech, IIS)
  - Executables (Finger, KED)
  - Python (STT)
  - DLLs (KWIC)

---

## 📝 설계 원칙 재정의

### V1 원칙 (3축)
```
Operational Stability
Security
Developer Experience
```

### V2 원칙 (5축) ⭐ 확장
```
1. Operational Stability
   → Control Plane이 절대 중단되지 않도록

2. Security
   → RBAC + Scope 이중 검증

3. Developer Experience
   → View Plane 분리로 UI 개발 독립성 확보

4. AI Safety (NEW!)
   → AI는 제안만, 실행은 Control Plane이 검증

5. Graceful Degradation (NEW!)
   → View 없어도 작동
   → AI 없어도 작동
   → 일부 Execution 시스템 없어도 작동
```

---

## 🎯 마이그레이션 가이드 (V1 → V2)

### 인식 변경
```
AS-IS (V1):
  Frontend = Intelligent Plane의 핵심
  Frontend 빌드 실패 = 프로젝트 블로커

TO-BE (V2):
  Frontend = View Plane의 한 구성요소
  Frontend 빌드 실패 = 불편하지만 블로커 아님
```

### systems.yaml 변경
```yaml
# category 추가 (NEW!)
- id: "uconai-frontend"
  category: "view"  # "ai_service" → "view"
  priority: 5       # 9 → 5 (하향)
```

### 우선순위 재조정
```
AS-IS:
1. UCONAI 빌드 오류 해결
2. Controller 서비스화

TO-BE:
1. Controller 서비스화 (Control Plane 강화)
2. UCONAI 빌드 (병렬, View Plane)
```

---

## 🚀 로드맵 업데이트

### Chapter 1: 관제 기반 구축
```
✅ 1-0: 운영 안전망 (scope.yaml)
✅ 1-1: systems.yaml
🔥 1-3: Controller 서비스화 ← 최우선
   1-4: Watchdog
   1-5: Health Check
   1-6: CLI Dashboard
   1-7: Gate 1 검증
   
병렬: 1-2 UCONAI Frontend
```

### Chapter 2: 통합 워크스페이스
```
- View Plane 독립화
- RBAC + Scope 통합 검증
- Git 표준화
```

### Chapter 3: 자동 복구
```
- Recovery Rules 고도화
- AI 판단 루프 통합
- Correlation ID 시스템
```

---

## 📊 아키텍처 다이어그램

```
┌─────────────────────────────────────────────┐
│  Layer 0: Intelligence Plane (AI 두뇌)       │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Ollama  │  │ UCONAI   │  │ AI        │  │
│  │ (11434) │  │ LLM      │  │ Bridge    │  │
│  └─────────┘  └──────────┘  └───────────┘  │
└─────────────────────────────────────────────┘
          ↓ 제안 (실행 권한 없음)
┌─────────────────────────────────────────────┐
│  Layer 1: Control Plane (제어 핵심) 🔥       │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Gateway │  │Controller│  │ Policies  │  │
│  │ (18789) │  │(17777)   │  │ (YAML)    │  │
│  └─────────┘  └──────────┘  └───────────┘  │
│  ┌─────────────────────────────────────┐   │
│  │ RBAC + Scope + Recovery Rules       │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
      ↓ 검증된 명령            ↑ 상태 조회
┌─────────────────────────────────────────────┐
│  Layer 2: View Plane (UI, 비핵심)            │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Web UI  │  │ CLI      │  │ API       │  │
│  │ (5173)  │  │ (PS1)    │  │ (REST)    │  │
│  └─────────┘  └──────────┘  └───────────┘  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Layer 3: Execution Plane (11개 DCP 시스템)  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ Info │ │Finger│ │ KED  │ │ KWIC │  ...  │
│  │ tech │ │      │ │      │ │      │       │
│  └──────┘ └──────┘ └──────┘ └──────┘       │
└─────────────────────────────────────────────┘
```

---

## 🎓 결론

### V2의 핵심 메시지
```
"Control Plane이 모든 것의 중심이다.
 View는 그저 창문일 뿐이다.
 AI는 조언자일 뿐이다.
 실행 시스템은 도구일 뿐이다."
```

### 성공 기준 재정의
```
AS-IS (V1):
  ✅ = Frontend 빌드 성공

TO-BE (V2):
  ✅ = Controller Health Check 통과
      Scope 검증 통과
      Recovery Rules 작동
      
  Frontend는 보너스
```

---

**작성**: DCP Admin  
**검토**: 2026-02-10  
**다음 검토**: 아키텍처 변경 시
