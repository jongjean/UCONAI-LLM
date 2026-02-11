# DCP Git Development Standards V2
# Chapter 2-3: Git ?œì???
# Version: 2.0
# Updated: 2026-02-10

## ?“‹ ëª©ì°¨
1. [ë¸Œëœì¹??„ëµ](#1-ë¸Œëœì¹??„ëµ)
2. [ì»¤ë°‹ ì»¨ë²¤??(#2-ì»¤ë°‹-ì»¨ë²¤??
3. [PR/MR ê°€?´ë“œ?¼ì¸](#3-prmr-ê°€?´ë“œ?¼ì¸)
4. [ë³´ì•ˆ ê°€?´ë“œ?¼ì¸](#4-ë³´ì•ˆ-ê°€?´ë“œ?¼ì¸)
5. [?‘ì—… ?Œí¬?Œë¡œ??(#5-?‘ì—…-?Œí¬?Œë¡œ??
6. [ë¦´ë¦¬??ê´€ë¦?(#6-ë¦´ë¦¬??ê´€ë¦?
7. [ì¶©ëŒ ?´ê²°](#7-ì¶©ëŒ-?´ê²°)

---

## 1. ë¸Œëœì¹??„ëµ

### Git Flow ?¨ìˆœ???„ëµ

| ë¸Œëœì¹?| ?©ë„ | ë³´í˜¸ ?˜ì? | ê¶Œí•œ |
|--------|------|-----------|------|
| `main` | ?œí’ˆ ì¶œì‹œ ë°?ë°°í¬ (Stable) | ?”’ ìµœìƒ | Adminë§?ë³‘í•© |
| `develop` | ?¤ìŒ ì¶œì‹œ ?µí•© ë¸Œëœì¹?| ?”’ ?’ìŒ | PR ?„ìˆ˜ |
| `feature/*` | ê¸°ëŠ¥ ê°œë°œ (?¨ê¸°) | - | ?´ë‹¹??|
| `fix/*` | ê¸´ê¸‰ ë²„ê·¸ ?˜ì • | - | ëª¨ë“  ê°œë°œ??|
| `hotfix/*` | ?„ë¡œ?•ì…˜ ê¸´ê¸‰ ?˜ì • | ?”’ ì¤‘ê°„ | Admin ?¹ì¸ |
| `release/*` | ë¦´ë¦¬??ì¤€ë¹?| ?”’ ?’ìŒ | Adminë§?|

### ë¸Œëœì¹?ëª…ëª… ê·œì¹™

```bash
# ê¸°ëŠ¥ ê°œë°œ
feature/chapter-2-3-git-standards
feature/dashboard-ui
feature/rbac-integration

# ë²„ê·¸ ?˜ì •
fix/controller-port-binding
fix/watchdog-task-error
fix/health-check-timeout

# ê¸´ê¸‰ ?˜ì • (main?ì„œ ë¶„ê¸°)
hotfix/security-patch-1.2.3
hotfix/critical-memory-leak

# ë¦´ë¦¬??(develop?ì„œ ë¶„ê¸°)
release/v1.0.0
release/v1.1.0-beta
```

**ê·œì¹™**:
- ?Œë¬¸?ë§Œ ?¬ìš©
- ?¨ì–´???˜ì´??`-`)?¼ë¡œ êµ¬ë¶„
- Chapter ë²ˆí˜¸ ?¬í•¨ ê¶Œì¥
- ?´ìŠˆ ë²ˆí˜¸ ?¬í•¨ ê°€??(`feature/123-user-auth`)

---

## 2. ì»¤ë°‹ ì»¨ë²¤??

### Conventional Commits ê¸°ë°˜

#### ê¸°ë³¸ ?•ì‹
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

#### Type (?„ìˆ˜)

| Type | ?¤ëª… | ?ˆì‹œ |
|------|------|------|
| `feat` | ? ê·œ ê¸°ëŠ¥ ì¶”ê? | feat: Dashboard ?¤ì‹œê°?ëª¨ë“œ ì¶”ê? |
| `fix` | ë²„ê·¸ ?˜ì • | fix: Controller ?¬íŠ¸ ë°”ì¸???¤ë¥˜ ?´ê²° |
| `docs` | ë¬¸ì„œ ?˜ì • | docs: RBAC V2 ê°€?´ë“œ ?‘ì„± |
| `style` | ì½”ë“œ ?¤í???(ê¸°ëŠ¥ ë³€???†ìŒ) | style: Dashboard ?¤ì—¬?°ê¸° ?˜ì • |
| `refactor` | ë¦¬íŒ©? ë§ | refactor: Health Check ë¡œì§ ê°œì„  |
| `test` | ?ŒìŠ¤??ì¶”ê?/?˜ì • | test: Watchdog ?¨ìœ„ ?ŒìŠ¤??ì¶”ê? |
| `chore` | ë¹Œë“œ/?¤ì • ë³€ê²?| chore: .gitignore ?…ë°?´íŠ¸ |
| `perf` | ?±ëŠ¥ ê°œì„  | perf: Scope ê²€ì¦??ë„ 2x ?¥ìƒ |

#### Scope (? íƒ)

```bash
feat(dashboard): ?‰ìƒ ì½”ë”© ì¶”ê?
fix(watchdog): ë¬´í•œ ë£¨í”„ ?´ê²°
docs(chapter-1): Gate 1 ë³´ê³ ???‘ì„±
```

**Scope ?ˆì‹œ**:
- `dashboard`, `watchdog`, `health-check`
- `rbac`, `scope`, `recovery`
- `chapter-1`, `chapter-2`
- `frontend`, `controller`, `gateway`

#### Subject (?œëª©)

**ê·œì¹™**:
- 50???´ë‚´
- ëª…ë ¹???„ì¬ ?œì œ ("ì¶”ê??? ?? "ì¶”ê?" ??
- ì²?ê¸€???Œë¬¸??
- ë§ˆì¹¨???†ìŒ

**ì¢‹ì? ?ˆì‹œ**:
```bash
feat: CLI Dashboard ì¶”ê?
fix: Controller ?¬íŠ¸ 18082 ë°”ì¸???¤ë¥˜ ?´ê²°
docs: Chapter 2-2 RBAC ê°•í™” ?„ë£Œ ë³´ê³ ??
```

**?˜ìœ ?ˆì‹œ**:
```bash
Updated files.  ??(ë¶ˆëª…??
Fixed bug  ??(?´ë–¤ ë²„ê·¸?)
ì¶”ê??ˆìŒ.  ??(ëª…ë ¹???„ë‹˜)
```

#### Body (ë³¸ë¬¸, ? íƒ)

```bash
feat(watchdog): Scope ê¸°ë°˜ ?ë™ ë³µêµ¬ ì¶”ê?

Scope.yaml??manage ?ì—­???ˆëŠ” ?œìŠ¤?œë§Œ ?ë™ ë³µêµ¬ ?˜í–‰.
observe?€ deny ?ì—­?€ ?ë™ ë³µêµ¬ ?€?ì—???œì™¸?˜ì—¬ ?ˆì „???•ë³´.

- manage: 7ê°??œìŠ¤???ë™ ë³µêµ¬ ê°€??
- observe: ?½ê¸° ?„ìš©, ë³µêµ¬ ë¶ˆê?
- deny: ?ˆë? ?‘ê·¼ ë¶ˆê?
```

#### Footer (?¸í„°, ? íƒ)

```bash
fix(controller): ?¬íŠ¸ ë°”ì¸???¤ë¥˜ ?´ê²°

?¬íŠ¸ 17777ê³?18082ë¥??™ì‹œ ë°”ì¸?©í•˜?„ë¡ ?˜ì •.
ë¶€?????ë™ ?œì‘ ?ˆì •???¥ìƒ.

Fixes #123
Closes #456
BREAKING CHANGE: ?¬íŠ¸ ?¤ì • ë³€ê²??„ìš”
```

**Footer ?¤ì›Œ??*:
- `Fixes #123`: ?´ìŠˆ ?˜ì •
- `Closes #456`: ?´ìŠˆ ì¢…ë£Œ
- `Refs #789`: ì°¸ì¡°
- `BREAKING CHANGE`: ?¸í™˜??ê¹¨ì???ë³€ê²?

### ì»¤ë°‹ ë©”ì‹œì§€ ?ˆì‹œ (Chapter 1 ?„ë£Œ)

```bash
feat: Chapter 1 ?„ë£Œ - ê´€??ê¸°ë°˜ êµ¬ì¶•

[Chapter 1-0] ?´ì˜ ?ˆì „ë§?êµ¬ì¶•
- scope.yaml: 12ê°??œìŠ¤??ë¶„ë¥˜ (Manage/Observe/Deny)
- Validate-Scope.ps1: ?•í•©??ê²€ì¦?
- SCOPE_POLICY.md: 400 lines ?´ì˜ ê°€?´ë“œ

[Chapter 1-3] Controller ?œë¹„?¤í™”
- Task Scheduler ?µí•©
- Install-DCP-Controller.ps1

[Chapter 1-4] Watchdog Monitor
- Watchdog-Monitor.ps1: 5ë¶?ì£¼ê¸° ?ë™ ê°ì‹œ
- Scope ê¸°ë°˜ ?ë™ ë³µêµ¬

[Chapter 1-5] Health Check V2
- health-all.ps1 ?„ì „ ?¬ì‘??
- Scope ?µí•©, ?ë™ ë³µêµ¬

[Chapter 1-6] CLI Dashboard
- Dashboard.ps1: ?¤ì‹œê°??°ë???UI
- ?‰ìƒ ì½”ë”©, Scope ?œì‹œ

[Chapter 1-7] Gate 1 ê²€ì¦?
- GATE_1_VERIFICATION.md
- 82/100 ì¡°ê±´ë¶€ ?µê³¼

?„ì„±?? 1.3% ??7.0% (+5.7%p)
?Œì¼: 21ê°?(?ì„± 18 + ?˜ì • 3)
?¼ì¸: 5,700+
Gate 1: PASSED (82??

?¤ìŒ: Chapter 2-1 (VS Code ?µí•©)

BREAKING CHANGE: health-all.ps1 V2 ?¬ì‘?±ìœ¼ë¡?ê¸°ì¡´ ?¤í¬ë¦½íŠ¸ ?¸í™˜ ë¶ˆê?

Co-authored-by: Antigravity AI <ai@deepmind>
```

---

## 3. PR/MR ê°€?´ë“œ?¼ì¸

### Pull Request ?„ë¡œ?¸ìŠ¤

#### 1. PR ?ì„± ??ì²´í¬ë¦¬ìŠ¤??

- [ ] ë¡œì»¬ ?ŒìŠ¤???„ë£Œ
- [ ] ì½”ë“œ ë¦°íŠ¸ ?µê³¼
- [ ] ì»¤ë°‹ ë©”ì‹œì§€ ê·œì¹™ ì¤€??
- [ ] ì¶©ëŒ ?†ìŒ
- [ ] `.gitignore` ?•ì¸ (ë¹„ë??•ë³´ ?†ìŒ)

#### 2. PR ?œëª© ê·œì¹™

```
[Chapter X-Y] ?œëª© - ?µì‹¬ ?´ìš©

?ˆì‹œ:
[Chapter 1] ê´€??ê¸°ë°˜ êµ¬ì¶• - Scope + Watchdog + Dashboard
[Chapter 2-2] RBAC ê°•í™” - Scope ?°ë™ ë°??´ì¤‘ ë³´ì•ˆ
[Hotfix] Controller ?¬íŠ¸ ë°”ì¸??ê¸´ê¸‰ ?˜ì •
```

#### 3. PR ?œí”Œë¦?

```markdown
## ?“‹ ?‘ì—… ?´ìš©

### ?„ë£Œ??Chapter
- Chapter X-Y: ?œëª©

### ì£¼ìš” ë³€ê²½ì‚¬??
- ê¸°ëŠ¥ 1
- ê¸°ëŠ¥ 2
- ê¸°ëŠ¥ 3

## ??ì²´í¬ë¦¬ìŠ¤??

- [ ] ë¡œì»¬ ?ŒìŠ¤???„ë£Œ
- [ ] ë¬¸ì„œ ?…ë°?´íŠ¸ ?„ë£Œ
- [ ] ì»¤ë°‹ ë©”ì‹œì§€ ê·œì¹™ ì¤€??
- [ ] ì¶©ëŒ ?´ê²° ?„ë£Œ

## ?“Š ?ŒìŠ¤??ê²°ê³¼

```
?ŒìŠ¤??ëª…ë ¹?? powershell -File test.ps1
ê²°ê³¼: PASSED
```

## ?“ ì°¸ê³ ?¬í•­

(?¹ì´?¬í•­, ì£¼ì˜?¬í•­, ì¶”ê? ?¤ëª… ??

## ?”— ê´€???´ìŠˆ

Fixes #123
Refs #456
```

#### 4. ë¦¬ë·° ê·œì¹™

- **?„ìˆ˜ ?¹ì¸??*: 1ëª??´ìƒ (Chapter ?„ë£Œ??2ëª?
- **ë¦¬ë·° ê¸°í•œ**: 24?œê°„ ?´ë‚´
- **ë³€ê²??”ì²­**: ëª…í™•???´ìœ  ë°??€???œì‹œ

---

## 4. ë³´ì•ˆ ê°€?´ë“œ?¼ì¸

### ?ˆë? ì»¤ë°‹ ê¸ˆì? ??ª©

1. **ë¹„ë?ë²ˆí˜¸ ë°?? í°**
   ```bash
   # ??ê¸ˆì?
   api_key = "sk-1234567890abcdef"
   password = "mySecretPass123"
   
   # ???ˆìš©
   api_key = "${CRED:openai-api-key}"
   password = "${ENV:DB_PASSWORD}"
   ```

2. **ê°œì¸ ?•ë³´**
   - ?´ë©”?? ?„í™”ë²ˆí˜¸, ì£¼ì†Œ
   - ?¤ëª… (ê³µê°œ ?¹ì¸ ?œì™¸)
   - ?´ë? IP ì£¼ì†Œ

3. **ë¡œì»¬ ?¤ì • ?Œì¼**
   ```bash
   # .gitignore???„ìˆ˜ ì¶”ê?
   *.local
   *.env
   .env.*
   config/local.yaml
   secrets/
   credentials/
   ```

### .gitignore ?œì?

```gitignore
# DCP ?œì? .gitignore

# ============================================================
# OS ?ì„± ?Œì¼
# ============================================================
Thumbs.db
.DS_Store
desktop.ini

# ============================================================
# ê°œë°œ ?˜ê²½
# ============================================================
.vscode/
.idea/
*.swp
*.swo
*~

# ============================================================
# ë¹Œë“œ ê²°ê³¼ë¬?
# ============================================================
node_modules/
dist/
build/
*.exe
*.dll
*.so

# ============================================================
# ë¡œê·¸ ë°??„ì‹œ ?Œì¼
# ============================================================
logs/
*.log
tmp/
temp/
*.tmp

# ============================================================
# ë³´ì•ˆ ê´€??(ì¤‘ìš”!)
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
# DCP ?¹í™”
# ============================================================
backups/
C:\OpenClaw\logs/
```

### ë¹„ë? ?•ë³´ ?„ì¶œ ???€??

1. **ì¦‰ì‹œ ì¤‘ë‹¨**: ???´ìƒ ì»¤ë°‹?˜ì? ?ŠìŒ
2. **ë¹„ë? ë¬´íš¨??*: API ??? í° ì¦‰ì‹œ ?¬ë°œê¸?
3. **?ˆìŠ¤? ë¦¬ ?•ë¦¬**: `git filter-branch` ?ëŠ” `BFG Repo-Cleaner`
4. **ë³´ê³ **: ê´€ë¦¬ì?ê²Œ ì¦‰ì‹œ ë³´ê³ 
5. **?¬ë°œ ë°©ì?**: pre-commit hook ?¤ì •

---

## 5. ?‘ì—… ?Œí¬?Œë¡œ??

### ?¼ë°˜ ê¸°ëŠ¥ ê°œë°œ

```bash
# 1. develop?ì„œ feature ë¸Œëœì¹??ì„±
git checkout develop
git pull origin develop
git checkout -b feature/chapter-2-3-git-standards

# 2. ?‘ì—… ?˜í–‰
# ... ì½”ë”© ...

# 3. ì»¤ë°‹
git add .
git commit -m "feat(git): GIT_STANDARDS.md V2 ?‘ì„±"

# 4. ?ê²© ?¸ì‹œ
git push origin feature/chapter-2-3-git-standards

# 5. PR ?ì„± (GitHub/GitLab)
# develop <- feature/chapter-2-3-git-standards

# 6. ë¦¬ë·° ë°??¹ì¸ ??ë³‘í•©
git checkout develop
git pull origin develop

# 7. feature ë¸Œëœì¹??? œ
git branch -d feature/chapter-2-3-git-standards
```

### ê¸´ê¸‰ ?˜ì • (Hotfix)

```bash
# 1. main?ì„œ hotfix ë¸Œëœì¹??ì„±
git checkout main
git pull origin main
git checkout -b hotfix/controller-port-binding

# 2. ?˜ì • ë°?ì»¤ë°‹
git commit -m "fix(controller): ?¬íŠ¸ 18082 ë°”ì¸???¤ë¥˜ ê¸´ê¸‰ ?˜ì •"

# 3. mainê³?develop ëª¨ë‘??ë³‘í•©
git checkout main
git merge --no-ff hotfix/controller-port-binding
git push origin main

git checkout develop
git merge --no-ff hotfix/controller-port-binding
git push origin develop

# 4. hotfix ë¸Œëœì¹??? œ
git branch -d hotfix/controller-port-binding
```

---

## 6. ë¦´ë¦¬??ê´€ë¦?

### Release ë¸Œëœì¹?

```bash
# 1. develop?ì„œ release ë¸Œëœì¹??ì„±
git checkout develop
git checkout -b release/v1.0.0

# 2. ë²„ì „ ë²ˆí˜¸ ?…ë°?´íŠ¸
# - README.md
# - package.json
# - metadata.yaml

# 3. ìµœì¢… ?ŒìŠ¤??ë°?ë²„ê·¸ ?˜ì •

# 4. mainê³?develop??ë³‘í•©
git checkout main
git merge --no-ff release/v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0 - Chapter 1 ?„ë£Œ"
git push origin main --tags

git checkout develop
git merge --no-ff release/v1.0.0
git push origin develop

# 5. release ë¸Œëœì¹??? œ
git branch -d release/v1.0.0
```

### ë²„ì „ ?œê·¸ ê·œì¹™

**Semantic Versioning (SemVer)**:
```
v<MAJOR>.<MINOR>.<PATCH>

?ˆì‹œ:
v1.0.0  - ì²??•ì‹ ë¦´ë¦¬??
v1.1.0  - ê¸°ëŠ¥ ì¶”ê?
v1.1.1  - ë²„ê·¸ ?˜ì •
v2.0.0  - ?¸í™˜??ê¹¨ì???ë³€ê²?
```

**?œê·¸ ë©”ì‹œì§€**:
```bash
git tag -a v1.0.0 -m "Release v1.0.0 - UCONAI-LLM Chapter 1 ?„ë£Œ

ì£¼ìš” ê¸°ëŠ¥:
- Scope ê¸°ë°˜ ?ˆì „ë§?
- Watchdog ?ë™ ê°ì‹œ
- CLI Dashboard
- Gate 1 ?µê³¼ (82??

?„ì„±?? 7.0%
"
```

---

## 7. ì¶©ëŒ ?´ê²°

### ì¶©ëŒ ë°œìƒ ??

```bash
# 1. develop ìµœì‹  ?íƒœë¡??…ë°?´íŠ¸
git checkout develop
git pull origin develop

# 2. feature ë¸Œëœì¹˜ë¡œ ?Œì•„ê°€??rebase
git checkout feature/my-feature
git rebase develop

# 3. ì¶©ëŒ ?Œì¼ ?•ì¸
git status

# 4. ì¶©ëŒ ?´ê²° (?˜ë™ ?¸ì§‘)
# <<<<<<< HEAD
# ?˜ì˜ ë³€ê²?
# =======
# ?¤ë¥¸ ?¬ëŒ??ë³€ê²?
# >>>>>>> develop

# 5. ?´ê²° ??ê³„ì†
git add <ì¶©ëŒ?Œì¼>
git rebase --continue

# 6. ê°•ì œ ?¸ì‹œ (rebase ???„ìˆ˜)
git push origin feature/my-feature --force-with-lease
```

### ì¶©ëŒ ?ˆë°©

1. **?ì£¼ pull**: `git pull origin develop` ë§¤ì¼ ?„ì¹¨
2. **?‘ì? ?¨ìœ„**: feature ë¸Œëœì¹??˜ëª… ì§§ê²Œ (1-3??
3. **?˜ì‚¬?Œí†µ**: ê°™ì? ?Œì¼ ?‘ì—… ???¬ì „ ì¡°ìœ¨

---

## 8. ? ìš©??Git ëª…ë ¹??

### ?ˆìŠ¤? ë¦¬ ì¡°íšŒ

```bash
# ë¡œê·¸ ë³´ê¸° (?ˆì˜ê²?
git log --oneline --graph --all --decorate

# ?¹ì • ?Œì¼ ë³€ê²??´ë ¥
git log -p <?Œì¼ëª?

# ì»¤ë°‹ ?µê³„
git shortlog -sn
```

### ë³€ê²?ì·¨ì†Œ

```bash
# ë§ˆì?ë§?ì»¤ë°‹ ë©”ì‹œì§€ ?˜ì •
git commit --amend

# ?¤í…Œ?´ì§• ì·¨ì†Œ
git reset HEAD <?Œì¼>

# ?‘ì—… ?”ë ‰? ë¦¬ ë³€ê²?ì·¨ì†Œ
git checkout -- <?Œì¼>

# ì»¤ë°‹ ?˜ëŒë¦¬ê¸° (?´ë ¥ ? ì?)
git revert <commit-hash>
```

### ë¸Œëœì¹?ê´€ë¦?

```bash
# ë¡œì»¬ ë¸Œëœì¹?ëª©ë¡
git branch

# ?ê²© ë¸Œëœì¹??¬í•¨
git branch -a

# ë³‘í•©??ë¸Œëœì¹??? œ
git branch --merged | grep -v "\\*\\|main\\|develop" | xargs -n 1 git branch -d
```

---

## 9. Chapterë³?ì»¤ë°‹ ê¶Œì¥?¬í•­

| Chapter | ì»¤ë°‹ ì£¼ê¸° | PR ?¬ê¸° |
|---------|-----------|---------|
| Chapter 1-X | ?˜ìœ„ Chapter ?„ë£Œ ??| ?Œí˜• (1-5 ?Œì¼) |
| Gate X | Gate ?µê³¼ ??| ?€??(?„ì²´) |
| Hotfix | ì¦‰ì‹œ | ì´ˆì†Œ??(1-2 ?Œì¼) |

---

## ??Git ?œì? ì²´í¬ë¦¬ìŠ¤??

### ì»¤ë°‹ ??
- [ ] `.gitignore` ?•ì¸
- [ ] ë¹„ë??•ë³´ ?œê±°
- [ ] ì»¤ë°‹ ë©”ì‹œì§€ ê·œì¹™ ì¤€??
- [ ] ë¡œì»¬ ?ŒìŠ¤???µê³¼

### PR ??
- [ ] `develop` ë¸Œëœì¹˜ì? ?™ê¸°??
- [ ] ì¶©ëŒ ?´ê²° ?„ë£Œ
- [ ] PR ?œí”Œë¦??‘ì„±
- [ ] ë¦¬ë·°??ì§€??

### ë³‘í•© ??
- [ ] ë¦¬ë·° ?¹ì¸ ?„ë£Œ
- [ ] CI/CD ?µê³¼ (êµ¬ì¶• ??
- [ ] ìµœì¢… ?ŒìŠ¤???•ì¸

---

**ë²„ì „**: V2.0  
**?…ë°?´íŠ¸**: 2026-02-10  
**?‘ì„±??*: DCP Admin  
**?¤ìŒ ?…ë°?´íŠ¸**: Chapter 2-6 CI/CD ??
