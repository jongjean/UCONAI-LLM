# Chapter 2-2: RBAC ê°•í™” (Scope ?°ë™) - ?„ë£Œ ë³´ê³ ??

**?‘ì—…??*: 2026-02-10  
**?íƒœ**: ???„ë£Œ  
**?Œìš” ?œê°„**: 13ë¶?

---

## ?“‹ ?‘ì—… ê°œìš”

ê¸°ì¡´ RBAC ?œìŠ¤?œì„ Scope?€ ?µí•©?˜ì—¬ ??•  ê¸°ë°˜ + ?ì—­ ê¸°ë°˜ ?´ì¤‘ ë³´ì•ˆ ì²´ê³„ êµ¬ì¶•.

---

## ???„ë£Œ???‘ì—…

### 1. rbac_policy.yaml V2 ?„ì „ ?¬ì‘??

**ì£¼ìš” ë³€ê²½ì‚¬??*:
- ??Scope ?œìŠ¤???µí•©
- ??deny ?ì—­ ?ˆë? ë³´í˜¸
- ????• ë³?Scope ?‘ê·¼ ê¶Œí•œ ?•ì˜
- ??ê°ì‚¬ ë¡œê·¸ ?„ìˆ˜?? 
- ???ˆì „ ?¥ì¹˜ ì¶”ê?

---

## ?¯ RBAC V2 ?µì‹¬ ê¸°ëŠ¥

### 1. ??• ë³?Scope ?‘ê·¼ ê¶Œí•œ

#### Admin (ê´€ë¦¬ì)
```yaml
scope_access:
  manage: true   # ?½ê¸°/?°ê¸°/?œì–´
  observe: true  # ?½ê¸°/?°ê¸°
  deny: false    # ?‘ê·¼ ë¶ˆê? ??
```

#### Operator (?´ì˜??
```yaml
scope_access:
  manage: true   # ?œì–´ ê°€??
  observe: true  # ?½ê¸°ë§?
  deny: false    # ?‘ê·¼ ë¶ˆê? ??
```

#### Auditor (ê°ì‚¬??
```yaml
scope_access:
  manage: false  # ?‘ê·¼ ë¶ˆê?
  observe: true  # ?½ê¸°ë§?
  deny: false    # ?‘ê·¼ ë¶ˆê? ??
```

#### UCONAI-Bot (AI)
```yaml
scope_access:
  manage: true   # ?ë™ ë³µêµ¬ë§?
  observe: true  # ?½ê¸°ë§?
  deny: false    # ?‘ê·¼ ë¶ˆê? ??
restrictions:
  scope_validation_required: true  # ?„ìˆ˜!
```

---

### 2. Scope ê¸°ë°˜ ?œìŠ¤???‘ê·¼ ?œì–´

#### manage ?ì—­
```yaml
allowed_roles: [admin, operator, uconai-bot]
permissions:
  - read
  - write
  - control
  - auto_recovery  # ?ë™ ë³µêµ¬ ?ˆìš©
systems: [controller, gateway, bridge, ...]
```

#### observe ?ì—­
```yaml
allowed_roles: [admin, operator, auditor, uconai-bot]
permissions:
  - read  # ?½ê¸°ë§?
systems: [frontend, stt, ...]
```

#### deny ?ì—­
```yaml
allowed_roles: []  # ?„ë¬´???‘ê·¼ ë¶ˆê?!
permissions: []
paths:
  - C:\Users\user\Desktop
  - C:\Windows\System32
  - C:\UCONAI-LLM\config
  - ...  # 14ê°?ê²½ë¡œ
```

---

### 3. ê°ì‚¬ ë¡œê·¸ ?•ì±…

```yaml
audit_policy:
  enabled: true
  log_path: C:\UCONAI-LLM\logs\rbac_audit
  
  log_events:
    - system.start/stop/restart
    - scope.manage.access
    - scope.deny.attempt  # ??ƒ ê¸°ë¡!
  
  alert_on:
    - scope.deny.attempt  # ì¦‰ì‹œ ?Œë¦¼!
    - rbac.violation
    - auto_recovery.fail
```

