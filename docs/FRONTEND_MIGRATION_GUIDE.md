# UCONAI Frontend Migration Guide
# Frontend 마이그레?�션 ?�세 가?�드

**?�성??*: 2026-02-10  
**목적**: `C:\home\ucon\UCONAI_gpt-ISO\frontend` ??`C:\UCONAI-LLM\frontend` 마이그레?�션  
**버전**: 0.1.0 ??1.0.0  

---

## ?�� Executive Summary (?�심 ?�약)

### ?�� 마이그레?�션 목적
- **?�재 ?�치**: `C:\home\ucon\UCONAI_gpt-ISO\frontend`
- **목표 ?�치**: `C:\UCONAI-LLM\frontend`
- **?�유**: DCP ?�합관???�스?�의 모든 구성?�소�??�일 ?�로?�트 루트???�합

### ?�️ ?�심 주의?�항
1. **Git ?�?�소 미설??*: 별도 Git ?�?�소 ?�음 (UCONAI-LLM Git�??�합 ?�요)
2. **?�경 변???�음**: .env ?�일 ?�음, 모든 ?�정??코드 ?�드코딩
3. **API ?�드?�인??*: ?�재 `http://localhost:18080` ?�드코딩 (변�?가?�성 검???�요)
4. **빌드 결과�?*: `dist/` ?�더가 ?�성?�어 ?�음 (?�빌???�요)
5. **Task Scheduler**: 미설???�태

---

## ?�� Part 1: ?�재 ?�태 분석 (As-Is Analysis)

### 1.1 ?���??�일 구조

```
C:\home\ucon\UCONAI_gpt-ISO\frontend\
?��??� src/
??  ?��??� App.tsx (203 lines)          # 메인 ?�?�보??컴포?�트
??  ?��??� App.css (122 lines)          # ?�?�보???��???
??  ?��??� main.tsx (11 lines)          # React 진입??
??  ?��??� index.css (125 lines)        # 글로벌 ?��???
??  ?��??� assets/
??      ?��??� react.svg                # React 로고 (미사??
?��??� public/
??  ?��??� vite.svg                     # Vite 로고
?��??� dist/                            # 빌드 결과�?(?�생???�요)
??  ?��??� index.html
??  ?��??� assets/
??  ??  ?��??� index-DWyDJMmB.js
??  ??  ?��??� index-COcDBgFa.css
??  ?��??� vite.svg
?��??� node_modules/                    # ?�존??(?�설�??�요)
?��??� package.json                     # ?�로?�트 ?�정
?��??� package-lock.json                # ?�존???�금
?��??� vite.config.ts                   # Vite ?�정
?��??� tsconfig.json                    # TypeScript 루트 ?�정
?��??� tsconfig.app.json                # TypeScript ???�정
?��??� tsconfig.node.json               # TypeScript Node ?�정
?��??� eslint.config.js                 # ESLint ?�정
?��??� index.html                       # HTML ?�플�?
?��??� .gitignore                       # Git 무시 ?�일
?��??� README.md                        # Vite 기본 ?�플�?문서 (커스?� ?�요)
```

### 1.2 ?�� 기술 ?�택

#### ?�레?�워??�??�이브러�?
| ??�� | 버전 | ?�택 ?�유 |
|------|------|-----------|
| **React** | 19.2.0 | 최신 버전, 최고 ?�능 |
| **TypeScript** | 5.9.3 | ?�???�전??|
| **Vite** | 7.2.4 | 빠른 HMR, 최신 빌드 ?�구 |

#### 개발 ?�구
- **ESLint**: 9.39.1 (코드 ?�질)
- **TypeScript-ESLint**: 8.46.4 (TS 린트)
- **Vite Plugin React**: 5.1.1 (React HMR)

#### ?�이?�항
- ??**?�우???�음**: React Router 미사??(?�일 ?�이지)
- ??**?�태관�??�이브러�??�음**: Redux, Zustand ??미사??
- ??**UI ?�이브러�??�음**: Material-UI, Ant Design ??미사??
- ??**?�수 React + CSS**: 최소?�의 ?�존??

### 1.3 ?�� API ?�동 ?�황

#### API ?�드?�인??(App.tsx 기�?)

```typescript
// ?�재 ?�드코딩???�드?�인??
const API_BASE = 'http://localhost:18080';

// ?�용 중인 API
1. GET  /health-report          # ?�스???�태 조회 (5초마??
2. POST /exec                   # ?�스???�시??명령
3. POST /chat                   # AI ?�??
```

