# UCONAI 2.0 - Context7 Connector Deployment Guide

This connector is built according to the **UCONAI v2.2 Standard Architecture**. It separates code from data and implements a 3-tier pipeline (Pull -> Sync -> Index).

## 🚀 Quick Start (External PC)

1. **Prerequisites**:
   - Node.js v18.0.0+ 
   - npm v10.0.0+

2. **Clone/Copy**:
   - Copy the `connectors/context7` folder to your workspace.
   - Create a directory for the Vault (e.g., `C:\UCONAI-Vault\context7`).

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Environment Setup**:
   - Create a `.env` file in this directory:
     ```env
     CONTEXT7_TOKEN=your_personal_access_token_here
     ```

5. **Configuration**:
   - Update `context7.config.json` to point to your Vault path:
     ```json
     {
       "vaultRoot": "C:\\UCONAI-Vault\\context7",
       ...
     }
     ```

6. **Run Pipeline**:
   ```bash
   # Phase 1: Pull full snapshot
   npm run pull -- /org/repo-path
   
   # Phase 2: Incremental Sync
   npm run sync -- /org/repo-path
   
   # Phase 3: Build Search Index
   npm run index -- /org/repo-path
   ```

## 🏛️ Directory Structure
- `raw/`: Raw source files and document content.
- `meta/`: Manifests, hashes, and audit logs.
- `index/`: Processed data for LLM context injection.
