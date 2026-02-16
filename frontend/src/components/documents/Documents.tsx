import { useState } from 'react';
import { FileText, Table, Presentation, Globe, Zap, Terminal } from 'lucide-react';

const Documents = () => {
    const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [mercenaryRequest, setMercenaryRequest] = useState('');
    const [logs, setLogs] = useState<string[]>([]);
    const [jsonPayload, setJsonPayload] = useState('{\n  "title": "UCONAI_Report",\n  "content": "이곳에 내용을 입력하세요"\n}');

    const docTypes = [
        { id: 'word', platform: 'MS', name: 'MS Word', icon: <FileText size={40} className="text-blue-500" />, color: '#2b579a', desc: 'O365 워드 문서 자동 생성' },
        { id: 'excel', platform: 'MS', name: 'MS Excel', icon: <Table size={40} className="text-green-500" />, color: '#217346', desc: 'O365 엑셀 리포트/차트 자동 생성' },
        { id: 'ppt', platform: 'MS', name: 'MS PPT', icon: <Presentation size={40} className="text-orange-500" />, color: '#d24726', desc: 'O365 프레젠테이션 자동 생성' },
        { id: 'google', platform: 'GOOGLE', name: 'Google Docs', icon: <Globe size={40} className="text-blue-400" />, color: '#4285f4', desc: 'Google API 기반 클라우드 생성' },
        { id: 'gsheet', platform: 'GOOGLE', name: 'Google Sheets', icon: <Table size={40} className="text-green-400" />, color: '#34a853', desc: 'Google API 기반 시트 자동화' },
        { id: 'gslide', platform: 'GOOGLE', name: 'Google Slides', icon: <Presentation size={40} className="text-yellow-500" />, color: '#fbbc05', desc: 'Google API 기반 발표자료 생성' }
    ];

    const deployMercenary = async (request: string, type: string) => {
        setIsGenerating(true);
        setLogs(prev => [`[COMMAND] 용병 소환 명령: ${request} (${type})`, ...prev]);

        try {
            const res = await fetch('http://localhost:18081/api/deploy-mercenary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ request, type })
            });

            const data = await res.json();

            if (data.ok) {
                setLogs(prev => [
                    `[SUCCESS] 작전 완료!`,
                    `[PROJECT] ${data.projectPath}`,
                    `[OUTPUT] ${data.outputs.join(', ')}`,
                    ...prev
                ]);
                alert(`✅ 작전 성공!\n\n결과물: ${data.outputs.join(', ')}\n위치: ${data.projectPath}/output`);
            } else {
                setLogs(prev => [`[FAILED] 작전 실패: ${data.error}`, ...prev]);
                alert(`❌ 작전 실패: ${data.error}`);
            }
        } catch (err: any) {
            setLogs(prev => [`[ERROR] 통신 오류: ${err.message}`, ...prev]);
            alert(`❌ 통신 오류: ${err.message}`);
        } finally {
            setIsGenerating(false);
            setSelectedDoc(null);
        }
    };

    const handleExecute = async () => {
        if (!selectedDoc) return;

        if (selectedDoc.platform === 'GOOGLE') {
            // Google API Logic (Existing)
            setIsGenerating(true);
            try {
                const payload = JSON.parse(jsonPayload);
                const resp = await fetch('http://localhost:18082/api/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: selectedDoc.id, ...payload })
                });
                const data = await resp.json();
                if (data.success) window.open(data.url, '_blank');
            } catch (err) {
                alert('작업 실행 실패: ' + err);
            } finally {
                setIsGenerating(false);
                setSelectedDoc(null);
            }
        } else {
            // MS Office Logic -> Mercenary Factory
            const request = (document.getElementById('manualRequest') as HTMLInputElement)?.value ||
                `${selectedDoc.name} 문서를 생성해줘.`;
            await deployMercenary(request, selectedDoc.id); // 'word', 'excel', 'ppt'
        }
    };

    return (
        <div style={{ padding: '30px', color: '#e0e0e0', fontFamily: '"Inter", sans-serif', height: '100%', overflowY: 'auto' }}>

            {/* 1. OFFICE MERCENARY FACTORY (Top Section) */}
            <div style={{
                marginBottom: '40px',
                border: '2px solid #ff6b35',
                borderRadius: '8px',
                padding: '25px',
                backgroundColor: '#1a0a00',
                boxShadow: '0 0 30px #ff6b3511'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    <Zap size={28} color="#ff6b35" />
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#ff6b35', fontWeight: 'bold', letterSpacing: '1px' }}>OFFICE MERCENARY FACTORY</h2>
                        <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '0.9rem', fontFamily: 'monospace' }}>제1군단 용병 양성소 // UNIVERSAL CREATOR ENGINE</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <textarea
                        value={mercenaryRequest}
                        onChange={(e) => setMercenaryRequest(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                deployMercenary(mercenaryRequest, 'auto');
                            }
                        }}
                        placeholder="자연어로 명령하십시오. (Shift+Enter로 줄바꿈)
