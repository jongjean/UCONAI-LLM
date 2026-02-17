# UCONAI Command Center v1.0 완성 설계서
**엔터프라이즈급 통제형 운영 플랫폼 실현 구축 계획**

---

## 설계 원칙

### 핵심 2가지
1. **우측 고정 채팅/명령 패널의 실시간 동기화** (PC ↔ Telegram)
2. **좌측 탭별 독립 데이터 소스/권한/세션** (안정성 우선)

### 운영 철학
```
Trust but Verify & Control
= 정책 → 승인 → 실행 → 검증 → 감사
(모든 명령이 Command Center에서 실시간 가시화)
```

---

## Part 1: UI 구조

### 레이아웃
```
┌──────────────────────────────────────────────────────────────┐
│  UCONAI Command Center v1.0                     [🔴 LIVE]     │
├───────────────────────────────┬──────────────────────────────┤
│  좌측 2/3 (탭 전환)            │  우측 1/3 (항상 고정)        │
│  ┌─────────────────────────┐  │  ┌────────────────────────┐ │
│  │ [1P][2P][3P][4P] Tabs   │  │  │ 🤖 AI Chat & Command   │ │
│  ├─────────────────────────┤  │  ├────────────────────────┤ │
│  │ 1P: 통합 시스템 관제     │  │  │ Chat History           │ │
│  │ 2P: 리눅스 원격 관제     │  │  │ PC ↔ TG 동기화         │ │
│  │ 3P: Playbook 자동화     │  │  │ > /exec health         │ │
│  │ 4P: AI 설정/정책        │  │  │ [Send] [📱 TG]         │ │
│  └─────────────────────────┘  │  └────────────────────────┘ │
└───────────────────────────────┴──────────────────────────────┘
```

### UX 핵심 요구사항
1. ✅ 탭 전환 시 우측 채팅 끊김 없음 (세션 고정, unmount 금지)
2. ✅ PC Web UI ↔ Telegram 완전 동기화 (같은 대화방 공유)
3. ✅ 모든 명령은 동일한 감사체인 (채널 무관)

---

## Part 2: Telegram 동기화 - Chat Bus 아키텍처

### 구조
```
┌─────────────────────────────────────────────────────────┐
│                    Chat Bus (DB 중심)                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │        chat_messages (단일 진실의 원천)            │  │
│  │  - id, actor_id, team_id, channel (WEB|TG)       │  │
│  │  - text, correlation_id, created_at              │  │
│  └───────────────────────────────────────────────────┘  │
│                     ↑           ↓                        │
│          ┌──────────┴───────────┴──────────┐             │
│    ┌─────▼─────┐                    ┌─────▼─────┐       │
│    │ Web UI    │◄───WebSocket/SSE──│  Server   │       │
│    │ (PC)      │                    │           │       │
│    └───────────┘                    └─────▲─────┘       │
│                                           │             │
│                                     ┌─────▼─────┐       │
│                                     │ Telegram  │       │
│                                     │ Bot API   │       │
└─────────────────────────────────────────────────────────┘
```

### Telegram 사용자 매핑
```sql
ALTER TABLE users ADD COLUMN telegram_user_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN telegram_chat_id TEXT;
```

---

## Part 1: UI 구조 및 레이아웃 (영구 세션 보장)

### 레이아웃 전략
- **RightDock (우측 1/3) 상시 고정**: React/프레임워크 최상단 Layout에 배치하여 탭 전환 시에도 **unmount를 절대 금지**합니다. 이를 통해 WebSocket 재연결로 인한 "끊김"을 원천 차단합니다.
- **좌측 2/3 (Tab 프레임)**: 1P~4P 페이지 라우팅이 독립적으로 작동하며, 각 탭의 데이터 소스는 독립 세션으로 관리합니다.

### 6가지 핵심 의사결정 (D1~D6)
1. **[D1] 포트 통합**: 모든 WS/SSE는 **3003 포트**에 통합하여 단일 인증/팀 격리(C12) 체계를 유지합니다.
2. **[D2] Chat Bus 멱등성**: `source_msg_id`와 `source_chat_id`를 활용하여 TG 중복 수신을 방어하고, `chat_deliveries`로 전송 성공을 보장합니다.
3. **[D3] Team-TG 매핑**: 사용자가 아닌 **팀 채널(`telegram_chat_id`)**을 기준으로 컨텍스트를 바인딩하여 그룹 채팅 내 명령 소속을 명확히 합니다.
4. **[D4] Command Routing 순서**: `/` 명령 수신 시 `Auth → Context 생성(C11) → 정책 승안(C15/C23) → Job 생성 → 실행 → 감사` 순서를 엄격히 준수합니다.
5. **[D5] 원격 명령 보안**: 단순 치환이 아닌 **Allowlist + 정규식 검증** 템플릿 방식을 강제합니다.
6. **[D6] 승인 통합**: `approval_requests`는 DB SoT 기반으로 PC와 TG 양쪽에 동시 전파(Fan-out)됩니다.

