# UCONAI Frontend Migration Guide
# Frontend ë§ˆì´ê·¸ë ˆ?´ì…˜ ?ì„¸ ê°€?´ë“œ

**?‘ì„±??*: 2026-02-10  
**ëª©ì **: `C:\home\ucon\UCONAI_gpt-ISO\frontend` ??`C:\UCONAI-LLM\frontend` ë§ˆì´ê·¸ë ˆ?´ì…˜  
**ë²„ì „**: 0.1.0 ??1.0.0  

---

## ?“‹ Executive Summary (?µì‹¬ ?”ì•½)

### ?¯ ë§ˆì´ê·¸ë ˆ?´ì…˜ ëª©ì 
- **?„ì¬ ?„ì¹˜**: `C:\home\ucon\UCONAI_gpt-ISO\frontend`
- **ëª©í‘œ ?„ì¹˜**: `C:\UCONAI-LLM\frontend`
- **?´ìœ **: DCP ?µí•©ê´€???œìŠ¤?œì˜ ëª¨ë“  êµ¬ì„±?”ì†Œë¥??¨ì¼ ?„ë¡œ?íŠ¸ ë£¨íŠ¸???µí•©

### ? ï¸ ?µì‹¬ ì£¼ì˜?¬í•­
1. **Git ?€?¥ì†Œ ë¯¸ì„¤??*: ë³„ë„ Git ?€?¥ì†Œ ?†ìŒ (UCONAI-LLM Gitê³??µí•© ?„ìš”)
2. **?˜ê²½ ë³€???†ìŒ**: .env ?Œì¼ ?†ìŒ, ëª¨ë“  ?¤ì •??ì½”ë“œ ?˜ë“œì½”ë”©
3. **API ?”ë“œ?¬ì¸??*: ?„ì¬ `http://localhost:18080` ?˜ë“œì½”ë”© (ë³€ê²?ê°€?¥ì„± ê²€???„ìš”)
4. **ë¹Œë“œ ê²°ê³¼ë¬?*: `dist/` ?´ë”ê°€ ?ì„±?˜ì–´ ?ˆìŒ (?¬ë¹Œ???„ìš”)
5. **Task Scheduler**: ë¯¸ì„¤???íƒœ

---

## ?“Š Part 1: ?„ì¬ ?íƒœ ë¶„ì„ (As-Is Analysis)

### 1.1 ?—‚ï¸??Œì¼ êµ¬ì¡°

```
C:\home\ucon\UCONAI_gpt-ISO\frontend\
?œâ??€ src/
??  ?œâ??€ App.tsx (203 lines)          # ë©”ì¸ ?€?œë³´??ì»´í¬?ŒíŠ¸
??  ?œâ??€ App.css (122 lines)          # ?€?œë³´???¤í???
??  ?œâ??€ main.tsx (11 lines)          # React ì§„ì…??
??  ?œâ??€ index.css (125 lines)        # ê¸€ë¡œë²Œ ?¤í???
??  ?”â??€ assets/
??      ?”â??€ react.svg                # React ë¡œê³  (ë¯¸ì‚¬??
?œâ??€ public/
??  ?”â??€ vite.svg                     # Vite ë¡œê³ 
?œâ??€ dist/                            # ë¹Œë“œ ê²°ê³¼ë¬?(?¬ìƒ???„ìš”)
??  ?œâ??€ index.html
??  ?œâ??€ assets/
??  ??  ?œâ??€ index-DWyDJMmB.js
??  ??  ?”â??€ index-COcDBgFa.css
??  ?”â??€ vite.svg
?œâ??€ node_modules/                    # ?˜ì¡´??(?¬ì„¤ì¹??„ìš”)
?œâ??€ package.json                     # ?„ë¡œ?íŠ¸ ?¤ì •
?œâ??€ package-lock.json                # ?˜ì¡´??? ê¸ˆ
?œâ??€ vite.config.ts                   # Vite ?¤ì •
?œâ??€ tsconfig.json                    # TypeScript ë£¨íŠ¸ ?¤ì •
?œâ??€ tsconfig.app.json                # TypeScript ???¤ì •
?œâ??€ tsconfig.node.json               # TypeScript Node ?¤ì •
?œâ??€ eslint.config.js                 # ESLint ?¤ì •
?œâ??€ index.html                       # HTML ?œí”Œë¦?
?œâ??€ .gitignore                       # Git ë¬´ì‹œ ?Œì¼
?”â??€ README.md                        # Vite ê¸°ë³¸ ?œí”Œë¦?ë¬¸ì„œ (ì»¤ìŠ¤?€ ?„ìš”)
```

### 1.2 ?”§ ê¸°ìˆ  ?¤íƒ

#### ?„ë ˆ?„ì›Œ??ë°??¼ì´ë¸ŒëŸ¬ë¦?
| ??ª© | ë²„ì „ | ? íƒ ?´ìœ  |
|------|------|-----------|
| **React** | 19.2.0 | ìµœì‹  ë²„ì „, ìµœê³  ?±ëŠ¥ |
| **TypeScript** | 5.9.3 | ?€???ˆì „??|
| **Vite** | 7.2.4 | ë¹ ë¥¸ HMR, ìµœì‹  ë¹Œë“œ ?„êµ¬ |

#### ê°œë°œ ?„êµ¬
- **ESLint**: 9.39.1 (ì½”ë“œ ?ˆì§ˆ)
- **TypeScript-ESLint**: 8.46.4 (TS ë¦°íŠ¸)
- **Vite Plugin React**: 5.1.1 (React HMR)

#### ?¹ì´?¬í•­
- ??**?¼ìš°???†ìŒ**: React Router ë¯¸ì‚¬??(?¨ì¼ ?˜ì´ì§€)
- ??**?íƒœê´€ë¦??¼ì´ë¸ŒëŸ¬ë¦??†ìŒ**: Redux, Zustand ??ë¯¸ì‚¬??
- ??**UI ?¼ì´ë¸ŒëŸ¬ë¦??†ìŒ**: Material-UI, Ant Design ??ë¯¸ì‚¬??
- ??**?œìˆ˜ React + CSS**: ìµœì†Œ?œì˜ ?˜ì¡´??

### 1.3 ?“¡ API ?°ë™ ?„í™©

#### API ?”ë“œ?¬ì¸??(App.tsx ê¸°ì?)

```typescript
// ?„ì¬ ?˜ë“œì½”ë”©???”ë“œ?¬ì¸??
const API_BASE = 'http://localhost:18080';

// ?¬ìš© ì¤‘ì¸ API
1. GET  /health-report          # ?œìŠ¤???íƒœ ì¡°íšŒ (5ì´ˆë§ˆ??
2. POST /exec                   # ?œìŠ¤???¬ì‹œ??ëª…ë ¹
3. POST /chat                   # AI ?€??
```