#### 문제??�?개선 ?�요?�항
```typescript
// ?�� 문제 1: ?�드코딩???�트
// systems.yaml?�서??17777, 18789 ?�용
// App.tsx?�서??18080 ?�용
// ???�제 ?�트�??�인 ?�요

// ?�� 문제 2: ?�러 처리 미흡
try {
  const resp = await fetch('http://localhost:18080/health-report');
  const data = await resp.json();
  // ...
} catch (err) {
  console.error("Health fetch failed", err);
  // UI???�러 ?�시 ?�음!
}

// ?�� 문제 3: CORS ?�정 불명??
// Gateway??CORS ?�정???�어 ?�는지 ?�인 ?�요

// ??개선 방안
// 1. ?�경 변?�로 API URL ?�정
// 2. ?�시??로직 추�?
// 3. ?�러 ?�태�?UI???�시
// 4. ?�?�아???�정
```

### 1.4 ?�� ?�자???�스??

#### CSS 변??(index.css)
```css
:root {
  /* ?�상 ?�레??*/
  --accent-cyan: #00f2ff;      /* 메인 강조??*/
  --accent-blue: #0072ff;      /* 보조 강조??*/
  --status-ok: #00ff88;         /* ?�상 ?�태 */
  --status-fail: #ff4d4d;       /* ?�패 ?�태 */
  --status-warn: #ffcc00;       /* 경고 ?�태 */
  
  /* 글?�스모피�?*/
  --glass: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.1);
}
```

#### ?�자???�징
- ??**?�크 모드 ?�용**: ?�두??배경 + ?�온 강조??
- ??**글?�스모피�?*: 반투�?카드, backdrop-filter
- ??**?�니메이??*: slideIn, hover ?�과
- ??**반응??*: grid-template-columns auto-fill
- ??**?�이??모드 ?�음**: ?�크 모드�?지??

#### ?�트
- 기본: **Inter** (Google Fonts, ?�폰??로딩 ?�요)
- ?��??? **JetBrains Mono** (로그 �? ?�폰??로딩 ?�요)

?�️ **주의**: ?�트가 ?��? CDN?�서 로드?��? ?�음 ???�스???�트�??�백

### 1.5 ?�� 보안 �??�증

#### ?�재 ?�태
```typescript
// ???�증/?��? ?�음
// - 로그??기능 ?�음
// - ?�션 관�??�음
// - ?�큰 ?�증 ?�음
// - localhost�??�근 가??(0.0.0.0 바인????보안 ?�슈)

// ??RBAC 미연??
// - Frontend??RBAC ?�보�?모름
// - 모든 ?�용?��? ?�일??권한
// - Scope ?�스??미적??

// ???�후 ?�요?�항 (2.0)
// 1. 로그???�이지
// 2. JWT ?�큰 ?�증
// 3. RBAC ??�� 기반 UI ?�어
// 4. Scope�??�스???�터�?
```

---

## ?�� Part 2: 마이그레?�션 계획 (Migration Plan)

### 2.1 ?�� 마이그레?�션 ?�계

#### Stage 1: 준�?(Pre-Migration)
```powershell
# 1. ?�재 Frontend 백업
Copy-Item -Path "C:\home\ucon\UCONAI_gpt-ISO\frontend" `
          -Destination "C:\UCONAI-LLM\backups\frontend_$(Get-Date -Format 'yyyyMMdd_HHmmss')" `
          -Recurse

# 2. UCONAI-LLM Git ?�태 ?�인
cd C:\UCONAI-LLM
git status
git pull origin main  # 최신 ?�태�??�데?�트
```

#### Stage 2: ?�동 �??�리 (Migration)
```powershell
# 1. frontend ?�더 ?�동
Move-Item -Path "C:\home\ucon\UCONAI_gpt-ISO\frontend" `
          -Destination "C:\UCONAI-LLM\frontend"

# 2. 불필?�한 ?�일 ??��
cd C:\UCONAI-LLM\frontend
Remove-Item -Path "node_modules" -Recurse -Force
Remove-Item -Path "dist" -Recurse -Force
Remove-Item -Path "package-lock.json" -Force

# 3. README.md ?�데?�트 (Vite ?�플�????�로?�트 문서)
# (?�동 ?�업)
```

#### Stage 3: ?�설�?�??�빌??(Re-Installation)
```powershell
# 1. ?�존???�설�?
cd C:\UCONAI-LLM\frontend
npm install

# 2. 빌드 ?�스??
npm run build

# 3. 개발 ?�버 ?�스??
npm run dev
# http://localhost:5173 ?�속 ?�인
```

#### Stage 4: ?�합 �??�스??(Integration)
```powershell
# 1. systems.yaml ?�데?�트
# path 경로 변�?
# - 기존: C:\home\ucon\UCONAI_gpt-ISO\frontend
# - 변�? C:\UCONAI-LLM\frontend