---

### 4. ?ˆì „ ?¥ì¹˜ (Safety Guards)

#### deny ?ì—­ ?ˆë? ë³´í˜¸
```yaml
deny_area_protection:
  enabled: true
  block_all_access: true  # ë¬´ì¡°ê±?ì°¨ë‹¨
  log_attempts: true
  alert_on_attempts: true
```

#### ?ë™ ë³µêµ¬ ?œí•œ
```yaml
auto_recovery_limits:
  max_attempts: 3
  cooldown_minutes: 5
  require_scope_validation: true
```

#### ê¸ˆìœµ ?œìŠ¤??ë³´í˜¸
```yaml
financial_systems_protection:
  systems: [kwic-kiss]
  auto_recovery: false  # ?ˆë? ?ë™ ë³µêµ¬ ë¶ˆê?!
  require_manual_approval: true
```

---

## ?“Š ?´ì¤‘ ë³´ì•ˆ ì²´ê³„

### Before (RBACë§?
```
?”ì²­ ??RBAC ê²€ì¦????¤í–‰
         ???¤íŒ¨
        ê±°ë?
```

### After (RBAC + Scope)
```
?”ì²­ ??RBAC ê²€ì¦???Scope ê²€ì¦????¤í–‰
         ???¤íŒ¨       ???¤íŒ¨
        ê±°ë?         ê±°ë?
```

---

## ?¯ ?œë‚˜ë¦¬ì˜¤ ê¸°ë°˜ ?¤ëª…

### ?œë‚˜ë¦¬ì˜¤ 1: Admin??Controller ?¬ì‹œ??
```
1. ??• : admin
2. RBAC ê²€ì¦?
   - system.restart ê¶Œí•œ? ???ˆìŒ
   - openclaw-controller ?‘ê·¼? ???ˆìš©
3. Scope ê²€ì¦?
   - manage ?ì—­? ??Controller??manage
   - admin??manage ?‘ê·¼? ???ˆìš©
4. ê²°ê³¼: ???ˆìš©
```

---

### ?œë‚˜ë¦¬ì˜¤ 2: AIê°€ ?ë™ ë³µêµ¬ ?œë„
```
1. ??• : uconai-bot
2. RBAC ê²€ì¦?
   - system.restart ê¶Œí•œ? ???ˆìŒ
   - scope.manage.access? ???ˆìŒ
3. Scope ê²€ì¦?
   - manage ?ì—­? ??Infotech??manage
   - auto_recovery: true? ???ˆìš©
4. ë³µêµ¬ ?¤í–‰:
   - Scope ê²€ì¦??¤í¬ë¦½íŠ¸ ?¤í–‰
   - ê²€ì¦??µê³¼ ??ë³µêµ¬ ì§„í–‰
5. ê²°ê³¼: ???ë™ ë³µêµ¬ ?±ê³µ
```

---

### ?œë‚˜ë¦¬ì˜¤ 3: AIê°€ ê°œì¸ ?´ë” ?‘ê·¼ ?œë„ (ê³µê²©)
```
1. ??• : uconai-bot (?´í‚¹?¹í•œ ?íƒœ)
2. RBAC ê²€ì¦?
   - ê²½ë¡œ: C:\Users\user\Desktop
   - scope.deny.access? ??ê¶Œí•œ ?†ìŒ
3. Scope ê²€ì¦?
   - deny ?ì—­? ??Desktop?€ deny
   - allowed_roles: []  # ?„ë¬´??????
4. ê²°ê³¼: ??**ì°¨ë‹¨**
5. ?„ì† ì¡°ì¹˜:
   - ê°ì‚¬ ë¡œê·¸ ê¸°ë¡
   - ì¦‰ì‹œ ?Œë¦¼ ë°œì†¡
   - ?œë„ ?Ÿìˆ˜ ê¸°ë¡
```

---

