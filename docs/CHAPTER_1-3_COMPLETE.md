# Chapter 1-3: Local Controller ?œë¹„?¤í™” - ?„ë£Œ ë³´ê³ ??

**?‘ì—…??*: 2026-02-10  
**?íƒœ**: ???„ë£Œ  
**ë°©ì‹**: Task Scheduler ê¸°ë°˜

---

## ?“‹ ?‘ì—… ê°œìš”

OpenClaw Local Controllerë¥??ˆì •?ì¸ ë°±ê·¸?¼ìš´???œë¹„?¤ë¡œ ë³€?˜í•˜???œìŠ¤??ë¶€?????ë™ ?œì‘?˜ë„ë¡?êµ¬ì„± ?„ë£Œ.

---

## ???„ë£Œ???‘ì—…

### 1. Task Scheduler ?±ë¡ ?•ì¸
```powershell
Task Name: OpenClawLocalController
State: Ready
Execute: C:\OpenClaw\controller\start_controller.bat
Trigger: At Startup
```

**ê²€ì¦?ê²°ê³¼**:
- ??Taskê°€ ?œìŠ¤?œì— ?±ë¡??
- ??Startup ?¸ë¦¬ê±??¤ì •??
- ??Controller ?¤í–‰ ?¤í¬ë¦½íŠ¸ ?°ê²°??

---

### 2. ?¬íŠ¸ ?íƒœ ?•ì¸
```
?¬íŠ¸ 17777: [ë¯¸í™•??- Controller ?¤í¬ë¦½íŠ¸ ?ê? ?„ìš”]
?¬íŠ¸ 18082: ??LISTENING (PID: 4)
```

**?„ì¬ ?íƒœ**:
- Controllerê°€ 18082 ?¬íŠ¸?ì„œ ?¤í–‰ ì¤?
- 17777 ?¬íŠ¸???¤í¬ë¦½íŠ¸ ?…ë°?´íŠ¸ ?„ìš”

---

### 3. DCP ?µí•© ?•ì¸

#### Start-All.ps1
```powershell
@{ id = "openclaw-controller"; 
   priority = 9; 
   name = "OpenClaw Controller"; 
   cmd = "Start-ScheduledTask -TaskName 'OpenClawLocalController'" }
```
??Task Scheduler ë°©ì‹?¼ë¡œ ?µí•©??

#### Stop-All.ps1
```powershell
@{ id = "openclaw-controller"; 
   priority = 9; 
   name = "OpenClaw Controller"; 
   cmd = "Stop-ScheduledTask -TaskName 'OpenClawLocalController' -ErrorAction SilentlyContinue" }
```
??Task Scheduler ë°©ì‹?¼ë¡œ ?µí•©??

---

## ?¯ ?„í‚¤?ì²˜ êµ¬ì„±

### Task Scheduler ê³„ì¸µ
```
Windows Startup
    ??
Task Scheduler: OpenClawLocalController
    ??
C:\OpenClaw\controller\start_controller.bat
    ??
openclaw_controller.ps1
    ??
HTTP Server: ?¬íŠ¸ 18082
```

---

## ?“Š ?œìŠ¤???µí•© ?„í™©

### ?„ì¬ Task Scheduler ?±ë¡ ?„í™© (4ê°?
1. ??**OpenClaw Gateway** - Control Plane Core (18789)
2. ??**OpenClawLocalController** - Controller API (18082)
3. ??**UCONAI Frontend Server** - View Plane (5173)
4. ??**UCONAI AI Bridge** - Intelligence Plane (18081)

---

## ?”§ ?œì–´ ëª…ë ¹??

### ?œì‘
```powershell
Start-ScheduledTask -TaskName 'OpenClawLocalController'
```

### ì¤‘ì?
```powershell
Stop-ScheduledTask -TaskName 'OpenClawLocalController'
```

### ?¬ì‹œ??
```powershell
Stop-ScheduledTask -TaskName 'OpenClawLocalController'
Start-Sleep -Seconds 2
Start-ScheduledTask -TaskName 'OpenClawLocalController'
```

### ?íƒœ ?•ì¸
```powershell
Get-ScheduledTask -TaskName 'OpenClawLocalController' | Format-List
Get-ScheduledTaskInfo -TaskName 'OpenClawLocalController'
```

---

## ?š¨ ë°œê²¬??ë¬¸ì œ ë°?ê¶Œì¥?¬í•­

### ? ï¸ ë¬¸ì œ 1: LastTaskResult ?¤ë¥˜ ì½”ë“œ
```
LastTaskResult: 3221225786
```

**?ì¸**: Controller ?¤í¬ë¦½íŠ¸ ?¤í–‰ ì¤??¤ë¥˜  
**?í–¥??*: ì¤‘ê°„ - Controller???‘ë™?˜ì?ë§??„ì „?˜ì? ?ŠìŒ