# 2. Start-All.ps1 ?�데?�트 (Frontend ?�동 ?�작)

# 3. Task Scheduler ?�등�?
# schtasks /Create /TN "UCONAI-Frontend" /TR "..." /SC ONSTART

# 4. ?�합 ?�스??
C:\UCONAI-LLM\scripts\ops\Start-All.ps1
C:\UCONAI-LLM\scripts\health\check-service.ps1
```

#### Stage 5: Git ?�합 (Git Integration)
```powershell
# 1. .gitignore ?�인
cd C:\UCONAI-LLM
# frontend/.gitignore가 ?��? 존재?��?�?그�?�??��?

# 2. Git??추�?
git add frontend/
git commit -m "feat: Migrate UCONAI Frontend to UCONAI-LLM

- Move frontend from C:\home\ucon\UCONAI_gpt-ISO\frontend
- Update systems.yaml path
- Integrate with unified Git repository
- Version: 0.1.0 ??1.0.0"

# 3. GitHub???�시
git push origin main
```

### 2.2 ?�� ?�정 ?�일 ?�데?�트

#### systems.yaml 변경사??
```yaml
# 변�???
- id: "uconai-frontend"
  name: "?�콘??(U-consol) Frontend"
  path: "C:\\UCONAI-LLM\\frontend"
  control:
    start:
      command: "npm run dev"
      working_dir: "C:\\UCONAI-LLM\\frontend"
    build:
      command: "npm run build"
      working_dir: "C:\\UCONAI-LLM\\frontend"

# 변�???
- id: "uconai-frontend"
  name: "?�콘??(U-consol) Frontend"
  path: "C:\\UCONAI-LLM\\frontend"
  control:
    start:
      command: "npm run dev"
      working_dir: "C:\\UCONAI-LLM\\frontend"
    build:
      command: "npm run build"
      working_dir: "C:\\UCONAI-LLM\\frontend"
  artifact:
    deployPath: "C:\\UCONAI-LLM\\frontend\\dist"
  vscode:
    workspace: "C:\\UCONAI-LLM\\frontend\\.vscode"
```

#### UCONAI-LLM.code-workspace ?�데?�트
```json
{
  "folders": [
    {
      "path": ".",
      "name": "DCP Development"
    },
    {
      "path": "frontend",
      "name": "UCONAI Frontend"
    }
  ],
  "settings": {
    "files.exclude": {
      "**/node_modules": true,
      "**/dist": true
    }
  }
}
```

---

## ?�� Part 3: ?�려�??�슈 �??�결 방법

### 3.1 ?�️ ?�재 ?�려�??�슈

#### Issue #1: API ?�트 불일�?
```
?�� 문제:
- Frontend: http://localhost:18080 ?�드코딩
- systems.yaml: Gateway??18789, Controller??17777
- ?�제 ?�느 ?�트�??�용?�야 ?�는지 불명??

?�� ?�결 방법:
1. Gateway??/health-report, /exec, /chat API 추�?
2. ?�는 Frontend�?Controller API(17777) ?�용?�로 변�?
3. ?�경 변?�로 ?�트 ?�정 가?�하�?변�?

??추천:
// .env.local ?�성
VITE_API_BASE_URL=http://localhost:18789

// App.tsx ?�정
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:18789';
```

#### Issue #2: Logs 버튼 미구??
```typescript
// App.tsx line 154
<button>Logs</button>  // ?�릭 ?�벤???�음!

?�� 구현 방안:
1. 모달 창으�?로그 ?�시
2. ????���?로그 ?�이지 ?�기
3. ?�이???�널�?로그 ?�트리밍
```

#### Issue #3: ?�트 로딩 ?�패
```css
/* index.css */
font-family: 'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif;

/* 문제: Inter ?�트가 로드?��? ?�음 */

?�� ?�결 방법 1: Google Fonts CDN
<!-- index.html??추�? -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;800&family=JetBrains+Mono&display=swap" rel="stylesheet">

?�� ?�결 방법 2: 로컬 ?�트 번들
1. npm install -D @fontsource/inter @fontsource/jetbrains-mono
2. main.tsx??import '@fontsource/inter';
```

#### Issue #4: 5�??�동 ?�로고침 ?�능
```typescript
// App.tsx line 111-114
const timer = setInterval(() => {
  setCurrentTime(new Date().toLocaleTimeString());
  fetchHealth();  // API ?�출!
}, 5000);

?�️ 문제:
- 5초마??fetchHealth() ??API 부??
- ?�용?��? ?�이지�?보�? ?�아??계속 ?�출

