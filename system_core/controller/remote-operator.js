const { exec } = require('child_process');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'uconai.db'));

const SAFE_TOOLS = {
    'sys_check': {
        cmd: 'powershell -Command "Get-Service | Where-Object {$_.Status -eq \'Running\'} | Select-Object -First 5 | Format-Table"',
        risk: 'LOW',
        description: '실행 중인 주요 서비스 확인'
    },
    'disk_usage': {
        cmd: 'powershell -Command "Get-PSDrive C | Select-Object Used, Free"',
        risk: 'LOW',
        description: 'C 드라이브 용량 확인'
    },
    'uptime': {
        cmd: 'powershell -Command "(Get-Date) - (Get-Process -Id $PID).StartTime"',
        risk: 'LOW',
        description: '시스템 가동 시간 확인'
    },
    'tail_logs': {
        cmd: (params) => `powershell -Command "Get-Content -Path '${params.path || 'uconai.log'}' -Tail ${params.lines || 10}"`,
        risk: 'MEDIUM',
        description: '최근 로그 조회',
        params: ['path', 'lines']
    },
    'weather': {
        cmd: (params) => `powershell -Command "$wc = New-Object System.Net.WebClient; $wc.DownloadString('http://wttr.in/${params.city || 'Seoul'}?format=3')"`,
        risk: 'LOW',
        description: '현재 날씨 정보 확인 (기본: 서울)',
        params: ['city']
    },
    'app_list': {
        cmd: 'powershell -Command "Get-ItemProperty HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Sort-Object DisplayName | Select-Object -First 15 -Property DisplayName, DisplayVersion | Format-Table -AutoSize"',
        risk: 'LOW',
        description: '설치된 어플리케이션(SW) 목록 조사'
    },
    'port_status': {
        cmd: 'powershell -Command "[Console]::OutputEncoding=[System.Text.Encoding]::UTF8; Get-NetTCPConnection -State Listen | Select-Object @{Name=\'PORT\';Expression={$_.LocalPort}}, @{Name=\'NAME\';Expression={(Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue).Name}}, @{Name=\'PID\';Expression={$_.OwningProcess}}, State | Sort-Object PORT | Format-Table -AutoSize"',
        risk: 'LOW',
        description: '실시간 사용 중인 포트, 점유 프로세스 명 및 PID 조사'
    },
    'storage_scan': {
        cmd: 'powershell -Command "Get-Volume | Where-Object { $_.DriveLetter -ne $null } | Select-Object @{Name=\'Drive\';Expression={$_.DriveLetter}}, @{Name=\'Free(GB)\';Expression={[Math]::Round($_.SizeRemaining/1GB,1)}}, @{Name=\'Total(GB)\';Expression={[Math]::Round($_.Size/1GB,1)}}, @{Name=\'FileSystem\';Expression={$_.FileSystemType}} | Sort-Object Drive | Format-Table -AutoSize"',
        risk: 'LOW',
        description: '설치된 저장장치 및 파티션 상세 상태 조사'
    },
    'cpu_top': {
        cmd: 'powershell -Command "[Console]::OutputEncoding=[System.Text.Encoding]::UTF8;$p=Get-CimInstance Win32_PerfFormattedData_PerfProc_Process|Where-Object{$_.Name -notmatch \'_Total|Idle|System\'};Get-Process|Where-Object{$_.Name -notmatch \'Idle|^System$\'}|ForEach-Object{try{$id=$_.Id;$matches=$p|Where-Object{$_.IDProcess -eq $id};$c=0;if($matches){$c=$matches.PercentProcessorTime};$d=$_.Description;if(-not $d){$d=$_.Name};$h=0;if($_.MainWindowTitle){$h=1};[PSCustomObject]@{N=$d;C=$c;M=$_.WorkingSet;H=$h}}catch{}}|Group-Object N|ForEach-Object{[PSCustomObject]@{N=$_.Name;C=($_.Group|Measure-Object C -Sum).Sum;M=[Math]::Round(($_.Group|Measure-Object M -Sum).Sum/1024/1024,0);H=($_.Group|Measure-Object H -Max).Maximum}}|Sort-Object H,M -Descending|Select-Object -First 20|Format-Table -AutoSize"',
        risk: 'LOW',
        description: '본격 리소스 관제 TOP 20 (앱 우선 순위)'
    },
    'system_vitals': {
        cmd: 'powershell -Command "$cpu = (Get-WmiObject win32_processor | Measure-Object -Property LoadPercentage -Average).Average; $mem = Get-WmiObject Win32_OperatingSystem; $totalMem = [Math]::Round($mem.TotalVisibleMemorySize / 1024 / 1024, 2); $freeMem = [Math]::Round($mem.FreePhysicalMemory / 1024 / 1024, 2); $usedMem = $totalMem - $freeMem; $uptime = (Get-Date) - [Management.ManagementDateTimeconverter]::ToDateTime($mem.LastBootUpTime); @{cpu=$cpu; ram_total=$totalMem; ram_used=$usedMem; uptime=$uptime.TotalSeconds} | ConvertTo-Json"',
        risk: 'LOW',
        description: '실시간 시스템 핵심 바이탈 스캔'
    },
    'process_all_info': {
        cmd: 'powershell -Command "[Console]::OutputEncoding=[System.Text.Encoding]::UTF8;$p=Get-CimInstance Win32_PerfFormattedData_PerfProc_Process|Where-Object{$_.Name -notmatch \'_Total|Idle|System\'};Get-Process|Where-Object{$_.Name -notmatch \'Idle|^System$\'}|ForEach-Object{try{$id=$_.Id;$matches=$p|Where-Object{$_.IDProcess -eq $id};$c=0;if($matches){$c=$matches.PercentProcessorTime};$d=$_.Description;if(-not $d){$d=$_.Name};$h=0;if($_.MainWindowTitle){$h=1};[PSCustomObject]@{N=$d;C=$c;M=$_.WorkingSet;Id=$_.Id;H=$h}}catch{}}|Group-Object N|ForEach-Object{[PSCustomObject]@{Name=$_.Name;CPU=($_.Group|Measure-Object C -Sum).Sum;MemoryMB=[Math]::Round(($_.Group|Measure-Object M -Sum).Sum/1024/1024,0);Id=$_.Group[0].Id;H=($_.Group|Measure-Object H -Max).Maximum}}|Sort-Object H,MemoryMB -Descending|Select-Object -First 20|ConvertTo-Json"',
        risk: 'LOW',
        description: '본격 리소스 상세 관제 TOP 20 (앱 우선 순위)'
    },
    'error_analysis': {
        cmd: 'powershell -Command "Get-Content -Path \'admin_err.log\' -Tail 10"',
        risk: 'LOW',
        description: '최근 시스템 에러 및 장애 현황 조사'
    },
    'gpu_usage': {
        cmd: 'powershell -Command "Get-CimInstance Win32_VideoController | Select-Object Name, AdapterRAM, DriverVersion | ConvertTo-Json"',
        risk: 'LOW',
        description: 'VGA/그래픽 장치 상태 조사'
    },
    'gpu_full_status': {
        cmd: 'powershell -Command "try { $nv = nvidia-smi --query-gpu=utilization.gpu,utilization.memory,temperature.gpu,memory.used,memory.total,driver_version --format=csv,noheader,nounits; if($nv) { $parts = $nv.Split(\',\'); @{gpu_util=$parts[0]; mem_util=$parts[1]; temp=$parts[2]; mem_used=$parts[3]; mem_total=$parts[4]; driver=$parts[5]} | ConvertTo-Json } else { throw } } catch { $gpu = Get-CimInstance Win32_VideoController | Select-Object -First 1; @{name=$gpu.Name; ram_mb=[Math]::Round($gpu.AdapterRAM/1MB,0); driver=$gpu.DriverVersion; status=\'fallback\'} | ConvertTo-Json }"',
        risk: 'LOW',
        description: 'GPU 사용률, 온도, 메모리 실시간 조사 (NVIDIA 전용 + Fallback)'
    }
};

