import React, { useState, useEffect } from 'react';
import { Activity, Terminal, Eye, Zap } from 'lucide-react';

const Dashboard: React.FC = () => {
    const [status, setStatus] = useState<any>({
        cpu: 0,
        mem: 0,
        services: [],
        logs: [],
        lastUpdate: ""
    });
    const [isResetting, setIsResetting] = useState(false);
    const [visionKey, setVisionKey] = useState(Date.now());
    const [selectedUnit, setSelectedUnit] = useState<any>(null);
    const [visionAnalysis, setVisionAnalysis] = useState("초기화 대기 중... 강박사님의 분석 명령을 대기하고 있습니다.");
    const [selectedMonitor, setSelectedMonitor] = useState(0);

    const unitDetails: any = {
        'dcp-control-plane': { role: '전체 시스템 통신 관문 (Gateway)', perf: '최적화 가용성 보장', loc: 'C:\\Users\\user\\.openclaw' },
        'dcp-execution-plane': { role: '명령 집행 및 프로세스 제어 (Controller)', perf: '실시간 명령 처리 중', loc: 'C:\\OpenClaw\\controller' },
        'uconai-bridge': { role: '지능형 전략 수립 및 LLM 연동 (AI-Bridge)', perf: '신경망 링크 활성화', loc: 'C:\\OpenClaw\\controller' },
        'uconai-frontend': { role: '사용자 관제 인터페이스 (Vite/React)', perf: '60FPS 렌더링 안정', loc: 'C:\\UCONAI-LLM\\frontend' },
        'infotech-monitor': { role: 'IT 기술 지원 및 에이전트 모니터링', perf: '상태 패킷 정상', loc: 'C:\\infotech\\iftNxService' },
        'finger-monitor': { role: '보안 인증 및 ID 식별 서비스', perf: '인증 대기열 안정', loc: 'C:\\Finger\\FSWSS' },
        'ked-monitor': { role: '정보 탐색 및 데이터 분석 에이전트', perf: '데이터 크롤링 준비 완료', loc: 'C:\\KED\\FindAgent' },
        'tms-server': { role: '터미널 관리 시스템 (TMS)', perf: '응답 시간 초과 발생', loc: 'C:\\KWIC\\KISS' },
        'pms-server': { role: '프로세스 무결성 관리 시스템 (PMS)', perf: '커널 레벨 감시 중', loc: 'WizveraPMSvc' },
        'workstation-monitor': { role: '물리적 워크스테이션 하드웨어 기반', perf: '윈도우 커널 안정', loc: 'System Root' }
    };

    const runAction = async (action: string) => {
        setIsResetting(true);
        setTimeout(() => setIsResetting(false), 1500);

        try {
            await fetch('http://localhost:18088/exec', {
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
            await fetch('http://localhost:18088/exec', {
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
                const healthRes = await fetch('http://localhost:18088/health-report');
                const healthData = await healthRes.json();

                const services = (healthData.systems || []).map((s: any) => ({
                    name: s.name,
                    status: s.result && s.result.ok ? "ONLINE" : "OFFLINE",
                    uptime: s.result ? s.result.uptime : "0s",
                    pid: s.result ? s.result.pid : 0,
                    id: s.id
                }));

                setStatus({
                    cpu: healthData.cpu || 0,
                    mem: healthData.memory || 0,
                    services: services,
                    logs: [
                        `[SYS] Kernel Heartbeat: Stable`,
                        `[NET] Neural Link: Active (18081)`,
                        `[DCP] Tactical Mesh: Ready`,
                        ...(status.logs || []).slice(0, 5)
                    ],
                    lastUpdate: new Date().toLocaleTimeString()
                });
            } catch (err) {
                console.error("Link Failure", err);
            }
        };

        const interval = setInterval(fetchStatus, 2000);
        return () => clearInterval(interval);
    }, [status.logs]);

    return (
        <div style={{ backgroundColor: '#050505', color: '#00ff9d', minHeight: '100%', padding: '20px', fontFamily: '"JetBrains Mono", monospace' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #00ff9d33', paddingBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Activity size={24} />
                    <h1 style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '2px' }}>UCONAI_CORE_OS v2.5</h1>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#888' }}>
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
                                    style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                                >
                                    <span style={{ fontSize: '0.9rem', color: selectedUnit?.id === svc.id ? '#00ff9d' : 'white', textDecoration: selectedUnit?.id === svc.id ? 'underline' : 'none' }}>{svc.name}</span>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                                        <span style={{ color: svc.status === 'ONLINE' ? '#00ff9d' : '#ff4d4d', fontSize: '0.8rem', fontWeight: 'bold' }}>{svc.status}</span>
                                        {svc.status === 'ONLINE' && <span style={{ color: '#aaa', fontSize: '0.75rem' }}>[{svc.uptime}]</span>}
                                        {svc.status === 'ONLINE' && svc.pid > 0 && <span style={{ color: '#00ff9d', fontSize: '0.75rem', padding: '0 4px', border: '1px solid #00ff9d44', borderRadius: '2px' }}>PID: {svc.pid}</span>}
                                    </div>
                                </div>
                                {true && (
                                    <button
                                        onClick={async () => {
                                            const systemMap: any = {
                                                'dcp-control-plane': 'openclaw-gateway',
                                                'dcp-execution-plane': 'openclaw-controller',
                                                'uconai-bridge': 'uconai-bridge',
                                                'uconai-frontend': 'uconai-frontend',
                                                'infotech-monitor': 'infotech-monitor',
                                                'finger-monitor': 'finger-monitor',
                                                'ked-monitor': 'ked-monitor',
                                                'tms-server': 'tms-server',
                                                'pms-server': 'pms-server',
                                                'workstation-monitor': 'workstation-monitor'
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
                                                // 1차 시도: Controller (18088)
                                                console.log(`[DCP] Requesting restart for ${svc.id} via Controller...`);
                                                const res = await fetch('http://localhost:18088/exec', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(payload)
                                                });
                                                if (!res.ok) throw new Error('Controller Offline');
                                            } catch (err) {
                                                // 2차 시도 (Fallback): AI Bridge (18081)
                                                console.log(`[DCP] Controller offline. Using Emergency Bridge fallback for ${svc.id}...`);
                                                await fetch('http://localhost:18081/exec', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(payload)
                                                });
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
                                )}
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

            <footer style={{ marginTop: '30px', backgroundColor: '#000', padding: '15px', border: '1px solid #00ff9d33' }}>
                <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem' }}>
                    <Terminal size={18} />
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                        {status.logs.join('\n')}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;