---

## Part 2: Hardened Chat Bus 아키텍처

### 데이터베이스 스키마 보강 (v1.0 안정성)

```sql
-- Chat Messages (멱등성 보강)
CREATE TABLE chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    correlation_id TEXT UNIQUE NOT NULL,
    channel TEXT CHECK(channel IN ('WEB', 'TG', 'API')) NOT NULL,
    source_chat_id TEXT,  -- TG chat_id
    source_msg_id TEXT,   -- TG message_id
    actor_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    is_command BOOLEAN DEFAULT 0,
    job_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(channel, source_chat_id, source_msg_id) -- 중복 수신 방지
);

-- Chat Deliveries (전송 보장)
CREATE TABLE chat_deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id INTEGER NOT NULL,
    target_channel TEXT CHECK(target_channel IN ('WEB', 'TG')),
    status TEXT CHECK(status IN ('PENDING', 'SENT', 'FAILED')) DEFAULT 'PENDING',
    retry_count INTEGER DEFAULT 0,
    error_msg TEXT,
    last_attempt_at DATETIME,
    FOREIGN KEY (message_id) REFERENCES chat_messages(id)
);

-- Team-TG Mapping 확장
ALTER TABLE teams ADD COLUMN telegram_chat_id TEXT;
```

### 보안 및 검증
- **Telegram Webhook**: `X-Telegram-Bot-Api-Secret-Token` 헤더를 통한 웹훅 소스 검증을 강제합니다.
- **명시적 Prefix**: `/exec`, `/playbook`, `/approve` 등 Allowlist에 등록된 명령만 실행으로 승격합니다.

---

## Part 3: 좌측 탭 4개 구현 가이드라인

### 1P: 통합 시스템 관제 (SSE 기반)
- **SSE Event Name**: `alerts`, `telemetry`, `jobs`로 구분하여 효율적 리스닝.
- **탭 독립성**: 1P 탭 활성화 시에만 SSE 연결을 유지하여 부하를 최적화합니다.

### 3P: Playbook 자동화 (통제 루프)
- **Write Policy**: 무조건 Sandbox + writeAtomic + 롤백 스냅샷 필수.
- **Approval Sync**: PC에서 승인 요청 시 TG에도 푸시, 어느 한 곳에서 처리되면 양쪽 즉시 반영.

---

## Part 4: 착수 순서 (하드닝 반영)

### Step 1: Command Bus 통합 (핵심)
- **1-A**: DB 멱등성 스키마 및 Team-TG 바인딩 확정.
- **1-B (Inbound)**: TG/WEB → 서버 → DB 적재 (중복 방지 로직 포함).
- **1-C (Outbound)**: DB → TG (`chat_deliveries` 기록) 및 WEB 브로드캐스트.
- **1-D (Routing)**: 슬래시 커맨드 → C11 컨텍스트 생성 → Job 실행 연동.

---

## Part 5: DoD (운영 장애 대응 항목 추가)

- [ ] **멱등성**: TG 재전송/중복 수신 시 메시지 1건만 저장되는가?
- [ ] **전송 보장**: TG 발송 실패 시 `FAILED`로 남고 재시도가 가능한가?
- [ ] **동기화**: WS 재연결 시 최근 N개의 메시지가 Replay(History 복구) 되는가?
- [ ] **세션 유지**: 탭 100회 전환 후에도 RightDock의 WS 연결이 유지되는가?
- [ ] **보안**: TG 웹훅이 Secret Token 없이 접근할 때 차단되는가?

---

## 기술 스택

**Frontend**:
- HTML5 + CSS Grid
- Chart.js
- Monaco Editor
- WebSocket + SSE

**Backend**:
- Node.js (Zero-Dependency)
- SQLite3
- ws (WebSocket)
- node-telegram-bot-api

**Governance**:
- GCore (정책 엔진)
- Arbiter (DSL)
- SecondaryGuard (C23)
- FailSafe (Hybrid)

---

**작성일**: 2026-02-17  
**버전**: v1.0  
**상태**: 설계 완료, 착수 대기
