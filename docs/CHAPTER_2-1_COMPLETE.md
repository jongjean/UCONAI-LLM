# Chapter 2-1: VS Code ?µí•© ?Œí¬?¤í˜?´ìŠ¤ - ?„ë£Œ ë³´ê³ ??

**?‘ì—…??*: 2026-02-10  
**?íƒœ**: ???„ë£Œ  
**?Œìš” ?œê°„**: 10ë¶?

---

## ?“‹ ?‘ì—… ê°œìš”

Chapter 1?ì„œ ê°œë°œ??ëª¨ë“  ?¤í¬ë¦½íŠ¸ë¥?VS Code ?œìŠ¤?¬ë¡œ ?µí•©?˜ì—¬ ?í´ë¦??¤í–‰ ?˜ê²½ êµ¬ì¶•.

---

## ???„ë£Œ???‘ì—…

### 1. VS Code Tasks ?µí•© (6ê°??œìŠ¤??ì¶”ê?)

**?Œì¼**: `.vscode/tasks.json`

#### ì¶”ê????œìŠ¤??

1. **??[Chapter 1] Scope ê²€ì¦?*
   - ?¤í¬ë¦½íŠ¸: Validate-Scope.ps1
   - ?¨ì¶•?? Ctrl+Shift+P ??"Tasks: Run Task"
   - ê¸°ëŠ¥: Scope ?•í•©??ê²€ì¦?

