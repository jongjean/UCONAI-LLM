# UCONAI-LLM 2.0: DCP Unified Control & Operation System

> **Version**: 2.0.0 (Production Ready)  
> **Status**: ??Active & Stable  
> **Last Updated**: 2026-02-10

## ?éØ Overview
**UCONAI-LLM 2.0** is the enterprise-grade unified control system for DCP operations.
It integrates **OpenClaw** (Control Plane), **React Frontend** (View Plane), and **PowerShell Automation** (Execution Plane) into a single rigorous framework.

### ?èÜ Key Features (v2.0)
- **Scope Safety System**: Strict **Manage / Observe / Deny** zones.
- **Unified Architecture**: All components (Frontend, Backend, Config) in one repo.
- **Real-time Monitoring**: Watchdog (5-min auto-heal) & Live Dashboard.
- **RBAC V2**: Role-Based Access Control + Scope Policy.
- **AI Integration**: Ollama (Qwen3:8b) for natural language command processing.

---

## ?ìÇ Project Structure (Unified)

```
C:\UCONAI-LLM\          (Project Root)
?ú‚??Ä ?ìÅ frontend\             (React Web UI - Port 5173)
??  ?ú‚??Ä src\                 (Source Code)
??  ?ú‚??Ä .env.local           (API Config)
??  ?î‚??Ä public\              (Static Assets)
??
?ú‚??Ä ?ìÅ scripts\              (Backend Automation)
??  ?ú‚??Ä ops\                 (Operational Scripts)
??  ?ú‚??Ä health\              (Health Check V2 with Scope)
??  ?ú‚??Ä core\                (Standard Wrapper)
??  ?î‚??Ä automation\          (Watchdog & Auto-Heal)
??
?ú‚??Ä ?ìÅ config\               (Configuration Center)
??  ?ú‚??Ä systems.yaml         (System Definitions)
??  ?ú‚??Ä scope.yaml           (Safety Zones)
??  ?î‚??Ä rbac_policy.yaml     (Security Roles)
??
?ú‚??Ä ?ìÅ docs\                 (Documentation)
??  ?ú‚??Ä UCONAI_LLM_2.0_COMPLETE.md (Release Notes)
??  ?ú‚??Ä FRONTEND_MIGRATION_GUIDE.md (Migration Log)
??  ?î‚??Ä ARCHITECTURE.md      (High-Level Design)
??
?î‚??Ä ?ìÅ logs\                 (Centralized Logs)
```

## ?? Quick Start

### 1. Backend Services
```powershell
# Start all core services (Gateway, Controller, Watchdog)
C:\UCONAI-LLM\scripts\ops\Start-All.ps1
```

### 2. Frontend UI
```powershell
cd C:\UCONAI-LLM\frontend
npm install  # First time only
npm run dev  # Start Dev Server (http://localhost:5173)
```

### 3. Check Status
```powershell
# CLI Dashboard
C:\UCONAI-LLM\scripts\ops\Dashboard.ps1

# Web Dashboard
http://localhost:5173
```

---

## ?ìä Development Status

| Component | Status | Progress | Last Update |
|-----------|--------|----------|-------------|
| **Core Engine** | ?ü¢ Stable | 100% | v2.0.0 |
| **Frontend** | ?ü¢ Migrated | 100% | v2.0.0 |
| **Scope System**| ?ü¢ Active | 100% | v2.0.0 |
| **RBAC** | ?ü¢ Active | 100% | v2.0.0 |
| **Watchdog** | ?ü¢ Active | 100% | v2.0.0 |

---

## ?ìö Recent Documentation
- [UCONAI-LLM 2.0 Completion Report](docs/UCONAI_LLM_2.0_COMPLETE.md)
- [Frontend Migration Guide](docs/FRONTEND_MIGRATION_GUIDE.md)
- [Scope Policy Definition](config/scope.yaml)
- [RBAC Policy Definition](config/rbac_policy.yaml)
