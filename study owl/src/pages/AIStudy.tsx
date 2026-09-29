import { useState, useRef, useEffect } from "react";
import { C, Card, Btn, Badge, Avatar } from "../components/ui";
import { IconBrain, IconSend, IconCopy, IconStar, IconRefresh, IconPlus, IconFileText, IconSparkles } from "../components/Icons";

const ClaudeIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
  </svg>
);

const DeepSeekIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.748 4.651c-.254-.124-.364.113-.512.233-.051.04-.094.09-.137.137-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.155-.708-.311-.955-.65-.172-.24-.219-.509-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.094.172.187.129.323-.082.28-.18.553-.266.833-.055.179-.137.218-.328.14a5.5 5.5 0 0 1-1.737-1.179c-.857-.828-1.631-1.743-2.597-2.46a12 12 0 0 0-.689-.47c-.985-.957.13-1.743.387-1.836.27-.098.094-.433-.778-.428-.872.003-1.67.295-2.687.685a3 3 0 0 1-.465.136 9.6 9.6 0 0 0-2.883-.101c-1.885.21-3.39 1.1-4.497 2.622C.082 8.776-.231 10.854.152 13.02c.403 2.284 1.568 4.175 3.36 5.653 1.857 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.132-.284 4.994-1.86.47.234.962.328 1.78.398.629.058 1.235-.031 1.705-.129.735-.155.684-.836.418-.961-2.155-1.004-1.682-.595-2.112-.926 1.095-1.295 2.768-3.598 3.284-6.733.05-.346.115-.834.108-1.114-.004-.171.035-.238.23-.257a4.2 4.2 0 0 0 1.545-.475c1.397-.763 1.96-2.016 2.093-3.517.02-.23-.004-.467-.247-.588M11.58 18.168c-2.088-1.642-3.101-2.183-3.52-2.16-.39.024-.32.472-.234.763.09.288.207.487.371.74.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.168-1.361-.801-2.5-1.86-3.301-3.306-.775-1.393-1.225-2.888-1.299-4.482-.02-.385.094-.522.477-.592a4.7 4.7 0 0 1 1.53-.038c2.131.311 3.946 1.264 5.467 2.774.868.86 1.525 1.887 2.202 2.89.72 1.066 1.494 2.082 2.48 2.915.348.291.626.513.892.677-.802.09-2.14.109-3.055-.615zm1.001-6.44a.306.306 0 0 1 .415-.287.3.3 0 0 1 .113.074.3.3 0 0 1 .086.214c0 .17-.136.307-.308.307a.303.303 0 0 1-.306-.307m3.11 1.596c-.2.081-.4.151-.591.16a1.25 1.25 0 0 1-.798-.254c-.274-.23-.47-.358-.551-.758a1.7 1.7 0 0 1 .015-.588c.07-.327-.007-.537-.238-.727-.188-.156-.426-.199-.689-.199a.6.6 0 0 1-.254-.078.253.253 0 0 1-.114-.358 1 1 0 0 1 .192-.21c.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.392.451.462.576.685.915.176.264.336.536.446.848.066.194-.02.353-.25.45" />
  </svg>
);

const ChatGPTIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 512 509.639" fillRule="evenodd" clipRule="evenodd">
    <path fill="#fff" d="M115.612 0h280.775C459.974 0 512 52.026 512 115.612v278.415c0 63.587-52.026 115.613-115.613 115.613H115.612C52.026 509.64 0 457.614 0 394.027V115.612C0 52.026 52.026 0 115.612 0z" />
    <path fillRule="nonzero" d="M412.037 221.764a90.834 90.834 0 004.648-28.67 90.79 90.79 0 00-12.443-45.87c-16.37-28.496-46.738-46.089-79.605-46.089-6.466 0-12.943.683-19.264 2.04a90.765 90.765 0 00-67.881-30.515h-.576c-.059.002-.149.002-.216.002-39.807 0-75.108 25.686-87.346 63.554-25.626 5.239-47.748 21.31-60.682 44.03a91.873 91.873 0 00-12.407 46.077 91.833 91.833 0 0023.694 61.553 90.802 90.802 0 00-4.649 28.67 90.804 90.804 0 0012.442 45.87c16.369 28.504 46.74 46.087 79.61 46.087a91.81 91.81 0 0019.253-2.04 90.783 90.783 0 0067.887 30.516h.576l.234-.001c39.829 0 75.119-25.686 87.357-63.588 25.626-5.242 47.748-21.312 60.682-44.033a91.718 91.718 0 0012.383-46.035 91.83 91.83 0 00-23.693-61.553l-.004-.005zM275.102 413.161h-.094a68.146 68.146 0 01-43.611-15.8 56.936 56.936 0 002.155-1.221l72.54-41.901a11.799 11.799 0 005.962-10.251V241.651l30.661 17.704c.326.163.55.479.596.84v84.693c-.042 37.653-30.554 68.198-68.21 68.273h.001zm-146.689-62.649a68.128 68.128 0 01-9.152-34.085c0-3.904.341-7.817 1.005-11.663.539.323 1.48.897 2.155 1.285l72.54 41.901a11.832 11.832 0 0011.918-.002l88.563-51.137v35.408a1.1 1.1 0 01-.438.94l-73.33 42.339a68.43 68.43 0 01-34.11 9.12 68.359 68.359 0 01-59.15-34.11l-.001.004zm-19.083-158.36a68.044 68.044 0 0135.538-29.934c0 .625-.036 1.731-.036 2.5v83.801l-.001.07a11.79 11.79 0 005.954 10.242l88.564 51.13-30.661 17.704a1.096 1.096 0 01-1.034.093l-73.337-42.375a68.36 68.36 0 01-34.095-59.143 68.412 68.412 0 019.112-34.085l-.004-.003zm251.907 58.621l-88.563-51.137 30.661-17.697a1.097 1.097 0 011.034-.094l73.337 42.339c21.109 12.195 34.132 34.746 34.132 59.132 0 28.604-17.849 54.199-44.686 64.078v-86.308c.004-.032.004-.065.004-.096 0-4.219-2.261-8.119-5.919-10.217zm30.518-45.93c-.539-.331-1.48-.898-2.155-1.286l-72.54-41.901a11.842 11.842 0 00-5.958-1.611c-2.092 0-4.15.558-5.957 1.611l-88.564 51.137v-35.408l-.001-.061a1.1 1.1 0 01.44-.88l73.33-42.303a68.301 68.301 0 0134.108-9.129c37.704 0 68.281 30.577 68.281 68.281a68.69 68.69 0 01-.984 11.545v.005zm-191.843 63.109l-30.668-17.704a1.09 1.09 0 01-.596-.84v-84.692c.016-37.685 30.593-68.236 68.281-68.236a68.332 68.332 0 0143.689 15.804 63.09 63.09 0 00-2.155 1.222l-72.54 41.9a11.794 11.794 0 00-5.961 10.248v.068l-.05 102.23zm16.655-35.91l39.445-22.782 39.444 22.767v45.55l-39.444 22.767-39.445-22.767v-45.535z" />
  </svg>
);

const AI_MODELS = [
  { id: 'claude', name: 'Claude', color: '#D97757', icon: <ClaudeIcon /> },
  { id: 'deepseek', name: 'Deep Seek', color: '#4D6BFE', icon: <DeepSeekIcon /> },
  { id: 'chatgpt', name: 'Chat gpt', color: '#000000', icon: <ChatGPTIcon /> },
  { id: 'gemini', name: 'Gemini', color: '#fff', icon: <img src="/assets/gemini.svg" alt="" width={18} height={18} style={{ display: 'block' }} /> },
];

/**
 * Page: AI Study Chat (/app/ai-study) — student-only, inside AppLayout.
 * Purpose: Chat-style AI tutor with a conversation history sidebar, a model
 *   picker, per-message copy/save/regenerate actions, and a context panel.
 * Data source: NOT a real AI call. `send` appends the user's message, waits
 *   1.2s, then always replies with the same canned `aiResponses.default`
 *   text regardless of the question or the selected model. Choosing a model
 *   only changes the avatar colour/icon, not the response.
 * Layout: a three-column full-height shell (240px history / flex chat /
 *   220px context) rather than a normal scrolling page. It stretches to the
 *   space between the AppLayout top bar and the app footer, and scrolls only
 *   inside its own columns.
 */

type Message = { id: number; role: 'user' | 'assistant'; content: string; saved?: boolean };

// Clickable starter prompts shown in the empty-chat state
const suggestions = [
  "Explain the difference between B-Tree and B+ Tree indexing",
  "Summarize the OSI model layers with examples",
  "What are the key differences between DFS and BFS?",
  "Explain Deadlock Detection and Prevention",
  "Generate 5 MCQs on Normalization",
  "Write a 10-mark answer on Transaction Management",
];

// Canned reply text. Only `default` exists, so every answer is identical
const aiResponses: Record<string, string> = {
  default: `Great question! Let me break this down clearly for your exam preparation.\n\n**Key Concepts:**\nThis is an important topic that regularly appears in CSE 6th semester examinations.\n\n**Explanation:**\nThe core idea involves understanding the underlying principles and their practical applications. Let me walk you through each aspect systematically:\n\n1. **First Principle** — The foundational concept that everything else builds upon. Understanding this gives you the framework to answer any related question.\n\n2. **Second Aspect** — This builds on the first and introduces the practical mechanics of how the system works.\n\n3. **Third Point** — The advanced consideration that often appears in 10-mark questions and distinguishes good answers from excellent ones.\n\n**Example:**\nConsider a real-world scenario: when you book a train ticket online, multiple concepts from this topic are applied simultaneously.\n\n**Exam Tip:**\nIn a 5-mark question, cover points 1 and 2 with one example. For 10 marks, add point 3, a comparison table, and a conclusion paragraph.\n\nWould you like me to generate practice questions on this topic, or explain any specific part in more detail?`,
};

