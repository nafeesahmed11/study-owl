import { useState, useRef, useEffect } from "react";
import { C, Card, Btn, Badge, Avatar } from "../components/ui";
import { IconBrain, IconSend, IconCopy, IconStar, IconRefresh, IconPlus, IconFileText, IconSparkles } from "../components/Icons";

type Message = { id: number; role: 'user' | 'assistant'; content: string; saved?: boolean };

const suggestions = [
  "Explain the difference between B-Tree and B+ Tree indexing",
  "Summarize the OSI model layers with examples",
  "What are the key differences between DFS and BFS?",
  "Explain Deadlock Detection and Prevention",
  "Generate 5 MCQs on Normalization",
  "Write a 10-mark answer on Transaction Management",
];

const aiResponses: Record<string, string> = {
  default: `Great question! Let me break this down clearly for your exam preparation.\n\n**Key Concepts:**\nThis is an important topic that regularly appears in CSE 6th semester examinations.\n\n**Explanation:**\nThe core idea involves understanding the underlying principles and their practical applications. Let me walk you through each aspect systematically:\n\n1. **First Principle** — The foundational concept that everything else builds upon. Understanding this gives you the framework to answer any related question.\n\n2. **Second Aspect** — This builds on the first and introduces the practical mechanics of how the system works.\n\n3. **Third Point** — The advanced consideration that often appears in 10-mark questions and distinguishes good answers from excellent ones.\n\n**Example:**\nConsider a real-world scenario: when you book a train ticket online, multiple concepts from this topic are applied simultaneously.\n\n**Exam Tip:**\nIn a 5-mark question, cover points 1 and 2 with one example. For 10 marks, add point 3, a comparison table, and a conclusion paragraph.\n\nWould you like me to generate practice questions on this topic, or explain any specific part in more detail?`,
};

let msgId = 10;

const initMessages: Message[] = [
  { id: 1, role: 'assistant', content: "Hello! I'm your Study Owl AI academic tutor. I can help you understand difficult topics, explain concepts, generate practice questions, summarize chapters, and prepare structured exam answers.\n\nWhat would you like to study today?" },
];

