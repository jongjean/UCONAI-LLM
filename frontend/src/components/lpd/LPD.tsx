import React, { useState } from 'react';
import { Terminal, Cpu, Layers, Code, Server, Play, Save } from 'lucide-react';

const LPD: React.FC = () => {
    const [selectedModule, setSelectedModule] = useState<string | null>(null);

    return (
        <div style={{ padding: '25px', backgroundColor: '#0a0a0a', color: '#e0e0e0', minHeight: '100%', fontFamily: '"JetBrains Mono", monospace' }}>
            {/* Header Section */}
            <header style={{ marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#00ff9d' }}>
                    <Cpu size={32} />
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', letterSpacing: '3px' }}>LPD v1.0</h2>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>LINUX PROJECT DEVELOPER // INTEGRATED DEVELOPMENT ENVIRONMENT</p>
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '25px' }}>
                {/* Side Navigation / Project Explorer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ backgroundColor: '#111', border: '1px solid #222', padding: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#00ff9d' }}>
                            <Layers size={16} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>PROJECT MODULES</span>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {['Kernel_Bridge', 'Neural_Interpreter', 'Dev_Vault', 'System_Sync'].map(mod => (
                                <li
                                    key={mod}
                                    onClick={() => setSelectedModule(mod)}
                                    style={{
                                        padding: '10px',
                                        backgroundColor: selectedModule === mod ? '#004d30' : 'transparent',
                                        border: '1px solid',
                                        borderColor: selectedModule === mod ? '#00ff9d' : '#222',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {mod}.lpd
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div style={{ backgroundColor: '#111', border: '1px solid #222', padding: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#00ff9d' }}>
                            <Server size={16} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>REMOTE CLUSTERS</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '10px' }}>
                            <div style={{ color: '#00ff9d' }}>● Ubuntu-Dev-Server</div>
                            <div>ssh://root@linux-ip</div>
                        </div>
                    </div>
                </div>

                {/* Main Development Workspace */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Code / Editor Area Placeholder */}
                    <div style={{ flex: 1, backgroundColor: '#050505', border: '1px solid #333', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ backgroundColor: '#111', padding: '10px 20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#888', fontSize: '0.8rem' }}>
                                <Code size={14} />
                                <span>{selectedModule ? `${selectedModule}.lpd` : 'Select a module to edit'}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <Save size={14} style={{ cursor: 'pointer', color: '#888' }} />
                                <Play size={14} style={{ cursor: 'pointer', color: '#00ff9d' }} />
                            </div>
                        </div>
                        <div style={{ flex: 1, padding: '20px', color: '#00ff9d', fontSize: '0.9rem', overflowY: 'auto' }}>
                            {selectedModule ? (
                                <pre style={{ margin: 0 }}>
                                    {`// UCONAI 2.0 LPD Automated Block\n// Module: ${selectedModule}\n\nimport { Uconai_Core } from './bridge';\n\nfunction initialize_block() {\n    const node = Uconai_Core.connect_remote('ubuntu_ssh');\n    console.log('[LPD] Syncing logic patterns...');\n    // Electronic-Auto implementation logic here\n}\n\n// TODO: Integrate Linux development pipeline`}
                                </pre>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                                    <Terminal size={64} style={{ marginBottom: '20px' }} />
                                    <span>LPD_OS_READY: WAITING_FOR_INPUT</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Console / Terminal Section */}
                    <div style={{ height: '200px', backgroundColor: '#000', border: '1px solid #00ff9d44', padding: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', borderBottom: '1px solid #222', paddingBottom: '8px' }}>
                            <Terminal size={14} color="#00ff9d" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#00ff9d' }}>LPD_REMOTE_CONSOLE</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#00ccaa', fontFamily: 'monospace' }}>
                            {`[root@linux-dev]:~$ uconai-cli lpd status\nLPD: All functional blocks online\nUCONAI_CORE_LINK: Stable\nReady for electronic development...`}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LPD;