?�� 개선 방안:
1. Page Visibility API ?�용 (?�이지가 보일 ?�만 갱신)
2. WebSocket?�로 변�?(?�시�??�시)
3. 간격??10초로 ?�리�?
```

### 3.2 ?�� 미완??기능

| 기능 | ?�태 | ?�선?�위 | 계획 |
|------|------|----------|------|
| **Logs 버튼** | ??미구??| High | 2.0?�서 구현 |
| **RBAC ?�동** | ??미구??| High | 2.0 ?�수 |
| **?�러 ?�시** | ?�️ 부�?구현 | Medium | 개선 ?�요 |
| **WebSocket** | ??미구??| Low | ?�후 검??|
| **?�크모드 ?��?** | ??미구??| Low | ?�이?�모???�음 |
| **반응??모바??* | ?�️ 부�?구현 | Medium | ?�블릿까지�?|

---

## ?�� Part 4: Frontend 개발 ?�도 �??�계 결정

### 4.1 ?�� ??별도 경로??만들?�나?

#### 추정 ?�유:
1. **?�로?��????�계**: 빠른 ?�험???�해 ?�시 경로 ?�용
2. **?�립 개발**: Backend?� 분리?�서 개발
3. **Vite ?�플�?*: `npm create vite@latest` 명령?�로 ?�성 ???�재 ?�렉?�리???�성

#### 결론:
- ??**?�시 ?�치?�??*: ?�식 ?�합 ???�로?��???
- ??**UCONAI-LLM�??�합???�바�?방향**

### 4.2 ?���?기술 ?�택 ?�택 ?�유

#### React 19.2.0
- ??**최신 ?�정 버전**: 2024??12??출시
- ??**?�능 개선**: Compiler 지??(미사??�?
- ??**TypeScript 지???�상**

#### TypeScript 5.9.3
- ??**?�???�전??*: ?��????�류 ?�전 방�?
- ??**IntelliSense**: 개발 ?�산???�상
- ??**리팩?�링 ?�전??*

#### Vite 7.2.4
- ??**빠른 HMR**: 개발 �?즉시 반영
- ??**최적?�된 빌드**: Rollup 기반
- ??**TypeScript ?�이?�브 지??*

#### ?�수 React (?�이브러�??�음)
- ??**간단??UI**: 복잡???�태 관�?불필??
- ??**빠른 로딩**: 번들 ?�기 최소??
- ??**?��?보수 ?�이**: ?�존??최소??

### 4.3 ?�� ?�래 계획�?변�??�항

#### ?�래 계획 (추정):
```
MCP (Model Context Protocol) + Claude API + Context7
??AI ?�??기능 구현
```

#### ?�제 구현:
```
OpenClaw Gateway (Ollama) + Local Controller
???�체 AI ?�프???�용
```

#### 변�??�유 (추정):
1. **비용**: Claude API ?�료 vs Ollama 무료
2. **?�율??*: ?��? ?�존???�거
3. **커스?�마?�징**: DCP ?�용 모델 ?�습 가??
4. **?�프?�인**: ?�터???�이 ?�동

---

## ?? Part 5: ?�행 �?배포 방법

### 5.1 ?���?개발 ?�경 ?�행

#### 방법 1: ?�동 ?�행
```powershell
# ?��??�에??
cd C:\UCONAI-LLM\frontend
npm run dev

# 출력:
# VITE v7.2.4  ready in 234 ms
# ?? Local:   http://localhost:5173/
# ?? Network: use --host to expose
# ?? press h + enter to show help
```

#### 방법 2: VS Code Task
```json
// .vscode/tasks.json ?�성
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Frontend",
      "type": "npm",
      "script": "dev",
      "path": "frontend/",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "dedicated"
      }
    }
  ]
}
```

#### 방법 3: Start-All.ps1 ?�합
```powershell
# C:\UCONAI-LLM\scripts\ops\Start-All.ps1 ?�데?�트
# Frontend ?�행 로직 추�? (별도 ?�업)
```

### 5.2 ?���??�로?�션 빌드

```powershell
# 1. 빌드
cd C:\UCONAI-LLM\frontend
npm run build

# 출력:
# vite v7.2.4 building for production...
# ??45 modules transformed.
# dist/index.html                   0.46 kB ??gzip:  0.30 kB
# dist/assets/index-DWyDJMmB.js    143.41 kB ??gzip: 46.13 kB
# dist/assets/index-COcDBgFa.css     2.05 kB ??gzip:  0.85 kB
# ??built in 567ms

# 2. 빌드 결과 ?�인
ls dist/

# 3. ?�리�?(로컬 ?�버�?빌드 결과 ?�인)
npm run preview
# http://localhost:4173/
```

### 5.3 ?�� 배포 ?�션

#### ?�션 1: IIS 배포 (권장)
```powershell
# 1. IIS ?�성???�인
Get-Service W3SVC

