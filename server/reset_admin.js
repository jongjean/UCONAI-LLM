const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.resolve(__dirname, 'esg.db');
const db = new sqlite3.Database(dbPath);

const newPassword = 'admin1234!';

(async () => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.run(`UPDATE members SET password = ?, role = 'super_admin', member_status = 'active' WHERE user_id = 'admin'`,
        [hashedPassword],
        function (err) {
            if (err) {
                console.error('❌ Error:', err.message);
            } else {
                console.log('✅ Admin password reset successfully!');
                console.log('');
                console.log('═══════════════════════════════════');
                console.log('  최고관리자 계정 정보');
                console.log('═══════════════════════════════════');
                console.log('  이메일: admin@esg.or.kr');
                console.log('  비밀번호: admin1234!');
                console.log('  역할: super_admin');
                console.log('═══════════════════════════════════');
            }
            db.close();
            process.exit(0);
        }
    );
})();
