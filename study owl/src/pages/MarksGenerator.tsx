import { useState } from "react";
import { C, Card, Btn, Textarea, Select, Badge, PageHeader } from "../components/ui";
import { IconZap, IconCopy, IconStar, IconRefresh, IconBook } from "../components/Icons";

/**
 * Page: Marks Generator (/app/marks-generator) — student-only, inside AppLayout.
 * Purpose: Produce a structured, exam-ready answer sized to a chosen mark
 *   value (2/3/5/10). Left panel = inputs, right panel = the generated answer.
 * Data source: NOT a real AI call. `generate` fakes a 1.4s delay, then returns
 *   either a canned answer from `sampleAnswers` (keyed by question -> marks) or
 *   a generic template from `generatePlaceholder`. The Save/Simplify/Expand
 *   buttons are visual only.
 */

// Answer-length options, each with a hint about the expected depth
const marksLevels = [
  { value: '2', label: '2 Marks', desc: 'Short definition/concept' },
  { value: '3', label: '3 Marks', desc: 'Brief explanation with example' },
  { value: '5', label: '5 Marks', desc: 'Detailed explanation with diagram/table' },
  { value: '10', label: '10 Marks', desc: 'Full essay-type answer with examples' },
];

// Canned answers: sampleAnswers[question][marks] -> answer text
const sampleAnswers: Record<string, Record<string, string>> = {
  'Explain ACID properties in database transactions.': {
    '2': `**ACID Properties:**\nACID stands for Atomicity, Consistency, Isolation, and Durability — four properties that guarantee reliable database transactions.`,
    '5': `**ACID Properties of Database Transactions**\n\n**Definition:** ACID is a set of properties that ensure reliable processing of database transactions.\n\n**1. Atomicity:** A transaction is treated as a single unit — either all operations complete or none do. (e.g., in a bank transfer, both debit and credit must succeed.)\n\n**2. Consistency:** A transaction must bring the database from one valid state to another valid state, maintaining all integrity constraints.\n\n**3. Isolation:** Concurrent transactions execute as if they were serial — intermediate results are invisible to other transactions.\n\n**4. Durability:** Once a transaction is committed, its effects persist permanently even in the event of system failure (ensured via write-ahead logging).\n\n**Conclusion:** ACID properties are fundamental to ensuring data correctness and reliability in database systems.`,
    '10': `**ACID Properties — A Comprehensive Study**\n\n**Introduction:**\nACID is an acronym representing four critical properties of database transactions: Atomicity, Consistency, Isolation, and Durability. These properties are essential for maintaining data integrity and reliability in database management systems.\n\n**1. Atomicity:**\nAtomicity means a transaction is an indivisible unit of work. Either all operations within the transaction are executed completely, or none are executed at all.\n- Example: Transferring ₹500 from Account A to Account B involves two operations: debiting A and crediting B. If the system crashes after debiting A, the transaction must be rolled back.\n- Implemented via undo logs and rollback mechanisms.\n\n**2. Consistency:**\nA transaction must transform the database from one consistent state to another consistent state, ensuring all integrity constraints, rules, and triggers remain satisfied.\n- Example: If a foreign key constraint requires that every order must have a valid customer, a transaction cannot insert an order with an invalid customer ID.\n\n**3. Isolation:**\nConcurrently executing transactions must produce the same result as if they were executed serially. Isolation prevents one transaction from reading uncommitted or intermediate results of another.\n- Isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable.\n- Implemented via locking protocols and MVCC.\n\n**4. Durability:**\nOnce a transaction is committed, its changes are permanent and survive system failures, crashes, or power loss.\n- Implemented via write-ahead logging (WAL) and checkpointing.\n\n**Importance of ACID:**\nWithout ACID properties, databases would be vulnerable to data corruption, inconsistency, and loss. They are the foundation of reliable DBMS design.\n\n**Conclusion:**\nACID properties collectively ensure that database transactions are processed reliably, making them fundamental to the design of any production-grade database system.`,
  },
};

// Subject dropdown options
const subjects = ['DBMS', 'Algorithms', 'Computer Networks', 'Software Engineering', 'Numerical Methods', 'Compiler Design', 'Other'].map(s => ({ value: s, label: s }));