// Module-level message id counter, shared by user and assistant messages
let msgId = 10;

// The greeting that starts every conversation
const initMessages: Message[] = [
  { id: 1, role: 'assistant', content: "Hello! I'm your Study Owl AI academic tutor. I can help you understand difficult topics, explain concepts, generate practice questions, summarize chapters, and prepare structured exam answers.\n\nWhat would you like to study today?" },
];

export default function AIStudy() {
  // The full conversation, oldest first
  const [messages, setMessages] = useState<Message[]>(initMessages);

  // Current textarea contents
  const [input, setInput] = useState('');

  // In-flight flag; renders the typing indicator and blocks the send button
  const [loading, setLoading] = useState(false);

  // Which provider is active; affects only the assistant's avatar
  const [selectedModel, setSelectedModel] = useState('chatgpt');

  // Static conversation history list. Declared without a setter, so the
  // entries never change and the buttons have no click handler
  const [history] = useState([
    { id: 1, title: "DBMS — Normalization Explained", date: "2h ago" },
    { id: 2, title: "CN — OSI vs TCP/IP Model", date: "Yesterday" },
    { id: 3, title: "Algo — Dynamic Programming", date: "Dec 10" },
    { id: 4, title: "SE — SDLC Models Compared", date: "Dec 9" },
  ]);
  // Anchor for auto-scrolling; always kept at the end of the message list
  const bottomRef = useRef<HTMLDivElement>(null);

  // Look up the active model's display data, falling back to the first entry
  const selectedModelData = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

  // Scroll to the newest message whenever the conversation grows
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Sends a message: appends the user turn, clears the input, then fakes a
  // 1.2s round-trip before appending the canned assistant reply
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

  // Stars/unstars an assistant message
  const toggleSave = (id: number) => setMessages(m => m.map(msg => msg.id === id ? { ...msg, saved: !msg.saved } : msg));

  return (
    // Three-column full-height shell: history | chat | context.
    // `height: 100%` (not viewport math) so it fills exactly the space left
    // between the TopBar and the AppFooter rendered by AppLayout.
    <div style={{ display: 'flex', height: '100%', minHeight: 0, overflow: 'hidden' }}>
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
        {/* Model picker: one coloured button per provider, green dot = active */}
        <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: `1px solid ${C.border}` }}>
          {AI_MODELS.map(model => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                  backgroundColor: model.id === 'gemini' ? '#fff' : model.color,
                  border: model.id === 'gemini' ? '1px solid rgb(209 209 209)' : 'none',
                cursor: 'pointer',
                color: model.id === 'gemini' ? C.text : '#fff',
                fontWeight: 600,
                fontSize: '13.5px',
                transition: 'background-color 180ms ease, color 180ms ease, border-color 180ms ease, transform 180ms ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {model.icon}
                {model.name}
              </div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80', border: '1px solid rgb(209 209 209)', opacity: selectedModel === model.id ? 1 : 0, transform: selectedModel === model.id ? 'scale(1)' : 'scale(0.65)', transition: 'opacity 180ms ease, transform 180ms ease', pointerEvents: 'none' }} />
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

        {/* Scrollable message list; user turns are right-aligned via row-reverse */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: C.bg }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', gap: '10px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
              {msg.role === 'assistant' ? (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: selectedModelData.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff' }}>
                  {selectedModelData.icon}
                </div>
              ) : (
                <Avatar name="Alex Johnson" size={32} />
              )}
              <div style={{ maxWidth: '72%' }}>
                <div style={{ padding: '14px 16px', borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px', backgroundColor: msg.role === 'user' ? C.indigo : C.surface, color: msg.role === 'user' ? '#fff' : C.text, border: msg.role === 'assistant' ? `1px solid ${C.border}` : 'none', lineHeight: 1.65 }}>
                  {/* `**` prefixed lines are emphasised as headings */}
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
                    <button onClick={() => { }} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', background: 'none', border: `1px solid ${C.border}`, borderRadius: '6px', fontSize: '11.5px', color: C.text3, cursor: 'pointer' }}>
                      <IconRefresh size={11} /> Regenerate
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: selectedModelData.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff' }}>
                {selectedModelData.icon}
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
            // Quick-action shortcut; sends its own label as the prompt
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