2. **?¥ [Chapter 1] Health Check V2**
   - ?¤í¬ë¦½íŠ¸: health-all.ps1
   - ê¸°ëŠ¥: ?„ì²´ ?œìŠ¤??Health Check
   - ?µì…˜: ê¸°ë³¸ ëª¨ë“œ (ì¡°íšŒë§?

3. **?¥ [Chapter 1] Health Check (Auto-Heal)**
   - ?¤í¬ë¦½íŠ¸: health-all.ps1 -AutoHeal
   - ê¸°ëŠ¥: Health Check + ?ë™ ë³µêµ¬
   - ?„í—˜?? ì¤‘ê°„ (manage ?ì—­ë§?ë³µêµ¬)

4. **?‘ï¸?[Chapter 1] Watchdog Monitor (Once)**
   - ?¤í¬ë¦½íŠ¸: Watchdog-Monitor.ps1 -Once
   - ê¸°ëŠ¥: 1??Watchdog ì²´í¬
   - ?©ë„: ?ŒìŠ¤??ë°?ê²€ì¦?

5. **?“Š [Chapter 1] CLI Dashboard**
   - ?¤í¬ë¦½íŠ¸: Dashboard.ps1 -Once
   - ê¸°ëŠ¥: ?„ì¬ ?œìŠ¤???íƒœ ?¤ëƒ…??
   - ì¶œë ¥: ?‰ìƒ ì½”ë”©???°ë???UI

6. **?“Š [Chapter 1] Dashboard (Auto-Refresh)**
   - ?¤í¬ë¦½íŠ¸: Dashboard.ps1 (ë¬´í•œ ë£¨í”„)
   - ê¸°ëŠ¥: 5ì´ˆë§ˆ???ë™ ?ˆë¡œê³ ì¹¨
   - ëª¨ë“œ: Background task

---

## ?¯ ?¬ìš© ë°©ë²•

### VS Code?ì„œ ?œìŠ¤???¤í–‰

#### ë°©ë²• 1: Command Palette
```
1. Ctrl + Shift + P
2. "Tasks: Run Task" ?…ë ¥
3. ?í•˜???œìŠ¤??? íƒ
```

#### ë°©ë²• 2: Terminal ë©”ë‰´
```
1. Terminal ??Run Task...
2. ?œìŠ¤??? íƒ
```

#### ë°©ë²• 3: ?¨ì¶•???¤ì • (? íƒ)
```json
// keybindings.json??ì¶”ê?
{
    "key": "ctrl+shift+h",
    "command": "workbench.action.tasks.runTask",
    "args": "?¥ [Chapter 1] Health Check V2"
}
```

---

## ?“Š ?œìŠ¤??ë¶„ë¥˜

### ê²€ì¦??œìŠ¤??
- ??Scope ê²€ì¦?
- ?¥ Health Check V2

### ?ë™???œìŠ¤??
- ?¥ Health Check (Auto-Heal)
- ?‘ï¸?Watchdog Monitor

### ëª¨ë‹ˆ?°ë§ ?œìŠ¤??
- ?“Š CLI Dashboard
- ?“Š Dashboard (Auto-Refresh)

---

## ?’¡ ?œìŠ¤???¹ì§•

### 1. Group ?¤ì •
- Scope ê²€ì¦? `test` ê·¸ë£¹
- Health Check V2: `test` ê·¸ë£¹
- ê¸°í?: ê·¸ë£¹ ?†ìŒ (?˜ë™ ?¤í–‰)

### 2. Presentation ?¤ì •
```json
{
    "reveal": "always",    // ??ƒ ?°ë????œì‹œ
    "panel": "shared",     // ê³µìœ  ?¨ë„ ?¬ìš©
    "clear": true          // ?¤í–‰ ???”ë©´ ì´ˆê¸°??
}
```

### 3. Background Task
- Dashboard (Auto-Refresh) ?„ìš©
- `isBackground: true` ?¤ì •
- Ctrl+Cë¡?ì¢…ë£Œ ê°€??

---

## ?”§ ?Œí¬?¤í˜?´ìŠ¤ êµ¬ì¡°

### .vscode/ ?”ë ‰? ë¦¬
```
.vscode/
?œâ??€ tasks.json          ???…ë°?´íŠ¸??(6ê°??œìŠ¤??ì¶”ê?)
?œâ??€ settings.json       (ê¸°ì¡´)
?”â??€ extensions.json     (ê¸°ì¡´)
```

### ?œìŠ¤??ì´?ê°œìˆ˜
- **ê¸°ì¡´**: ~30ê°?(?œìŠ¤???œì–´, ë¡œê·¸, ë³´ê³ ????
- **ì¶”ê?**: 6ê°?(Chapter 1 ?¤í¬ë¦½íŠ¸)
- **ì´?*: ~36ê°?

---

## ?“ˆ Chapter 2-1 ?¬ì„± ê¸°ì?

| ??ª© | ëª©í‘œ | ?„ì¬ | ?íƒœ |
|-----|------|------|------|
| VS Code ?œìŠ¤???µí•© | ??| ??| **?„ë£Œ** |
| Chapter 1 ?¤í¬ë¦½íŠ¸ ëª¨ë‘ ì¶”ê? | ??| ??| **?„ë£Œ** |
| ?¨ì¶•???¤ì • | ? íƒ | ?¸ï¸ | **? íƒ?¬í•­** |
| ë¬¸ì„œ??| ??| ??| **?„ë£Œ** |

**?„ì²´ ?¬ì„±ë¥?*: 100% (? íƒ?¬í•­ ?œì™¸)

---

## ??¸ ?¤ìŒ ?¨ê³„ (Chapter 2-2)

### RBAC ê°•í™” (Scope ?°ë™)

**ëª©í‘œ**: RBAC?€ Scope ?œìŠ¤???µí•©

**?‘ì—… ?´ìš©**:
1. rbac_policy.yaml ?…ë°?´íŠ¸
2. Scope ê¸°ë°˜ ê¶Œí•œ ê²€ì¦?
3. ??• ë³??œìŠ¤???‘ê·¼ ?œì–´
4. ê°ì‚¬ ë¡œê·¸ ê¸°ë¡

---

## ?¯ ê²°ë¡ 

**Chapter 2-1: VS Code ?µí•© ?Œí¬?¤í˜?´ìŠ¤ - ???„ë£Œ**

VS Code?ì„œ Chapter 1??ëª¨ë“  ?¤í¬ë¦½íŠ¸ë¥??í´ë¦?œ¼ë¡??¤í–‰ ê°€?¥í•˜ë©? ê°œë°œ ?ì‚°?±ì´ ?¬ê²Œ ?¥ìƒ?˜ì—ˆ?µë‹ˆ??

**ì§„í–‰ë¥?*: Chapter 2-7 ì¤?**1ê°??„ë£Œ** (14%)

**?¤ìŒ ëª©í‘œ**: Chapter 2-2 RBAC ê°•í™”

---

**?‘ì„±??*: DCP Admin  
**?ŒìŠ¤??*: ??Ctrl+Shift+P ??Tasks: Run Task ?•ìƒ ?‘ë™  
**ì°¸ì¡°**: 
- `.vscode/tasks.json`
- Chapter 1 ?¤í¬ë¦½íŠ¸ (6ê°?
