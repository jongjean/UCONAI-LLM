import { useState, useEffect, useRef } from 'react'
import './App.css'

interface LogEntry {
  time: string;
  msg: string;
}

interface SystemStatus {
  id: string;
  name: string;
  status: 'OK' | 'FAIL' | 'WARN';
  uptime: string;
  load: number;
}

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

function App() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [systems, setSystems] = useState<SystemStatus[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([
    { time: new Date().toLocaleTimeString(), msg: "Dashboard initialized. Ready for operations." }
  ]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('uconai_chat_history');
    return saved ? JSON.parse(saved) : [{ role: 'ai', text: '지휘관님, 무엇을 도와드릴까요?' }];
  });
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-9), { time: new Date().toLocaleTimeString().split(' ')[1], msg }]);
  };

  const fetchHealth = async () => {
    try {
      const resp = await fetch('http://localhost:18080/health-report');
      const data = await resp.json();
      const mapped = data.systems.map((s: any) => ({
        id: s.id,
        name: s.name,
        status: s.result.ok ? 'OK' : 'FAIL',
        uptime: s.result.ok ? 'Running' : '0s',
        load: s.result.ok ? Math.floor(Math.random() * 20) + 5 : 0
      }));
      setSystems(mapped);
    } catch (err) {
      console.error("Health fetch failed", err);
    }
  };

  const handleRestart = async (id: string) => {
    addLog(`Initiating restart for ${id}...`);
    try {
      const resp = await fetch('http://localhost:18080/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cmd: 'powershell.exe',
          args: ['C:\\\\UCONAI-LLM\\\\scripts\\\\core\\\\Standard-Wrapper.ps1', '-SystemId', id, '-Action', 'Restart']
        })
      });
      const result = await resp.json();
      if (result.ok) {
        addLog(`Restart command sent to ${id} successfully.`);
        setTimeout(fetchHealth, 2000);
      } else {
        addLog(`Error restarting ${id}: ${result.error}`);
      }
    } catch (err) {
      addLog(`Failed to communicate with controller for ${id}.`);
    }
  };

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
    localStorage.setItem('uconai_chat_history', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    fetchHealth();
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
      fetchHealth();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dashboard-wrapper">
      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>UCONAI-LLM 1.0</h1>
            <p className="subtitle">DCP Unified Intelligence Control Center</p>
          </div>
          <div className="header-right">
            <div className="time-display">{currentTime}</div>
            <div className="global-status">
              <span className={`status-indicator ${systems.every(s => s.status === 'OK') ? 'status-ok' : 'status-warn'}`}></span>
              {systems.every(s => s.status === 'OK') ? 'SYSTEMS OPERATIONAL' : 'ACTION REQUIRED'}
            </div>
          </div>
        </header>

        <div className="dashboard-grid">
          {systems.map((sys) => (
            <div key={sys.id} className="system-card">
              <div className="card-header">
                <span className={`status-indicator status-${sys.status.toLowerCase()}`}></span>
                <span className="system-name">{sys.name}</span>
              </div>
              <div className="card-body">
                <div className="metric">
                  <span className="label">Status:</span>
                  <span className={`value status-${sys.status.toLowerCase()}`}>{sys.status}</span>
                </div>
                <div className="metric">
                  <span className="label">Uptime:</span>
                  <span className="value">{sys.uptime}</span>
                </div>
              </div>
              <div className="card-footer">
                <button onClick={() => handleRestart(sys.id)}>Restart</button>
                <button>Logs</button>
              </div>
            </div>
          ))}
        </div>

        <section className="terminal-section">
          <h3>Live Event Trace</h3>
          <div className="log-window">
            {logs.map((log, i) => (
              <div key={i} className="log-entry">
                <span className="log-time">[{log.time}]</span>
                <span className="log-msg">{log.msg}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <aside className="chat-panel">
        <div className="chat-header">
          <h3>AI 전략 지휘센터</h3>
          <span className="status-indicator status-ok"></span>
        </div>
        <div className="chat-messages">
          {chatMessages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role}`}>
              {m.text}
            </div>
          ))}
          {isTyping && <div className="chat-bubble ai typing">...</div>}
          <div ref={chatEndRef} />
        </div>
        <div className="chat-input-area">
          <input
            type="text"
            placeholder="명령을 입력하세요..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={handleSendMessage}>전송</button>
        </div>
      </aside>
    </div>
  )
}

export default App
