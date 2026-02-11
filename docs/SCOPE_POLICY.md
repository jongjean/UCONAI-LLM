# DCP Scope Policy
# ?´ì˜ ë²”ìœ„ ë°??ˆì „ ?•ì±… ê°€?´ë“œ

**ë²„ì „**: 1.0  
**?‘ì„±??*: 2026-02-10  
**ëª©ì **: AI ?ë™ ë³µêµ¬ ë°??œìŠ¤???œì–´???ˆì „???´ì˜

---

## 1. Scope?€ ë¬´ì—‡?¸ê??

**Scope**??DCP ?µí•©ê´€???œìŠ¤?œì—??**AI?€ ?ë™?”ê? ?œì–´?????ˆëŠ” ë²”ìœ„ë¥?ëª…í™•???•ì˜**?˜ëŠ” ?ˆì „ ?¥ì¹˜?…ë‹ˆ??

### ?µì‹¬ ê°œë…
```
systems.yaml = "ë¬´ì—‡??ê´€ë¦¬í•  ???ˆëŠ”ê°€" (?¥ë ¥)
scope.yaml   = "ë¬´ì—‡??ê´€ë¦¬í•´???˜ëŠ”ê°€" (ê¶Œí•œ)
```

???Œì¼??**êµì°¨ ê²€ì¦?*?˜ì–´ ?ˆì „ ?ˆì¼???•ì„±?©ë‹ˆ??

---

## 2. 3ê°€ì§€ ?ì—­

### ?Ÿ¢ MANAGE (ê´€ë¦??ì—­)
**?•ì˜**: AI?€ ?ë™?”ê? ?„ì „???œì–´ ê°€?? 
**?ˆìš©**: ?œì‘, ?•ì?, ?¬ì‹œ?? ?¤ì • ë³€ê²? 
**?ë™ ë³µêµ¬**: ê°€??(recovery_rules.yaml ?ìš©)