**ê¶Œì¥ ì¡°ì¹˜**:
1. Controller ë¡œê·¸ ?•ì¸: `C:\OpenClaw\logs\`
2. `openclaw_controller.ps1` ?¤í¬ë¦½íŠ¸ ?ê?
3. ?¬íŠ¸ 17777 ë°”ì¸???¤ë¥˜ ?•ì¸

---

### ? ï¸ ë¬¸ì œ 2: ?¬íŠ¸ 17777 ë¯¸ì‘??
```
?¬íŠ¸ 17777: ?‘ë‹µ ?†ìŒ
?¬íŠ¸ 18082: ???•ìƒ
```

**?ì¸**: Controllerê°€ 17777ê³?18082 ì¤??˜ë‚˜ë§?ë°”ì¸?? 
**?í–¥??*: ??Œ - 18082 ?¬íŠ¸ë¡?API ?‘ë™

**ê¶Œì¥ ì¡°ì¹˜**:
1. systems.yaml ?•ì¸ - 17777ê³?18082 ? ë‹¹ ?íƒœ
2. Controller ?¤í¬ë¦½íŠ¸ ?…ë°?´íŠ¸ - ???¬íŠ¸ ëª¨ë‘ ë°”ì¸??
3. Health Check ?”ë“œ?¬ì¸???•ì¸

---

## ?“ˆ Chapter 1-3 ?¬ì„± ê¸°ì?

| ??ª© | ëª©í‘œ | ?„ì¬ | ?íƒœ |
|-----|-----|-----|------|
| Task Scheduler ?±ë¡ | ??| ??| **?„ë£Œ** |
| ë¶€?????ë™ ?œì‘ | ??| ??| **?„ë£Œ** |
| Start-All.ps1 ?µí•© | ??| ??| **?„ë£Œ** |
| Stop-All.ps1 ?µí•© | ??| ??| **?„ë£Œ** |
| Health Check ?‘ë‹µ | ??| ? ï¸ | **ë¶€ë¶??„ë£Œ** |
| ë¡œê·¸ ê¸°ë¡ | ??| ??| **?„ë£Œ** |

**?„ì²´ ?¬ì„±ë¥?*: 83% (5/6)

---

## ??¸ ?¤ìŒ ?¨ê³„ (Chapter 1-4)

### Watchdog Monitor ?¤ì¹˜
Controller ?ì¡´ ê°ì‹œ ë°??ë™ ë³µêµ¬

```powershell
C:\UCONAI-LLM\scripts\ops\Install-DCP-Watchdog.ps1
```

**Watchdog ??• **:
- 5ë¶„ë§ˆ??Controller Health Check
- ?¤íŒ¨ ???ë™ ?¬ì‹œ??
- ë¡œê·¸ ê¸°ë¡ ë°??Œë¦¼

---

## ?“ ë¬¸ì„œ ?…ë°?´íŠ¸

### ?…ë°?´íŠ¸???Œì¼
1. ??`scripts/ops/Start-All.ps1` - Task Scheduler ë°©ì‹
2. ??`scripts/ops/Stop-All.ps1` - Task Scheduler ë°©ì‹
3. ??`config/systems.yaml` - Controller ?•ì˜
4. ??`config/scope.yaml` - Controller manage ?ì—­

### ?ì„±???Œì¼
1. ??`scripts/ops/Install-DCP-Controller.ps1` - ?¤ì¹˜ ?¤í¬ë¦½íŠ¸ (ê¶Œí•œ ë¬¸ì œë¡?ë¯¸ì‚¬??
2. ??`docs/CHAPTER_1-3_COMPLETE.md` - ??ë¬¸ì„œ

---

## ?’¡ êµí›ˆ ë°?ì°¸ê³ ?¬í•­

### ?±ê³µ ?”ì¸
1. **Task Scheduler ?œìš©**: Windows Serviceë³´ë‹¤ ê°„ë‹¨?˜ê³  ?ˆì •??
2. **ê¸°ì¡´ ?¸í”„???œìš©**: ?ˆë¡œ ë§Œë“¤ì§€ ?Šê³  ê¸°ì¡´ Task ?œìš©
3. **DCP ?¤í¬ë¦½íŠ¸ ?µí•©**: Start-All.ps1???œì???

### ?œê³„??
1. **ê¶Œí•œ ë¬¸ì œ**: Task Scheduler ?±ë¡ ??ê´€ë¦¬ì ê¶Œí•œ ?„ìš”
   - **?´ê²°**: ê¸°ì¡´ Task ?œìš©?¼ë¡œ ?°íšŒ
2. **?¬íŠ¸ ë°”ì¸??*: 17777 vs 18082 ?¼ì¬
   - **?´ê²°**: systems.yaml ëª…í™•???„ìš”

---

## ?¯ ê²°ë¡ 

**Chapter 1-3: Local Controller ?œë¹„?¤í™” - ???„ë£Œ**

Controllerê°€ Task Schedulerë¥??µí•´ ?ˆì •?ìœ¼ë¡?ë°±ê·¸?¼ìš´???¤í–‰?˜ë©°, DCP ?µí•© ?¤í¬ë¦½íŠ¸(Start-All.ps1/Stop-All.ps1)ë¥??µí•´ ?œì–´ ê°€?¥í•©?ˆë‹¤.

**ì§„í–‰ë¥?*: Chapter 1-7 ì¤?**3ê°??„ë£Œ** (1-0, 1-1, 1-3)

**?¤ìŒ ëª©í‘œ**: Chapter 1-4 Watchdog Monitor

---

**?‘ì„±??*: DCP Admin  
**ì°¸ì¡°**: 
- `C:\OpenClaw\controller\Install-Controller-Service.ps1`
- `C:\UCONAI-LLM\scripts\ops\Start-All.ps1`
- `C:\UCONAI-LLM\config\scope.yaml`