export default function AIStudy() {
  const [messages, setMessages] = useState<Message[]>(initMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history] = useState([
    { id: 1, title: "DBMS — Normalization Explained", date: "2h ago" },
    { id: 2, title: "CN — OSI vs TCP/IP Model", date: "Yesterday" },
    { id: 3, title: "Algo — Dynamic Programming", date: "Dec 10" },
    { id: 4, title: "SE — SDLC Models Compared", date: "Dec 9" },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = (text?: string) => {
    const content = text || input.trim();
    if (!content) return;
    const userMsg: Message = { id: ++msgId, role: 'user', content };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      const aiMsg: Message = { id: ++msgId, role: 'assistant', content: aiResponses.default };
      setMessages(m => [...m, aiMsg]);
      setLoading(false);
    }, 1200);
  };

  const toggleSave = (id: number) => setMessages(m => m.map(msg => msg.id === id ? { ...msg, saved: !msg.saved } : msg));

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      {/* Left: History sidebar */}
      <div style={{ width: '240px', borderRight: `1px solid ${C.border}`, backgroundColor: C.surface, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px', borderBottom: `1px solid ${C.border}` }}>
          <Btn fullWidth size="sm" variant="secondary" icon={<IconPlus size={14} />} onClick={() => setMessages(initMessages)}>
            New Conversation
          </Btn>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 8px 4px' }}>Recent</p>
          {history.map(h => (
            <button key={h.id} style={{ width: '100%', textAlign: 'left', padding: '10px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface2}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <p style={{ fontSize: '13px', fontWeight: 500, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</p>
              <p style={{ fontSize: '11px', color: C.text3, marginTop: '2px' }}>{h.date}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Center: Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: C.surface }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: C.indigoLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.indigo }}>
            <IconBrain size={17} />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: C.navy }}>AI Study Assistant</p>
            <p style={{ fontSize: '11.5px', color: C.text3 }}>Academic tutor · DBMS, Algorithms, CN and more</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
            <Badge variant="success">Online</Badge>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: C.bg }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', gap: '10px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
              {msg.role === 'assistant' ? (
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: C.navyMid, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img src="/assets/ce79b.svg" alt="AI" style={{ height: '22px', filter: 'brightness(10)' }} />
                </div>
              ) : (
                <Avatar name="Alex Johnson" size={32} />
              )}
              <div style={{ maxWidth: '72%' }}>
                <div style={{ padding: '14px 16px', borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px', backgroundColor: msg.role === 'user' ? C.indigo : C.surface, color: msg.role === 'user' ? '#fff' : C.text, border: msg.role === 'assistant' ? `1px solid ${C.border}` : 'none', lineHeight: 1.65 }}>
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i} style={{ fontSize: '13.5px', fontWeight: line.startsWith('**') ? 600 : 400, color: msg.role === 'user' ? '#fff' : (line.startsWith('**') ? C.navy : C.text), marginBottom: line === '' ? '8px' : '2px' }}>
                      {line.replace(/\*\*/g, '')}
                    </p>
                  ))}
                </div>
                {msg.role === 'assistant' && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                    <button onClick={() => { navigator.clipboard.writeText(msg.content); }} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', background: 'none', border: `1px solid ${C.border}`, borderRadius: '6px', fontSize: '11.5px', color: C.text3, cursor: 'pointer' }}>
                      <IconCopy size={11} /> Copy
                    </button>
                    <button onClick={() => toggleSave(msg.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', background: 'none', border: `1px solid ${msg.saved ? C.indigo : C.border}`, borderRadius: '6px', fontSize: '11.5px', color: msg.saved ? C.indigo : C.text3, cursor: 'pointer' }}>
                      <IconStar size={11} /> {msg.saved ? 'Saved' : 'Save'}
                    </button>
                    <button onClick={() => {}} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', background: 'none', border: `1px solid ${C.border}`, borderRadius: '6px', fontSize: '11.5px', color: C.text3, cursor: 'pointer' }}>
                      <IconRefresh size={11} /> Regenerate
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: C.navyMid, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src="/assets/ce79b.svg" alt="AI" style={{ height: '22px', filter: 'brightness(10)' }} />
              </div>
              <div style={{ padding: '14px 16px', borderRadius: '4px 16px 16px 16px', backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '20px' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: C.text3, animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                  ))}
                  <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}`}</style>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div style={{ padding: '12px 20px 0', borderTop: `1px solid ${C.border}`, backgroundColor: C.surface }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px' }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => send(s)} style={{ padding: '6px 12px', backgroundColor: C.surface2, border: `1px solid ${C.border}`, borderRadius: '99px', fontSize: '12.5px', color: C.text2, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={{ padding: '12px 20px 16px', backgroundColor: C.surface }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Ask me anything academic… (Enter to send, Shift+Enter for new line)"
                rows={2}
                style={{ width: '100%', padding: '10px 14px', fontSize: '14px', borderRadius: '12px', border: `1.5px solid ${C.border}`, outline: 'none', resize: 'none', fontFamily: 'inherit', color: C.text, lineHeight: 1.5 }}
                onFocus={e => e.target.style.borderColor = C.indigo}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>
            <button onClick={() => send()} disabled={!input.trim() || loading} style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: C.indigo, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: !input.trim() || loading ? 0.5 : 1, flexShrink: 0 }}>
              <IconSend size={17} color="#fff" />
            </button>
          </div>
          <p style={{ fontSize: '11px', color: C.text3, marginTop: '6px' }}>Study Owl AI · Answers are AI-generated for academic study purposes.</p>
        </div>
      </div>

      {/* Right: Context panel */}
      <div style={{ width: '220px', borderLeft: `1px solid ${C.border}`, backgroundColor: C.surface, padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flexShrink: 0, overflowY: 'auto' }}>
        <div>
          <p style={{ fontSize: '11.5px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Context</p>
          <div style={{ padding: '10px 12px', backgroundColor: C.indigoLight, borderRadius: '10px', border: `1px solid ${C.indigo}30` }}>
            <p style={{ fontSize: '12.5px', fontWeight: 600, color: C.indigo }}>DBMS – 6th Sem</p>
            <p style={{ fontSize: '11.5px', color: C.text2, marginTop: '2px' }}>Dr. A.K. Rahman</p>
          </div>
        </div>
        <div>
          <p style={{ fontSize: '11.5px', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>AI Tools</p>
          {[
            { label: 'Generate MCQs', icon: <IconSparkles size={13} /> },
            { label: 'Summarize Chapter', icon: <IconFileText size={13} /> },
            { label: 'Make Study Notes', icon: <IconStar size={13} /> },
          ].map(a => (
            <button key={a.label} onClick={() => send(a.label)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'none', border: `1px solid ${C.border}`, borderRadius: '8px', fontSize: '12.5px', color: C.text2, cursor: 'pointer', marginBottom: '6px', textAlign: 'left' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.surface2; e.currentTarget.style.borderColor = C.indigo; e.currentTarget.style.color = C.indigo; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text2; }}>
              {a.icon}{a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
