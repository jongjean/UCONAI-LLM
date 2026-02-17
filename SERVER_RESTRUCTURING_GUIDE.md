# ?? URGENT: Server Data Restructuring Directive
**Target System**: UCONAI ESG Website (`/home/ucon/esg`)
**Objective**: Decouple persistent data (DB, Uploads) from application code to prevent data loss during deployment.

---

## ?? Critical Issue Analysis
Currently, the SQLite database (`esg.db`) and uploaded files (`uploads/`) reside inside the application directory (`server/`).
This violates the **Stateless Web Server Principle**:
1. **Data Loss Risk**: `deploy_esg.sh` overwrites `/var/www/esg/`, potentially deleting user data.
2. **Inconsistency**: The Live DB (`/var/www/.../esg.db`) differs from the Source DB (`/home/.../esg.db`).
3. **Security**: Data files are exposed within the web root if not carefully configured.

---

## ????Action Plan: Restructuring (Must Execute in Order)

### Phase 1: Establish Persistent Data Layer (Safe Zone)
Move all persistent data out of the web root (`/var/www`) and source code (`/home/ucon/esg`).

1. **Create Data Directory (Outside Web Root)**
   ```bash
   mkdir -p /home/ucon/esg_data/db
   mkdir -p /home/ucon/esg_data/uploads/posts
   mkdir -p /home/ucon/esg_data/uploads/slides
   chmod -R 755 /home/ucon/esg_data
   chown -R ucon:ucon /home/ucon/esg_data
   ```

2. **Migrate Existing Data**
   - **Database**: 
     - Check which DB has the latest/most data (likely `/home/ucon/esg/server/esg.db` or `/var/www/esg/server/esg.db`).
     - Copy the **Master DB** to `/home/ucon/esg_data/db/esg.db`.
   - **Uploads**:
     - Consolidate all images from both locations to `/home/ucon/esg_data/uploads/`.
     - *Caution: Do not simply overwrite; ensure no filenames clash if needed, though timestamps usually prevent this.*

---

### Phase 2: Update Application Code (Backend)

Modify the Node.js application to use **Absolute Paths** or **Environment Variables** for data access.

#### 1. `server/db.js` (Database Connection)
**Current (Bad):**
```javascript
const db = new sqlite3.Database('./esg.db'); // Relative to CWD
```

**Required Change:**
```javascript
const DB_PATH = process.env.DB_PATH || '/home/ucon/esg_data/db/esg.db';
const db = new sqlite3.Database(DB_PATH);
console.log(`?? Connected to database at: ${DB_PATH}`);
```

#### 2. `server/routes/posts.js` (File Uploads)
**Current (Bad):**
```javascript
cb(null, 'uploads/posts'); // Relative path inside server/
```

**Required Change:**
```javascript
const UPLOAD_ROOT = process.env.UPLOAD_ROOT || '/home/ucon/esg_data/uploads';
const POSTS_DIR = path.join(UPLOAD_ROOT, 'posts');

// Ensure directory exists at startup
if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });

cb(null, POSTS_DIR);
```

#### 3. `server/server.js` (Static File Serving)
You must explicitly serve the external upload directory.
```javascript
app.use('/uploads', express.static('/home/ucon/esg_data/uploads'));
```

---

### Phase 3: Enhance Deployment Script (`deploy_esg.sh`)

The deployment script must **NEVER** touch the data directory, but ensuring the code points to it.

**Required Changes:**
1. **Do NOT copy** `esg.db` or `uploads/` from source to target.
2. **Symlink Strategy** (Optional but recommended for PHP/Apache compatibility):
   - Link `/var/www/esg/server/uploads` -> `/home/ucon/esg_data/uploads` if needed.
   - However, since we updated Node.js to use absolute paths, symlinks might not be necessary for the backend, only for serving static files if you don't use `express.static`.

**Modified `deploy_esg.sh` Logic:**
```bash
# ... (Standard Deployment Lines) ...

# ?? Critical: Do NOT overwrite data
echo "?? Preserving Persistent Data..."

# Link the external data directory to the web root for static serving (if using Nginx/Apache to serve files directly)
# or just rely on Node.js static serving (Preferred for this setup).

# Restart Node Service to pick up new paths
sudo systemctl restart esg-server
```

---

## ??Verification Checklist (DoD)

1.  **Persistence Test**:
    - Deploy the app.
    - Create a new post with an image.
    - Deploy the app **AGAIN**.
    - **Verify**: The post and image MUST still exist.

2.  **Data Location**:
    - Verify `ls -l /home/ucon/esg_data/db/esg.db` timestamp updates when a post is read/written.
    - Verify `ls -l /var/www/esg/server/esg.db` does **NOT** exist (or is ignored).

3.  **Process Check**:
    - `lsof -p <node_pid> | grep esg_data` should show open handles to the new location.

---
**Signed by**: UCONAI Command Center (AI Controller)
**Date**: 2026-02-17
