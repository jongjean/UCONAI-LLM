import React, { useState, useEffect } from 'react';
import { Activity, Terminal, Eye, Zap, Brain } from 'lucide-react';

const Dashboard: React.FC = () => {
    // 0. Initial "OFFLINE" State for Instant Load
    const initialServices = [
        { id: 'dcp-control-plane', name: 'DCP Gateway', status: 'OFFLINE', pid: 0 },
        { id: 'dcp-execution-plane', name: 'DCP Controller', status: 'OFFLINE', pid: 0 },
        { id: 'uconai-bridge', name: 'AI Bridge', status: 'OFFLINE', pid: 0 },
        { id: 'uconai-frontend', name: 'Frontend', status: 'OFFLINE', pid: 0 },
        { id: 'adobe-photoshop', name: 'Photoshop 2022', status: 'OFFLINE', pid: 0 },
        { id: 'adobe-illustrator', name: 'Illustrator 2022', status: 'OFFLINE', pid: 0 },
        { id: 'ms-word', name: 'MS Word', status: 'OFFLINE', pid: 0 },
        { id: 'ms-excel', name: 'MS Excel', status: 'OFFLINE', pid: 0 },
        { id: 'ms-powerpoint', name: 'MS PowerPoint', status: 'OFFLINE', pid: 0 },
        { id: 'hancom-office', name: 'Hancom Office', status: 'OFFLINE', pid: 0 },
        { id: 'infotech-monitor', name: 'Infotech TS', status: 'OFFLINE', pid: 0 },
        { id: 'finger-monitor', name: 'Finger TS', status: 'OFFLINE', pid: 0 },
        { id: 'ked-monitor', name: 'KED TS', status: 'OFFLINE', pid: 0 },
        { id: 'tms-server', name: 'TMS Server', status: 'OFFLINE', pid: 0 },
        { id: 'pms-server', name: 'PMS Server', status: 'OFFLINE', pid: 0 },
        { id: 'workstation-monitor', name: 'Workstation', status: 'OFFLINE', pid: 0 },
        { id: 'antigravity-agent', name: 'Antigravity', status: 'OFFLINE', pid: 0 }
    ];

    const [status, setStatus] = useState<any>({
        cpu: 0,
        mem: 0,
        services: initialServices, // Load immediately
        logs: [],
        lastUpdate: "CONNECTING..."
    });

    // ... (rest of state definitions)

    const [isResetting, setIsResetting] = useState(false);
    const [visionKey, setVisionKey] = useState(Date.now());
    const [selectedUnit, setSelectedUnit] = useState<any>(null);
    const [visionAnalysis, setVisionAnalysis] = useState("초기화 대기 중... 강박사님의 분석 명령을 대기하고 있습니다.");
    const [selectedMonitor, setSelectedMonitor] = useState(0);
    const [isPipelineRunning, setIsPipelineRunning] = useState(false);
    const [pipelineProject, setPipelineProject] = useState("context7-main");
    const [commanderMsg, setCommanderMsg] = useState("");
    const [isSending, setIsSending] = useState(false);

    // ... (runAction, sendCommanderMsg, etc. remain unchanged)

    const sendCommanderMsg = async () => {
        if (!commanderMsg.trim() || isSending) return;
        setIsSending(true);
        const msg = commanderMsg;
        setCommanderMsg("");

        setStatus((prev: any) => ({
            ...prev,
            logs: [`[USER] ${msg}`, ...prev.logs.slice(0, 10)]
        }));

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const res = await fetch('http://localhost:18081/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const data = await res.json();

            setStatus((prev: any) => ({
                ...prev,
                logs: [`[AI] ${data.answer}`, ...prev.logs.slice(0, 10)]
            }));
        } catch (err: any) {
            const errorMsg = err.name === 'AbortError'
                ? '[TIMEOUT] AI 응답 시간 초과 (30초)'
                : `[ERROR] 통신 오류가 발생했습니다. Gateway 상태를 확인해주세요.`;
            setStatus((prev: any) => ({
                ...prev,
                logs: [errorMsg, ...prev.logs.slice(0, 10)]
            }));
        }
        setIsSending(false);
    };

    const runPipeline = async (action: string = "Full") => {
        setIsPipelineRunning(true);
        setStatus((prev: any) => ({
            ...prev,
            logs: [`[KNOWLEDGE] Triggering pipeline for ${pipelineProject}...`, ...prev.logs.slice(0, 10)]
        }));

        try {
            const res = await fetch('http://localhost:18081/pipeline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectKey: pipelineProject, action })
            });
            await res.json();

            setStatus((prev: any) => ({
                ...prev,
                logs: [`[KNOWLEDGE] Pipeline Task Complete: ${pipelineProject}`, ...prev.logs.slice(0, 10)]
            }));
        } catch (err) {
            setStatus((prev: any) => ({
                ...prev,
                logs: [`[ERROR] Pipeline Execution Failed: ${err}`, ...prev.logs.slice(0, 10)]
            }));
        }
        setIsPipelineRunning(false);
    };

    const unitDetails: any = {
        'dcp-control-plane': { role: '전체 시스템 통신 관문 (Gateway)', perf: '최적화 가용성 보장', loc: 'C:\\Users\\user\\.openclaw' },
        'dcp-execution-plane': { role: '명령 집행 및 프로세스 제어 (Controller)', perf: '실시간 명령 처리 중', loc: 'C:\\OpenClaw\\controller' },
        'uconai-bridge': { role: '지능형 전략 수립 및 LLM 연동 (AI-Bridge)', perf: '신경망 링크 활성화', loc: 'C:\\OpenClaw\\controller' },
        'uconai-frontend': { role: '사용자 관제 인터페이스 (Vite/React)', perf: '60FPS 렌더링 안정', loc: 'C:\\UCONAI-LLM\\frontend' },
        'adobe-photoshop': { role: '그래픽 리터칭 및 이미지 합성 엔진 (Photoshop)', perf: '2022 v23.0 엔진 로드 완료', loc: 'C:\\Program Files\\Adobe\\Adobe Photoshop 2022' },
        'adobe-illustrator': { role: '벡터 그래픽 및 레이아웃 설계 엔진 (Illustrator)', perf: '2022 v26.0 엔진 로드 완료', loc: 'C:\\Program Files\\Adobe\\Adobe Illustrator 2022' },
        'ms-word': { role: '문서 작성 및 사무 자동화 엔진 (Word)', perf: 'MS Office Core 활성화', loc: 'WINWORD.EXE' },
        'ms-excel': { role: '데이터 분석 및 스프레드시트 엔진 (Excel)', perf: 'MS Office Core 활성화', loc: 'EXCEL.EXE' },
        'ms-powerpoint': { role: '프레젠테이션 설계 및 시각화 엔진 (PowerPoint)', perf: 'MS Office Core 활성화', loc: 'POWERPNT.EXE' },
        'hancom-office': { role: '한글 문서 작성 엔진 (Hancom)', perf: 'HWP Core 활성화', loc: 'Hwp.exe' },
        'infotech-monitor': { role: 'IT 기술 지원 및 에이전트 모니터링', perf: '상태 패킷 정상', loc: 'C:\\infotech\\iftNxService' },
        'finger-monitor': { role: '보안 인증 및 ID 식별 서비스', perf: '인증 대기열 안정', loc: 'C:\\Finger\\FSWSS' },
        'ked-monitor': { role: '정보 탐색 및 데이터 분석 에이전트', perf: '데이터 크롤링 준비 완료', loc: 'C:\\KED\\FindAgent' },
        'tms-server': { role: '터미널 관리 시스템 (TMS)', perf: '응답 시간 초과 발생', loc: 'C:\\KWIC\\KISS' },
        'pms-server': { role: '프로세스 무결성 관리 시스템 (PMS)', perf: '커널 레벨 감시 중', loc: 'WizveraPMSvc' },
        'workstation-monitor': { role: '물리적 워크스테이션 하드웨어 기반', perf: '윈도우 커널 안정', loc: 'System Root' },
        'antigravity-agent': { role: '메인 지능 에이전트 인터페이스 (Antigravity)', perf: '인터랙티브 신경망 최적화', loc: 'C:\\Users\\user\\AppData\\Local\\Programs\\Antigravity' }
    };

    const runAction = async (action: string) => {
        setIsResetting(true);
        setTimeout(() => setIsResetting(false), 1500);

        try {
            await fetch('http://localhost:17777/exec', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cmd: 'powershell.exe',
                    args: ['C:\\UCONAI-LLM\\scripts\\core\\Standard-Wrapper.ps1', '-SystemId', 'all', '-Action', action]
                })
            });
        } catch (e) {
            console.error('Command transmission failed.');
        }
    };

    const captureScreen = async () => {
        setIsResetting(true);
        setVisionAnalysis(`모니터 ${selectedMonitor + 1} 스캔 개시... 광학 데이터 수집 중`);

        try {
            await fetch('http://localhost:17777/exec', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cmd: 'powershell.exe',
                    args: ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'C:\\UCONAI-LLM\\scripts\\utils\\Capture-Screen.ps1', '-MonitorIndex', selectedMonitor.toString()],
                    timeoutSec: 15
                })
            });

            setTimeout(() => {
                setVisionKey(Date.now());
                setVisionAnalysis(`[SCAN_COMPLETE] 모니터 ${selectedMonitor + 1} 캡처 완료. 시각 데이터 메모리 버퍼에 적재되었습니다.`);
                setIsResetting(false);
            }, 1500);
        } catch (err) {
            setVisionAnalysis(`[ERROR] 캡처 실패: ${err}`);
            setIsResetting(false);
        }
    };

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                // 1. Try Main Health Report (Controller) with timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

                const controllerRes = await fetch('http://localhost:17777/health-report', {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                let healthData = { systems: [], cpu: 0, memory: 0 };

                if (controllerRes.ok) {
                    try {
                        healthData = await controllerRes.json();
                    } catch (e) {
                        console.warn("Controller returned non-JSON:", e);
                    }
                }

                // 2. Cross-Verification (Direct Ping & Extended List - 13 Units)
                const systemsConfig = [
                    { id: 'dcp-control-plane', name: 'DCP Gateway', port: 18789, type: 'gateway' },
                    { id: 'dcp-execution-plane', name: 'DCP Controller', port: 17777, type: 'controller' },
                    { id: 'uconai-bridge', name: 'AI Bridge', port: 18081, type: 'bridge' },
                    { id: 'uconai-frontend', name: 'Frontend', port: 5173, type: 'ui' },
                    { id: 'adobe-photoshop', name: 'Photoshop 2022', type: 'app' },
                    { id: 'adobe-illustrator', name: 'Illustrator 2022', type: 'app' },
                    { id: 'ms-word', name: 'MS Word', type: 'app' },
                    { id: 'ms-excel', name: 'MS Excel', type: 'app' },
                    { id: 'ms-powerpoint', name: 'MS PowerPoint', type: 'app' },
                    { id: 'hancom-office', name: 'Hancom Office', type: 'app' },
                    { id: 'infotech-monitor', name: 'Infotech TS', type: 'service' },
                    { id: 'finger-monitor', name: 'Finger TS', type: 'service' },
                    { id: 'ked-monitor', name: 'KED TS', type: 'service' },
                    { id: 'tms-server', name: 'TMS Server', type: 'service' },
                    { id: 'pms-server', name: 'PMS Server', type: 'service' },
                    { id: 'workstation-monitor', name: 'Workstation', type: 'service' },
                    { id: 'ollama-service', name: 'Ollama (Local LLM)', port: 11434, type: 'ai' },
                    { id: 'antigravity-agent', name: 'Antigravity', type: 'app' }
                ];

                const finalServices = await Promise.all(systemsConfig.map(async (sys) => {
                    // Check if Controller reported this system
                    const reported: any = healthData.systems?.find((s: any) => s.id === sys.id);
                    if (reported && reported.result?.ok) {
                        return {
                            name: sys.name,
                            status: "ONLINE",
                            uptime: reported.result.uptime || "Active",
                            pid: reported.result.pid || 0,
                            id: sys.id
                        };
                    }

                    // If not reported or failed, try direct fetch (Fallback for core units with ports)
                    try {
                        if (!sys.port) throw new Error("No port");
                        let url = `http://localhost:${sys.port}`;
                        if (sys.type === 'gateway') url += '/health'; // Gateway returns HTML/JSON
                        else if (sys.type === 'bridge') url += '/health';
                        else if (sys.type === 'controller') url += '/health';

                        // Short timeout ping
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 2000);
                        const res = await fetch(url, { method: 'HEAD', signal: controller.signal }).catch(() => null);
                        clearTimeout(timeoutId);

                        if (res && (res.ok || res.status === 404)) { // 404 means server is up (e.g. Vite)
                            return { name: sys.name, status: "ONLINE", uptime: "Verified", pid: 0, id: sys.id };
                        }
                    } catch (e) { /* Ignore */ }

                    return { name: sys.name, status: "OFFLINE", uptime: "0s", pid: 0, id: sys.id };
                }));

                // 3. Fetch Persistent Logs from Controller
                let persistentLogs = [];
                try {
                    const logRes = await fetch('http://localhost:17777/logs');
                    if (logRes.ok) {
                        persistentLogs = await logRes.json();
                    }
                } catch (e) {
                    console.error("Failed to fetch logs:", e);
                }

                setStatus((prev: any) => ({
                    cpu: healthData.cpu || 0,
                    mem: healthData.memory || 0,
                    services: finalServices,
                    logs: Array.isArray(persistentLogs) ? [...persistentLogs].reverse() : prev.logs, // Safely reverse array
                    lastUpdate: new Date().toLocaleTimeString()
                }));
            } catch (err) {
                console.error("Dashboard Status Sync Failure:", err);
            }
        };

        const interval = setInterval(fetchStatus, 2000);
        return () => clearInterval(interval);
    }, [status.logs]);

    return (
        <div style={{ backgroundColor: '#050505', color: '#00ff9d', minHeight: '100%', padding: '20px', fontFamily: '"JetBrains Mono", monospace' }}>
            <header style={{ marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#00ff9d' }}>
                    <Activity size={32} />
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', letterSpacing: '3px' }}>UCONAI DASHBOARD</h2>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>TACTICAL OPERATIONS CENTER // MULTI-UNIT COMMAND & CONTROL</p>
                    </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#555', fontFamily: 'monospace' }}>
                    LAST_UPDATE: {status.lastUpdate}<br />
                    SECURE_LINK: ESTABLISHED
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 350px', gap: '25px', marginTop: '30px' }}>

                {/* Tactical Units (Services) */}
                <div style={{ border: '1px solid #00ff9d33', padding: '20px', borderRadius: '4px', backgroundColor: '#111' }}>
                    <h3 style={{ marginTop: 0, color: '#888', fontSize: '0.9rem' }}>TACTICAL_UNITS.YAML</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {status.services.map((svc: any) => (
                            <div key={svc.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 12px',
                                background: '#1a1a1a',
                                borderLeft: `3px solid ${svc.status === 'ONLINE' ? '#00ff9d' : '#ff4d4d'}`
                            }}>
                                <div
                                    onClick={() => setSelectedUnit({ ...svc, ...unitDetails[svc.id] })}
                                    style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', flex: 1 }}
                                >
                                    <span style={{ fontSize: '0.9rem', color: selectedUnit?.id === svc.id ? '#00ff9d' : 'white', textDecoration: selectedUnit?.id === svc.id ? 'underline' : 'none' }}>{svc.name}</span>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                        <span style={{ color: svc.status === 'ONLINE' ? '#00ff9d' : '#ff4d4d', fontSize: '0.75rem', fontWeight: 'bold' }}>{svc.status}</span>
                                        {svc.status === 'ONLINE' && <span style={{ color: '#aaa', fontSize: '0.7rem' }}>{svc.uptime}</span>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                    {svc.status === 'ONLINE' && svc.pid > 0 && <span style={{ color: '#00ff9d', fontSize: '0.65rem', padding: '1px 4px', border: '1px solid #00ff9d44', borderRadius: '2px', whiteSpace: 'nowrap' }}>PID:{svc.pid}</span>}
                                    <button
                                        onClick={async () => {
                                            const systemMap: any = {
                                                'dcp-control-plane': 'dcp-control-plane',
                                                'dcp-execution-plane': 'dcp-execution-plane',
                                                'uconai-bridge': 'uconai-bridge',
                                                'uconai-frontend': 'uconai-frontend',
                                                'adobe-photoshop': 'adobe-photoshop',
                                                'adobe-illustrator': 'adobe-illustrator',
                                                'ms-word': 'ms-word',
                                                'ms-excel': 'ms-excel',
                                                'ms-powerpoint': 'ms-powerpoint',
                                                'hancom-office': 'hancom-office',
                                                'infotech-monitor': 'infotech-monitor',
                                                'finger-monitor': 'finger-monitor',
                                                'ked-monitor': 'ked-monitor',
                                                'tms-server': 'tms-server',
                                                'pms-server': 'pms-server',
                                                'workstation-monitor': 'workstation-monitor',
                                                'antigravity-agent': 'antigravity-agent'
                                            };
                                            setIsResetting(true);
                                            const payload = {
                                                cmd: 'powershell.exe',
                                                args: ['C:\\UCONAI-LLM\\scripts\\core\\Standard-Wrapper.ps1', '-SystemId', systemMap[svc.id], '-Action', 'Restart']
                                            };
                                            setStatus((prev: any) => ({
                                                ...prev,
                                                logs: [`[DCP] Requesting RECYCLE for unit: ${svc.name}`, ...prev.logs.slice(0, 10)]
                                            }));

                                            try {
                                                // 1차 시도: Controller (17777)
                                                console.log(`[DCP] Requesting restart for ${svc.id} via Controller...`);
                                                const res = await fetch('http://localhost:17777/exec', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(payload)
                                                });
                                                if (!res.ok) throw new Error('Controller Offline');
                                            } catch (err) {
                                                // 2차 시도 (Fallback): AI Bridge (18081)
                                                console.log(`[DCP] Controller offline. Using Emergency Bridge fallback for ${svc.id}...`);
                                                try {
                                                    await fetch('http://localhost:18081/exec', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify(payload)
                                                    });
                                                } catch (e) {
                                                    console.error("All fallback commands failed.");
                                                }
                                            }

                                            setTimeout(() => setIsResetting(false), 1500);
                                        }}
                                        style={{
                                            background: '#333',
                                            border: '1px solid #555',
                                            color: '#00ff9d',
                                            padding: '2px 8px',
                                            fontSize: '0.7rem',
                                            cursor: 'pointer',
                                            borderRadius: '2px'
                                        }}
                                    >
                                        RE
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resource Core */}
                <div style={{
                    border: '1px solid #00ff9d33',
                    padding: '20px',
                    borderRadius: '4px',
                    backgroundColor: '#111',
                    opacity: isResetting ? 0.3 : 1,
                    transition: 'opacity 0.2s',
                    position: 'relative'
                }}>
                    {isResetting && <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.7rem', color: '#ff4d4d' }}>REBOOTING...</div>}
                    <h3 style={{ marginTop: 0, color: '#888', fontSize: '0.9rem' }}>NEURAL_LOAD.LOG</h3>
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>CPU_CORES</span><span>{status.cpu}%</span></div>
                        <div style={{ height: '4px', background: '#222', marginTop: '5px' }}>
                            <div style={{ width: `${status.cpu}%`, height: '100%', background: '#00ff9d', boxShadow: '0 0 10px #00ff9d' }} />
                        </div>
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>MEM_ARRAY</span><span>{status.mem}%</span></div>
                        <div style={{ height: '4px', background: '#222', marginTop: '5px' }}>
                            <div style={{ width: `${status.mem}%`, height: '100%', background: '#4dabf7', boxShadow: '0 0 10px #4dabf7' }} />
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        <button onClick={() => runAction('Restart')} style={{ flex: '1', background: 'transparent', border: '1px solid #00ff9d', color: '#00ff9d', padding: '10px', cursor: 'pointer', transition: '0.3s' }}>REBOOT CORE</button>
                        <button onClick={() => runAction('Start')} style={{ flex: '1', background: 'transparent', border: '1px solid #4dabf7', color: '#4dabf7', padding: '10px', cursor: 'pointer' }}>ENGAGE MESH</button>
                    </div>

                    {/* Unit Info Box */}
                    <div style={{ marginTop: '25px', border: '1px solid #00ff9d66', padding: '15px', background: '#050505', minHeight: '120px' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: '#00ff9d', borderBottom: '1px solid #00ff9d33' }}>UNIT_INTELLIGENCE_REPORT</h4>
                        {selectedUnit ? (
                            <div style={{ fontSize: '0.8rem', color: '#ccc', lineHeight: '1.6' }}>
                                <div><span style={{ color: '#00ff9d' }}>[ROLE]:</span> {selectedUnit.role}</div>
                                <div><span style={{ color: '#00ff9d' }}>[PERF]:</span> {selectedUnit.perf}</div>
                                <div><span style={{ color: '#00ff9d' }}>[PATH]:</span> {selectedUnit.loc}</div>
                                <div style={{ marginTop: '5px', fontSize: '0.7rem', color: '#555' }}>LINK_STABILITY_SCAN: PASS // 128-BIT ENCRYPTION</div>
                            </div>
                        ) : (
                            <div style={{ fontSize: '0.8rem', color: '#444' }}>좌측 작전 유닛을 선택하여 상세 제원을 확인하십시오.</div>
                        )}
                    </div>

                    {/* NEURAL_LOAD.LOG (Moved Terminal Logs) */}
                    <div style={{
                        marginTop: '25px',
                        border: '1px solid #00ff9d33',
                        padding: '15px',
                        background: 'rgba(0,10,0,0.5)',
                        height: '350px',
                        overflowY: 'auto',
                        fontFamily: '"JetBrains Mono", monospace'
                    }}>
                        <div style={{ display: 'flex', gap: '10px', color: '#00ff9d', fontSize: '0.75rem', marginBottom: '10px', borderBottom: '1px solid #00ff9d33' }}>
                            <Terminal size={14} /> <span>NEURAL_LOAD.LOG</span>
                        </div>
                        <div style={{ color: '#00ff9d', fontSize: '0.8rem', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                            {status.logs.map((log: string, i: number) => (
                                <div key={i} style={{ marginBottom: '4px' }}>
                                    {log.startsWith('[USER]') ? (
                                        <span style={{ color: '#fff' }}>{log.replace('[USER]', '> ')}</span>
                                    ) : log.startsWith('[AI]') ? (
                                        <span style={{ color: '#4dabf7' }}>{log.replace('[AI]', '🤖 ')}</span>
                                    ) : (
                                        <span>{log}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Vision Feed (Elite) */}
                <div style={{ border: '1px solid #4dabf7', padding: '20px', borderRadius: '4px', backgroundColor: '#000' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ color: '#4dabf7', fontSize: '0.8rem' }}>VISION_FEED_01</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {/* Monitor Selectors */}
                            <div style={{ display: 'flex', gap: '4px', marginRight: '10px' }}>
                                {[0, 1, 2, 3].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setSelectedMonitor(m)}
                                        style={{
                                            background: selectedMonitor === m ? '#4dabf7' : '#002',
                                            border: '1px solid #4dabf7',
                                            color: selectedMonitor === m ? '#000' : '#4dabf7',
                                            fontSize: '0.6rem',
                                            padding: '2px 6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        M{m + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={captureScreen}
                                style={{ background: '#003', border: '1px solid #0af', color: '#0af', fontSize: '0.6rem', padding: '2px 8px', cursor: 'pointer' }}
                            >
                                CAPTURE
                            </button>
                            <Eye size={16} color="#4dabf7" />
                        </div>
                    </div>
                    <div style={{
                        width: '100%',
                        height: '200px',
                        background: '#050505',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #333',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <img
                            src={`/vision_capture.jpg?t=${visionKey}`}
                            alt="Vision Feed"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isResetting ? 0.5 : 1 }}
                            onError={(e: any) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                            onLoad={(e: any) => {
                                e.target.style.display = 'block';
                                e.target.nextSibling.style.display = 'none';
                            }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute' }}>
                            <Zap size={48} color="#333" />
                        </div>
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '0.7rem', color: '#4dabf7', fontFamily: 'monospace' }}>
                        {isResetting ? "--- CAPTURING FEED ---" : "LINK STATUS: SECURE_VISION_ACTIVE"}
                    </div>

                    {/* AI Vision Analysis Box */}
                    <div style={{ marginTop: '20px', border: '1px solid #4dabf766', padding: '15px', background: '#000a0f', minHeight: '150px' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: '#4dabf7', borderBottom: '1px solid #4dabf733' }}>AI_VISION_DEEP_SCAN</h4>
                        <div style={{ fontSize: '0.85rem', color: '#88b4ff', lineHeight: '1.6', fontFamily: '"JetBrains Mono", monospace' }}>
                            {visionAnalysis}
                        </div>
                    </div>
                </div>

            </div>

            {/* Knowledge Pipeline Section (Left) */}
            <div style={{
                marginTop: '25px',
                border: '1px solid #ff00ff33',
                padding: '20px',
                borderRadius: '4px',
                backgroundColor: '#0a000a',
                boxShadow: '0 0 15px #ff00ff11'
            }}>
                <h3 style={{ marginTop: 0, color: '#ff00ff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '2px' }}>
                    <Zap size={20} /> DATA_KNOWLEDGE_PIPELINE.v2.3
                </h3>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '8px', fontFamily: 'monospace' }}>TARGET_PROJECT_KEY</label>
                        <input
                            type="text"
                            value={pipelineProject}
                            onChange={(e) => setPipelineProject(e.target.value)}
                            placeholder="e.g. context7-legal-docs"
                            style={{
                                width: '100%',
                                background: '#000',
                                border: '1px solid #ff00ff66',
                                color: '#ff00ff',
                                padding: '10px 15px',
                                fontSize: '0.9rem',
                                outline: 'none',
                                fontFamily: 'monospace'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button
                            onClick={() => runPipeline('Full')}
                            disabled={isPipelineRunning}
                            style={{
                                background: isPipelineRunning ? '#333' : '#ff00ff22',
                                border: '1px solid #ff00ff',
                                color: '#ff00ff',
                                padding: '10px 30px',
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                                cursor: isPipelineRunning ? 'not-allowed' : 'pointer',
                                transition: '0.3s'
                            }}
                        >
                            {isPipelineRunning ? 'PROCESSING...' : 'ENGAGE FULL PIPELINE'}
                        </button>
                    </div>
                </div>
                <div style={{ marginTop: '12px', fontSize: '0.7rem', color: '#666', fontFamily: 'monospace' }}>
                    STATUS: {isPipelineRunning ? 'PIPELINE_ENGAGED' : 'IDLE'} // RAG_SYNC_READY
                </div>
            </div>

            {/* Knowledge Expansion Center (New Wings Section) */}
            <div style={{
                marginTop: '25px',
                border: '1px solid #4dabf733',
                padding: '20px',
                borderRadius: '4px',
                backgroundColor: '#000a1a',
                boxShadow: '0 0 15px #4dabf711'
            }}>
                <h3 style={{ marginTop: 0, color: '#4dabf7', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '2px' }}>
                    <Brain size={20} /> KNOWLEDGE_EXPANSION_CENTER (EXPERT_WINGS)
                </h3>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '8px', fontFamily: 'monospace' }}>EXPERT_FIELD (CATEGORY)</label>
                        <input
                            type="text"
                            id="expansionField"
                            placeholder="e.g. ISO 9001, ESG, Next.js"
                            style={{
                                width: '100%', background: '#000', border: '1px solid #4dabf766',
                                color: '#4dabf7', padding: '10px 15px', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace'
                            }}
                        />
                    </div>
                    <div style={{ flex: 2 }}>
                        <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '8px', fontFamily: 'monospace' }}>SPECIFIC_TOPIC (SEARCH_QUERY)</label>
                        <input
                            type="text"
                            id="expansionTopic"
                            placeholder="e.g. CSRD Disclosure, Audit Checklist, Performance Memo"
                            style={{
                                width: '100%', background: '#000', border: '1px solid #4dabf766',
                                color: '#4dabf7', padding: '10px 15px', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace'
                            }}
                        />
                    </div>
                    <button
                        onClick={async () => {
                            const field = (document.getElementById('expansionField') as HTMLInputElement).value;
                            const topic = (document.getElementById('expansionTopic') as HTMLInputElement).value;
                            if (!field || !topic) return;

                            setIsPipelineRunning(true);
                            setStatus((prev: any) => ({
                                ...prev,
                                logs: [`[EXPANSION] Deploying Expert Wings: ${field} > ${topic}...`, ...prev.logs.slice(0, 10)]
                            }));

                            try {
                                const res = await fetch('http://localhost:18081/api/expand-knowledge', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ field, topic })
                                });
                                const data = await res.json();
                                if (data.ok) {
                                    setStatus((prev: any) => ({
                                        ...prev,
                                        logs: [`[SUCCESS] Brain Expanded with specialization: ${data.projectKey}`, ...prev.logs.slice(0, 10)]
                                    }));
                                    setPipelineProject(data.projectKey);
                                } else {
                                    throw new Error(data.error);
                                }
                            } catch (err) {
                                setStatus((prev: any) => ({
                                    ...prev,
                                    logs: [`[ERROR] Expansion Failed: ${err}`, ...prev.logs.slice(0, 10)]
                                }));
                            }
                            setIsPipelineRunning(false);
                        }}
                        disabled={isPipelineRunning}
                        style={{
                            background: isPipelineRunning ? '#333' : '#4dabf722',
                            border: '1px solid #4dabf7',
                            color: '#4dabf7',
                            padding: '10px 30px',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            cursor: isPipelineRunning ? 'not-allowed' : 'pointer',
                            transition: '0.3s'
                        }}
                    >
                        {isPipelineRunning ? 'EVOLVING...' : 'SUMMON EXPERT KNOWLEDGE'}
                    </button>
                </div>
            </div>

            {/* UCONAI COMMANDER (Natural Language Control) */}
            <div style={{
                marginTop: '25px',
                border: '1px solid #00ff9d66',
                padding: '20px',
                borderRadius: '4px',
                backgroundColor: '#050a05',
                boxShadow: '0 0 10px #00ff9d11'
            }}>
                <h3 style={{ marginTop: 0, color: '#00ff9d', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '2px' }}>
                    <Activity size={20} /> UCONAI_COMMANDER.v2.3
                </h3>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <input
                        type="text"
                        value={commanderMsg}
                        onChange={(e) => setCommanderMsg(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendCommanderMsg()}
                        placeholder="전술 명령을 입력하십시오. (예: 포토샵으로 간판 제작 개시...)"
                        disabled={isSending}
                        style={{
                            flex: 1,
                            background: '#000',
                            border: '1px solid #00ff9d33',
                            color: '#00ff9d',
                            padding: '12px 20px',
                            fontSize: '1rem',
                            outline: 'none',
                            fontFamily: '"JetBrains Mono", monospace'
                        }}
                    />
                    <button
                        onClick={sendCommanderMsg}
                        disabled={isSending}
                        style={{
                            background: isSending ? '#222' : '#00ff9d',
                            color: '#000',
                            border: 'none',
                            padding: '0 30px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            letterSpacing: '1px'
                        }}
                    >
                        {isSending ? 'SENDING...' : 'EXECUTE'}
                    </button>
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.7rem', color: '#00ff9d44', fontFamily: 'monospace' }}>
                    NEURAL_LINK: ACTIVE // DIRECT_ACCESS_LEVEL: 5 // READY_FOR_DEPLOYMENT
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