#### ë¬¸ì œ??ë°?ê°œì„  ?„ìš”?¬í•­
```typescript
// ?”´ ë¬¸ì œ 1: ?˜ë“œì½”ë”©???¬íŠ¸
// systems.yaml?ì„œ??17777, 18789 ?¬ìš©
// App.tsx?ì„œ??18080 ?¬ìš©
// ???¤ì œ ?¬íŠ¸ë¥??•ì¸ ?„ìš”

// ?”´ ë¬¸ì œ 2: ?ëŸ¬ ì²˜ë¦¬ ë¯¸í¡
try {
  const resp = await fetch('http://localhost:18080/health-report');
  const data = await resp.json();
  // ...
} catch (err) {
  console.error("Health fetch failed", err);
  // UI???ëŸ¬ ?œì‹œ ?†ìŒ!
}

// ?”´ ë¬¸ì œ 3: CORS ?¤ì • ë¶ˆëª…??
// Gateway??CORS ?¤ì •???˜ì–´ ?ˆëŠ”ì§€ ?•ì¸ ?„ìš”

// ??ê°œì„  ë°©ì•ˆ
// 1. ?˜ê²½ ë³€?˜ë¡œ API URL ?¤ì •
// 2. ?¬ì‹œ??ë¡œì§ ì¶”ê?
// 3. ?ëŸ¬ ?íƒœë¥?UI???œì‹œ
// 4. ?€?„ì•„???¤ì •
```

### 1.4 ?¨ ?”ì???œìŠ¤??

#### CSS ë³€??(index.css)
```css
:root {
  /* ?‰ìƒ ?”ë ˆ??*/
  --accent-cyan: #00f2ff;      /* ë©”ì¸ ê°•ì¡°??*/
  --accent-blue: #0072ff;      /* ë³´ì¡° ê°•ì¡°??*/
  --status-ok: #00ff88;         /* ?•ìƒ ?íƒœ */
  --status-fail: #ff4d4d;       /* ?¤íŒ¨ ?íƒœ */
  --status-warn: #ffcc00;       /* ê²½ê³  ?íƒœ */
  
  /* ê¸€?˜ìŠ¤ëª¨í”¼ì¦?*/
  --glass: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.1);
}
```

#### ?”ì???¹ì§•
- ??**?¤í¬ ëª¨ë“œ ?„ìš©**: ?´ë‘??ë°°ê²½ + ?¤ì˜¨ ê°•ì¡°??
- ??**ê¸€?˜ìŠ¤ëª¨í”¼ì¦?*: ë°˜íˆ¬ëª?ì¹´ë“œ, backdrop-filter
- ??**? ë‹ˆë©”ì´??*: slideIn, hover ?¨ê³¼
- ??**ë°˜ì‘??*: grid-template-columns auto-fill
- ??**?¼ì´??ëª¨ë“œ ?†ìŒ**: ?¤í¬ ëª¨ë“œë§?ì§€??

#### ?°íŠ¸
- ê¸°ë³¸: **Inter** (Google Fonts, ?¹í°??ë¡œë”© ?„ìš”)
- ?°ë??? **JetBrains Mono** (ë¡œê·¸ ì°? ?¹í°??ë¡œë”© ?„ìš”)

? ï¸ **ì£¼ì˜**: ?°íŠ¸ê°€ ?¸ë? CDN?ì„œ ë¡œë“œ?˜ì? ?ŠìŒ ???œìŠ¤???°íŠ¸ë¡??´ë°±

### 1.5 ?” ë³´ì•ˆ ë°??¸ì¦

#### ?„ì¬ ?íƒœ
```typescript
// ???¸ì¦/?¸ê? ?†ìŒ
// - ë¡œê·¸??ê¸°ëŠ¥ ?†ìŒ
// - ?¸ì…˜ ê´€ë¦??†ìŒ
// - ? í° ?¸ì¦ ?†ìŒ
// - localhostë§??‘ê·¼ ê°€??(0.0.0.0 ë°”ì¸????ë³´ì•ˆ ?´ìŠˆ)

// ??RBAC ë¯¸ì—°??
// - Frontend??RBAC ?•ë³´ë¥?ëª¨ë¦„
// - ëª¨ë“  ?¬ìš©?ê? ?™ì¼??ê¶Œí•œ
// - Scope ?œìŠ¤??ë¯¸ì ??

// ???¥í›„ ?„ìš”?¬í•­ (2.0)
// 1. ë¡œê·¸???˜ì´ì§€
// 2. JWT ? í° ?¸ì¦
// 3. RBAC ??•  ê¸°ë°˜ UI ?œì–´
// 4. Scopeë³??œìŠ¤???„í„°ë§?
```

---

## ?”„ Part 2: ë§ˆì´ê·¸ë ˆ?´ì…˜ ê³„íš (Migration Plan)

### 2.1 ?“¦ ë§ˆì´ê·¸ë ˆ?´ì…˜ ?¨ê³„

#### Stage 1: ì¤€ë¹?(Pre-Migration)
```powershell
# 1. ?„ì¬ Frontend ë°±ì—…
Copy-Item -Path "C:\home\ucon\UCONAI_gpt-ISO\frontend" `
          -Destination "C:\UCONAI-LLM\backups\frontend_$(Get-Date -Format 'yyyyMMdd_HHmmss')" `
          -Recurse

# 2. UCONAI-LLM Git ?íƒœ ?•ì¸
cd C:\UCONAI-LLM
git status
git pull origin main  # ìµœì‹  ?íƒœë¡??…ë°?´íŠ¸
```

#### Stage 2: ?´ë™ ë°??•ë¦¬ (Migration)
```powershell
# 1. frontend ?´ë” ?´ë™
Move-Item -Path "C:\home\ucon\UCONAI_gpt-ISO\frontend" `
          -Destination "C:\UCONAI-LLM\frontend"

# 2. ë¶ˆí•„?”í•œ ?Œì¼ ?? œ
cd C:\UCONAI-LLM\frontend
Remove-Item -Path "node_modules" -Recurse -Force
Remove-Item -Path "dist" -Recurse -Force
Remove-Item -Path "package-lock.json" -Force

