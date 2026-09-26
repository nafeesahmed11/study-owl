import { C, Card, StatCard, PageHeader, ProgressBar, Badge } from "../components/ui";
import { IconBarChart, IconCheck, IconBook, IconTrendingUp, IconBrain, IconCalendar, IconAward } from "../components/Icons";

const weekData = [40, 65, 30, 80, 55, 70, 45]; // minutes per day
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const subjectProgress = [
  { name: "Software Engineering", code: "CSE-404", progress: 83, quizAvg: 86, color: "#DC2626" },
  { name: "Database Management", code: "CSE-401", progress: 72, quizAvg: 74, color: "#4F46E5" },
  { name: "Algorithms", code: "CSE-402", progress: 58, quizAvg: 62, color: "#059669" },
  { name: "Compiler Design", code: "CSE-406", progress: 61, quizAvg: 58, color: "#0EA5E9" },
  { name: "Computer Networks", code: "CSE-403", progress: 45, quizAvg: 50, color: "#D97706" },
  { name: "Numerical Methods", code: "CSE-405", progress: 34, quizAvg: 40, color: "#7C3AED" },
];

const quizHistory = [
  { date: "Dec 11", subject: "DBMS", score: 80, total: 5 },
  { date: "Dec 10", subject: "Algorithms", score: 60, total: 5 },
  { date: "Dec 9", subject: "CN", score: 70, total: 5 },
  { date: "Dec 7", subject: "SE", score: 90, total: 5 },
  { date: "Dec 5", subject: "DBMS", score: 75, total: 5 },
];

const insights = [
  { text: "DBMS received the most study time this week — 3.5 hours total.", type: "positive" },
  { text: "Computer Networks has had no study sessions in 4 days.", type: "warning" },
  { text: "Your quiz accuracy improved 8% compared to last week.", type: "positive" },
  { text: "Numerical Methods is your weakest subject by quiz score.", type: "warning" },
];

const maxMin = Math.max(...weekData);

export default function Progress() {
  const totalMin = weekData.reduce((a, b) => a + b, 0);
  const avgScore = Math.round(quizHistory.reduce((a, q) => a + (q.score / q.total * 100), 0) / quizHistory.length);

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1200px' }}>
      <PageHeader title="Academic Progress" sub="Track your study activity, quiz performance, and learning consistency" />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatCard icon={<IconCalendar size={20} />} label="Study Streak" value="12 days" sub="Personal best: 18" />
        <StatCard icon={<IconBarChart size={20} />} label="This Week" value={`${Math.round(totalMin / 60)}h ${totalMin % 60}m`} sub="+22% vs last week" />
        <StatCard icon={<IconCheck size={20} />} label="Tasks Completed" value="18" sub="5 remaining" />
        <StatCard icon={<IconAward size={20} />} label="Quiz Average" value={`${avgScore}%`} sub="Last 5 quizzes" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', marginBottom: '24px' }}>
        {/* Weekly study chart */}
        <Card>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.navy, marginBottom: '20px' }}>Weekly Study Activity</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '120px' }}>
            {weekData.map((min, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: C.text3 }}>{min}m</span>
                <div style={{ width: '100%', backgroundColor: C.indigoLight, borderRadius: '6px 6px 0 0', height: `${(min / maxMin) * 100}px`, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: i === 4 ? C.success : C.indigo, borderRadius: '6px 6px 0 0', height: '100%', opacity: i === new Date().getDay() - 1 ? 1 : 0.65 }} />
                </div>
                <span style={{ fontSize: '11px', color: C.text3 }}>{days[i]}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: '24px' }}>
            {[{ label: 'Total this week', value: `${Math.round(totalMin / 60)}h ${totalMin % 60}m` }, { label: 'Daily average', value: `${Math.round(totalMin / 7)}m` }, { label: 'Best day', value: 'Thursday' }].map(s => (
              <div key={s.label}>
                <p style={{ fontSize: '15px', fontWeight: 700, color: C.navy }}>{s.value}</p>
                <p style={{ fontSize: '12px', color: C.text3 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Insights */}
        <Card style={{ backgroundColor: '#F8F7FF', border: '1px solid #E4E2FF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <IconBrain size={17} color={C.indigo} />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.navy }}>AI Study Insights</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {insights.map((ins, i) => (
              <div key={i} style={{ padding: '12px', backgroundColor: C.surface, border: `1px solid ${ins.type === 'warning' ? C.warning + '40' : C.success + '40'}`, borderLeft: `3px solid ${ins.type === 'warning' ? C.warning : C.success}`, borderRadius: '8px' }}>
                <p style={{ fontSize: '13px', color: C.text, lineHeight: 1.5 }}>{ins.text}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Subject Progress */}
      <Card style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.navy, marginBottom: '20px' }}>Subject Progress</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {subjectProgress.map((s, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div>
                  <p style={{ fontSize: '13.5px', fontWeight: 600, color: C.text }}>{s.name}</p>
                  <p style={{ fontSize: '11.5px', color: C.text3 }}>Quiz avg: {s.quizAvg}%</p>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: s.color }}>{s.progress}%</span>
              </div>
              <ProgressBar value={s.progress} color={s.color} />
            </div>
          ))}
        </div>
      </Card>

      {/* Quiz History */}
      <Card>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.navy, marginBottom: '16px' }}>Recent Quiz Results</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {quizHistory.map((q, i) => {
            const pct = Math.round(q.score / q.total * 100);
            const color = pct >= 80 ? C.success : pct >= 60 ? C.indigo : pct >= 40 ? C.warning : C.error;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', backgroundColor: C.surface2, borderRadius: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `2.5px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color, flexShrink: 0 }}>{pct}%</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13.5px', fontWeight: 600, color: C.text }}>{q.subject}</p>
                  <p style={{ fontSize: '12px', color: C.text3 }}>{q.date} · {q.score}/{q.total} correct</p>
                </div>
                <Badge variant={pct >= 80 ? 'success' : pct >= 60 ? 'navy' : pct >= 40 ? 'warning' : 'error'}>
                  {pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : pct >= 40 ? 'Fair' : 'Needs Work'}
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
