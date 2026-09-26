import { useState } from "react";
import { C, Card, Badge, Btn, Avatar, Tabs, PageHeader, Modal, Textarea, Input, Select } from "../components/ui";
import { IconUsers, IconMessageCircle, IconTrendingUp, IconCheck, IconPlus, IconShare, IconStar } from "../components/Icons";

type Post = { id: number; author: string; role: 'Student' | 'Senior' | 'Admin'; dept: string; subject: string; category: string; title: string; content: string; helpful: number; comments: number; time: string; userHelped: boolean };

const initPosts: Post[] = [
  { id: 1, author: "Fahim Hossain", role: "Senior", dept: "CSE", subject: "DBMS", category: "Resource", title: "DBMS Final Prep — Normalization Notes 2024", content: "I've compiled a complete normalization guide with examples from the last 5 years' question papers. Covers 1NF through BCNF with practice problems. Good luck to all 6th semester students!", helpful: 47, comments: 12, time: "2h ago", userHelped: false },
  { id: 2, author: "Nadia Islam", role: "Senior", dept: "CSE", subject: "Algorithms", category: "Tip", title: "How I scored 92% in Algorithms — Study Strategy", content: "The key to Algorithms is not just memorizing — understand WHY each algorithm works. Focus on Dynamic Programming first (it's 30+ marks), then Graph Algorithms. Practice at least 3 past papers under timed conditions.", helpful: 63, comments: 18, time: "5h ago", userHelped: true },
  { id: 3, author: "Rifat Karim", role: "Student", dept: "CSE", subject: "CN", category: "Discussion", title: "Can anyone explain the difference between TCP vs UDP clearly?", content: "I keep confusing TCP and UDP in my notes. Can any senior explain it in a way that would work for a 5-mark exam question?", helpful: 12, comments: 24, time: "8h ago", userHelped: false },
  { id: 4, author: "Dr. Priya Roy", role: "Admin", dept: "CSE", subject: "SE", category: "Announcement", title: "Software Engineering Final Exam Syllabus 2024", content: "The final exam will cover Units 1-5. Design Patterns (Unit 4) carries 20 marks. Make sure to study UML diagrams. The question pattern will remain similar to 2023.", helpful: 89, comments: 7, time: "1d ago", userHelped: true },
  { id: 5, author: "Tanvir Ahmed", role: "Senior", dept: "CSE", subject: "DBMS", category: "QP", title: "DBMS Question Pattern Analysis — 5 Year Summary", content: "After analyzing 5 years of DBMS finals: Normalization (appears every year, 10M), SQL (appears every year, 10M), ACID (appears 4/5 years, 5M), ER Diagram (appears 4/5 years, 10M). Plan accordingly!", helpful: 124, comments: 31, time: "2d ago", userHelped: false },
];

const roleColors: Record<string, string> = { Senior: 'purple', Admin: 'error', Student: 'default' };
const catColors: Record<string, string> = { Resource: 'success', Tip: 'info', Discussion: 'navy', Announcement: 'error', QP: 'warning' };

function PostCard({ post, onHelp }: { post: Post; onHelp: () => void }) {
  return (
    <Card hover>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <Avatar name={post.author} size={38} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: C.navy }}>{post.author}</span>
            <Badge variant={roleColors[post.role] as any}>{post.role}</Badge>
            <span style={{ fontSize: '12px', color: C.text3 }}>{post.dept} · {post.time}</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            <Badge variant={catColors[post.category] as any}>{post.category}</Badge>
            <Badge variant="default">{post.subject}</Badge>
          </div>
        </div>
      </div>
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.navy, marginBottom: '8px', lineHeight: 1.4 }}>{post.title}</h3>
      <p style={{ fontSize: '13.5px', color: C.text2, lineHeight: 1.65, marginBottom: '14px' }}>{post.content}</p>
      <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: `1px solid ${C.border}` }}>
        <button onClick={onHelp} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', border: `1.5px solid ${post.userHelped ? C.success : C.border}`, borderRadius: '8px', backgroundColor: post.userHelped ? C.successLight : 'transparent', fontSize: '13px', fontWeight: 500, color: post.userHelped ? C.success : C.text3, cursor: 'pointer', transition: 'all 0.15s' }}>
          <IconCheck size={13} /> Helpful ({post.helpful + (post.userHelped ? 1 : 0)})
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', border: `1px solid ${C.border}`, borderRadius: '8px', fontSize: '13px', color: C.text3, cursor: 'pointer', background: 'none' }}>
          <IconMessageCircle size={13} /> {post.comments} replies
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', border: `1px solid ${C.border}`, borderRadius: '8px', fontSize: '13px', color: C.text3, cursor: 'pointer', background: 'none', marginLeft: 'auto' }}>
          <IconShare size={13} /> Share
        </button>
      </div>
    </Card>
  );
}

