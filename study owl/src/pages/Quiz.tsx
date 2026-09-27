import { useState } from "react";
import { C, Card, Btn, Badge, ProgressBar, Select, PageHeader } from "../components/ui";
import { IconCheck, IconX, IconChevronRight, IconChevronLeft, IconAward, IconTrendingUp, IconRefresh } from "../components/Icons";

/**
 * Page: Quiz (/app/quiz) — student-only, inside AppLayout.
 * Purpose: A three-state MCQ flow — 'setup' (configure) -> 'quiz' (answer)
 *   -> 'results' (score + full question review). The state machine is the
 *   `screen` variable; each branch returns early with its own layout.
 * Data source: the single hard-coded `quizData` (5 DBMS questions). The
 *   question-count and difficulty selectors are non-functional, and `time`
 *   is a fixed 15-minute value that is never counted down.
 * Note: answers can still be changed by navigating back before submitting,
 *   because the review only locks once `submitted` is true.
 */

// The only question set; `answer` is the index into `options`
const quizData = {
  subject: "Database Management Systems",
  questions: [
    { q: "Which normal form eliminates transitive dependencies?", options: ["1NF", "2NF", "3NF", "BCNF"], answer: 2 },
    { q: "What does ACID stand for in database transactions?", options: ["Atomicity, Consistency, Isolation, Durability", "Availability, Consistency, Integrity, Durability", "Atomicity, Concurrency, Isolation, Dependency", "Availability, Consistency, Isolation, Distribution"], answer: 0 },
    { q: "Which SQL clause is used to filter grouped results?", options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], answer: 1 },
    { q: "A foreign key in a table refers to:", options: ["A primary key in the same table", "A primary key in another table", "An index in the same table", "A unique key in another table"], answer: 1 },
    { q: "In the ER model, a diamond shape represents:", options: ["Entity", "Attribute", "Relationship", "Primary Key"], answer: 2 },
  ],
};

// The three mutually exclusive views this page can be in
type Screen = 'setup' | 'quiz' | 'results';

