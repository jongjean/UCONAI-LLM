# UCONAI-LLM Troubleshooting Guide

## Frontend (Port 5173) Connection Issues

### ?”´ ì¦ìƒ (Symptoms)
- `http://localhost:5173` ?‘ì† ë¶ˆê? (ERR_CONNECTION_REFUSED)
- ?°ë??ì´??ë¡œê·¸??`'vite'?€(?? ?´ë? ?ëŠ” ?¸ë? ëª…ë ¹...` ?¤ë¥˜ ë°œìƒ
- Self-Healing ?ëŠ” Recovery ?¤í¬ë¦½íŠ¸ ?¤í–‰ ì§í›„ ë°œìƒ ê°€?¥ì„± ?’ìŒ

### ?” ?ì¸ (Cause)
- ë³µêµ¬ ?¤í¬ë¦½íŠ¸(`RECOVERY_v1.1.ps1`) ?¤í–‰ ?„ì¤‘ `node_modules` ?´ë”ê°€ ?? œ?˜ê±°???Œì¼??? ê¸´ ?íƒœ?ì„œ ë³µì‚¬ê°€ ?œë„?˜ì–´ `vite` ?¤í–‰ ?Œì¼ ë§í¬(bin link)ê°€ ? ì‹¤??
- **ì£¼ì˜**: ?„ì²´ ?´ë”ê°€ ?ìƒ??ê²ƒì´ ?„ë‹ˆ?? ?¤í–‰ ?Œì¼(.bin) ?°ê²°ë§??Šì–´ì§?ê²½ìš°ê°€ ?€ë¶€ë¶„ì„.

### ???´ê²° ë°©ë²• (Solution)
**?ˆë? ?„ì²´ ?´ë”ë¥??? œ?˜ê±°??ë¬´ë¦¬?˜ê²Œ ?¬ì„¤ì¹˜í•˜ì§€ ë§ˆì‹­?œì˜¤.**

1. **Frontend ?´ë”ë¡??´ë™**
   ```powershell
   cd C:\UCONAI-LLM\frontend
   ```

2. **?˜ì¡´???°ê²° ë³µêµ¬ (1ë¶??Œìš”)**
   ```powershell
   npm install
   ```
   *`npm install`?€ ?„ë½???¨í‚¤ì§€ë§?ì±„ì›Œ?£ìœ¼ë¯€ë¡??„ì²´ ?? œë³´ë‹¤ ?¨ì”¬ ë¹ ë¥´ê³??ˆì „?©ë‹ˆ??*

3. **?œë²„ ?¬ì‹œ??*
   ```powershell
   npm run dev
   ```

---

## Service Ports
- **Frontend**: 5173
- **Controller**: 18080
- **AI Bridge**: 18081
- **Gateway**: 18082
- **MCP Server**: 18083