export default function MarksGenerator() {
  // The question the user wants answered
  const [question, setQuestion] = useState('');

  // Subject context (currently only shown as a badge on the result)
  const [subject, setSubject] = useState('DBMS');

  // Selected answer length as a string; also the key into sampleAnswers
  const [marks, setMarks] = useState('5');

  // The generated answer text, or '' before the first generation
  const [answer, setAnswer] = useState('');

  // In-flight flag driving the loading spinner and the "Generating…" copy
  const [generating, setGenerating] = useState(false);

  // Transient "Copied!" confirmation flag
  const [copied, setCopied] = useState(false);

  // Star/save toggle on the result header
  const [saved, setSaved] = useState(false);

  // Fakes the generation round-trip: clears any old answer, waits 1.4s, then
  // looks up a canned answer and falls back to the generic template
  const generate = () => {
    if (!question.trim()) return;
    setGenerating(true);
    setAnswer('');
    setTimeout(() => {
      const q = Object.keys(sampleAnswers)[0];
      const result = sampleAnswers[q]?.[marks] || generatePlaceholder(question, marks);
      setAnswer(result);
      setGenerating(false);
    }, 1400);
  };

  // Copies the answer to the clipboard and shows "Copied!" for 2 seconds
  const copy = () => { navigator.clipboard.writeText(answer); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    // Page container: 1100px max width (responsive padding via .page)
    <div className="page" style={{ maxWidth: '1100px' }}>
      {/* Page title + subtitle */}
      <PageHeader title="Marks-Based Answer Generator" sub="Get structured, exam-ready answers tailored to the marks allocated" />

      {/* Two-column layout: 360px input panel, flexible output panel.
          Stacks to one column on tablet and phone. */}
      <div className="cols-input-first">
        {/* Input panel */}
        <Card>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: C.navy, marginBottom: '20px' }}>Generate Answer</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Textarea label="Question" placeholder="e.g., Explain ACID properties in database transactions." value={question} onChange={e => setQuestion(e.target.value)} style={{ minHeight: '100px' }} />
            <Select label="Subject / Topic" options={subjects} value={subject} onChange={e => setSubject(e.target.value)} />

            {/* Answer-length picker: one clickable tile per mark value */}
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: C.text, marginBottom: '8px' }}>Answer Length (Marks)</p>
              <div className="tile-4">
                {marksLevels.map(m => (
                  <button key={m.value} onClick={() => setMarks(m.value)} style={{ padding: '10px 4px', border: `1.5px solid ${marks === m.value ? C.indigo : C.border}`, borderRadius: '10px', backgroundColor: marks === m.value ? C.indigoLight : C.surface, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: marks === m.value ? C.indigo : C.text }}>{m.label}</p>
                    <p style={{ fontSize: '10px', color: C.text3, marginTop: '2px', lineHeight: 1.3 }}>{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <Btn fullWidth icon={<IconZap size={14} />} onClick={generate} loading={generating} disabled={!question.trim()}>
              {generating ? 'Generating…' : 'Generate Answer'}
            </Btn>
          </div>

          {/* Suggestions */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${C.border}` }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Try These Questions</p>
            {['Explain ACID properties in database transactions.', 'What is normalization? Explain 1NF, 2NF, and 3NF.', 'Describe Dijkstra\'s shortest path algorithm.'].map(q => (
              <button key={q} onClick={() => setQuestion(q)} style={{ width: '100%', textAlign: 'left', padding: '8px 10px', fontSize: '12.5px', color: C.text2, background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px', lineHeight: 1.5 }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface2}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                {q}
              </button>
            ))}
          </div>
        </Card>

        {/* Output column: switches between empty, loading, and result states */}
        <div>
          {/* Empty state — shown before anything has been generated */}
          {!answer && !generating && (
            <Card style={{ textAlign: 'center', padding: '60px 32px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: C.indigoLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: C.indigo }}>
                <IconZap size={26} />
              </div>
              <p style={{ fontSize: '16px', fontWeight: 600, color: C.navy, marginBottom: '8px' }}>Generate your first answer</p>
              <p style={{ fontSize: '14px', color: C.text2, maxWidth: '300px', margin: '0 auto', lineHeight: 1.6 }}>Enter a question, select the marks, and get a structured exam-ready answer instantly.</p>
            </Card>
          )}

          {/* Loading state — spinner + inline keyframes for the rotation */}
          {generating && (
            <Card style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${C.indigoLight}`, borderTopColor: C.indigo, animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <p style={{ fontSize: '15px', fontWeight: 600, color: C.navy }}>Generating {marks}-mark answer…</p>
              <p style={{ fontSize: '13px', color: C.text2, marginTop: '6px' }}>Structuring a complete, exam-ready response.</p>
            </Card>
          )}

          {/* Result: badge row + actions, rendered answer body, and follow-up actions */}
          {answer && !generating && (
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Badge variant="navy">{marks} Marks</Badge>
                  <Badge variant="default">{subject}</Badge>
                  <Badge variant="purple">AI Generated</Badge>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <Btn size="xs" variant="ghost" icon={<IconCopy size={13} />} onClick={copy}>{copied ? 'Copied!' : 'Copy'}</Btn>
                  <Btn size="xs" variant={saved ? 'primary' : 'ghost'} icon={<IconStar size={13} />} onClick={() => setSaved(s => !s)}>{saved ? 'Saved' : 'Save'}</Btn>
                  <Btn size="xs" variant="secondary" icon={<IconRefresh size={13} />} onClick={generate}>Regenerate</Btn>
                </div>
              </div>

              {/* Answer body: `**` prefixed lines are rendered as bold headings */}
              <div style={{ backgroundColor: C.surface2, borderRadius: '12px', padding: '20px', fontFamily: 'inherit' }}>
                {answer.split('\n').map((line, i) => (
                  <p key={i} style={{
                    fontSize: line.startsWith('**') ? '14px' : '13.5px',
                    fontWeight: line.startsWith('**') ? 700 : 400,
                    color: line.startsWith('**') ? C.navy : C.text,
                    lineHeight: 1.7,
                    marginBottom: line === '' ? '12px' : '4px',
                  }}>
                    {line.replace(/\*\*/g, '')}
                  </p>
                ))}
              </div>

              {/* Follow-up actions; none of these are wired up yet */}
              <div className="actions-row" style={{ marginTop: '16px' }}>
                <Btn variant="secondary" size="sm">Simplify</Btn>
                <Btn variant="secondary" size="sm">Expand</Btn>
                <Btn variant="secondary" size="sm" icon={<IconBook size={13} />} style={{ marginLeft: 'auto' }}>Add Examples</Btn>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Fallback answer builder for questions with no canned entry.
 * Produces the same `**heading**` markdown shape as the canned answers so the
 * renderer above can display both identically.
 */
function generatePlaceholder(q: string, marks: string) {
  return `**Answer (${marks} Marks)**\n\n**Introduction:**\n${q.replace('?', '.')} This is a fundamental concept in the subject.\n\n**Key Points:**\n1. First important aspect of the topic with clear explanation.\n2. Second key point supported by relevant example or diagram reference.\n3. Third aspect covering the practical application.\n\n**Conclusion:**\nIn summary, this topic is important because it forms the basis for understanding related concepts in the curriculum.`;
}
