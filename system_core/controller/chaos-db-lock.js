const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./uconai.db');

console.log("[CHAOS] Locking DB for 10 seconds (EXCLUSIVE)...");
db.serialize(() => {
    db.run("BEGIN EXCLUSIVE TRANSACTION");
    setTimeout(() => {
        db.run("COMMIT", () => {
            console.log("[CHAOS] DB Unlocked.");
            db.close();
        });
    }, 10000);
});