export default function Quiz() {
  // Which of the three screens is showing
  const [screen, setScreen] = useState<Screen>('setup');

  // Chosen subject; only surfaced as a badge, the question set is fixed
  const [subject, setSubject] = useState('DBMS');

  // Index of the question currently on screen
  const [current, setCurrent] = useState(0);

  // Chosen option index per question; null means unanswered
  const [selected, setSelected] = useState<(number | null)[]>(Array(quizData.questions.length).fill(null));

  // Locked once the quiz is submitted; blocks further answer changes
  const [submitted, setSubmitted] = useState(false);

  // Time limit in seconds. Set once with no setter, so no countdown runs
  const [time] = useState(15 * 60); // 15 min in seconds

  // Derived score: number of questions whose selection matches the answer key
  const score = selected.filter((s, i) => s === quizData.questions[i].answer).length;

  // Score as a percentage, used for the grade band
  const pct = Math.round((score / quizData.questions.length) * 100);

  // The active question, dereferenced for the quiz screen
  const q = quizData.questions[current];

  // Records an answer for the current question; ignored after submitting
  const selectOption = (i: number) => { if (submitted) return; setSelected(s => { const n = [...s]; n[current] = i; return n; }); };

  // Advances, or submits when on the final question
  const next = () => { if (current < quizData.questions.length - 1) setCurrent(c => c + 1); else setSubmitted(true); };

  // Steps back one question
  const prev = () => { if (current > 0) setCurrent(c => c - 1); };

  // Submits early and jumps straight to the results screen
  const finish = () => { setSubmitted(true); setScreen('results'); };

  // Resets every piece of quiz state and returns to the setup screen
  const restart = () => { setScreen('setup'); setCurrent(0); setSelected(Array(quizData.questions.length).fill(null)); setSubmitted(false); };

  // Dropdown options for the setup screen
  const subjects = ['DBMS', 'Algorithms', 'Computer Networks', 'Software Engineering'].map(s => ({ value: s, label: s }));
  const counts = [5, 10, 15, 20].map(n => ({ value: String(n), label: `${n} Questions` }));

  // Setup screen: subject, question count, difficulty, and quiz facts
  if (screen === 'setup') return (
    <div style={{ padding: '28px 32px', maxWidth: '700px', margin: '0 auto' }}>
      <PageHeader title="Start a Quiz" sub="Test your knowledge with subject-specific questions" />
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Select label="Subject" options={subjects} value={subject} onChange={e => setSubject(e.target.value)} />
          <Select label="Number of Questions" options={counts} value="5" onChange={() => {}} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: C.text, marginBottom: '8px' }}>Difficulty</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Easy', 'Medium', 'Hard', 'Mixed'].map(d => (
                <button key={d} onClick={() => {}} style={{ padding: '7px 16px', border: `1.5px solid ${d === 'Mixed' ? C.indigo : C.border}`, borderRadius: '8px', backgroundColor: d === 'Mixed' ? C.indigoLight : C.surface, color: d === 'Mixed' ? C.indigo : C.text2, fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{d}</button>
              ))}
            </div>
          </div>
          {/* Quiz facts row: question count, time limit, question type */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, padding: '14px', backgroundColor: C.surface2, borderRadius: '10px', textAlign: 'center' }}>
              <p style={{ fontSize: '20px', fontWeight: 700, color: C.navy }}>5</p>
              <p style={{ fontSize: '12px', color: C.text3 }}>Questions</p>
            </div>
            <div style={{ flex: 1, padding: '14px', backgroundColor: C.surface2, borderRadius: '10px', textAlign: 'center' }}>
              <p style={{ fontSize: '20px', fontWeight: 700, color: C.navy }}>15 min</p>
              <p style={{ fontSize: '12px', color: C.text3 }}>Time Limit</p>
            </div>
            <div style={{ flex: 1, padding: '14px', backgroundColor: C.surface2, borderRadius: '10px', textAlign: 'center' }}>
              <p style={{ fontSize: '20px', fontWeight: 700, color: C.navy }}>MCQ</p>
              <p style={{ fontSize: '12px', color: C.text3 }}>Question Type</p>
            </div>
          </div>
          <Btn fullWidth size="lg" onClick={() => setScreen('quiz')}>Start Quiz</Btn>
        </div>
      </Card>
    </div>
  );

  // Results screen: grade summary plus a full question-by-question review
  if (screen === 'results') {
    // Verbal grade and its colour, both derived from the percentage
    const grade = pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : pct >= 40 ? 'Fair' : 'Needs Work';
    const gradeColor = pct >= 80 ? C.success : pct >= 60 ? C.indigo : pct >= 40 ? C.warning : C.error;
    return (
      <div style={{ padding: '28px 32px', maxWidth: '700px', margin: '0 auto' }}>
        {/* Score summary card: award icon, grade, percentage, progress bar */}
        <Card style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: gradeColor + '15', border: `3px solid ${gradeColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <IconAward size={36} color={gradeColor} />
          </div>
          <h2 style={{ fontFamily: "'Merriweather', serif", fontSize: '24px', fontWeight: 700, color: C.navy, marginBottom: '8px' }}>{grade}!</h2>
          <p style={{ fontSize: '48px', fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{pct}%</p>
          <p style={{ fontSize: '14px', color: C.text2, marginTop: '6px' }}>{score} out of {quizData.questions.length} correct</p>
          <ProgressBar value={pct} color={gradeColor} style={{ margin: '20px 0 16px' }} />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Btn variant="secondary" icon={<IconRefresh size={14} />} onClick={restart}>Retake Quiz</Btn>
            <Btn>View Study Suggestions</Btn>
          </div>
        </Card>

        {/* Review */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: C.navy }}>Question Review</h3>
          {quizData.questions.map((question, i) => {
            // Correct only counts as correct if it was actually the chosen answer
            const userAns = selected[i];
            const correct = userAns === question.answer;
            return (
              <Card key={i} padding={18}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: correct ? C.successLight : C.errorLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {correct ? <IconCheck size={14} color={C.success} /> : <IconX size={14} color={C.error} />}
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: C.text, lineHeight: 1.5 }}>{question.q}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '34px' }}>
                  {question.options.map((opt, j) => {
                    // Highlight the correct answer always, and the user's wrong pick on top of it
                    const isCorrect = j === question.answer;
                    const isUser = j === userAns;
                    const bg = isCorrect ? C.successLight : (isUser && !isCorrect) ? C.errorLight : 'transparent';
                    const border = isCorrect ? C.success : (isUser && !isCorrect) ? C.error : C.border;
                    return (
                      <div key={j} style={{ padding: '7px 12px', borderRadius: '8px', border: `1.5px solid ${border}`, backgroundColor: bg, fontSize: '13px', color: isCorrect ? C.success : (isUser && !isCorrect) ? C.error : C.text2, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isCorrect && <IconCheck size={13} color={C.success} />}
                        {isUser && !isCorrect && <IconX size={13} color={C.error} />}
                        {opt}
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Quiz screen (the fall-through branch)
  // Count of questions the user has answered, shown as a badge
  const answered = selected.filter(s => s !== null).length;
  return (
    <div style={{ padding: '28px 32px', maxWidth: '700px', margin: '0 auto' }}>
      {/* Progress bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <p style={{ fontSize: '13px', color: C.text2 }}>Question {current + 1} of {quizData.questions.length}</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Badge variant="default">{answered} answered</Badge>
            <Badge variant="navy">{quizData.subject}</Badge>
          </div>
        </div>
        <ProgressBar value={(current + 1) / quizData.questions.length * 100} />
      </div>

      {/* Current question and its options */}
      <Card style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '17px', fontWeight: 600, color: C.navy, lineHeight: 1.5, marginBottom: '24px' }}>{q.q}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {q.options.map((opt, i) => {
            // The radio-style option button for this question
            const isSelected = selected[current] === i;
            return (
              <button key={i} onClick={() => selectOption(i)} style={{ padding: '14px 16px', border: `1.5px solid ${isSelected ? C.indigo : C.border}`, borderRadius: '10px', backgroundColor: isSelected ? C.indigoLight : C.surface, color: isSelected ? C.indigo : C.text, fontSize: '14px', fontWeight: isSelected ? 600 : 400, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.15s' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${isSelected ? C.indigo : C.border}`, backgroundColor: isSelected ? C.indigo : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px', fontWeight: 700, color: isSelected ? '#fff' : C.text3 }}>
                  {String.fromCharCode(65 + i)}
                </div>
                {opt}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <Btn variant="secondary" icon={<IconChevronLeft size={14} />} onClick={prev} disabled={current === 0}>Previous</Btn>
        <div style={{ flex: 1 }} />
        {current < quizData.questions.length - 1 ? (
          <Btn iconRight={<IconChevronRight size={14} />} onClick={next}>Next</Btn>
        ) : (
          <Btn onClick={finish}>Submit Quiz</Btn>
        )}
      </div>

      {/* Question map */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {quizData.questions.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} style={{ width: '36px', height: '36px', borderRadius: '8px', border: `1.5px solid ${i === current ? C.indigo : selected[i] !== null ? C.success : C.border}`, backgroundColor: i === current ? C.indigoLight : selected[i] !== null ? C.successLight : C.surface, color: i === current ? C.indigo : selected[i] !== null ? C.success : C.text3, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