# 3. README.md ?…ë°?´íŠ¸ (Vite ?œí”Œë¦????„ë¡œ?íŠ¸ ë¬¸ì„œ)
# (?˜ë™ ?‘ì—…)
```

#### Stage 3: ?¬ì„¤ì¹?ë°??¬ë¹Œ??(Re-Installation)
```powershell
# 1. ?˜ì¡´???¬ì„¤ì¹?
cd C:\UCONAI-LLM\frontend
npm install

# 2. ë¹Œë“œ ?ŒìŠ¤??
npm run build

# 3. ê°œë°œ ?œë²„ ?ŒìŠ¤??
npm run dev
# http://localhost:5173 ?‘ì† ?•ì¸
```

#### Stage 4: ?µí•© ë°??ŒìŠ¤??(Integration)
```powershell
# 1. systems.yaml ?…ë°?´íŠ¸
# path ê²½ë¡œ ë³€ê²?
# - ê¸°ì¡´: C:\home\ucon\UCONAI_gpt-ISO\frontend
# - ë³€ê²? C:\UCONAI-LLM\frontend

# 2. Start-All.ps1 ?…ë°?´íŠ¸ (Frontend ?ë™ ?œì‘)

# 3. Task Scheduler ?¬ë“±ë¡?
# schtasks /Create /TN "UCONAI-Frontend" /TR "..." /SC ONSTART

# 4. ?µí•© ?ŒìŠ¤??
C:\UCONAI-LLM\scripts\ops\Start-All.ps1
C:\UCONAI-LLM\scripts\health\check-service.ps1
```

#### Stage 5: Git ?µí•© (Git Integration)
```powershell
# 1. .gitignore ?•ì¸
cd C:\UCONAI-LLM
# frontend/.gitignoreê°€ ?´ë? ì¡´ì¬?˜ë?ë¡?ê·¸ë?ë¡?? ì?

# 2. Git??ì¶”ê?
git add frontend/
git commit -m "feat: Migrate UCONAI Frontend to UCONAI-LLM

- Move frontend from C:\home\ucon\UCONAI_gpt-ISO\frontend
- Update systems.yaml path
- Integrate with unified Git repository
- Version: 0.1.0 ??1.0.0"

# 3. GitHub???¸ì‹œ
git push origin main
```

### 2.2 ?”§ ?¤ì • ?Œì¼ ?…ë°?´íŠ¸

#### systems.yaml ë³€ê²½ì‚¬??
```yaml
# ë³€ê²???
- id: "uconai-frontend"
  name: "? ì½˜??(U-consol) Frontend"
  path: "C:\\home\\ucon\\UCONAI_gpt-ISO\\frontend"
  control:
    start:
      command: "npm run dev"
      working_dir: "C:\\home\\ucon\\UCONAI_gpt-ISO\\frontend"
    build:
      command: "npm run build"
      working_dir: "C:\\home\\ucon\\UCONAI_gpt-ISO\\frontend"

# ë³€ê²???
- id: "uconai-frontend"
  name: "? ì½˜??(U-consol) Frontend"
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

#### UCONAI-LLM.code-workspace ?…ë°?´íŠ¸
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

## ?› Part 3: ?Œë ¤ì§??´ìŠˆ ë°??´ê²° ë°©ë²•

### 3.1 ? ï¸ ?„ì¬ ?Œë ¤ì§??´ìŠˆ

#### Issue #1: API ?¬íŠ¸ ë¶ˆì¼ì¹?
```
?“Œ ë¬¸ì œ:
- Frontend: http://localhost:18080 ?˜ë“œì½”ë”©
- systems.yaml: Gateway??18789, Controller??17777
- ?¤ì œ ?´ëŠ ?¬íŠ¸ë¥??¬ìš©?´ì•¼ ?˜ëŠ”ì§€ ë¶ˆëª…??

?”§ ?´ê²° ë°©ë²•:
1. Gateway??/health-report, /exec, /chat API ì¶”ê?
2. ?ëŠ” Frontendë¥?Controller API(17777) ?¬ìš©?¼ë¡œ ë³€ê²?
3. ?˜ê²½ ë³€?˜ë¡œ ?¬íŠ¸ ?¤ì • ê°€?¥í•˜ê²?ë³€ê²?

??ì¶”ì²œ:
// .env.local ?ì„±
VITE_API_BASE_URL=http://localhost:18789

// App.tsx ?˜ì •
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:18789';
```

#### Issue #2: Logs ë²„íŠ¼ ë¯¸êµ¬??
```typescript
// App.tsx line 154
<button>Logs</button>  // ?´ë¦­ ?´ë²¤???†ìŒ!

?”§ êµ¬í˜„ ë°©ì•ˆ:
1. ëª¨ë‹¬ ì°½ìœ¼ë¡?ë¡œê·¸ ?œì‹œ
2. ????œ¼ë¡?ë¡œê·¸ ?˜ì´ì§€ ?´ê¸°
3. ?¬ì´???¨ë„ë¡?ë¡œê·¸ ?¤íŠ¸ë¦¬ë°
```

#### Issue #3: ?°íŠ¸ ë¡œë”© ?¤íŒ¨
```css
/* index.css */
font-family: 'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif;

/* ë¬¸ì œ: Inter ?°íŠ¸ê°€ ë¡œë“œ?˜ì? ?ŠìŒ */

?”§ ?´ê²° ë°©ë²• 1: Google Fonts CDN
<!-- index.html??ì¶”ê? -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;800&family=JetBrains+Mono&display=swap" rel="stylesheet">

?”§ ?´ê²° ë°©ë²• 2: ë¡œì»¬ ?°íŠ¸ ë²ˆë“¤
1. npm install -D @fontsource/inter @fontsource/jetbrains-mono
2. main.tsx??import '@fontsource/inter';
```

#### Issue #4: 5ì´??ë™ ?ˆë¡œê³ ì¹¨ ?±ëŠ¥
```typescript
// App.tsx line 111-114
const timer = setInterval(() => {
  setCurrentTime(new Date().toLocaleTimeString());
  fetchHealth();  // API ?¸ì¶œ!
}, 5000);

? ï¸ ë¬¸ì œ:
- 5ì´ˆë§ˆ??fetchHealth() ??API ë¶€??
- ?¬ìš©?ê? ?˜ì´ì§€ë¥?ë³´ì? ?Šì•„??ê³„ì† ?¸ì¶œ

?”§ ê°œì„  ë°©ì•ˆ:
1. Page Visibility API ?¬ìš© (?˜ì´ì§€ê°€ ë³´ì¼ ?Œë§Œ ê°±ì‹ )
2. WebSocket?¼ë¡œ ë³€ê²?(?¤ì‹œê°??¸ì‹œ)
3. ê°„ê²©??10ì´ˆë¡œ ?˜ë¦¬ê¸?
```