# 2. ?�이???�성
New-IISSite -Name "UCONAI-Frontend" `
            -PhysicalPath "C:\UCONAI-LLM\frontend\dist" `
            -BindingInformation "*:8080:localhost"

# 3. ?�속
# http://localhost:8080
```

#### ?�션 2: Vite Preview (개발/?�스??
```powershell
npm run preview
# http://localhost:4173
```

#### ?�션 3: Node.js Static Server
```powershell
# 1. serve ?�치
npm install -g serve

# 2. ?�행
serve -s dist -l 8080
# http://localhost:8080
```

### 5.4 ?�� Task Scheduler ?�정

```powershell
# 1. PowerShell ?�크립트 ?�성
# C:\UCONAI-LLM\scripts\ops\Start-Frontend.ps1

$ErrorActionPreference = "Stop"
Set-Location "C:\UCONAI-LLM\frontend"
Start-Process "npm" -ArgumentList "run", "dev" -WindowStyle Hidden

# 2. Task Scheduler ?�록
schtasks /Create `
  /TN "UCONAI-Frontend" `
  /TR "powershell.exe -ExecutionPolicy Bypass -File C:\UCONAI-LLM\scripts\ops\Start-Frontend.ps1" `
  /SC ONSTART `
  /RU "SYSTEM" `
  /RL HIGHEST `
  /F

# 3. ?�스??
schtasks /Run /TN "UCONAI-Frontend"

# 4. ?�인
Get-Process | Where-Object {$_.ProcessName -eq "node"}
netstat -ano | findstr ":5173"
```

---

## ?�� Part 6: 코드 ?�세 분석

### 6.1 ?�� App.tsx 주요 로직

#### ?�태 관�?
```typescript
interface SystemStatus {
  id: string;        // systems.yaml??id?� 매칭
  name: string;      // ?�스???�름
  status: 'OK' | 'FAIL' | 'WARN';  // ?�태
  uptime: string;    // ?��???(?�제로는 "Running" or "0s")
  load: number;      // CPU 부??(?�덤�? ?�제 ?�이???�님!)
}