**?„ì¬ ?±ë¡???œìŠ¤??(7ê°?**:
1. `C:\OpenClaw\controller` - Control Plane Core
2. `C:\Users\user\.openclaw` - OpenClaw Gateway
3. `C:\infotech\iftNxService` - Infotech Monitor
4. `C:\Finger\FSWSS` - Finger Scraper
5. `C:\KED\FindAgent` - KED Agent
6. `C:\KWIC\KISS` - KWIC (auto_recovery: false)
7. `C:\inetpub` - IIS (auto_recovery: false)

**ì£¼ì˜?¬í•­**:
- KWIC KISS??ê¸ˆìœµ ?œìŠ¤?œìœ¼ë¡??ë™ ë³µêµ¬ ë¹„í™œ??
- IIS??? íƒ???œìŠ¤?œìœ¼ë¡??ë™ ë³µêµ¬ ë¹„í™œ??

---

### ?Ÿ¡ OBSERVE (ê´€ì°??ì—­)
**?•ì˜**: ?½ê¸° ?„ìš©, ëª¨ë‹ˆ?°ë§ë§??ˆìš©  
**?ˆìš©**: ë¡œê·¸ ?˜ì§‘, Health Check, ?íƒœ ì¡°íšŒ  
**ê¸ˆì?**: ?œì‘, ?•ì?, ?¬ì‹œ?? ?¤ì • ë³€ê²? 
**AI ??• **: ?œì•ˆë§?ê°€?? ?¤í–‰?€ ê´€ë¦¬ì ?¹ì¸ ?„ìš”

**?„ì¬ ?±ë¡???œìŠ¤??(5ê°?**:
1. `C:\home\ucon\UCONAI_gpt-ISO\frontend` - Frontend (View Layer)
2. `C:\stt` - STT Engine (Python venv)
3. `C:\NIA` - NIA Security (?©ë„ ë¯¸í™•??
4. `C:\WGear` - WGear System (?©ë„ ë¯¸í™•??
5. `C:\(IMICIH` - IMICIH (?©ë„ ë¯¸í™•??

**ë°°ê²½**:
- Frontend??**View Layer**ë¡??µì‹¬ ?„ë‹˜
- STT??Python ê°€?í™˜ê²??ìƒ ?„í—˜
- NIA/WGear/IMICIH???©ë„ ?•ì¸ ???¬ë¶„ë¥??„ìš”

---

### ?”´ DENY (ê¸ˆì? ?ì—­)
**?•ì˜**: AI?€ ?ë™?”ê? ?ˆë? ?‘ê·¼ ë¶ˆê?  
**?ˆìš©**: ?†ìŒ (ê´€ë¦¬ì??? ì¤‘?˜ê²Œ)  
**?„ë°˜ ??*: ì¦‰ì‹œ ê±°ë? + ?Œë¦¼ ë°œìƒ

**?„ì¬ ?±ë¡??ê²½ë¡œ (14ê°?**:

**ê°œì¸ ?ì—­**:
- `C:\Users\user\Desktop` (critical)
- `C:\Users\user\Documents` (critical)
- `C:\Users\user\Downloads` (high)
- `C:\Users\user\Pictures` (critical)
- `C:\Users\user\Videos` (critical)

**?œìŠ¤???µì‹¬**:
- `C:\Windows\System32` (fatal)
- `C:\Windows\SysWOW64` (fatal)
- `C:\Program Files` (critical)
- `C:\Program Files (x86)` (critical)

**DCP ê´€ë¦?*:
- `C:\UCONAI-LLM\config` (high) - ?°í???ê³„ì•½??
- `C:\UCONAI-LLM\ml_data\lake\gold_training_set` (high)
- `C:\UCONAI-LLM\backups` (high)

---

## 3. ê²€ì¦?ë©”ì»¤?ˆì¦˜

### ?ë™ ê²€ì¦?
```powershell
# ?•í•©??ê²€ì¦??¤í–‰
C:\UCONAI-LLM\scripts\ops\Validate-Scope.ps1
```

**ê²€ì¦???ª©**:
1. systems.yaml??ëª¨ë“  pathê°€ scope???•ì˜?˜ì–´ ?ˆëŠ”ê°€
2. scope???•ì˜??ê²½ë¡œê°€ ?¤ì œ ?œìŠ¤?œê³¼ ?¼ì¹˜?˜ëŠ”ê°€
3. deny ?ì—­ê³?systems.yaml??ì¶©ëŒ???†ëŠ”ê°€

**ê²€ì¦?ì£¼ê¸°**:
- ?˜ë™: systems.yaml ?ëŠ” scope.yaml ë³€ê²???
- ?ë™: ë§¤ì¼ 1??(validation.validate_interval_hours: 24)

---

## 4. AI ?”ì²­ ì²˜ë¦¬ ?ë¦„

### ?œë‚˜ë¦¬ì˜¤ 1: Manage ?ì—­ (?ë™ ?¤í–‰)
```
AI ?”ì²­: "Infotech Monitor ?¬ì‹œ??
    ??
1. scope.yaml ?•ì¸
    ??ê²½ë¡œ: C:\infotech\iftNxService
    ???ì—­: manage
    ??auto_recovery: true ??
    ??
2. recovery_rules.yaml ?•ì¸
    ??R003-SERVICE-AUTO-HEAL ë§¤ì¹­ ??
    ??
3. ?ë™ ?¤í–‰
    ??Stop-Service + Start-Service
    ??
ê²°ê³¼: ???ë™ ë³µêµ¬ ?±ê³µ
```

### ?œë‚˜ë¦¬ì˜¤ 2: Observe ?ì—­ (ê´€ë¦¬ì ?¹ì¸ ?„ìš”)
```
AI ?”ì²­: "Frontend ?¬ë¹Œ??
    ??
1. scope.yaml ?•ì¸
    ??ê²½ë¡œ: C:\home\ucon\UCONAI_gpt-ISO\frontend
    ???ì—­: observe ? ï¸
    ??auto_recovery: false
    ??
2. ê´€ë¦¬ì ?¹ì¸ ?”ì²­
    ??"Frontend??observe ?ì—­?…ë‹ˆ?? ?¹ì¸?˜ì‹œê² ìŠµ?ˆê¹Œ?"
    ??
3. ?¹ì¸ ?€ê¸?
    ??Yes: ?¤í–‰
    ??No: ê±°ë?
    ??
ê²°ê³¼: ?¸ï¸ ê´€ë¦¬ì ?ë‹¨ ?€ê¸?
```

### ?œë‚˜ë¦¬ì˜¤ 3: Deny ?ì—­ (ì¦‰ì‹œ ê±°ë?)
```
AI ?”ì²­: "Desktop ?´ë” ?•ë¦¬"
    ??
1. scope.yaml ?•ì¸
    ??ê²½ë¡œ: C:\Users\user\Desktop
    ???ì—­: deny ??
    ??severity: critical
    ??
2. ì¦‰ì‹œ ê±°ë?
    ???Œë¦¼ ë°œìƒ (cli + log)
    ??
ê²°ê³¼: ???”ì²­ ê±°ë? + ?„ë°˜ ë¡œê·¸ ê¸°ë¡
```

---

## 5. Scope ë³€ê²??ˆì°¨

### ?œìŠ¤?œì„ Observe ??Manageë¡??¹ê²©
```yaml
# AS-IS (scope.yaml)
observe:
  - path: "C:\\NIA"
    reason: "NIA Security - ?©ë„ ë¯¸í™•??
    auto_recovery: false

# TO-BE (ì¡°ì‚¬ ?„ë£Œ ??
manage:
  - path: "C:\\NIA"
    reason: "NIA Security - ?¤íŠ¸?Œí¬ ë³´ì•ˆ ëª¨ë‹ˆ??
    category: "security"
    auto_recovery: false  # ë³´ì•ˆ ?œìŠ¤?œì? ?˜ë™ ë³µêµ¬
    systems:
      - "nia-security"
```

**?ˆì°¨**:
1. ?œìŠ¤???©ë„ ?•ì¸
2. scope.yaml ?˜ì •
3. `Validate-Scope.ps1` ?¤í–‰
4. systems.yamlê³??¼ì¹˜ ?¬ë? ?•ì¸
5. Git commit

---

### ?ˆë¡œ???œìŠ¤??ì¶”ê?
```yaml
# 1. systems.yaml???œìŠ¤???±ë¡
- id: "new-system"
  path: "C:\\NewSystem"
  category: "monitoring"

# 2. scope.yaml???ì—­ ë¶„ë¥˜
manage:  # ?ëŠ” observe
  - path: "C:\\NewSystem"
    reason: "?ˆë¡œ??ëª¨ë‹ˆ?°ë§ ?œìŠ¤??
    category: "monitoring"
    auto_recovery: true
    systems:
      - "new-system"

# 3. ê²€ì¦?
powershell -ExecutionPolicy Bypass -File "C:\UCONAI-LLM\scripts\ops\Validate-Scope.ps1"
```

---

## 6. RBACê³¼ì˜ ê´€ê³?

### Scope vs RBAC
```
Scope: "?œìŠ¤?œì˜ ?´ëŠ ?ì—­"???œì–´?????ˆëŠ”ê°€
RBAC:  "?„ê?" ê·??œì–´ë¥??????ˆëŠ”ê°€
```

**êµì°¨ ê²€ì¦?*:
```
Admin + Manage ?ì—­ = ???„ì²´ ?œì–´ ê°€??
Operator + Manage ?ì—­ = ???œì–´ ê°€??(?¤ì • ë³€ê²?ë¶ˆê?)
AI Bot + Manage ?ì—­ = ???ë™ ë³µêµ¬ë§?
Auditor + ëª¨ë“  ?ì—­ = ???½ê¸°ë§?ê°€??

?„êµ¬??+ Deny ?ì—­ = ???‘ê·¼ ë¶ˆê?
```

---

## 7. ?„ë°˜ ë¡œê·¸

### ë¡œê·¸ ?„ì¹˜
```
C:\UCONAI-LLM\logs\scope_violations.log
```

### ë¡œê·¸ ?¬ë§· (JSONL)
```json
{
  "timestamp": "2026-02-10T12:15:00+09:00",
  "requester": "uconai-bot",
  "requested_path": "C:\\Users\\user\\Desktop",
  "requested_action": "delete",
  "scope_result": "denied",
  "severity": "critical",
  "alert_sent": true
}
```

### ë¡œê·¸ ì¡°íšŒ
```powershell
# ìµœê·¼ 10ê°??„ë°˜
Get-Content C:\UCONAI-LLM\logs\scope_violations.log -Tail 10 | ConvertFrom-Json

# ?¤ëŠ˜ ?„ë°˜ ê±´ìˆ˜
$today = (Get-Date).ToString("yyyy-MM-dd")
Get-Content C:\UCONAI-LLM\logs\scope_violations.log | 
  ConvertFrom-Json | 
  Where-Object { $_.timestamp -like "$today*" } | 
  Measure-Object
```

---

## 8. ?¸ëŸ¬ë¸”ìŠˆ??

### Q1: ê²€ì¦??¤íŒ¨ - "?œìŠ¤?œì´ scope???†ìŒ"
**?ì¸**: systems.yaml???ˆì?ë§?scope.yaml???†ìŒ  
**?´ê²°**:
```powershell
# 1. ë¡œê·¸ ?•ì¸
powershell -File "C:\UCONAI-LLM\scripts\ops\Validate-Scope.ps1"

# 2. ?„ë½???œìŠ¤?œì„ scope.yaml??ì¶”ê?
# (manage ?ëŠ” observe ?ì—­)

# 3. ?¬ê?ì¦?
powershell -File "C:\UCONAI-LLM\scripts\ops\Validate-Scope.ps1"
```

---

### Q2: AIê°€ ?•ìƒ ?œìŠ¤?œì„ ?œì–´?˜ì? ëª»í•¨
**?ì¸**: auto_recovery: falseë¡??¤ì •?? 
**?´ê²°**:
```yaml
# scope.yaml ?˜ì •
manage:
  - path: "C:\\?œìŠ¤?œê²½ë¡?
    auto_recovery: true  # false ??trueë¡?ë³€ê²?
```

---

### Q3: Deny ?ì—­ ì¶”ê??˜ê³  ?¶ìŒ
**?ˆì°¨**:
```yaml
# scope.yaml??ì¶”ê?
deny:
  - path: "C:\\ì¤‘ìš”??\ê²½ë¡œ"
    reason: "?°ì´???ì‹¤ ?„í—˜"
    severity: "critical"
```

**ê²€ì¦?*:
```powershell
# systems.yamlê³?ì¶©ëŒ ?•ì¸
powershell -File "C:\UCONAI-LLM\scripts\ops\Validate-Scope.ps1"
```

---

## 9. ëª¨ë²” ?¬ë?

### ??DO
1. **?œìŠ¤??ì¶”ê? ??scopeë¶€???•ì˜**
2. **ê¸ˆìœµ/ë³´ì•ˆ ?œìŠ¤?œì? auto_recovery: false**
3. **deny ?ì—­?€ ë³´ìˆ˜?ìœ¼ë¡??¤ì •**
4. **ë³€ê²???ë°˜ë“œ??Validate-Scope.ps1 ?¤í–‰**
5. **?„ë°˜ ë¡œê·¸ ì£¼ê¸°???ê?**

### ??DON'T
1. **scope ê²€ì¦??†ì´ systems.yaml ?˜ì •**
2. **deny ?ì—­???œìŠ¤??ê²½ë¡œë¡??¬ìš©**
3. **observe ?ì—­??auto_recovery: trueë¡??¤ì •**
4. **ê²€ì¦??¤ë¥˜ ë¬´ì‹œ?˜ê³  ë°°í¬**
5. **ê°œì¸ ?´ë”ë¥?manage ?ì—­??ì¶”ê?**

---

## 10. ì²´í¬ë¦¬ìŠ¤??

### ?ˆë¡œ???œìŠ¤??ì¶”ê? ??
- [ ] systems.yaml???œìŠ¤???±ë¡
- [ ] scope.yaml???ì—­ ë¶„ë¥˜ (manage/observe/deny)
- [ ] auto_recovery ?¤ì • (ê¸ˆìœµ/ë³´ì•ˆ?€ false)
- [ ] Validate-Scope.ps1 ?¤í–‰ ë°??µê³¼
- [ ] recovery_rules.yaml ê·œì¹™ ì¶”ê? (?„ìš”??
- [ ] Git commit

### Scope ë³€ê²???
- [ ] ë³€ê²??´ìœ  ë¬¸ì„œ??
- [ ] scope.yaml ?˜ì •
- [ ] Validate-Scope.ps1 ?¤í–‰
- [ ] ?ŒìŠ¤???˜ê²½ ê²€ì¦?
- [ ] ?„ë¡œ?•ì…˜ ë°°í¬
- [ ] ?„ë°˜ ë¡œê·¸ ëª¨ë‹ˆ?°ë§ (24?œê°„)

---

## 11. ì°¸ê³  ë¬¸ì„œ

- `config/scope.yaml` - Scope ?•ì˜
- `config/systems.yaml` - ?œìŠ¤???ˆì??¤íŠ¸ë¦?
- `config/recovery_rules.yaml` - ?ë™ ë³µêµ¬ ê·œì¹™
- `scripts/ops/Validate-Scope.ps1` - ê²€ì¦??¤í¬ë¦½íŠ¸
- `docs/ARCHITECTURE.md` - ?„í‚¤?ì²˜ ê°œìš”

---

**?‘ì„±??*: DCP Admin  
**ê²€??*: 2026-02-10  
**?¤ìŒ ê²€???ˆì •**: 2026-03-10