### 3.2 ?š§ ë¯¸ì™„??ê¸°ëŠ¥

| ê¸°ëŠ¥ | ?íƒœ | ?°ì„ ?œìœ„ | ê³„íš |
|------|------|----------|------|
| **Logs ë²„íŠ¼** | ??ë¯¸êµ¬??| High | 2.0?ì„œ êµ¬í˜„ |
| **RBAC ?°ë™** | ??ë¯¸êµ¬??| High | 2.0 ?„ìˆ˜ |
| **?ëŸ¬ ?œì‹œ** | ? ï¸ ë¶€ë¶?êµ¬í˜„ | Medium | ê°œì„  ?„ìš” |
| **WebSocket** | ??ë¯¸êµ¬??| Low | ?¥í›„ ê²€??|
| **?¤í¬ëª¨ë“œ ? ê?** | ??ë¯¸êµ¬??| Low | ?¼ì´?¸ëª¨???†ìŒ |
| **ë°˜ì‘??ëª¨ë°”??* | ? ï¸ ë¶€ë¶?êµ¬í˜„ | Medium | ?œë¸”ë¦¿ê¹Œì§€ë§?|

---

## ?“ Part 4: Frontend ê°œë°œ ?˜ë„ ë°??¤ê³„ ê²°ì •

### 4.1 ?¯ ??ë³„ë„ ê²½ë¡œ??ë§Œë“¤?ˆë‚˜?

#### ì¶”ì • ?´ìœ :
1. **?„ë¡œ? í????¨ê³„**: ë¹ ë¥¸ ?¤í—˜???„í•´ ?„ì‹œ ê²½ë¡œ ?¬ìš©
2. **?…ë¦½ ê°œë°œ**: Backend?€ ë¶„ë¦¬?´ì„œ ê°œë°œ
3. **Vite ?œí”Œë¦?*: `npm create vite@latest` ëª…ë ¹?¼ë¡œ ?ì„± ???„ì¬ ?”ë ‰? ë¦¬???ì„±

#### ê²°ë¡ :
- ??**?„ì‹œ ?„ì¹˜?€??*: ?•ì‹ ?µí•© ???„ë¡œ? í???
- ??**UCONAI-LLMë¡??µí•©???¬ë°”ë¥?ë°©í–¥**

### 4.2 ?› ï¸?ê¸°ìˆ  ?¤íƒ ? íƒ ?´ìœ 

