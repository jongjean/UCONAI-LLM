import { useState } from 'react';
import { FileText, Table, Presentation, Globe } from 'lucide-react';

const Documents = () => {
    const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [jsonPayload, setJsonPayload] = useState('{\n  "title": "UCONAI_Report",\n  "content": "이곳에 내용을 입력하세요"\n}');

    const docTypes = [
        { id: 'word', platform: 'MS', name: 'MS Word', icon: <FileText className="text-blue-500" />, color: '#2b579a', desc: 'O365 로컬 인텔리전스 기반 자동 생성' },
        { id: 'excel', platform: 'MS', name: 'MS Excel', icon: <Table className="text-green-500" />, color: '#217346', desc: 'O365 로컬 통계 데이터 자동 출력' },
        { id: 'ppt', platform: 'MS', name: 'MS PPT', icon: <Presentation className="text-orange-500" />, color: '#d24726', desc: 'O365 로컬 슬라이드 디자인 자동화' },
        { id: 'google', platform: 'GOOGLE', name: 'Google Docs', icon: <Globe className="text-blue-400" />, color: '#4285f4', desc: 'Google API JSON 기반 클라우드 생성' },
        { id: 'gsheet', platform: 'GOOGLE', name: 'Google Sheets', icon: <Table className="text-green-400" />, color: '#34a853', desc: 'Google API JSON 기반 시트 자동화' },
        { id: 'gslide', platform: 'GOOGLE', name: 'Google Slides', icon: <Presentation className="text-yellow-500" />, color: '#fbbc05', desc: 'Google API JSON 기반 발표자료 생성' }
    ];

    const handleExecute = async () => {
        if (!selectedDoc) return;
        setIsGenerating(true);
        try {
            if (selectedDoc.platform === 'GOOGLE') {
                const payload = JSON.parse(jsonPayload);
                const resp = await fetch('http://localhost:18082/api/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: selectedDoc.id, ...payload })
                });
                const data = await resp.json();
                if (data.success) window.open(data.url, '_blank');
            } else {
                alert(`${selectedDoc.name} 로컬 자동화 스크립트를 가동합니다. (O365 연동 시작)`);
            }
        } catch (err) {
            alert('작업 실행 실패: ' + err);
        } finally {
            setIsGenerating(false);
            setSelectedDoc(null);
        }
    };

    return (
        <div style={{ padding: '30px', color: '#e0e0e0', fontFamily: '"Inter", sans-serif', height: '100%', overflowY: 'auto' }}>
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#00ff9d', fontWeight: 'bold' }}>DOCUMENT INTELLIGENCE</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '0.9rem' }}>생성 방식을 선택하십시오 (O365 로컬 / Google API)</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
                {docTypes.map(doc => (
                    <div
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        style={{
                            backgroundColor: '#151515', border: '1px solid #333', borderRadius: '15px', padding: '30px',
                            cursor: 'pointer', transition: 'all 0.3s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = doc.color}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#333'}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ fontSize: '2.5rem' }}>{doc.icon}</div>
                            <div style={{ fontSize: '0.7rem', color: doc.color, fontWeight: 'bold', border: `1px solid ${doc.color}`, padding: '2px 8px', borderRadius: '10px', height: 'fit-content' }}>
                                {doc.platform}
                            </div>
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>{doc.name}</h3>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{doc.desc}</p>
                    </div>
                ))}
            </div>

            {selectedDoc && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(10px)'
                }}>
                    <div style={{
                        backgroundColor: '#111', border: `1px solid ${selectedDoc.color}`, borderRadius: '20px',
                        width: '600px', padding: '40px', position: 'relative'
                    }}>
                        <button onClick={() => setSelectedDoc(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                            <div style={{ fontSize: '3rem' }}>{selectedDoc.icon}</div>
                            <div>
                                <h2 style={{ margin: 0, color: '#fff' }}>{selectedDoc.name} Generator</h2>
                                <p style={{ margin: 0, color: selectedDoc.color, fontSize: '0.8rem', fontWeight: 'bold' }}>{selectedDoc.platform} AUTOMATION ENGINE ACTIVE</p>
                            </div>
                        </div>

                        {selectedDoc.platform === 'MS' ? (
                            <div style={{ backgroundColor: '#050505', padding: '25px', borderRadius: '12px', border: '1px solid #222' }}>
                                <h4 style={{ color: '#00ff9d', marginBottom: '15px' }}>O365 Local Logic Config</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: '#666' }}>DOC_TITLE</label>
                                        <input type="text" defaultValue="UCONAI_Strategic_Report_2026" style={{ width: '100%', background: '#111', border: '1px solid #333', padding: '10px', color: '#fff', marginTop: '5px' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button style={{ flex: 1, background: '#1a1a1a', color: '#eee', padding: '12px', border: '1px solid #333', borderRadius: '4px' }}>TEMPLATE_SCAN</button>
                                        <button style={{ flex: 1, background: '#1a1a1a', color: '#eee', padding: '12px', border: '1px solid #333', borderRadius: '4px' }}>AI_DRAFTING</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ backgroundColor: '#050505', padding: '25px', borderRadius: '12px', border: '1px solid #222' }}>
                                <h4 style={{ color: '#4285f4', marginBottom: '15px' }}>Google Workspace API JSON Architect</h4>
                                <textarea
                                    value={jsonPayload}
                                    onChange={e => setJsonPayload(e.target.value)}
                                    style={{ width: '100%', height: '150px', background: '#000', color: '#00ff9d', fontFamily: 'monospace', padding: '15px', border: '1px solid #333', borderRadius: '8px', fontSize: '0.9rem' }}
                                />
                                <div style={{ fontSize: '0.7rem', color: '#444', marginTop: '10px' }}>* JSON 형식을 준수하여 API 페이로드를 작성하십시오.</div>
                            </div>
                        )}

                        <button
                            onClick={handleExecute}
                            disabled={isGenerating}
                            style={{
                                width: '100%', marginTop: '30px', padding: '15px', borderRadius: '8px',
                                background: isGenerating ? '#333' : selectedDoc.color, color: '#fff',
                                fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1.1rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {isGenerating ? 'EXECUTING DROID...' : `EXECUTE ${selectedDoc.platform} AUTOMATION`}
                        </button>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Documents;
