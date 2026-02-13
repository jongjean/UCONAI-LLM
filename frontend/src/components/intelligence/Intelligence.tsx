import { useState, useEffect } from 'react';
import { Save, RefreshCw, Brain } from 'lucide-react';

export default function Intelligence() {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchDirective();
  }, []);

  const fetchDirective = async () => {
    try {
      const resp = await fetch('http://localhost:18081/api/directive');
      const data = await resp.json();
      setContent(data.content || '');
    } catch (err) {
      console.error('Failed to load directives:', err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatus('idle');
    try {
      const resp = await fetch('http://localhost:18081/api/directive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await resp.json();
      if (data.success) {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSync = async () => {
    setIsSaving(true);
    try {
      await fetch('http://localhost:18081/api/reindex', { method: 'POST' });
      alert('AI가 최신 지침을 즉시 인식했습니다.');
    } catch (err) {
      alert('동기화 실패: ' + err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '30px', color: '#e0e0e0', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Brain style={{ color: '#00ff9d' }} size={28} />
          <div>
            <h2 style={{ margin: 0, color: '#00ff9d', fontSize: '1.5rem', letterSpacing: '2px' }}>NEURAL GUIDE ARCHITECT</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>AI 핵심 의식 가이드라인 및 마스터 지침 관리</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSync}
            style={{
              backgroundColor: '#111', color: '#00ff9d', border: '1px solid #00ff9d',
              padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
            <RefreshCw size={16} /> 인식
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              backgroundColor: '#00ff9d', color: '#000', border: 'none',
              padding: '8px 25px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
            <Save size={16} /> 저장
          </button>
        </div>
      </header>

      <div style={{ backgroundColor: '#050505', border: '1px solid #222', borderRadius: '8px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px 20px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#888', fontFamily: 'monospace' }}>MASTER_DIRECTIVES.md</span>
          {status === 'success' && <span style={{ fontSize: '0.86rem', color: '#00ff9d' }}>수정 사항이 보관소에 안전하게 저장되었습니다.</span>}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder='# 여기에 AI가 반드시 따라야 할 지침이나 박제할 지식을 작성하십시오...'
          style={{
            flex: 1, backgroundColor: 'transparent', border: 'none', color: '#fff',
            padding: '20px', fontFamily: '"JetBrains Mono", monospace', fontSize: '1rem', lineHeight: '1.6',
            resize: 'none', outline: 'none'
          }}
        />
      </div>
    </div>
  );
}