#### React 19.2.0
- ??**ìµœì‹  ?ˆì • ë²„ì „**: 2024??12??ì¶œì‹œ
- ??**?±ëŠ¥ ê°œì„ **: Compiler ì§€??(ë¯¸ì‚¬??ì¤?
- ??**TypeScript ì§€???¥ìƒ**

#### TypeScript 5.9.3
- ??**?€???ˆì „??*: ?°í????¤ë¥˜ ?¬ì „ ë°©ì?
- ??**IntelliSense**: ê°œë°œ ?ì‚°???¥ìƒ
- ??**ë¦¬íŒ©? ë§ ?ˆì „??*

#### Vite 7.2.4
- ??**ë¹ ë¥¸ HMR**: ê°œë°œ ì¤?ì¦‰ì‹œ ë°˜ì˜
- ??**ìµœì ?”ëœ ë¹Œë“œ**: Rollup ê¸°ë°˜
- ??**TypeScript ?¤ì´?°ë¸Œ ì§€??*

#### ?œìˆ˜ React (?¼ì´ë¸ŒëŸ¬ë¦??†ìŒ)
- ??**ê°„ë‹¨??UI**: ë³µì¡???íƒœ ê´€ë¦?ë¶ˆí•„??
- ??**ë¹ ë¥¸ ë¡œë”©**: ë²ˆë“¤ ?¬ê¸° ìµœì†Œ??
- ??**? ì?ë³´ìˆ˜ ?©ì´**: ?˜ì¡´??ìµœì†Œ??

### 4.3 ?”® ?ë˜ ê³„íšê³?ë³€ê²??¬í•­

#### ?ë˜ ê³„íš (ì¶”ì •):
```
MCP (Model Context Protocol) + Claude API + Context7
??AI ?€??ê¸°ëŠ¥ êµ¬í˜„
```

#### ?¤ì œ êµ¬í˜„:
```
OpenClaw Gateway (Ollama) + Local Controller
???ì²´ AI ?¸í”„???¬ìš©
```

#### ë³€ê²??´ìœ  (ì¶”ì •):
1. **ë¹„ìš©**: Claude API ? ë£Œ vs Ollama ë¬´ë£Œ
2. **?ìœ¨??*: ?¸ë? ?˜ì¡´???œê±°
3. **ì»¤ìŠ¤?°ë§ˆ?´ì§•**: DCP ?„ìš© ëª¨ë¸ ?™ìŠµ ê°€??
4. **?¤í”„?¼ì¸**: ?¸í„°???†ì´ ?‘ë™

---

## ?? Part 5: ?¤í–‰ ë°?ë°°í¬ ë°©ë²•

### 5.1 ?› ï¸?ê°œë°œ ?˜ê²½ ?¤í–‰

#### ë°©ë²• 1: ?˜ë™ ?¤í–‰
```powershell
# ?°ë??ì—??
cd C:\UCONAI-LLM\frontend
npm run dev

# ì¶œë ¥:
# VITE v7.2.4  ready in 234 ms
# ?? Local:   http://localhost:5173/
# ?? Network: use --host to expose
# ?? press h + enter to show help
```

#### ë°©ë²• 2: VS Code Task
```json
// .vscode/tasks.json ?ì„±
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

#### ë°©ë²• 3: Start-All.ps1 ?µí•©
```powershell
# C:\UCONAI-LLM\scripts\ops\Start-All.ps1 ?…ë°?´íŠ¸
# Frontend ?¤í–‰ ë¡œì§ ì¶”ê? (ë³„ë„ ?‘ì—…)
```

### 5.2 ?—ï¸??„ë¡œ?•ì…˜ ë¹Œë“œ

```powershell
# 1. ë¹Œë“œ
cd C:\UCONAI-LLM\frontend
npm run build

# ì¶œë ¥:
# vite v7.2.4 building for production...
# ??45 modules transformed.
# dist/index.html                   0.46 kB ??gzip:  0.30 kB
# dist/assets/index-DWyDJMmB.js    143.41 kB ??gzip: 46.13 kB
# dist/assets/index-COcDBgFa.css     2.05 kB ??gzip:  0.85 kB
# ??built in 567ms

# 2. ë¹Œë“œ ê²°ê³¼ ?•ì¸
ls dist/

# 3. ?„ë¦¬ë·?(ë¡œì»¬ ?œë²„ë¡?ë¹Œë“œ ê²°ê³¼ ?•ì¸)
npm run preview
# http://localhost:4173/
```

### 5.3 ?“¦ ë°°í¬ ?µì…˜

#### ?µì…˜ 1: IIS ë°°í¬ (ê¶Œì¥)
```powershell
# 1. IIS ?œì„±???•ì¸
Get-Service W3SVC

# 2. ?¬ì´???ì„±
New-IISSite -Name "UCONAI-Frontend" `
            -PhysicalPath "C:\UCONAI-LLM\frontend\dist" `
            -BindingInformation "*:8080:localhost"

# 3. ?‘ì†
# http://localhost:8080
```

#### ?µì…˜ 2: Vite Preview (ê°œë°œ/?ŒìŠ¤??
```powershell
npm run preview
# http://localhost:4173
```

#### ?µì…˜ 3: Node.js Static Server
```powershell
# 1. serve ?¤ì¹˜
npm install -g serve

# 2. ?¤í–‰
serve -s dist -l 8080
# http://localhost:8080
```

### 5.4 ?”„ Task Scheduler ?¤ì •

```powershell
# 1. PowerShell ?¤í¬ë¦½íŠ¸ ?ì„±
# C:\UCONAI-LLM\scripts\ops\Start-Frontend.ps1

$ErrorActionPreference = "Stop"
Set-Location "C:\UCONAI-LLM\frontend"
Start-Process "npm" -ArgumentList "run", "dev" -WindowStyle Hidden

# 2. Task Scheduler ?±ë¡
schtasks /Create `
  /TN "UCONAI-Frontend" `
  /TR "powershell.exe -ExecutionPolicy Bypass -File C:\UCONAI-LLM\scripts\ops\Start-Frontend.ps1" `
  /SC ONSTART `
  /RU "SYSTEM" `
  /RL HIGHEST `
  /F

# 3. ?ŒìŠ¤??
schtasks /Run /TN "UCONAI-Frontend"

# 4. ?•ì¸
Get-Process | Where-Object {$_.ProcessName -eq "node"}
netstat -ano | findstr ":5173"
```

---

## ?” Part 6: ì½”ë“œ ?ì„¸ ë¶„ì„

### 6.1 ?“¦ App.tsx ì£¼ìš” ë¡œì§

#### ?íƒœ ê´€ë¦?
```typescript
interface SystemStatus {
  id: string;        // systems.yaml??id?€ ë§¤ì¹­
  name: string;      // ?œìŠ¤???´ë¦„
  status: 'OK' | 'FAIL' | 'WARN';  // ?íƒœ
  uptime: string;    // ?…í???(?¤ì œë¡œëŠ” "Running" or "0s")
  load: number;      // CPU ë¶€??(?œë¤ê°? ?¤ì œ ?°ì´???„ë‹˜!)
}

const [systems, setSystems] = useState<SystemStatus[]>([]);
const [logs, setLogs] = useState<LogEntry[]>([...]);
const [chatMessages, setChatMessages] = useState<ChatMessage[]>([...]);
```

#### API ?¸ì¶œ ë¡œì§
```typescript
const fetchHealth = async () => {
  try {
    const resp = await fetch('http://localhost:18080/health-report');
    const data = await resp.json();
    
    // ?”´ ë¬¸ì œ: API ?‘ë‹µ êµ¬ì¡°ë¥?ê°€?•í•¨
    // systems.yaml??êµ¬ì¡°?€ ?¼ì¹˜?˜ëŠ”ì§€ ?•ì¸ ?„ìš”
    const mapped = data.systems.map((s: any) => ({
      id: s.id,
      name: s.name,
      status: s.result.ok ? 'OK' : 'FAIL',
      uptime: s.result.ok ? 'Running' : '0s',
      load: s.result.ok ? Math.floor(Math.random() * 20) + 5 : 0
      // ? ï¸ load???œë¤ê°? ?¤ì œ CPU ?¬ìš©ë¥??„ë‹˜
    }));
    
    setSystems(mapped);
  } catch (err) {
    console.error("Health fetch failed", err);
    // ?”´ ë¬¸ì œ: UI???ëŸ¬ ?œì‹œ ?†ìŒ
  }
};
```

#### ?¬ì‹œ??ë¡œì§
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
      setTimeout(fetchHealth, 2000);  // 2ì´????íƒœ ê°±ì‹ 
    } else {
      addLog(`Error restarting ${id}: ${result.error}`);
    }
  } catch (err) {
    addLog(`Failed to communicate with controller for ${id}.`);
  }
};
```

#### AI ?€??ë¡œì§
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
      text: '?µì‹  ?¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤. Gateway ?íƒœë¥??•ì¸?´ì£¼?¸ìš”.' 
    }]);
  } finally {
    setIsTyping(false);
  }
};
```

### 6.2 ?¨ CSS ?˜ì´?¼ì´??

#### ê¸€?˜ìŠ¤ëª¨í”¼ì¦??¨ê³¼
```css
.system-card {
  background: var(--glass);                /* ë°˜íˆ¬ëª?ë°°ê²½ */
  border: 1px solid var(--glass-border);   /* ?Œë‘ë¦?*/
  border-radius: 16px;
  backdrop-filter: blur(12px);             /* ë¸”ëŸ¬ ?¨ê³¼ */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.system-card:hover {
  border-color: var(--accent-cyan);        /* ?¸ë²„ ???Œë‘ë¦???ë³€ê²?*/
  background: rgba(255, 255, 255, 0.06);   /* ?½ê°„ ë°ê²Œ */
  transform: translateY(-5px);              /* ?„ë¡œ 5px ?´ë™ */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); /* ê·¸ë¦¼??*/
}
```

#### ? ë‹ˆë©”ì´??
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

## ?“š Part 7: ë¬¸ì„œ??ê³„íš

### 7.1 README.md ?…ë°?´íŠ¸ (?„ìˆ˜)

?„ì¬ README.md??Vite ?œí”Œë¦?ê¸°ë³¸ ë¬¸ì„œ?…ë‹ˆ?? ?¤ìŒ ?´ìš©?¼ë¡œ êµì²´ ?„ìš”:

```markdown
# UCONAI Frontend

**? ì½˜??(U-consol) - DCP ?µí•©ê´€???œìŠ¤??Web UI**

