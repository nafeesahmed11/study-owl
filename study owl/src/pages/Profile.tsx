import { C, Card, Badge, Btn, Avatar, ProgressBar, StatCard, PageHeader } from "../components/ui";
import { IconBook, IconFolder, IconCheck, IconAward, IconEdit, IconCalendar, IconBarChart } from "../components/Icons";

const student = { name: "Alex Johnson", id: "CSE-2022-007", email: "alex.johnson@university.edu", dept: "CSE", semester: 6, batch: "2022", bio: "6th semester CSE student passionate about databases and algorithms. Active community contributor." };

const stats = [
  { label: "Resources Uploaded", value: 12 },
  { label: "Community Posts", value: 7 },
  { label: "Quiz Attempts", value: 23 },
  { label: "Study Streak", value: 12 },
];

const recentActivity = [
  { action: "Uploaded", item: "DBMS Lab Notes – Unit 4", time: "2h ago", type: "resource" },
  { action: "Completed quiz", item: "Algorithms – 80%", time: "Yesterday", type: "quiz" },
  { action: "Added task", item: "Revise Normalization", time: "Yesterday", type: "task" },
  { action: "Posted in Community", item: "How I study for DBMS finals", time: "Dec 10", type: "community" },
  { action: "Analyzed papers", item: "DBMS 2019–2023", time: "Dec 9", type: "ai" },
];

const typeColors: Record<string, string> = { resource: C.indigo, quiz: C.success, task: C.warning, community: C.purple, ai: C.info };

export default function Profile() {
  return (
    <div style={{ padding: '28px 32px', maxWidth: '900px' }}>
      <PageHeader title="My Profile" actions={<Btn variant="secondary" size="sm" icon={<IconEdit size={14} />}>Edit Profile</Btn>} />

      {/* Profile card */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Avatar name={student.name} size={72} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: C.navy }}>{student.name}</h2>
              <Badge variant="default">{student.id}</Badge>
              <Badge variant="navy">Student</Badge>
            </div>
            <p style={{ fontSize: '14px', color: C.text2, marginBottom: '4px' }}>{student.email}</p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              {[['Department', student.dept], ['Semester', `${student.semester}th`], ['Batch', student.batch]].map(([l, v]) => (
                <div key={l}>
                  <p style={{ fontSize: '11.5px', color: C.text3 }}>{l}</p>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: C.navy }}>{v}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '13.5px', color: C.text2, marginTop: '12px', lineHeight: 1.6 }}>{student.bio}</p>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {stats.map(s => (
          <Card key={s.label} padding={16} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: 700, color: C.indigo }}>{s.value}</p>
            <p style={{ fontSize: '12px', color: C.text3, marginTop: '2px' }}>{s.label}</p>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
        {/* Subject progress */}
        <Card>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.navy, marginBottom: '16px' }}>Subject Coverage</h3>
          {[
            { name: "Software Engineering", progress: 83, color: "#DC2626" },
            { name: "Database Management Systems", progress: 72, color: "#4F46E5" },
            { name: "Algorithms & Complexity", progress: 58, color: "#059669" },
            { name: "Computer Networks", progress: 45, color: "#D97706" },
          ].map(s => (
            <div key={s.name} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '13px', color: C.text }}>{s.name}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: s.color }}>{s.progress}%</span>
              </div>
              <ProgressBar value={s.progress} color={s.color} />
            </div>
          ))}
        </Card>

        {/* Recent activity */}
        <Card>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.navy, marginBottom: '16px' }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {recentActivity.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', paddingBottom: '14px', marginBottom: i < recentActivity.length - 1 ? '0' : '0', position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: typeColors[a.type] + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: typeColors[a.type] }} />
                  </div>
                  {i < recentActivity.length - 1 && <div style={{ width: '1px', flex: 1, backgroundColor: C.border, marginTop: '4px' }} />}
                </div>
                <div style={{ paddingTop: '4px' }}>
                  <p style={{ fontSize: '13px', color: C.text }}><span style={{ fontWeight: 600 }}>{a.action}</span> — {a.item}</p>
                  <p style={{ fontSize: '11.5px', color: C.text3, marginTop: '2px' }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