예:
- ISO 9001 품질점검표 엑셀 생성해줘
- 헤더는 파란색으로 하고
- 통과/실패 드롭다운 추가해줘"
                        style={{
                            flex: 1,
                            background: '#0a0a0a',
                            border: '1px solid #ff6b3544',
                            color: '#ff6b35',
                            padding: '15px',
                            fontSize: '1rem',
                            outline: 'none',
                            fontFamily: 'monospace',
                            borderRadius: '4px',
                            minHeight: '60px',
                            resize: 'vertical'
                        }}
                    />
                    <button
                        onClick={() => deployMercenary(mercenaryRequest, 'auto')}
                        disabled={isGenerating}
                        style={{
                            background: isGenerating ? '#333' : 'linear-gradient(135deg, #ff6b35, #ff8c55)',
                            color: '#fff',
                            border: 'none',
                            padding: '0 30px',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: isGenerating ? 'not-allowed' : 'pointer',
                            borderRadius: '4px',
                            boxShadow: '0 4px 15px #ff6b3544'
                        }}
                    >
                        {isGenerating ? 'DEPLOYING...' : 'DEPLOY'}
                    </button>
                </div>

                {logs.length > 0 && (
                    <div style={{
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid #ff6b3522',
                        padding: '15px',
                        borderRadius: '4px',
                        maxHeight: '150px',
                        overflowY: 'auto',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem'
                    }}>
                        {logs.map((log, i) => (
                            <div key={i} style={{ marginBottom: '5px', color: log.includes('[ERROR]') || log.includes('[FAILED]') ? '#ff4d4d' : log.includes('[SUCCESS]') ? '#00ff9d' : '#ccc' }}>
                                {log}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. SPECIFIC GENERATORS (Cards) */}
            <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '20px', color: '#888' }}>TACTICAL UNITS (MANUAL SELECT)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
                {docTypes.map(doc => (
                    <div
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        style={{
                            backgroundColor: '#151515', border: '1px solid #333', borderRadius: '8px', padding: '25px',
                            cursor: 'pointer', transition: 'all 0.3s', position: 'relative', overflow: 'hidden'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = doc.color;
                            e.currentTarget.style.transform = 'translateY(-5px)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#333';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div style={{ position: 'absolute', top: 0, right: 0, padding: '5px 10px', background: doc.color, fontSize: '0.7rem', fontWeight: 'bold', color: '#000', borderBottomLeftRadius: '8px' }}>
                            {doc.platform}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                            {doc.icon}
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>{doc.name}</h3>
                                <span style={{ fontSize: '0.75rem', color: '#666' }}>UNIT_ID: {doc.id.toUpperCase()}</span>
                            </div>
                        </div>
                        <p style={{ margin: 0, color: '#888', fontSize: '0.85rem', lineHeight: '1.4' }}>{doc.desc}</p>
                    </div>
                ))}
            </div>

            {/* Modal for Params */}
            {selectedDoc && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        backgroundColor: '#111', border: `2px solid ${selectedDoc.color}`, borderRadius: '12px',
                        width: '600px', padding: '30px', position: 'relative', boxShadow: `0 0 30px ${selectedDoc.color}22`
                    }}>
                        <button onClick={() => setSelectedDoc(null)} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                            {selectedDoc.icon}
                            <div>
                                <h2 style={{ margin: 0, color: '#fff' }}>{selectedDoc.name} Generator</h2>
                                <p style={{ margin: 0, color: selectedDoc.color, fontSize: '0.8rem', fontWeight: 'bold' }}>{selectedDoc.platform} MERCENARY UNIT READY</p>
                            </div>
                        </div>

                        {selectedDoc.platform === 'MS' ? (
                            <div style={{ backgroundColor: '#050505', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
                                <h4 style={{ color: selectedDoc.color, marginBottom: '15px', margin: 0 }}>MISSION BRIEFING (작전 상세)</h4>
                                <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '15px' }}>
                                    {selectedDoc.name} 용병에게 내릴 구체적인 지시사항을 입력하십시오.
                                </p>
                                <textarea
                                    id="manualRequest"
                                    placeholder={`예: ${selectedDoc.name}로 월간보고서 양식 만들어줘. 헤더에는 작성일, 중간에는 실적 테이블 포함.`}
                                    style={{ width: '100%', height: '100px', background: '#111', border: '1px solid #333', padding: '15px', color: '#fff', fontSize: '0.9rem', fontFamily: 'monospace', outline: 'none' }}
                                />
                            </div>
                        ) : (
                            <div style={{ backgroundColor: '#050505', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
                                <h4 style={{ color: '#4285f4', marginBottom: '15px', margin: 0 }}>Google API Payload (JSON)</h4>
                                <textarea
                                    value={jsonPayload}
                                    onChange={e => setJsonPayload(e.target.value)}
                                    style={{ width: '100%', height: '150px', background: '#111', color: '#00ff9d', fontFamily: 'monospace', padding: '15px', border: '1px solid #333', fontSize: '0.85rem', outline: 'none' }}
                                />
                            </div>
                        )}

                        <button
                            onClick={handleExecute}
                            disabled={isGenerating}
                            style={{
                                width: '100%', marginTop: '25px', padding: '15px', borderRadius: '6px',
                                background: isGenerating ? '#333' : selectedDoc.color, color: '#fff',
                                fontWeight: 'bold', border: 'none', cursor: isGenerating ? 'not-allowed' : 'pointer', fontSize: '1rem',
                                transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '1px'
                            }}
                        >
                            {isGenerating ? 'EXECUTING MISSION...' : `DEPLOY ${selectedDoc.name} MERCENARY`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Documents;

