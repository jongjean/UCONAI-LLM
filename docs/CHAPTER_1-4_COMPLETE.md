# Chapter 1-4: Watchdog Monitor - ?„ë£Œ ë³´ê³ ??

**?‘ì—…??*: 2026-02-10  
**?íƒœ**: ???„ë£Œ (?˜ë™ ?¤í–‰ ë°©ì‹)  
**ë°©ì‹**: PowerShell ?¤í¬ë¦½íŠ¸ ê¸°ë°˜

---

## ?“‹ ?‘ì—… ê°œìš”

Controller ë°??µì‹¬ ?œìŠ¤?œì˜ ?ì¡´ ?íƒœë¥?ê°ì‹œ?˜ê³  ?¤íŒ¨ ???ë™ ë³µêµ¬?˜ëŠ” Watchdog Monitor êµ¬í˜„ ?„ë£Œ.

---

## ???„ë£Œ???‘ì—…

### 1. Watchdog ?¤í¬ë¦½íŠ¸ ê°œë°œ
**?Œì¼**: `scripts/ops/Watchdog-Monitor.ps1` (300+ lines)

**ì£¼ìš” ê¸°ëŠ¥**:
- Health Check (3ê°??µì‹¬ ?œìŠ¤??
- ?ë™ ë³µêµ¬ (Scope ê²€ì¦??µê³¼ ??
- ë¡œê·¸ ê¸°ë¡
- Task Scheduler ?¤ì¹˜/?œê±°

---

### 2. ê°ì‹œ ?€???œìŠ¤??(3ê°?

```powershell
1. OpenClaw Controller (18082)
   - Type: HTTP
   - Endpoint: http://127.0.0.1:18082/health
   - Critical: true
   - Recovery: Start-ScheduledTask 'OpenClawLocalController'

2. OpenClaw Gateway (18789)
   - Type: HTTP
   - Endpoint: http://127.0.0.1:18789/health
   - Critical: true
   - Recovery: Start-ScheduledTask 'OpenClaw Gateway'

3. UCONAI AI Bridge (18081)
   - Type: HTTP
   - Endpoint: http://127.0.0.1:18081/health
   - Critical: true
   - Recovery: Start-ScheduledTask 'UCONAI AI Bridge'
```

---

### 3. ?ŒìŠ¤??ê²°ê³¼

**1???¤í–‰ ?ŒìŠ¤??*:
```
[2026-02-10 12:36:21] DCP Watchdog Monitor Started
[2026-02-10 12:36:21] Targets: 3 systems
[2026-02-10 12:36:21] Check Iteration #1
[2026-02-10 12:36:21] OpenClaw Controller: OK
[2026-02-10 12:36:21] OpenClaw Gateway: OK  
[2026-02-10 12:36:21] UCONAI AI Bridge: OK
[2026-02-10 12:36:21] All systems healthy. ??
```

**ê²°ê³¼**: ??**ëª¨ë“  ?œìŠ¤???•ìƒ**

---

## ?”§ ?¬ìš© ë°©ë²•

### 1???¤í–‰ (?ŒìŠ¤??
```powershell
C:\UCONAI-LLM\scripts\ops\Watchdog-Monitor.ps1 -Once
```

### ë°±ê·¸?¼ìš´???¤í–‰ (ë¬´í•œ ë£¨í”„)
```powershell
Start-Process PowerShell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File C:\UCONAI-LLM\scripts\ops\Watchdog-Monitor.ps1"
```

### ?¬ìš©???•ì˜ ì£¼ê¸°
```powershell
.\Watchdog-Monitor.ps1 -IntervalMinutes 10
```

---

## ?›¡ï¸??ˆì „ ë©”ì»¤?ˆì¦˜

### Scope ê²€ì¦??µí•©
```powershell
function Test-SystemInManageScope {
    # scope.yaml?ì„œ manage ?ì—­ ?•ì¸
    # manage ?ì—­???ˆì„ ?Œë§Œ ?ë™ ë³µêµ¬ ?ˆìš©
}
```

**ë³µêµ¬ ??ê²€ì¦??¨ê³„**:
1. ?œìŠ¤??Health Check ?¤íŒ¨ ê°ì?
2. Scope.yaml ?•ì¸ ??manage ?ì—­?¸ê??
3. manage ?ì—­ ?????ë™ ë³µêµ¬ ?¤í–‰
4. manage ?ì—­ ????ë³µêµ¬ ê±´ë„ˆ?°ê¸° + ê²½ê³  ë¡œê·¸

---

## ?“Š Watchdog ?ë¦„??

```
[Watchdog ?œì‘]
    ??
[5ë¶„ë§ˆ??ë£¨í”„]
    ??
[Health Check: Controller]
    ?œâ? OK ??ë¡œê·¸ ê¸°ë¡
    ?”â? FAIL ??Scope ê²€ì¦?
        ?œâ? manage ?ì—­ ??
        ??  ??
        ??  [?ë™ ë³µêµ¬ ?¤í–‰]
        ??  ??
        ??  [?¬ê?ì¦?
        ??      ?œâ? ?±ê³µ ??SUCCESS ë¡œê·¸
        ??      ?”â? ?¤íŒ¨ ??ERROR ë¡œê·¸
        ?”â? manage ????
            ??
            [ë³µêµ¬ ê±´ë„ˆ?°ê¸° + WARN ë¡œê·¸]
```

---

## ?“ˆ Chapter 1-4 ?¬ì„± ê¸°ì?

| ??ª© | ëª©í‘œ | ?„ì¬ | ?íƒœ |
|-----|-----|-----|------|
| Watchdog ?¤í¬ë¦½íŠ¸ ê°œë°œ | ??| ??| **?„ë£Œ** |
| Health Check êµ¬í˜„ | ??| ??| **?„ë£Œ** |
| ?ë™ ë³µêµ¬ ë¡œì§ | ??| ??| **?„ë£Œ** |
| Scope ê²€ì¦??µí•© | ??| ??| **?„ë£Œ** |
| ë¡œê·¸ ê¸°ë¡ | ??| ??| **?„ë£Œ** |
| Task Scheduler ?¤ì¹˜ | ??| ? ï¸ | **?˜ë™ ë°©ì‹** |

**?„ì²´ ?¬ì„±ë¥?*: 100% (ê¸°ëŠ¥ ?„ì„±)

---

## ?’¡ ?¤ê³„ ?¹ì§•

### 1. Scope ê¸°ë°˜ ?ˆì „??
- ëª¨ë“  ë³µêµ¬ ?œë„??scope.yaml ê²€ì¦??µê³¼ ?„ìš”
- manage ?ì—­ ???œìŠ¤?œì? ?ë™ ë³µêµ¬ ë¶ˆê?

### 2. ë¡œê·¸ ì¶”ì ??
- ?¼ë³„ ë¡œê·¸ ?Œì¼: `logs/watchdog_YYYYMMDD.log`
- ?€?„ìŠ¤?¬í”„, ?ˆë²¨, ë©”ì‹œì§€ ?¬í•¨
- ë³µêµ¬ ?œë„/?±ê³µ/?¤íŒ¨ ëª¨ë‘ ê¸°ë¡

### 3. ? ì—°???¤í–‰ ë°©ì‹
- Once ëª¨ë“œ: 1??ì²´í¬ ??ì¢…ë£Œ
- ë°±ê·¸?¼ìš´??ëª¨ë“œ: ë¬´í•œ ë£¨í”„
- ?¬ìš©???•ì˜ ì£¼ê¸°

---

## ??¸ ?¤ìŒ ?¨ê³„ (Chapter 1-5)

### Health Check ê³ ë„??
**?Œì¼**: `scripts/health/health-all.ps1` (?…ë°?´íŠ¸)

**ì¶”ê? ê¸°ëŠ¥**:
- Watchdog ?íƒœ ?•ì¸
- ?„ì²´ ?œìŠ¤??Health Check
- Scope ê¸°ë°˜ ?ë™??
- ?Œë¦¼ ?œìŠ¤???µí•©

---

## ?“ ?µí•© ?„í™©

### Start-All.ps1 ?…ë°?´íŠ¸ ?„ìš” ?¬ë?
**ê²°ë¡ **: ë¶ˆí•„??

Watchdog??ë°±ê·¸?¼ìš´??ê°ì‹œ ?œë¹„?¤ë¡œ, Start-All.ps1ê³??…ë¦½?ìœ¼ë¡??¤í–‰?©ë‹ˆ??

**ê¶Œì¥ ?¤í–‰ ë°©ë²•**:
1. ?œìŠ¤??ë¶€????1???˜ë™ ?¤í–‰
2. ?ëŠ” ?¬ìš©??ë¡œê·¸?????ë™ ?¤í–‰ (? íƒ)

---

## ?¯ ê²°ë¡ 

**Chapter 1-4: Watchdog Monitor - ???„ë£Œ**

Watchdog Monitorê°€ êµ¬í˜„?˜ì–´ Controller ë°??µì‹¬ ?œìŠ¤?œì„ 5ë¶„ë§ˆ??ê°ì‹œ?˜ê³ , ?¤íŒ¨ ??Scope ê²€ì¦????ë™ ë³µêµ¬?©ë‹ˆ??

**ì§„í–‰ë¥?*: Chapter 1-7 ì¤?**4ê°??„ë£Œ** (1-0, 1-1, 1-3, 1-4)

**?¤ìŒ ëª©í‘œ**: Chapter 1-5 Health Check ê³ ë„??

---

**?‘ì„±??*: DCP Admin  
**?ŒìŠ¤??*: ??All systems healthy  
**ì°¸ì¡°**: 
- `scripts/ops/Watchdog-Monitor.ps1`
- `config/scope.yaml`
- `logs/watchdog_20260210.log`
