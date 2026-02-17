const { exec } = require('child_process');
const cmd = 'powershell -Command "Get-Process | Where-Object { $_.MainWindowTitle } | Select-Object Name, MainWindowTitle, WorkingSet | Sort-Object WorkingSet -Descending | Select-Object -First 15 | ConvertTo-Json"';
exec(cmd, (err, stdout, stderr) => {
    if (err) {
        console.error(stderr);
    } else {
        console.log(stdout);
    }
    process.exit();
});