## ê°œìš”
React + TypeScript + Viteë¡?êµ¬ì¶•???¤ì‹œê°??œìŠ¤??ëª¨ë‹ˆ?°ë§ ?€?œë³´??

## ê¸°ëŠ¥
- 11ê°?DCP ?œìŠ¤???¤ì‹œê°??íƒœ ëª¨ë‹ˆ?°ë§
- ?œìŠ¤???¬ì‹œ???œì–´
- AI ê¸°ë°˜ ?¥ì•  ë¶„ì„ ë°??€??
- ?´ë²¤??ë¡œê·¸ ì¶”ì 

## ê¸°ìˆ  ?¤íƒ
- React 19.2.0
- TypeScript 5.9.3
- Vite 7.2.4

## ?¤ì¹˜ ë°??¤í–‰
\`\`\`bash
# ?˜ì¡´???¤ì¹˜
npm install

# ê°œë°œ ?œë²„ ?¤í–‰
npm run dev

# ?„ë¡œ?•ì…˜ ë¹Œë“œ
npm run build
\`\`\`

## ?˜ê²½ ë³€??
\`\`\`.env
VITE_API_BASE_URL=http://localhost:18789
\`\`\`

## API ?”ë“œ?¬ì¸??
- GET /health-report - ?œìŠ¤???íƒœ ì¡°íšŒ
- POST /exec - ?œìŠ¤???œì–´ ëª…ë ¹
- POST /chat - AI ?€??

## ê°œë°œ ê°€?´ë“œ
[docs/FRONTEND_DEV_GUIDE.md](../docs/FRONTEND_DEV_GUIDE.md) ì°¸ê³ 
```

### 7.2 ?“– ì¶”ê? ë¬¸ì„œ ?‘ì„± (ê¶Œì¥)

#### FRONTEND_DEV_GUIDE.md (ê°œë°œ??ê°€?´ë“œ)
- ì»´í¬?ŒíŠ¸ êµ¬ì¡°
- ?íƒœ ê´€ë¦??¨í„´
- API ?µì‹  ê·œì¹™
- ?¤í???ê°€?´ë“œ