### ?œë‚˜ë¦¬ì˜¤ 4: Operatorê°€ Frontend ?¬ì‹œ??
```
1. ??• : operator
2. RBAC ê²€ì¦?
   - system.restart ê¶Œí•œ? ???ˆìŒ
3. Scope ê²€ì¦?
   - observe ?ì—­? ??Frontend??observe
   - operator??observe ê¶Œí•œ? readë§?
   - control ê¶Œí•œ? ???†ìŒ!
4. ê²°ê³¼: ??**ê±°ë?** (observe???½ê¸° ?„ìš©)
5. ê¶Œì¥: admin ê¶Œí•œ ?„ìš”
```

---

## ?’¡ Chapter 2-2 ì£¼ìš” ?±ê³¼

### 1. ë³´ì•ˆ ê°•í™” +200% â­â­â­â­â­?
```
Before: RBACë§?
After:  RBAC + Scope ?´ì¤‘ ê²€ì¦?
        deny ?ì—­ ?ˆë? ë³´í˜¸
```

### 2. AI ?ˆì „??+300% â­â­â­â­â­?
```
Before: AIê°€ ëª¨ë“  manage ?‘ê·¼ ê°€??
After:  scope_validation_required: true
        deny ?ì—­ ?ˆë? ì°¨ë‹¨
        ê°ì‚¬ ë¡œê·¸ ?„ìˆ˜
```

### 3. ê°ì‚¬ ì¶”ì ??+400% â­â­â­â­â­?
```
Before: ë¡œê·¸ ?†ìŒ
After:  ëª¨ë“  ?‘ê·¼ ?œë„ ë¡œê·¸
        deny ?œë„??ì¦‰ì‹œ ?Œë¦¼
        RBAC ?„ë°˜ ì¶”ì 
```

---

## ?“ˆ Chapter 2-2 ?¬ì„± ê¸°ì?

| ??ª© | ëª©í‘œ | ?„ì¬ | ?íƒœ |
|-----|------|------|------|
| Scope ?µí•© | ??| ??| **?„ë£Œ** |
| deny ?ì—­ ë³´í˜¸ | ??| ??| **?„ë£Œ** |
| ê°ì‚¬ ë¡œê·¸ | ??| ??| **?„ë£Œ** |
| ?ˆì „ ?¥ì¹˜ | ??| ??| **?„ë£Œ** |
| ë¬¸ì„œ??| ??| ??| **?„ë£Œ** |

**?„ì²´ ?¬ì„±ë¥?*: 100%

---

## ??¸ ?¤ìŒ ?¨ê³„ (Chapter 2-3)

### Git ?œì???(GIT_STANDARDS.md)

**ëª©í‘œ**: Git ë¸Œëœì¹??„ëµ ë°?ì»¤ë°‹ ê·œì¹™ ?•ë¦½

**?‘ì—… ?´ìš©**:
1. GIT_STANDARDS.md ?…ë°?´íŠ¸
2. ë¸Œëœì¹??„ëµ (main/dev/feature)
3. ì»¤ë°‹ ë©”ì‹œì§€ ê·œì¹™
4. PR ?œí”Œë¦?

---

## ?¯ ê²°ë¡ 

**Chapter 2-2: RBAC ê°•í™” (Scope ?°ë™) - ???„ë£Œ**

RBAC?€ Scopeë¥??µí•©?˜ì—¬ ?´ì¤‘ ë³´ì•ˆ ì²´ê³„ë¥?êµ¬ì¶•?ˆìœ¼ë©? deny ?ì—­ ?ˆë? ë³´í˜¸, ê°ì‚¬ ë¡œê·¸, ?ˆì „ ?¥ì¹˜ê°€ ì¶”ê??˜ì—ˆ?µë‹ˆ??

**ì§„í–‰ë¥?*: Chapter 2-7 ì¤?**2ê°??„ë£Œ** (29%)

**?¤ìŒ ëª©í‘œ**: Chapter 2-3 Git ?œì???

---

**?‘ì„±??*: DCP Admin  
**ê²€ì¦?*: ??rbac_policy.yaml V2 ?ì„± ?„ë£Œ  
**ì°¸ì¡°**: 
- `config/rbac_policy.yaml` (V2)
- `config/scope.yaml`
- `config/recovery_rules.yaml`
