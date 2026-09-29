import { useState, useRef, useEffect } from "react";
import { C, Card, Btn, Badge, Avatar } from "../components/ui";
import { IconBrain, IconSend, IconCopy, IconStar, IconRefresh, IconPlus, IconFileText, IconSparkles, IconCheck, IconChevronRight, IconMessageCircle, IconDownload, IconTerminal } from "../components/Icons";
import claudeLogo from "../image/clude logo.png";

const ClaudeIcon = ({ size = 18 }) => (
  <img src={claudeLogo} alt="" width={size} height={size} style={{ display: 'block' }} />
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

const labNotebookBlocks = [
  {
    title: 'Create Database :',
    subtitle: 'Initialize the database for student management.',
    code: 'CREATE DATABASE student_mg_table;',
  },
  {
    title: 'Create Tables :',
    subtitle: 'Create the student table and define its columns.',
    code: `USE student_mg_table;\nCREATE TABLE student(\n  student_id INT PRIMARY KEY,\n  student_name VARCHAR(20),\n  department VARCHAR(20),\n  email VARCHAR(20),\n  batch VARCHAR(20)\n);`,
  },
];

// Generated artifacts listed in the Lab Canvas. Mock data — nothing is written
// to disk and the download buttons are display-only, matching the page's other
// non-wired actions (Regenerate, the conversation-history rows). `code` picks
// the Terminal icon instead of the document icon.
const notebookArtifacts = [
  { id: 'marketing', name: 'Bba 2404 marketing...', meta: 'Document • MD', code: false },
  { id: 'bcom', name: 'Bcom 2404 marketing...', meta: 'Document • MD', code: false },
  { id: 'sql', name: 'student_table.sql', meta: 'SQL Code', code: true },
  { id: 'notes', name: 'class_notes.md', meta: 'Document • MD', code: false },
];

// Source documents referenced by the conversation, shown as thumbnails in the
// "Content" grid. Mock data.
const sourceDocuments = [
  { id: 's1', name: 'Bcom 2404 Marketing', format: 'PDF' },
  { id: 's2', name: 'Marketing Class Note', format: 'PDF' },
  { id: 's3', name: 'DBMS Unit 4 Slides', format: 'PDF' },
  { id: 's4', name: 'Normalization Notes', format: 'PDF' },
];

/**
 * Page: AI Study Chat (/app/ai-study) — student-only, inside AppLayout.
 * Purpose: Chat-style AI tutor with a conversation history sidebar, a model
 *   picker, per-message copy/save/regenerate actions, and a context panel.
 * Data source: NOT a real AI call. `send` appends the user's message, waits
 *   1.2s, then always replies with the same canned `aiResponses.default`
 *   text regardless of the question or the selected model. Choosing a model
 *   only changes the avatar colour/icon, not the response.
 * Layout: a split-pane full-height shell rather than a normal scrolling page.
 *   Three flex children of `.ai-study-panes` — conversation history (23%,
 *   collapsing to 64px), the chat column (flex 47%, expanding to 100% on
 *   mobile), and the Lab Canvas (30%, hidden below 1024px). The shell stretches
 *   to the space between the AppLayout top bar and the app footer, and each
 *   column scrolls on its own. The Lab Canvas holds three stacked sections:
 *   an artifacts list, a grid of referenced sources, and the code blocks.
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);
  // Lab Canvas drawer for < 1024px. Previously the pane was simply hidden on
  // small screens, which made its artifacts unreachable; it is now toggleable.
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);

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

  const copyNotebookCode = async (title: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedBlock(title);
      window.setTimeout(() => setCopiedBlock(current => current === title ? null : current), 1800);
    } catch {
      setCopiedBlock(null);
    }
  };

  return (
    <div className="ai-study-layout">
      <style>{`
        .ai-study-layout { display: flex; flex-direction: column; height: 100%; min-height: 0; overflow: hidden; position: relative; }
        .ai-study-mobile-toolbar { display: none; }
        .ai-study-panes { display: flex; flex: 1; min-width: 0; min-height: 0; overflow: hidden; position: relative; }
        .ai-study-sidebar { display: flex; flex: 0 0 23%; flex-direction: column; height: 100%; max-width: 320px; min-width: 220px; overflow: hidden; background: ${C.surface}; border-right: 1px solid ${C.border}; transition: flex-basis 240ms ease, min-width 240ms ease, transform 240ms ease; z-index: 21; }
        .ai-study-sidebar.is-collapsed { flex-basis: 64px; max-width: 64px; min-width: 64px; }
        .ai-study-chat-pane { display: flex; flex: 1 1 47%; flex-direction: column; min-width: 0; overflow: hidden; }
        .ai-study-notebook-pane { display: flex; flex: 0 0 30%; flex-direction: column; height: 100%; min-height: 0; min-width: 240px; overflow-y: auto; background: #F1F5F9; border-left: 1px solid ${C.border}; }
        .ai-study-notebook-header { position: sticky; top: 0; z-index: 1; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 18px 18px 14px; background: #F1F5F9; border-bottom: 1px solid #D8E0E9; }
        .ai-study-notebook-subheader { margin: 20px 18px 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #64748B; }
        .ai-study-artifact-row { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 18px; background: none; border: 0; border-bottom: 1px solid #E2E8F0; text-align: left; cursor: pointer; transition: background 140ms ease; }
        .ai-study-artifact-row:hover { background: #F8FAFC; }
        .ai-study-source-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; padding: 0 18px; }
        .ai-study-source-preview { height: 64px; display: flex; flex-direction: column; gap: 5px; padding: 9px 10px; background: #E2E8F0; }
        .ai-study-sidebar-backdrop { display: none; }
        @media (max-width: 1023px) {
          .ai-study-mobile-toolbar { display: flex; align-items: center; flex: 0 0 44px; gap: 8px; padding: 0 12px; background: ${C.surface}; border-bottom: 1px solid ${C.border}; }
          .ai-study-panes { overflow: hidden; }
          .ai-study-sidebar, .ai-study-sidebar.is-collapsed { position: absolute; top: 0; bottom: 0; left: 0; width: min(320px, 85vw); max-width: none; min-width: 0; flex: none; transform: translateX(-105%); box-shadow: none; }
          .ai-study-sidebar.is-open { transform: translateX(0); box-shadow: var(--sh-3); }
          .ai-study-notebook-pane { position: absolute; top: 0; bottom: 0; right: 0; z-index: 22; display: flex; width: min(340px, 88vw); max-width: none; min-width: 0; flex: none; transform: translateX(100%); transition: transform 240ms ease; box-shadow: none; }
          .ai-study-notebook-pane.is-open { transform: translateX(0); box-shadow: var(--sh-3); }
          .ai-study-chat-pane { flex: 1 1 100%; width: 100%; }
          .ai-study-sidebar-backdrop, .ai-study-notebook-backdrop { position: absolute; inset: 0; display: block; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.25); border: 0; z-index: 20; }
        }
        /* Tablet (768-1023px): the conversation rail stays inline as a
           structural column; only the Lab Canvas becomes a drawer. Declared
           after the 1023px block so it wins on equal specificity. */
        @media (min-width: 768px) and (max-width: 1023px) {
          .ai-study-sidebar { position: relative; top: 0; bottom: auto; left: auto; width: 240px; max-width: 240px; min-width: 0; flex: 0 0 240px; transform: none; box-shadow: none; }
          .ai-study-sidebar.is-collapsed { width: 64px; max-width: 64px; flex: 0 0 64px; }
        }
      `}</style>
      <div className="ai-study-mobile-toolbar">
        <button type="button" onClick={() => setIsSidebarOpen(open => !open)} aria-expanded={isSidebarOpen} aria-label={isSidebarOpen ? 'Close conversation menu' : 'Open conversation menu'} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', background: 'none', border: 'none', color: C.text2, cursor: 'pointer' }}>
          <IconChevronRight size={16} style={{ transform: isSidebarOpen ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease' }} />
          Conversations
        </button>
        <button
          type="button"
          onClick={() => setIsNotebookOpen(open => !open)}
          aria-expanded={isNotebookOpen}
          aria-label={isNotebookOpen ? 'Close Lab Canvas' : 'Open Lab Canvas'}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', padding: '6px 8px', background: 'none', border: 'none', color: isNotebookOpen ? C.indigo : C.text2, cursor: 'pointer' }}
        >
          <IconFileText size={16} />
          Lab Canvas
        </button>
      </div>
      <div className="ai-study-panes">
        {isSidebarOpen && <button type="button" className="ai-study-sidebar-backdrop" aria-label="Close conversation menu" onClick={() => setIsSidebarOpen(false)} />}
        {isNotebookOpen && <button type="button" className="ai-study-notebook-backdrop" aria-label="Close Lab Canvas" onClick={() => setIsNotebookOpen(false)} />}
        <aside className={`ai-study-sidebar ${isSidebarOpen ? 'is-open' : 'is-collapsed'}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center', minHeight: '56px', padding: isSidebarOpen ? '12px 16px' : '12px 6px', borderBottom: `1px solid ${C.border}` }}>
            {isSidebarOpen && <span style={{ fontSize: '14px', fontWeight: 700, color: C.navy, whiteSpace: 'nowrap' }}>Study Owl AI</span>}
            <button type="button" onClick={() => setIsSidebarOpen(open => !open)} aria-expanded={isSidebarOpen} aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'} title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', border: 'none', borderRadius: '8px', background: 'transparent', color: C.text2, cursor: 'pointer', flexShrink: 0 }}>
              <IconChevronRight size={16} style={{ transform: isSidebarOpen ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease' }} />
            </button>
          </div>
          <div style={{ padding: isSidebarOpen ? '12px' : '12px 6px' }}>
            <Btn fullWidth size="sm" variant="secondary" icon={<IconPlus size={14} />} onClick={() => setMessages(initMessages)}>
              {isSidebarOpen && 'New Conversation'}
            </Btn>
          </div>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: isSidebarOpen ? '8px' : '8px 4px' }}>
            {isSidebarOpen && <p style={{ fontSize: '11px', fontWeight: 600, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 8px 6px' }}>Recent</p>}
            {history.map(h => (
              <button key={h.id} title={h.title} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', padding: '9px 10px', borderRadius: 'var(--r-md)', background: 'none', border: 'none', cursor: 'pointer', color: C.text2, transition: 'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface2}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <IconMessageCircle size={16} />
                {isSidebarOpen && <span style={{ minWidth: 0 }}><span style={{ display: 'block', fontSize: '13.5px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</span><span style={{ display: 'block', fontSize: '11px', color: C.text3, marginTop: '2px' }}>{h.date}</span></span>}
              </button>
            ))}
          </div>
          <div style={{ padding: isSidebarOpen ? '16px 12px' : '12px 6px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: `1px solid ${C.border}` }}>
            {AI_MODELS.map(model => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                title={model.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isSidebarOpen ? 'space-between' : 'center',
                  position: 'relative',
                  padding: isSidebarOpen ? '10px 14px' : '10px',
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
                  {isSidebarOpen && model.name}
                </div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80', border: '1px solid rgb(209 209 209)', opacity: selectedModel === model.id ? 1 : 0, transform: selectedModel === model.id ? 'scale(1)' : 'scale(0.65)', transition: 'opacity 180ms ease, transform 180ms ease', pointerEvents: 'none', position: isSidebarOpen ? 'static' : 'absolute', top: '5px', right: '5px' }} />
              </button>
            ))}
          </div>
        </aside>

        {/* Center: Chat */}
        <div className="ai-study-chat-pane" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '12px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: C.surface }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: C.indigoLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.indigo }}>
              <IconBrain size={17} />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: C.navy }}>AI Study Assistant</p>
              <p style={{ fontSize: '12px', color: C.text3 }}>Academic tutor · DBMS, Algorithms, CN and more</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
              <Badge variant="success">Online</Badge>
            </div>
          </div>

          {/* Scrollable message list; user turns are right-aligned via row-reverse */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: C.bg }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', gap: '10px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                {msg.role === 'assistant' ? (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: selectedModelData.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff' }}>
                    {selectedModelData.icon}
                  </div>
                ) : (
                  <Avatar name="Alex Johnson" size={32} />
                )}
                <div style={{ maxWidth: 'min(72%, 640px)' }}>
                  <div style={{ padding: '14px 16px', borderRadius: msg.role === 'user' ? 'var(--r-3xl) var(--r-xs) var(--r-3xl) var(--r-3xl)' : 'var(--r-xs) var(--r-3xl) var(--r-3xl) var(--r-3xl)', backgroundColor: msg.role === 'user' ? C.indigo : C.surface, color: msg.role === 'user' ? '#fff' : C.text, border: msg.role === 'assistant' ? `1px solid ${C.border}` : 'none', lineHeight: 1.65 }}>
                    {/* `**` prefixed lines are emphasised as headings */}
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i} style={{ fontSize: '13.5px', fontWeight: line.startsWith('**') ? 600 : 400, color: msg.role === 'user' ? '#fff' : (line.startsWith('**') ? C.navy : C.text), marginBottom: line === '' ? '8px' : '2px' }}>
                        {line.replace(/\*\*/g, '')}
                      </p>
                    ))}
                  </div>
                  {msg.role === 'assistant' && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                      <button onClick={() => { navigator.clipboard.writeText(msg.content); }} aria-label="Copy message" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 9px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 'var(--r-sm)', fontSize: '11.5px', color: C.text3, cursor: 'pointer', transition: 'background 0.12s, color 0.12s' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.surface2; e.currentTarget.style.color = C.text2; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.text3; }}>
                        <IconCopy size={11} /> Copy
                      </button>
                      <button onClick={() => toggleSave(msg.id)} aria-label={msg.saved ? 'Remove from saved' : 'Save message'} aria-pressed={!!msg.saved} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 9px', background: 'none', border: `1px solid ${msg.saved ? C.indigo : C.border}`, borderRadius: 'var(--r-sm)', fontSize: '11.5px', color: msg.saved ? C.indigo : C.text3, cursor: 'pointer', transition: 'background 0.12s, color 0.12s' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.indigoLight; if (!msg.saved) e.currentTarget.style.color = C.text2; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = msg.saved ? C.indigo : C.text3; }}>
                        <IconStar size={11} /> {msg.saved ? 'Saved' : 'Save'}
                      </button>
                      <button onClick={() => { }} aria-label="Regenerate response" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 9px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 'var(--r-sm)', fontSize: '11.5px', color: C.text3, cursor: 'pointer', transition: 'background 0.12s, color 0.12s' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.surface2; e.currentTarget.style.color = C.text2; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.text3; }}>
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
                <button key={s} onClick={() => send(s)} style={{ padding: '7px 14px', backgroundColor: C.surface2, border: `1px solid ${C.border}`, borderRadius: 'var(--r-pill)', fontSize: '12px', color: C.text2, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'background 0.12s, color 0.12s, border-color 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.indigoLight; e.currentTarget.style.color = C.indigo; e.currentTarget.style.borderColor = C.indigo; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.surface2; e.currentTarget.style.color = C.text2; e.currentTarget.style.borderColor = C.border; }}>
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
                  rows={3}
                  aria-label="Message the AI tutor"
                  style={{ width: '100%', padding: '12px 14px', fontSize: '14px', borderRadius: 'var(--r-xl)', border: `1.5px solid ${C.border}`, outline: 'none', resize: 'none', fontFamily: 'inherit', color: C.text, lineHeight: 1.5, transition: 'border-color 0.15s' }}
                  onFocus={e => e.target.style.borderColor = C.indigo}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>
              <button onClick={() => send()} disabled={!input.trim() || loading} aria-label="Send message" title="Send message" style={{ width: '44px', height: '44px', borderRadius: 'var(--r-xl)', backgroundColor: C.indigo, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: !input.trim() || loading ? 'not-allowed' : 'pointer', opacity: !input.trim() || loading ? 0.45 : 1, flexShrink: 0, transition: 'background 0.15s, opacity 0.15s' }}
                onMouseEnter={e => { if (input.trim() && !loading) e.currentTarget.style.backgroundColor = C.indigoHover; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.indigo; }}>
                <IconSend size={17} color="#fff" />
              </button>
            </div>
            <p style={{ fontSize: '11px', color: C.text3, marginTop: '6px' }}>Study Owl AI · Answers are AI-generated for academic study purposes.</p>
          </div>
        </div>

        {/* Right: Lab Canvas — artifacts, referenced content, and code blocks */}
        <aside className={`ai-study-notebook-pane${isNotebookOpen ? ' is-open' : ''}`} aria-label="Lab Canvas">
          {/* Sticky actions header */}
          <div className="ai-study-notebook-header">
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>DBMS · 6th Semester</p>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B' }}>Artifacts</h2>
            </div>
            <button
              type="button"
              title="Download all artifacts"
              aria-label="Download all artifacts"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, padding: '6px 10px', background: '#FFFFFF', border: '1px solid #D8E0E9', borderRadius: '8px', color: '#475569', fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'background 140ms ease, color 140ms ease' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.color = '#1E293B'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.color = '#475569'; }}
            >
              <IconDownload size={14} />Download all
            </button>
          </div>

          {/* Generated artifacts */}
          {notebookArtifacts.map(artifact => (
            <div key={artifact.id} className="ai-study-artifact-row">
              <span style={{ display: 'flex', flexShrink: 0, color: artifact.code ? '#4F46E5' : '#64748B' }}>
                {artifact.code ? <IconTerminal size={17} /> : <IconFileText size={17} />}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{artifact.name}</span>
                <span style={{ display: 'block', fontSize: '11px', color: '#94A3B8', marginTop: '1px' }}>{artifact.meta}</span>
              </span>
              <button
                type="button"
                title={`Download ${artifact.name}`}
                aria-label={`Download ${artifact.name}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: '26px', height: '26px', border: 'none', borderRadius: '6px', background: 'transparent', color: '#64748B', cursor: 'pointer', transition: 'background 140ms ease, color 140ms ease' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#E2E8F0'; e.currentTarget.style.color = '#1E293B'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748B'; }}
              >
                <IconDownload size={14} />
              </button>
            </div>
          ))}

          {/* Referenced content sources */}
          <p className="ai-study-notebook-subheader">Content</p>
          <div className="ai-study-source-grid">
            {sourceDocuments.map(source => (
              <div key={source.id} style={{ border: '1px solid #D8E0E9', borderRadius: '8px', overflow: 'hidden', background: '#FFFFFF' }}>
                {/* Light-grey page-layout placeholder */}
                <div className="ai-study-source-preview">
                  <span style={{ width: '70%', height: '5px', borderRadius: '2px', background: '#CBD5E1' }} />
                  <span style={{ width: '100%', height: '4px', borderRadius: '2px', background: '#CBD5E1' }} />
                  <span style={{ width: '85%', height: '4px', borderRadius: '2px', background: '#CBD5E1' }} />
                  <span style={{ width: '45%', height: '4px', borderRadius: '2px', background: '#CBD5E1' }} />
                </div>
                <div style={{ borderTop: '1px solid #E2E8F0', padding: '7px 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ padding: '2px 6px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '4px', fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.04em', color: '#64748B' }}>{source.format}</span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: '11px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{source.name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Code blocks */}
          <p className="ai-study-notebook-subheader">Lab Notebook</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 18px 18px' }}>
            {labNotebookBlocks.map(block => (
              <section key={block.title}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '5px' }}>{block.title}</h3>
                <p style={{ fontSize: '12px', lineHeight: 1.5, color: '#64748B', marginBottom: '10px' }}>{block.subtitle}</p>
                <div style={{ overflow: 'hidden', border: '1px solid #D8E0E9', borderRadius: '8px', background: '#eef2f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 8px 0' }}>
                    <button type="button" onClick={() => copyNotebookCode(block.title, block.code)} aria-label={`Copy ${block.title} code`} title={copiedBlock === block.title ? 'Copied' : 'Copy code'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', border: 'none', borderRadius: '6px', background: 'transparent', color: copiedBlock === block.title ? '#15803D' : '#64748B', cursor: 'pointer' }}>
                      {copiedBlock === block.title ? <IconCheck size={15} /> : <IconCopy size={15} />}
                    </button>
                  </div>
                  <pre style={{ overflowX: 'auto', padding: '4px 12px 12px', margin: 0, color: '#1E293B', fontFamily: 'var(--font-mono)', fontSize: '11.5px', lineHeight: 1.6, whiteSpace: 'pre' }}><code>{block.code}</code></pre>
                </div>
              </section>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