export default function Community() {
  const [posts, setPosts] = useState<Post[]>(initPosts);
  const [tab, setTab] = useState('all');
  const [postOpen, setPostOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', subject: 'DBMS', category: 'Discussion', content: '' });

  const toggleHelp = (id: number) => setPosts(ps => ps.map(p => p.id === id ? { ...p, userHelped: !p.userHelped } : p));

  const categories = ['all', 'Discussion', 'Resource', 'Tip', 'QP', 'Announcement'];
  const filtered = tab === 'all' ? posts : posts.filter(p => p.category === tab);

  const addPost = () => {
    if (!newPost.title || !newPost.content) return;
    const p: Post = { id: Date.now(), author: "Alex Johnson", role: "Student", dept: "CSE", subject: newPost.subject, category: newPost.category, title: newPost.title, content: newPost.content, helpful: 0, comments: 0, time: "Just now", userHelped: false };
    setPosts(ps => [p, ...ps]);
    setNewPost({ title: '', subject: 'DBMS', category: 'Discussion', content: '' });
    setPostOpen(false);
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: '900px' }}>
      <PageHeader title="Academic Community" sub="Share resources, ask questions, and connect with seniors and peers"
        actions={<Btn icon={<IconPlus size={14} />} onClick={() => setPostOpen(true)}>New Post</Btn>}
      />

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setTab(cat)} style={{ padding: '5px 14px', borderRadius: '99px', border: `1.5px solid ${tab === cat ? C.indigo : C.border}`, backgroundColor: tab === cat ? C.indigoLight : C.surface, color: tab === cat ? C.indigo : C.text2, fontSize: '13px', fontWeight: 500, cursor: 'pointer', textTransform: cat === 'all' ? 'capitalize' : 'none' }}>
            {cat === 'all' ? 'All Posts' : cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filtered.map(p => <PostCard key={p.id} post={p} onHelp={() => toggleHelp(p.id)} />)}
      </div>

      <Modal open={postOpen} onClose={() => setPostOpen(false)} title="Create a Post" width={560}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Post Title" placeholder="e.g., DBMS Normalization Notes — 2024" value={newPost.title} onChange={e => setNewPost(f => ({ ...f, title: e.target.value }))} fullWidth />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select label="Subject" options={['DBMS','Algorithms','CN','SE','Numerical Methods'].map(s => ({ value: s, label: s }))} value={newPost.subject} onChange={e => setNewPost(f => ({ ...f, subject: e.target.value }))} />
            <Select label="Category" options={['Discussion','Resource','Tip','QP'].map(c => ({ value: c, label: c }))} value={newPost.category} onChange={e => setNewPost(f => ({ ...f, category: e.target.value }))} />
          </div>
          <Textarea label="Content" placeholder="Share your knowledge, tip, or question…" value={newPost.content} onChange={e => setNewPost(f => ({ ...f, content: e.target.value }))} style={{ minHeight: '120px' }} />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => setPostOpen(false)}>Cancel</Btn>
            <Btn onClick={addPost} disabled={!newPost.title || !newPost.content}>Post</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
