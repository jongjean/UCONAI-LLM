import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Shield, Code, FileText, Brain } from 'lucide-react';
import Dashboard from './components/dashboard/Dashboard';
import LPD from './components/lpd/LPD';
import Documents from './components/documents/Documents';
import Intelligence from './components/intelligence/Intelligence';
import './App.css'

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

function App() {
  const [activeScreen, setActiveScreen] = useState<'UCONAI' | 'LPD' | 'DOCS' | 'INTEL'>(() => {
    return (localStorage.getItem('uconai_active_screen') as any) || 'UCONAI';
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('uconai_chat_history');
    return saved ? JSON.parse(saved) : [{ role: 'ai', text: '강박사님, 무엇을 도와드릴까요?' }];
  });
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Only scroll to bottom when new messages appear, not on every screen switch
    if (chatMessages.length > 1) {
      scrollToBottom();
    }
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('uconai_active_screen', activeScreen);
  }, [activeScreen]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const msg = userInput;
    setUserInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setIsTyping(true);

    try {
      const resp = await fetch('http://localhost:18081/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ message: msg })
      });
      const data = await resp.json();
      setChatMessages(prev => [...prev, { role: 'ai', text: data.answer }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', text: '통신 오류가 발생했습니다. Gateway 상태를 확인해주세요.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    const syncHistory = async () => {
      try {
        const resp = await fetch('http://localhost:18081/api/history');
        const data = await resp.json();
        if (data.history && data.history.length > 0) {
          const synced = data.history.map((h: any) => ({
            role: h.role === 'USER' ? 'user' : 'ai',
            text: h.content
          }));
          setChatMessages(synced);
        }
      } catch (err) { console.error("History sync failed:", err); }
    };
    syncHistory();
  }, []);

  useEffect(() => {
    localStorage.setItem('uconai_chat_history', JSON.stringify(chatMessages));
  }, [chatMessages]);

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0a0a0a', color: 'white' }}>
      {/* Unified Header */}
      <nav style={{ display: 'flex', borderBottom: '2px solid #00ff9d33', padding: '0 25px', alignItems: 'center', backgroundColor: '#050505', justifyContent: 'space-between', height: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', height: '100%' }}>
          <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#00ff9d', fontWeight: 'bold', letterSpacing: '2px', borderRight: '1px solid #333', paddingRight: '30px' }}>UCONAI 2.0</h1>

          <div style={{ display: 'flex', height: '100%', gap: '5px' }}>
            <button
              onClick={() => setActiveScreen('UCONAI')}
              style={{
                background: 'transparent', border: 'none', color: activeScreen === 'UCONAI' ? '#00ff9d' : '#666',
                padding: '0 20px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px',
                borderBottom: activeScreen === 'UCONAI' ? '3px solid #00ff9d' : '3px solid transparent',
                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s'
              }}>
              <Shield size={16} /> UCONAI
            </button>
            <button
              onClick={() => setActiveScreen('LPD')}
              style={{
                background: 'transparent', border: 'none', color: activeScreen === 'LPD' ? '#00ff9d' : '#666',
                padding: '0 20px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px',
                borderBottom: activeScreen === 'LPD' ? '3px solid #00ff9d' : '3px solid transparent',
                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s'
              }}>
              <Code size={16} /> LPD
            </button>
            <button
              onClick={() => setActiveScreen('DOCS')}
              style={{
                background: 'transparent', border: 'none', color: activeScreen === 'DOCS' ? '#00ff9d' : '#666',
                padding: '0 20px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px',
                borderBottom: activeScreen === 'DOCS' ? '3px solid #00ff9d' : '3px solid transparent',
                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s'
              }}>
              <FileText size={16} /> DOCUMENTS
            </button>
            <button
              onClick={() => setActiveScreen('INTEL')}
              style={{
                background: 'transparent', border: 'none', color: activeScreen === 'INTEL' ? '#00ff9d' : '#666',
                padding: '0 20px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px',
                borderBottom: activeScreen === 'INTEL' ? '3px solid #00ff9d' : '3px solid transparent',
                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s'
              }}>
              <Brain size={16} /> NEURAL GUIDE
            </button>
          </div>
        </div>
        <div style={{ color: '#888', fontSize: '0.7rem', fontFamily: 'monospace', opacity: 0.6 }}>SYSTEM_REV: 1.2 // SECURE_LINK_ACTIVE</div>
      </nav>

      {/* Main Unified Content Area */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

        {/* Left: Component Area */}
        <div style={{ flex: '1.2', borderRight: '1px solid #333', overflowY: 'auto', backgroundColor: '#0a0a0a' }}>
          {activeScreen === 'UCONAI' && <Dashboard />}
          {activeScreen === 'LPD' && <LPD />}
          {activeScreen === 'DOCS' && <Documents />}
          {activeScreen === 'INTEL' && <Intelligence />}
        </div>

        {/* Right: Neural Link (Chat) */}
        <div style={{ flex: '0.8', display: 'flex', flexDirection: 'column', backgroundColor: '#0c0c0c' }}>
          <div style={{ padding: '15px 20px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: '10px', color: '#00ff9d' }}>
            <MessageSquare size={18} />
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px' }}>UCONAI COMMANDER</span>
          </div>

          <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {chatMessages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: m.role === 'user' ? '#004d30' : '#1a1a1a',
                color: m.role === 'user' ? '#00ff9d' : '#e0e0e0',
                padding: '12px 18px', borderRadius: '4px', maxWidth: '85%',
                border: m.role === 'user' ? '1px solid #00ff9d' : '1px solid #333',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                fontFamily: '"JetBrains Mono", monospace'
              }}>
                {(m.text || '').split('\n').map((line, idx) => <div key={idx}>{line}</div>)}
              </div>
            ))}
            {isTyping && <div style={{ color: '#00ff9d', fontSize: '0.8rem', paddingLeft: '10px', fontFamily: 'monospace' }}>ANALYZING...</div>}
            <div ref={chatEndRef} />
          </div>

          <div className="input-area" style={{ padding: '15px', borderTop: '1px solid #222', backgroundColor: '#050505' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="지시를 입력하십시오, 강박사님..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                style={{
                  flex: 1, padding: '12px', borderRadius: '4px', border: '1px solid #00ff9d44',
                  backgroundColor: '#111', color: '#00ff9d', fontFamily: 'monospace', outline: 'none'
                }}
              />
              <button
                onClick={handleSendMessage}
                style={{
                  padding: '0 20px', backgroundColor: 'transparent', color: '#00ff9d',
                  border: '1px solid #00ff9d', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                }}
              >
                EXECUTE
              </button>
            </div>

            {/* Tactical Shortcuts */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => { setUserInput('모든 시스템 상태 확인해줘'); handleSendMessage(); }} style={{ padding: '5px 10px', background: '#111', border: '1px solid #333', color: '#888', borderRadius: '2px', cursor: 'pointer', fontSize: '0.75rem' }}>
                STATUS_CHECK
              </button>
              <button onClick={() => { setUserInput('AI Bridge 재시작해줘'); handleSendMessage(); }} style={{ padding: '5px 10px', background: '#111', border: '1px solid #333', color: '#888', borderRadius: '2px', cursor: 'pointer', fontSize: '0.75rem' }}>
                REBOOT_BRIDGE
              </button>
              <button onClick={() => { setUserInput('시스템 정리하고 보고서 작성해줘'); handleSendMessage(); }} style={{ padding: '5px 10px', background: '#111', border: '1px solid #333', color: '#888', borderRadius: '2px', cursor: 'pointer', fontSize: '0.75rem' }}>
                GENERATE_REPORT
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