#### FRONTEND_API_SPEC.md (API ëª…ì„¸)
- ê°??”ë“œ?¬ì¸?¸ì˜ ?”ì²­/?‘ë‹µ ?ˆì‹œ
- ?ëŸ¬ ì½”ë“œ ?•ì˜
- ?¸ì¦ ë°©ë²• (2.0ë¶€??

---

## ??Part 8: ë§ˆì´ê·¸ë ˆ?´ì…˜ ì²´í¬ë¦¬ìŠ¤??

### 8.1 ?¬ì „ ì¤€ë¹?(Pre-Migration)
- [ ] Frontend ?„ì¬ ?íƒœ ë°±ì—…
- [ ] UCONAI-LLM Git ìµœì‹  ?íƒœ ?•ì¸
- [ ] systems.yaml ë°±ì—…
- [ ] ?„ì¬ ?¤í–‰ ì¤‘ì¸ Frontend ?„ë¡œ?¸ìŠ¤ ì¢…ë£Œ

### 8.2 ?Œì¼ ?´ë™ (Migration)
- [ ] Frontend ?´ë” ?´ë™ (`C:\home\ucon\...` ??`C:\UCONAI-LLM`)
- [ ] node_modules ?? œ
- [ ] dist ?? œ
- [ ] package-lock.json ?? œ (?¬ìƒ??

### 8.3 ?¬ì„¤ì¹?ë°??¬ë¹Œ??(Re-Installation)
- [ ] `npm install` ?¤í–‰
- [ ] `npm run build` ?±ê³µ ?•ì¸
- [ ] `npm run dev` ?ŒìŠ¤??

### 8.4 ?¤ì • ?…ë°?´íŠ¸ (Configuration)
- [ ] systems.yaml ê²½ë¡œ ?…ë°?´íŠ¸
- [ ] UCONAI-LLM.code-workspace ?…ë°?´íŠ¸
- [ ] Start-All.ps1??Frontend ì¶”ê?
- [ ] README.md ?…ë°?´íŠ¸

### 8.5 API ?°ë™ ?•ì¸ (API Integration)
- [ ] API ?¬íŠ¸ ?•ì¸ (18080 vs 18789)
- [ ] Gateway???„ìš”??API ?”ë“œ?¬ì¸???•ì¸
- [ ] CORS ?¤ì • ?•ì¸
- [ ] ?¤ì œ API ?¸ì¶œ ?ŒìŠ¤??

### 8.6 Git ?µí•© (Git Integration)
- [ ] .gitignore ?•ì¸
- [ ] `git add frontend/`
- [ ] ì»¤ë°‹ ë©”ì‹œì§€ ?‘ì„±
- [ ] GitHub???¸ì‹œ

### 8.7 ë°°í¬ ë°??¤í–‰ (Deployment)
- [ ] Task Scheduler ?¬ë“±ë¡?
- [ ] IIS ë°°í¬ (? íƒ ?¬í•­)
- [ ] ?µí•© ?ŒìŠ¤??(`Start-All.ps1`)
- [ ] Health Check ?•ì¸

### 8.8 ë¬¸ì„œ??(Documentation)
- [ ] README.md ?…ë°?´íŠ¸
- [ ] ë§ˆì´ê·¸ë ˆ?´ì…˜ ë¬¸ì„œ ?‘ì„± (??ë¬¸ì„œ!)
- [ ] ê°œë°œ ê°€?´ë“œ ?‘ì„±
- [ ] API ëª…ì„¸ ?‘ì„±

---

## ?š¨ Part 9: ? ì¬??ë¬¸ì œ ë°??€??ë°©ì•ˆ

### 9.1 ? ï¸ ë§ˆì´ê·¸ë ˆ?´ì…˜ ì¤?ë°œìƒ ê°€?¥í•œ ë¬¸ì œ

#### ë¬¸ì œ 1: npm install ?¤íŒ¨
```
ì¦ìƒ: node-gyp ?¤ë¥˜, Python ë²„ì „ ë¬¸ì œ
?ì¸: @types/node ?¨í‚¤ì§€???¤ì´?°ë¸Œ ëª¨ë“ˆ ë¹Œë“œ ?¤íŒ¨

?´ê²°:
1. Node.js ë²„ì „ ?•ì¸ (20.x LTS ê¶Œì¥)
2. npm cache clean --force
3. npm install --legacy-peer-deps
```

#### ë¬¸ì œ 2: ë¹Œë“œ ?¤ë¥˜
```
ì¦ìƒ: TypeScript ì»´íŒŒ???¤ë¥˜
?ì¸: tsconfig.json ê²½ë¡œ ë¬¸ì œ

?´ê²°:
1. tsconfig.json???ˆë? ê²½ë¡œ ?œê±°
2. ?ë? ê²½ë¡œë¡?ë³€ê²?
3. npm run build ?¬ì‹œ??
```

#### ë¬¸ì œ 3: API ?°ê²° ?¤íŒ¨
```
ì¦ìƒ: Cannot connect to http://localhost:18080
?ì¸: Gatewayê°€ 18080 ?¬íŠ¸ë¥??¬ìš©?˜ì? ?ŠìŒ

?´ê²°:
1. Gateway ?¤ì œ ?¬íŠ¸ ?•ì¸ (netstat -ano | findstr "18")
2. App.tsx??API_BASE ?˜ì •
3. ?ëŠ” .env.local ?Œì¼ ?ì„±
```

#### ë¬¸ì œ 4: CORS ?¤ë¥˜
```
ì¦ìƒ: Access-Control-Allow-Origin ?¤ë¥˜
?ì¸: Gateway?ì„œ CORS ?ˆìš© ????

?´ê²° (Gateway ì¸?:
// Express ?ˆì‹œ
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### 9.2 ?”§ ë¡¤ë°± ê³„íš

ë§Œì•½ ë§ˆì´ê·¸ë ˆ?´ì…˜ ?¤íŒ¨ ??
```powershell
# 1. ë°±ì—…?ì„œ ë³µêµ¬
$backupPath = "C:\UCONAI-LLM\backups\frontend_YYYYMMDD_HHMMSS"
Copy-Item -Path $backupPath -Destination "C:\home\ucon\UCONAI_gpt-ISO\frontend" -Recurse -Force

# 2. systems.yaml ë³µêµ¬
Copy-Item -Path "C:\UCONAI-LLM\backups\systems.yaml.bak" `
          -Destination "C:\UCONAI-LLM\config\systems.yaml" -Force

# 3. ?ë˜ ?˜ê²½?¼ë¡œ ë³µê?
cd C:\home\ucon\UCONAI_gpt-ISO\frontend
npm install
npm run dev
```

---

## ?¯ Part 10: ?¥í›„ ê°œì„  ê³„íš (Roadmap)

### 10.1 ?¨ê¸° (v1.0 - ë§ˆì´ê·¸ë ˆ?´ì…˜ ì§í›„)

#### 1ì£¼ì°¨
- [x] ë§ˆì´ê·¸ë ˆ?´ì…˜ ?„ë£Œ
- [ ] API ?¬íŠ¸ ?µì¼
- [ ] ?˜ê²½ ë³€???¤ì • (.env)
- [ ] README.md ?…ë°?´íŠ¸

#### 2ì£¼ì°¨
- [ ] Logs ë²„íŠ¼ êµ¬í˜„
- [ ] ?ëŸ¬ ?œì‹œ UI ê°œì„ 
- [ ] ?°íŠ¸ ë¡œë”© ?˜ì •
- [ ] ë°˜ì‘??ê°œì„  (ëª¨ë°”??

### 10.2 ì¤‘ê¸° (v2.0 - RBAC ?µí•©)

#### 1ê°œì›”
- [ ] ë¡œê·¸???˜ì´ì§€ êµ¬í˜„
- [ ] JWT ? í° ?¸ì¦
- [ ] RBAC ??• ë³?UI ?œì–´
- [ ] Scope ?„í„°ë§?

#### 2ê°œì›”
- [ ] WebSocket ?¤ì‹œê°??…ë°?´íŠ¸
- [ ] ?±ëŠ¥ ëª¨ë‹ˆ?°ë§ ?€?œë³´??
- [ ] ?Œë¦¼ ?œìŠ¤??
- [ ] ?¤í¬/?¼ì´??ëª¨ë“œ ? ê?

### 10.3 ?¥ê¸° (v3.0 - ê³ ë„??

#### 6ê°œì›”
- [ ] ì°¨íŠ¸ ë°??µê³„ (Chart.js)
- [ ] ?ˆìŠ¤? ë¦¬ ì¡°íšŒ (ê³¼ê±° ?´ë²¤??
- [ ] ?¤ì • ?˜ì´ì§€
- [ ] ?¬ìš©??ê´€ë¦?UI

#### 1??
- [ ] ëª¨ë°”????(React Native)
- [ ] PWA ì§€??(?¤í”„?¼ì¸)
- [ ] ?¤êµ­??ì§€??(i18n)
- [ ] ?Œë§ˆ ì»¤ìŠ¤?°ë§ˆ?´ì§•

---

## ?“ Part 11: ì§€??ë°?ë¬¸ì˜

### 11.1 ?“§ ?°ë½ì²?

- **?„ë¡œ?íŠ¸ ê´€ë¦¬ì**: DCP Admin
- **Repository**: https://github.com/jongjean/u-consol
- **Issues**: GitHub Issues ?¬ìš©

### 11.2 ?› ï¸??¸ëŸ¬ë¸”ìŠˆ??

#### FAQ

**Q1: npm install??ë§¤ìš° ?ë¦½?ˆë‹¤.**
```powershell
# npm ?ˆì??¤íŠ¸ë¦¬ë? êµ?‚´ ë¯¸ëŸ¬ë¡?ë³€ê²?
npm config set registry https://registry.npmmirror.com
npm install
```

**Q2: Frontendê°€ ?œì‘?˜ì? ?ŠìŠµ?ˆë‹¤.**
```powershell
# ?¬íŠ¸ 5173???¬ìš© ì¤‘ì¸ì§€ ?•ì¸
netstat -ano | findstr ":5173"

# ?„ë¡œ?¸ìŠ¤ ì¢…ë£Œ
taskkill /PID <PID> /F

# ?¬ì‹œ??
npm run dev
```

**Q3: API ?¸ì¶œ???¤íŒ¨?©ë‹ˆ??**
```powershell
# Gateway ?íƒœ ?•ì¸
Invoke-WebRequest -Uri "http://localhost:18789/health"

# Gateway ë¡œê·¸ ?•ì¸
Get-Content "C:\Users\user\.openclaw\logs\*.log" -Tail 50
```

---

## ?“Š Part 12: ë§ˆì´ê·¸ë ˆ?´ì…˜ ?±ê³µ ê¸°ì?

### 12.1 ???±ê³µ ì¡°ê±´

1. **?Œì¼ ?´ë™ ?„ë£Œ**
   - [x] Frontend ?´ë”ê°€ `C:\UCONAI-LLM\frontend`??ì¡´ì¬
   - [x] ëª¨ë“  ?Œì¼ ë¬´ê²°??? ì?

2. **ë¹Œë“œ ?±ê³µ**
   - [ ] `npm install` ?¤ë¥˜ ?†ìŒ
   - [ ] `npm run build` ?¤ë¥˜ ?†ìŒ
   - [ ] `dist/` ?´ë” ?ì„±??

3. **?¤í–‰ ?•ì¸**
   - [ ] `npm run dev` ?¤í–‰ ?±ê³µ
   - [ ] `http://localhost:5173` ?‘ì† ê°€??
   - [ ] ?€?œë³´??UI ?•ìƒ ?œì‹œ

4. **API ?°ë™**
   - [ ] Health Report ì¡°íšŒ ?±ê³µ
   - [ ] ?œìŠ¤???¬ì‹œ??ëª…ë ¹ ?‘ë™
   - [ ] AI ?€??ê¸°ëŠ¥ ?‘ë™

5. **Git ?µí•©**
   - [ ] `.gitignore` ?ìš© ?•ì¸
   - [ ] GitHub???¸ì‹œ ?„ë£Œ
   - [ ] ë¸Œëœì¹?ë³´í˜¸ ê·œì¹™ ?ìš©

6. **ë¬¸ì„œ??*
   - [ ] README.md ?…ë°?´íŠ¸
   - [ ] ë§ˆì´ê·¸ë ˆ?´ì…˜ ë¬¸ì„œ ?‘ì„±
   - [ ] systems.yaml ?…ë°?´íŠ¸

### 12.2 ?“ˆ ?±ëŠ¥ ê¸°ì?

| ??ª© | ëª©í‘œ | ì¸¡ì • ë°©ë²• |
|------|------|-----------|
| **ë¹Œë“œ ?œê°„** | < 1ë¶?| `npm run build` ?Œìš” ?œê°„ |
| **HMR ?ë„** | < 100ms | ì½”ë“œ ?˜ì • ??ë°˜ì˜ ?œê°„ |
| **ì´ˆê¸° ë¡œë”©** | < 2ì´?| ë¸Œë¼?°ì? ë¡œë”© ?„ë£Œ ?œê°„ |
| **API ?‘ë‹µ** | < 500ms | Health Report ì¡°íšŒ ?œê°„ |

---

## ? Part 13: ìµœì¢… ?”ì•½

### 13.1 ?“‹ TL;DR (?”ì•½)

#### ?„ì¬ ?íƒœ
- Frontend??`C:\home\ucon\UCONAI_gpt-ISO\frontend`???„ì¹˜
- React 19 + TypeScript + Vite ?¤íƒ
- API ?¬íŠ¸ ë¶ˆì¼ì¹?(18080 vs 18789)
- Git ?€?¥ì†Œ ë¯¸ì„¤??
- ?˜ê²½ ë³€???†ìŒ

#### ë§ˆì´ê·¸ë ˆ?´ì…˜ ?‘ì—…
1. Frontend ?´ë”ë¥?`C:\UCONAI-LLM\frontend`ë¡??´ë™
2. `npm install` ?¬ì„¤ì¹?
3. systems.yaml ê²½ë¡œ ?…ë°?´íŠ¸
4. Git???µí•©
5. ë¬¸ì„œ??

#### ì£¼ìš” ?´ìŠˆ
- API ?¬íŠ¸ ?µì¼ ?„ìš”
- Logs ë²„íŠ¼ ë¯¸êµ¬??
- RBAC ë¯¸ì—°??
- ?°íŠ¸ ë¡œë”© ?¤íŒ¨

#### ?¤ìŒ ?¨ê³„
- v1.0: ë§ˆì´ê·¸ë ˆ?´ì…˜ + ê¸°ë³¸ ?´ìŠˆ ?˜ì •
- v2.0: RBAC ?µí•© + ë¡œê·¸??
- v3.0: ê³ ë„??ê¸°ëŠ¥ ì¶”ê?

---

## ?“ Appendix: ì°¸ê³  ?ë£Œ

### A. ê´€??ë¬¸ì„œ
- [DCP_?µí•©ê´€??ë§ˆìŠ¤???¤ê³„??md](C:\tmp\DCP_?µí•©ê´€??ë§ˆìŠ¤???¤ê³„??md)
- [DCP_ìµœì¢…êµ¬ì¶•ê³„íš??v2.md](C:\tmp\DCP_ìµœì¢…êµ¬ì¶•ê³„íš??v2.md)
- [UCONAI-LLM_?„ì „_ë¡œë“œë§?md](C:\tmp\UCONAI-LLM_?„ì „_ë¡œë“œë§?md)
- [systems.yaml](C:\UCONAI-LLM\config\systems.yaml)

### B. ?¸ë? ë¦¬ì†Œ??
- [Vite ê³µì‹ ë¬¸ì„œ](https://vite.dev/)
- [React 19 ê³µì‹ ë¬¸ì„œ](https://react.dev/)
- [TypeScript ê³µì‹ ë¬¸ì„œ](https://www.typescriptlang.org/)

### C. ?„ë¡œ?íŠ¸ ?€?„ë¼??
| ? ì§œ | ?´ë²¤??|
|------|--------|
| 2025-11-24 | UCONAI_gpt-ISO ?´ë” ?ì„± |
| 2026-02-09 04:10 | Frontend ?„ë¡œ?íŠ¸ ?ì„± |
| 2026-02-09 04:11 | ì²?ë¹Œë“œ ?„ë£Œ |
| 2026-02-10 06:18 | ë¶„ì„ ë°?ë§ˆì´ê·¸ë ˆ?´ì…˜ ê³„íš ?œì‘ |
| 2026-02-10 21:08 | ë§ˆì´ê·¸ë ˆ?´ì…˜ ë¬¸ì„œ ?‘ì„± ?„ë£Œ |

---

**ë¬¸ì„œ ë²„ì „**: 1.0  
**ìµœì¢… ?…ë°?´íŠ¸**: 2026-02-10 21:08  
**?‘ì„±??*: Antigravity AI Assistant  
**ê²€? ì**: DCP Development Team  

---

## ?‰ ë§ˆì´ê·¸ë ˆ?´ì…˜???œì‘?˜ì„¸??

??ë¬¸ì„œë¥?ì°¸ê³ ?˜ì—¬ ?ˆì „?˜ê³  ?±ê³µ?ì¸ ë§ˆì´ê·¸ë ˆ?´ì…˜??ì§„í–‰?˜ì‹œê¸?ë°”ë?ˆë‹¤.

**?‰ìš´??ë¹•ë‹ˆ??** ??