class RemoteOperator {
    async execute(toolId, params = {}, actorId) {
        const tool = SAFE_TOOLS[toolId];
        if (!tool) throw new Error('E_COMMAND_NOT_FOUND');

        // [D5] Parameter Sanitization & Allowlist Validation
        let finalCmd = typeof tool.cmd === 'function' ? tool.cmd(params) : tool.cmd;

        // Block dangerous chars
        if (/[;&|`]/.test(JSON.stringify(params))) {
            throw new Error('E_INSECURE_PARAMETERS');
        }

        console.log(`[REMOTE] Executing: ${toolId} for actor ${actorId}`);

        return new Promise((resolve, reject) => {
            exec(finalCmd, (error, stdout, stderr) => {
                const result = stdout || stderr;

                // Audit to DB
                const jobId = `job_remote_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                db.run(`
                    INSERT INTO jobs (job_id, module, action, args, status, owner, result)
                    VALUES (?, 'REMOTE', ?, ?, 'SUCCESS', ?, ?)
                `, [jobId, toolId, JSON.stringify(params), actorId, result]);

                if (error) {
                    resolve({ status: 'ERROR', output: stderr || error.message });
                } else {
                    resolve({ status: 'SUCCESS', output: stdout });
                }
            });
        });
    }

    getTools() {
        return Object.keys(SAFE_TOOLS).map(id => ({
            id,
            description: SAFE_TOOLS[id].description,
            risk: SAFE_TOOLS[id].risk
        }));
    }
}

module.exports = new RemoteOperator();