const [systems, setSystems] = useState<SystemStatus[]>([]);
const [logs, setLogs] = useState<LogEntry[]>([...]);
const [chatMessages, setChatMessages] = useState<ChatMessage[]>([...]);
```

#### API ?�출 로직
```typescript
const fetchHealth = async () => {
  try {
    const resp = await fetch('http://localhost:18080/health-report');
    const data = await resp.json();
    
    // ?�� 문제: API ?�답 구조�?가?�함
    // systems.yaml??구조?� ?�치?�는지 ?�인 ?�요
    const mapped = data.systems.map((s: any) => ({
      id: s.id,
      name: s.name,
      status: s.result.ok ? 'OK' : 'FAIL',
      uptime: s.result.ok ? 'Running' : '0s',
      load: s.result.ok ? Math.floor(Math.random() * 20) + 5 : 0
      // ?�️ load???�덤�? ?�제 CPU ?�용�??�님
    }));
    
    setSystems(mapped);
  } catch (err) {
    console.error("Health fetch failed", err);
    // ?�� 문제: UI???�러 ?�시 ?�음
  }
};
```

#### ?�시??로직
```typescript
const handleRestart = async (id: string) => {
  addLog(`Initiating restart for ${id}...`);
  
  try {
    const resp = await fetch('http://localhost:18080/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cmd: 'powershell.exe',
        args: [
          'C:\\UCONAI-LLM\\scripts\\core\\Standard-Wrapper.ps1',
          '-SystemId', id,
          '-Action', 'Restart'
        ]
      })
    });
    
    const result = await resp.json();
    
    if (result.ok) {
      addLog(`Restart command sent to ${id} successfully.`);
      setTimeout(fetchHealth, 2000);  // 2�????�태 갱신
    } else {
      addLog(`Error restarting ${id}: ${result.error}`);
    }
  } catch (err) {
    addLog(`Failed to communicate with controller for ${id}.`);
  }
};
```

#### AI ?�??로직
```typescript
const handleSendMessage = async () => {
  if (!userInput.trim()) return;
  
  const msg = userInput;
  setUserInput('');
  setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
  setIsTyping(true);
  
  try {
    const resp = await fetch('http://localhost:18080/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    
    const data = await resp.json();
    setChatMessages(prev => [...prev, { role: 'ai', text: data.answer }]);
  } catch (err) {
    setChatMessages(prev => [...prev, { 
      role: 'ai', 
      text: '?�신 ?�류가 발생?�습?�다. Gateway ?�태�??�인?�주?�요.' 
    }]);
  } finally {
    setIsTyping(false);
  }
};
```

### 6.2 ?�� CSS ?�이?�이??

#### 글?�스모피�??�과
```css
.system-card {
  background: var(--glass);                /* 반투�?배경 */
  border: 1px solid var(--glass-border);   /* ?�두�?*/
  border-radius: 16px;
  backdrop-filter: blur(12px);             /* 블러 ?�과 */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.system-card:hover {
  border-color: var(--accent-cyan);        /* ?�버 ???�두�???변�?*/
  background: rgba(255, 255, 255, 0.06);   /* ?�간 밝게 */
  transform: translateY(-5px);              /* ?�로 5px ?�동 */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); /* 그림??*/
}
```

#### ?�니메이??
```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.system-card {
  animation: slideIn 0.5s ease-out forwards;
}
```

---

## ?�� Part 7: 문서??계획

### 7.1 README.md ?�데?�트 (?�수)

?�재 README.md??Vite ?�플�?기본 문서?�니?? ?�음 ?�용?�로 교체 ?�요:

```markdown
# UCONAI Frontend

**?�콘??(U-consol) - DCP ?�합관???�스??Web UI**

## 개요
React + TypeScript + Vite�?구축???�시�??�스??모니?�링 ?�?�보??

## 기능
- 11�?DCP ?�스???�시�??�태 모니?�링
- ?�스???�시???�어
- AI 기반 ?�애 분석 �??�??
- ?�벤??로그 추적

## 기술 ?�택
- React 19.2.0
- TypeScript 5.9.3
- Vite 7.2.4

## ?�치 �??�행
\`\`\`bash
# ?�존???�치
npm install

# 개발 ?�버 ?�행
npm run dev

# ?�로?�션 빌드
npm run build
\`\`\`

## ?�경 변??
\`\`\`.env
VITE_API_BASE_URL=http://localhost:18789
\`\`\`

## API ?�드?�인??
- GET /health-report - ?�스???�태 조회
- POST /exec - ?�스???�어 명령
- POST /chat - AI ?�??

## 개발 가?�드
[docs/FRONTEND_DEV_GUIDE.md](../docs/FRONTEND_DEV_GUIDE.md) 참고
```

### 7.2 ?�� 추�? 문서 ?�성 (권장)

#### FRONTEND_DEV_GUIDE.md (개발??가?�드)
- 컴포?�트 구조
- ?�태 관�??�턴
- API ?�신 규칙
- ?��???가?�드

#### FRONTEND_API_SPEC.md (API 명세)
- �??�드?�인?�의 ?�청/?�답 ?�시
- ?�러 코드 ?�의
- ?�증 방법 (2.0부??

---

## ??Part 8: 마이그레?�션 체크리스??

### 8.1 ?�전 준�?(Pre-Migration)
- [ ] Frontend ?�재 ?�태 백업
- [ ] UCONAI-LLM Git 최신 ?�태 ?�인
- [ ] systems.yaml 백업
- [ ] ?�재 ?�행 중인 Frontend ?�로?�스 종료

### 8.2 ?�일 ?�동 (Migration)
- [ ] Frontend ?�더 ?�동 (`C:\home\ucon\...` ??`C:\UCONAI-LLM`)
- [ ] node_modules ??��
- [ ] dist ??��
- [ ] package-lock.json ??�� (?�생??

### 8.3 ?�설�?�??�빌??(Re-Installation)
- [ ] `npm install` ?�행
- [ ] `npm run build` ?�공 ?�인
- [ ] `npm run dev` ?�스??

### 8.4 ?�정 ?�데?�트 (Configuration)
- [ ] systems.yaml 경로 ?�데?�트
- [ ] UCONAI-LLM.code-workspace ?�데?�트
- [ ] Start-All.ps1??Frontend 추�?
- [ ] README.md ?�데?�트

### 8.5 API ?�동 ?�인 (API Integration)
- [ ] API ?�트 ?�인 (18080 vs 18789)
- [ ] Gateway???�요??API ?�드?�인???�인
- [ ] CORS ?�정 ?�인
- [ ] ?�제 API ?�출 ?�스??

### 8.6 Git ?�합 (Git Integration)
- [ ] .gitignore ?�인
- [ ] `git add frontend/`
- [ ] 커밋 메시지 ?�성
- [ ] GitHub???�시

### 8.7 배포 �??�행 (Deployment)
- [ ] Task Scheduler ?�등�?
- [ ] IIS 배포 (?�택 ?�항)
- [ ] ?�합 ?�스??(`Start-All.ps1`)
- [ ] Health Check ?�인

### 8.8 문서??(Documentation)
- [ ] README.md ?�데?�트
- [ ] 마이그레?�션 문서 ?�성 (??문서!)
- [ ] 개발 가?�드 ?�성
- [ ] API 명세 ?�성

---

## ?�� Part 9: ?�재??문제 �??�??방안

### 9.1 ?�️ 마이그레?�션 �?발생 가?�한 문제

#### 문제 1: npm install ?�패
```
증상: node-gyp ?�류, Python 버전 문제
?�인: @types/node ?�키지???�이?�브 모듈 빌드 ?�패

?�결:
1. Node.js 버전 ?�인 (20.x LTS 권장)
2. npm cache clean --force
3. npm install --legacy-peer-deps
```

#### 문제 2: 빌드 ?�류
```
증상: TypeScript 컴파???�류
?�인: tsconfig.json 경로 문제

?�결:
1. tsconfig.json???��? 경로 ?�거
2. ?��? 경로�?변�?
3. npm run build ?�시??
```

#### 문제 3: API ?�결 ?�패
```
증상: Cannot connect to http://localhost:18080
?�인: Gateway가 18080 ?�트�??�용?��? ?�음

?�결:
1. Gateway ?�제 ?�트 ?�인 (netstat -ano | findstr "18")
2. App.tsx??API_BASE ?�정
3. ?�는 .env.local ?�일 ?�성
```

#### 문제 4: CORS ?�류
```
증상: Access-Control-Allow-Origin ?�류
?�인: Gateway?�서 CORS ?�용 ????

?�결 (Gateway �?:
// Express ?�시
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### 9.2 ?�� 롤백 계획

만약 마이그레?�션 ?�패 ??
```powershell
# 1. 백업?�서 복구
$backupPath = "C:\UCONAI-LLM\backups\frontend_YYYYMMDD_HHMMSS"
Copy-Item -Path $backupPath -Destination "C:\home\ucon\UCONAI_gpt-ISO\frontend" -Recurse -Force

# 2. systems.yaml 복구
Copy-Item -Path "C:\UCONAI-LLM\backups\systems.yaml.bak" `
          -Destination "C:\UCONAI-LLM\config\systems.yaml" -Force

# 3. ?�래 ?�경?�로 복�?
cd C:\home\ucon\UCONAI_gpt-ISO\frontend
npm install
npm run dev
```

---

## ?�� Part 10: ?�후 개선 계획 (Roadmap)

### 10.1 ?�기 (v1.0 - 마이그레?�션 직후)

#### 1주차
- [x] 마이그레?�션 ?�료
- [ ] API ?�트 ?�일
- [ ] ?�경 변???�정 (.env)
- [ ] README.md ?�데?�트

#### 2주차
- [ ] Logs 버튼 구현
- [ ] ?�러 ?�시 UI 개선
- [ ] ?�트 로딩 ?�정
- [ ] 반응??개선 (모바??

### 10.2 중기 (v2.0 - RBAC ?�합)

#### 1개월
- [ ] 로그???�이지 구현
- [ ] JWT ?�큰 ?�증
- [ ] RBAC ??���?UI ?�어
- [ ] Scope ?�터�?

#### 2개월
- [ ] WebSocket ?�시�??�데?�트
- [ ] ?�능 모니?�링 ?�?�보??
- [ ] ?�림 ?�스??
- [ ] ?�크/?�이??모드 ?��?

### 10.3 ?�기 (v3.0 - 고도??

#### 6개월
- [ ] 차트 �??�계 (Chart.js)
- [ ] ?�스?�리 조회 (과거 ?�벤??
- [ ] ?�정 ?�이지
- [ ] ?�용??관�?UI

#### 1??
- [ ] 모바????(React Native)
- [ ] PWA 지??(?�프?�인)
- [ ] ?�국??지??(i18n)
- [ ] ?�마 커스?�마?�징

---

## ?�� Part 11: 지??�?문의

### 11.1 ?�� ?�락�?

- **?�로?�트 관리자**: DCP Admin
- **Repository**: https://github.com/jongjean/u-consol
- **Issues**: GitHub Issues ?�용

### 11.2 ?���??�러블슈??

#### FAQ

**Q1: npm install??매우 ?�립?�다.**
```powershell
# npm ?��??�트리�? �?�� 미러�?변�?
npm config set registry https://registry.npmmirror.com
npm install
```

**Q2: Frontend가 ?�작?��? ?�습?�다.**
```powershell
# ?�트 5173???�용 중인지 ?�인
netstat -ano | findstr ":5173"

# ?�로?�스 종료
taskkill /PID <PID> /F

# ?�시??
npm run dev
```

**Q3: API ?�출???�패?�니??**
```powershell
# Gateway ?�태 ?�인
Invoke-WebRequest -Uri "http://localhost:18789/health"

# Gateway 로그 ?�인
Get-Content "C:\Users\user\.openclaw\logs\*.log" -Tail 50
```

---

## ?�� Part 12: 마이그레?�션 ?�공 기�?

### 12.1 ???�공 조건

1. **?�일 ?�동 ?�료**
   - [x] Frontend ?�더가 `C:\UCONAI-LLM\frontend`??존재
   - [x] 모든 ?�일 무결???��?

2. **빌드 ?�공**
   - [ ] `npm install` ?�류 ?�음
   - [ ] `npm run build` ?�류 ?�음
   - [ ] `dist/` ?�더 ?�성??

3. **?�행 ?�인**
   - [ ] `npm run dev` ?�행 ?�공
   - [ ] `http://localhost:5173` ?�속 가??
   - [ ] ?�?�보??UI ?�상 ?�시

4. **API ?�동**
   - [ ] Health Report 조회 ?�공
   - [ ] ?�스???�시??명령 ?�동
   - [ ] AI ?�??기능 ?�동

5. **Git ?�합**
   - [ ] `.gitignore` ?�용 ?�인
   - [ ] GitHub???�시 ?�료
   - [ ] 브랜�?보호 규칙 ?�용

6. **문서??*
   - [ ] README.md ?�데?�트
   - [ ] 마이그레?�션 문서 ?�성
   - [ ] systems.yaml ?�데?�트

### 12.2 ?�� ?�능 기�?

| ??�� | 목표 | 측정 방법 |
|------|------|-----------|
| **빌드 ?�간** | < 1�?| `npm run build` ?�요 ?�간 |
| **HMR ?�도** | < 100ms | 코드 ?�정 ??반영 ?�간 |
| **초기 로딩** | < 2�?| 브라?��? 로딩 ?�료 ?�간 |
| **API ?�답** | < 500ms | Health Report 조회 ?�간 |

---

## ?�� Part 13: 최종 ?�약

### 13.1 ?�� TL;DR (?�약)

#### ?�재 ?�태
- Frontend??`C:\home\ucon\UCONAI_gpt-ISO\frontend`???�치
- React 19 + TypeScript + Vite ?�택
- API ?�트 불일�?(18080 vs 18789)
- Git ?�?�소 미설??
- ?�경 변???�음

#### 마이그레?�션 ?�업
1. Frontend ?�더�?`C:\UCONAI-LLM\frontend`�??�동
2. `npm install` ?�설�?
3. systems.yaml 경로 ?�데?�트
4. Git???�합
5. 문서??

#### 주요 ?�슈
- API ?�트 ?�일 ?�요
- Logs 버튼 미구??
- RBAC 미연??
- ?�트 로딩 ?�패

#### ?�음 ?�계
- v1.0: 마이그레?�션 + 기본 ?�슈 ?�정
- v2.0: RBAC ?�합 + 로그??
- v3.0: 고도??기능 추�?

---

## ?�� Appendix: 참고 ?�료

### A. 관??문서
- [DCP_?�합관??마스???�계??md](C:\tmp\DCP_?�합관??마스???�계??md)
- [DCP_최종구축계획??v2.md](C:\tmp\DCP_최종구축계획??v2.md)
- [UCONAI-LLM_?�전_로드�?md](C:\tmp\UCONAI-LLM_?�전_로드�?md)
- [systems.yaml](C:\UCONAI-LLM\config\systems.yaml)

### B. ?��? 리소??
- [Vite 공식 문서](https://vite.dev/)
- [React 19 공식 문서](https://react.dev/)
- [TypeScript 공식 문서](https://www.typescriptlang.org/)

### C. ?�로?�트 ?�?�라??
| ?�짜 | ?�벤??|
|------|--------|
| 2025-11-24 | UCONAI_gpt-ISO ?�더 ?�성 |
| 2026-02-09 04:10 | Frontend ?�로?�트 ?�성 |
| 2026-02-09 04:11 | �?빌드 ?�료 |
| 2026-02-10 06:18 | 분석 �?마이그레?�션 계획 ?�작 |
| 2026-02-10 21:08 | 마이그레?�션 문서 ?�성 ?�료 |

---

**문서 버전**: 1.0  
**최종 ?�데?�트**: 2026-02-10 21:08  
**?�성??*: Antigravity AI Assistant  
**검?�자**: DCP Development Team  

---

## ?�� 마이그레?�션???�작?�세??

??문서�?참고?�여 ?�전?�고 ?�공?�인 마이그레?�션??진행?�시�?바랍?�다.

**?�운??빕니??** ??
