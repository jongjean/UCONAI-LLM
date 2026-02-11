# DCP Git Development Standards V2
# Chapter 2-3: Git 표준화
# Version: 2.0
# Updated: 2026-02-10

## 📋 목차
1. [브랜치 전략](#1-브랜치-전략)
2. [커밋 컨벤션](#2-커밋-컨벤션)
3. [PR/MR 가이드라인](#3-prmr-가이드라인)
4. [보안 가이드라인](#4-보안-가이드라인)
5. [작업 워크플로우](#5-작업-워크플로우)
6. [릴리스 관리](#6-릴리스-관리)
7. [충돌 해결](#7-충돌-해결)

---

## 1. 브랜치 전략

### Git Flow 단순화 전략

| 브랜치 | 용도 | 보호 수준 | 권한 |
|--------|------|-----------|------|
| `main` | 제품 출시 및 배포 (Stable) | 🔒 최상 | Admin만 병합 |
| `develop` | 다음 출시 통합 브랜치 | 🔒 높음 | PR 필수 |
| `feature/*` | 기능 개발 (단기) | - | 담당자 |
| `fix/*` | 긴급 버그 수정 | - | 모든 개발자 |
| `hotfix/*` | 프로덕션 긴급 수정 | 🔒 중간 | Admin 승인 |
| `release/*` | 릴리스 준비 | 🔒 높음 | Admin만 |

### 브랜치 명명 규칙

```bash
# 기능 개발
feature/chapter-2-3-git-standards
feature/dashboard-ui
feature/rbac-integration

# 버그 수정
fix/controller-port-binding
fix/watchdog-task-error
fix/health-check-timeout

# 긴급 수정 (main에서 분기)
hotfix/security-patch-1.2.3
hotfix/critical-memory-leak

# 릴리스 (develop에서 분기)
release/v1.0.0
release/v1.1.0-beta
```

**규칙**:
- 소문자만 사용
- 단어는 하이픈(`-`)으로 구분
- Chapter 번호 포함 권장
- 이슈 번호 포함 가능 (`feature/123-user-auth`)

---

## 2. 커밋 컨벤션

### Conventional Commits 기반

#### 기본 형식
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

#### Type (필수)

| Type | 설명 | 예시 |
|------|------|------|
| `feat` | 신규 기능 추가 | feat: Dashboard 실시간 모드 추가 |
| `fix` | 버그 수정 | fix: Controller 포트 바인딩 오류 해결 |
| `docs` | 문서 수정 | docs: RBAC V2 가이드 작성 |
| `style` | 코드 스타일 (기능 변화 없음) | style: Dashboard 들여쓰기 수정 |
| `refactor` | 리팩토링 | refactor: Health Check 로직 개선 |
| `test` | 테스트 추가/수정 | test: Watchdog 단위 테스트 추가 |
| `chore` | 빌드/설정 변경 | chore: .gitignore 업데이트 |
| `perf` | 성능 개선 | perf: Scope 검증 속도 2x 향상 |

#### Scope (선택)

```bash
feat(dashboard): 색상 코딩 추가
fix(watchdog): 무한 루프 해결
docs(chapter-1): Gate 1 보고서 작성
```

**Scope 예시**:
- `dashboard`, `watchdog`, `health-check`
- `rbac`, `scope`, `recovery`
- `chapter-1`, `chapter-2`
- `frontend`, `controller`, `gateway`

#### Subject (제목)

**규칙**:
- 50자 이내
- 명령형 현재 시제 ("추가함" ❌, "추가" ✅)
- 첫 글자 소문자
- 마침표 없음

**좋은 예시**:
```bash
feat: CLI Dashboard 추가
fix: Controller 포트 18082 바인딩 오류 해결
docs: Chapter 2-2 RBAC 강화 완료 보고서
```

**나쁜 예시**:
```bash
Updated files.  ❌ (불명확)
Fixed bug  ❌ (어떤 버그?)
추가했음.  ❌ (명령형 아님)
```

#### Body (본문, 선택)

```bash
feat(watchdog): Scope 기반 자동 복구 추가

Scope.yaml의 manage 영역에 있는 시스템만 자동 복구 수행.
observe와 deny 영역은 자동 복구 대상에서 제외하여 안전성 확보.

- manage: 7개 시스템 자동 복구 가능
- observe: 읽기 전용, 복구 불가
- deny: 절대 접근 불가
```

#### Footer (푸터, 선택)

```bash
fix(controller): 포트 바인딩 오류 해결

포트 17777과 18082를 동시 바인딩하도록 수정.
부팅 시 자동 시작 안정성 향상.

Fixes #123
Closes #456
BREAKING CHANGE: 포트 설정 변경 필요
```

**Footer 키워드**:
- `Fixes #123`: 이슈 수정
- `Closes #456`: 이슈 종료
- `Refs #789`: 참조
- `BREAKING CHANGE`: 호환성 깨지는 변경

### 커밋 메시지 예시 (Chapter 1 완료)

```bash
feat: Chapter 1 완료 - 관제 기반 구축

[Chapter 1-0] 운영 안전망 구축
- scope.yaml: 12개 시스템 분류 (Manage/Observe/Deny)
- Validate-Scope.ps1: 정합성 검증
- SCOPE_POLICY.md: 400 lines 운영 가이드

[Chapter 1-3] Controller 서비스화
- Task Scheduler 통합
- Install-DCP-Controller.ps1

[Chapter 1-4] Watchdog Monitor
- Watchdog-Monitor.ps1: 5분 주기 자동 감시
- Scope 기반 자동 복구

[Chapter 1-5] Health Check V2
- health-all.ps1 완전 재작성
- Scope 통합, 자동 복구

[Chapter 1-6] CLI Dashboard
- Dashboard.ps1: 실시간 터미널 UI
- 색상 코딩, Scope 표시

[Chapter 1-7] Gate 1 검증
- GATE_1_VERIFICATION.md
- 82/100 조건부 통과

완성율: 1.3% → 7.0% (+5.7%p)
파일: 21개 (생성 18 + 수정 3)
라인: 5,700+
Gate 1: PASSED (82점)

다음: Chapter 2-1 (VS Code 통합)

BREAKING CHANGE: health-all.ps1 V2 재작성으로 기존 스크립트 호환 불가

Co-authored-by: Antigravity AI <ai@deepmind>
```

---

## 3. PR/MR 가이드라인

### Pull Request 프로세스

#### 1. PR 생성 전 체크리스트

- [ ] 로컬 테스트 완료
- [ ] 코드 린트 통과
- [ ] 커밋 메시지 규칙 준수
- [ ] 충돌 없음
- [ ] `.gitignore` 확인 (비밀정보 없음)

#### 2. PR 제목 규칙

```
[Chapter X-Y] 제목 - 핵심 내용

예시:
[Chapter 1] 관제 기반 구축 - Scope + Watchdog + Dashboard
[Chapter 2-2] RBAC 강화 - Scope 연동 및 이중 보안
[Hotfix] Controller 포트 바인딩 긴급 수정
```

#### 3. PR 템플릿

```markdown
## 📋 작업 내용

### 완료된 Chapter
- Chapter X-Y: 제목

### 주요 변경사항
- 기능 1
- 기능 2
- 기능 3

## ✅ 체크리스트

- [ ] 로컬 테스트 완료
- [ ] 문서 업데이트 완료
- [ ] 커밋 메시지 규칙 준수
- [ ] 충돌 해결 완료

## 📊 테스트 결과

```
테스트 명령어: powershell -File test.ps1
결과: PASSED
```

## 📝 참고사항

(특이사항, 주의사항, 추가 설명 등)

## 🔗 관련 이슈

Fixes #123
Refs #456
```

#### 4. 리뷰 규칙

- **필수 승인자**: 1명 이상 (Chapter 완료는 2명)
- **리뷰 기한**: 24시간 이내
- **변경 요청**: 명확한 이유 및 대안 제시

---

## 4. 보안 가이드라인

### 절대 커밋 금지 항목

1. **비밀번호 및 토큰**
   ```bash
   # ❌ 금지
   api_key = "sk-1234567890abcdef"
   password = "mySecretPass123"
   
   # ✅ 허용
   api_key = "${CRED:openai-api-key}"
   password = "${ENV:DB_PASSWORD}"
   ```

2. **개인 정보**
   - 이메일, 전화번호, 주소
   - 실명 (공개 승인 제외)
   - 내부 IP 주소

3. **로컬 설정 파일**
   ```bash
   # .gitignore에 필수 추가
   *.local
   *.env
   .env.*
   config/local.yaml
   secrets/
   credentials/
   ```

### .gitignore 표준

```gitignore
# DCP 표준 .gitignore

# ============================================================
# OS 생성 파일
# ============================================================
Thumbs.db
.DS_Store
desktop.ini

# ============================================================
# 개발 환경
# ============================================================
.vscode/
.idea/
*.swp
*.swo
*~

# ============================================================
# 빌드 결과물
# ============================================================
node_modules/
dist/
build/
*.exe
*.dll
*.so

# ============================================================
# 로그 및 임시 파일
# ============================================================
logs/
*.log
tmp/
temp/
*.tmp

# ============================================================
# 보안 관련 (중요!)
# ============================================================
*.env
*.env.*
.env.local
config/local.yaml
config/*.local
secrets/
credentials/
*.key
*.pem
*.p12
.ssh/

# ============================================================
# DCP 특화
# ============================================================
backups/
C:\OpenClaw\logs/
```

### 비밀 정보 누출 시 대응

1. **즉시 중단**: 더 이상 커밋하지 않음
2. **비밀 무효화**: API 키/토큰 즉시 재발급
3. **히스토리 정리**: `git filter-branch` 또는 `BFG Repo-Cleaner`
4. **보고**: 관리자에게 즉시 보고
5. **재발 방지**: pre-commit hook 설정

---

## 5. 작업 워크플로우

### 일반 기능 개발

```bash
# 1. develop에서 feature 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b feature/chapter-2-3-git-standards

# 2. 작업 수행
# ... 코딩 ...

# 3. 커밋
git add .
git commit -m "feat(git): GIT_STANDARDS.md V2 작성"

# 4. 원격 푸시
git push origin feature/chapter-2-3-git-standards

# 5. PR 생성 (GitHub/GitLab)
# develop <- feature/chapter-2-3-git-standards

# 6. 리뷰 및 승인 후 병합
git checkout develop
git pull origin develop

# 7. feature 브랜치 삭제
git branch -d feature/chapter-2-3-git-standards
```

### 긴급 수정 (Hotfix)

```bash
# 1. main에서 hotfix 브랜치 생성
git checkout main
git pull origin main
git checkout -b hotfix/controller-port-binding

# 2. 수정 및 커밋
git commit -m "fix(controller): 포트 18082 바인딩 오류 긴급 수정"

# 3. main과 develop 모두에 병합
git checkout main
git merge --no-ff hotfix/controller-port-binding
git push origin main

git checkout develop
git merge --no-ff hotfix/controller-port-binding
git push origin develop

# 4. hotfix 브랜치 삭제
git branch -d hotfix/controller-port-binding
```

---

## 6. 릴리스 관리

### Release 브랜치

```bash
# 1. develop에서 release 브랜치 생성
git checkout develop
git checkout -b release/v1.0.0

# 2. 버전 번호 업데이트
# - README.md
# - package.json
# - metadata.yaml

# 3. 최종 테스트 및 버그 수정

# 4. main과 develop에 병합
git checkout main
git merge --no-ff release/v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0 - Chapter 1 완료"
git push origin main --tags

git checkout develop
git merge --no-ff release/v1.0.0
git push origin develop

# 5. release 브랜치 삭제
git branch -d release/v1.0.0
```

### 버전 태그 규칙

**Semantic Versioning (SemVer)**:
```
v<MAJOR>.<MINOR>.<PATCH>

예시:
v1.0.0  - 첫 정식 릴리스
v1.1.0  - 기능 추가
v1.1.1  - 버그 수정
v2.0.0  - 호환성 깨지는 변경
```

**태그 메시지**:
```bash
git tag -a v1.0.0 -m "Release v1.0.0 - UCONAI-LLM Chapter 1 완료

주요 기능:
- Scope 기반 안전망
- Watchdog 자동 감시
- CLI Dashboard
- Gate 1 통과 (82점)

완성율: 7.0%
"
```

---

## 7. 충돌 해결

### 충돌 발생 시

```bash
# 1. develop 최신 상태로 업데이트
git checkout develop
git pull origin develop

# 2. feature 브랜치로 돌아가서 rebase
git checkout feature/my-feature
git rebase develop

# 3. 충돌 파일 확인
git status

# 4. 충돌 해결 (수동 편집)
# <<<<<<< HEAD
# 나의 변경
# =======
# 다른 사람의 변경
# >>>>>>> develop

# 5. 해결 후 계속
git add <충돌파일>
git rebase --continue

# 6. 강제 푸시 (rebase 후 필수)
git push origin feature/my-feature --force-with-lease
```

### 충돌 예방

1. **자주 pull**: `git pull origin develop` 매일 아침
2. **작은 단위**: feature 브랜치 수명 짧게 (1-3일)
3. **의사소통**: 같은 파일 작업 시 사전 조율

---

## 8. 유용한 Git 명령어

### 히스토리 조회

```bash
# 로그 보기 (예쁘게)
git log --oneline --graph --all --decorate

# 특정 파일 변경 이력
git log -p <파일명>

# 커밋 통계
git shortlog -sn
```

### 변경 취소

```bash
# 마지막 커밋 메시지 수정
git commit --amend

# 스테이징 취소
git reset HEAD <파일>

# 작업 디렉토리 변경 취소
git checkout -- <파일>

# 커밋 되돌리기 (이력 유지)
git revert <commit-hash>
```

### 브랜치 관리

```bash
# 로컬 브랜치 목록
git branch

# 원격 브랜치 포함
git branch -a

# 병합된 브랜치 삭제
git branch --merged | grep -v "\\*\\|main\\|develop" | xargs -n 1 git branch -d
```

---

## 9. Chapter별 커밋 권장사항

| Chapter | 커밋 주기 | PR 크기 |
|---------|-----------|---------|
| Chapter 1-X | 하위 Chapter 완료 시 | 소형 (1-5 파일) |
| Gate X | Gate 통과 시 | 대형 (전체) |
| Hotfix | 즉시 | 초소형 (1-2 파일) |

---

## ✅ Git 표준 체크리스트

### 커밋 전
- [ ] `.gitignore` 확인
- [ ] 비밀정보 제거
- [ ] 커밋 메시지 규칙 준수
- [ ] 로컬 테스트 통과

### PR 전
- [ ] `develop` 브랜치와 동기화
- [ ] 충돌 해결 완료
- [ ] PR 템플릿 작성
- [ ] 리뷰어 지정

### 병합 전
- [ ] 리뷰 승인 완료
- [ ] CI/CD 통과 (구축 후)
- [ ] 최종 테스트 확인

---

**버전**: V2.0  
**업데이트**: 2026-02-10  
**작성자**: DCP Admin  
**다음 업데이트**: Chapter 2-6 CI/CD 시
