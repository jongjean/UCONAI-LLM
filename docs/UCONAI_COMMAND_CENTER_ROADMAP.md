# UCONAI Command Center v1.0 최종 확정 로드맵

## 📅 마일스톤 요약 표 (운영 하드닝 반영)

| 장 (Chapter) | 절 (Section) | 핵심 작업 내용 (Hardening Point) | 예상 시간 | 우선순위 |
|:---:|:---|:---|:---:|:---:|
| **제1장: 통제 기반** | 1.1 DB 스키마 | chat_messages(멱등성) + chat_deliveries + approval_requests | 1h | 🔴 최고 |
| (Chat Bus) | 1.2 WebSocket | 3003 통합 포트 + History Replay(N개) + Team Filtering | 3h | 🔴 최고 |
| | 1.3 TG 브릿지 | Webhook 검증(Secret) + Team-Chat 바인딩 + Rate Limit | 3h | 🔴 최고 |
| | 1.4 Cmd Router | **Auth → C11 → Policy → Job → Audit** 순서 강제 | 2h | 🔴 최고 |
| | 1.5 Approval 동기 | PC ↔ TG 양방향 승인 UI 동기화 (DB SoT) | 2h | 🔴 최고 |
| | 1.6 감사체인 검증 | Chat-Job-Audit-Gov 전 구간 추적성 확보 | 2h | 🔴 최고 |
| **제2장: 관제 지휘** | 2.1 Telemetry API | RSS/Heap/Lag/DB Lock 실시간 지표 (데이터 우선) | 2h | 🟠 높음 |
| (1P 관제창) | 2.2 Alert SSE | 2초 주기 실시간 알림 스트리밍 (alerts, jobs event) | 1h | 🟠 높음 |
| | 2.3 Gov Viz API | Risk/Drift/Fail-safe 상태 산출 모델링 | 2h | 🟠 높음 |
| | 2.4 1P 통합 UI | 탭 프레임워크 + 실시간 위젯 데이터 바인딩 | 3h | 🟠 높음 |
| **제3장: 실행 자동화** | 3.1 Playbook 엔진 | PB_DOC(Low), PB_IMAGE(Med), PB_DEV(High) 3종 고정 | 3h | 🟡 보통 |
| (3P/4P 기능) | 3.2 승인/롤백 | Approval Queue + Rollback Point + 실행 이력 | 3h | 🟡 보통 |
| | 3.3 Model Policy UI | Hot-Reload + 서명 검증 + 모델 정책 편집기 | 2h | 🟡 보통 |
| | 3.4 Context7/Vault | 상태/재빌드/무결성 UI | 2h | 🟡 보통 |
| **제4장: 원격/최적화** | 4.1 SSH 안전 래퍼 | Safe Tools Only (읽기 위주) | 3h | 🟢 낮음 |
| (2P/Hardening) | 4.2 감사 체인 UI | 경영/감사용 무결성 검증 대시보드 | 2h | 🟢 낮음 |
| | 4.3 24H 테스트 | 메모리 누수 점검 및 부하 최적화 | 3h | 🟢 낮음 |

---

## 📂 장별 세부 공정 및 검증 기준 (DoD)

### 제1장: Chat Bus - 단일 지휘체계 (하드닝 집중)

#### 1.1 DB 스키마 및 멱등성
- **idempotency**: `(channel, source_chat_id, source_msg_id)` 유니크 키로 TG 중복 수신 원천 차단.
- **delivery**: `chat_deliveries` 테이블로 TG 발송 실패 시 큐 대기 및 재시도 보장.
- **DoD**: TG로 메시지 전송 실패 시 DB에 `FAILED`로 남고, 수동/자동 재시도가 가능한가?

#### 1.2 WebSocket & 세션 유지
- **Structure**: 3003 포트 통합, `RightDock` 컴포넌트 영구 마운트로 탭 전환 시 연결 유지.
- **DoD**: 탭을 100회 전환해도 WebSocket `onConnect` 로그가 다시 찍히지 않는가?

#### 1.3 Telegram 브릿지 & 컨텍스트 바인딩
- **Binding**: `teams.telegram_chat_id` 기반으로 특정 채팅방의 명령이 소속 팀으로만 흐르도록 강제.
- **DoD**: A팀 채팅방에서 보낸 명령이 B팀의 감사로그나 작업 큐에 절대 나타나지 않는가?

#### 1.4 Command Router & 통제 루프
- **Flow**: 모든 명령은 `C11 Context` 생성 후 거버넌스 승인(C15)을 받아야 `job`으로 승격.
- **DoD**: 거버넌스 엔진을 껐을 때, 채팅 명령이 실행되지 않고 즉시 차단 메시지가 오는가?

---

### 제2장: 1P Dashboard - 데이터 기반 관제

#### 2.1~2.3 데이터 소스 우선순위
- UI 개발 전 API 데이터 형식을 먼저 확정하여 "허전함"을 방지합니다.
- **DoD**: SSE 스트림을 통해 `alert` 이벤트 발생 시 UI 새로고침 없이 로그가 추가되는가?

---

### 제3장: Playbook - 통제된 자동화

#### 3.1 표준 Playbook 3종
- **PB_DOC**: LOW Risk, 승인 생략, 원자적 쓰기.
- **PB_IMAGE**: MED Risk, 예산 체크, 승인 필수.
- **PB_DEV**: HIGH Risk, 원클릭 롤백 스냅샷 강제.
- **DoD**: Playbook 실행 실패 시 30초 내에 이전 파일 상태로 완벽히 복구되는가?

---

### 제4장: 보안 및 안정성 검증

#### 4.3 24H Soak Test
- **Focus**: 메모리 누수, WebSocket 유지력, Telegram API Rate Limit 대응.
- **DoD**: 24시간 가동 후 `RSS` 메모리 증가폭이 시작 시점 대비 10% 이내인가?

---
**Status**: Roadmap_Hardened_v1.0_FINAL // Zero_Failure_Architecture // Ready_to_Build
