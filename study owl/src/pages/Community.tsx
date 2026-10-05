import { useState } from "react";
import { C, Card, Badge, Btn, Avatar, Tabs, PageHeader, Modal, Textarea, Input, Select } from "../components/ui";
import { IconUsers, IconMessageCircle, IconTrendingUp, IconCheck, IconPlus, IconShare, IconStar } from "../components/Icons";

/**
 * Page: Community (/app/community) — student-only, inside AppLayout.
 * Purpose: Academic social feed — browse posts by category, mark posts
 *   helpful, and open a modal to create a new post.
 * Data source: seeded from the in-file `initPosts` mock array. Posts live in
 *   React state only, so they reset on reload (no backend yet).
 */

type Post = { id: number; author: string; role: 'Student' | 'Senior' | 'Admin'; dept: string; subject: string; category: string; title: string; content: string; helpful: number; comments: number; time: string; userHelped: boolean };

// Seed feed shown on first mount (5 sample posts)
const initPosts: Post[] = [
  { id: 1, author: "Fahim Hossain", role: "Senior", dept: "CSE", subject: "DBMS", category: "Resource", title: "DBMS Final Prep — Normalization Notes 2024", content: "I've compiled a complete normalization guide with examples from the last 5 years' question papers. Covers 1NF through BCNF with practice problems. Good luck to all 6th semester students!", helpful: 47, comments: 12, time: "2h ago", userHelped: false },
  { id: 2, author: "Nadia Islam", role: "Senior", dept: "CSE", subject: "Algorithms", category: "Tip", title: "How I scored 92% in Algorithms — Study Strategy", content: "The key to Algorithms is not just memorizing — understand WHY each algorithm works. Focus on Dynamic Programming first (it's 30+ marks), then Graph Algorithms. Practice at least 3 past papers under timed conditions.", helpful: 63, comments: 18, time: "5h ago", userHelped: true },
  { id: 3, author: "Rifat Karim", role: "Student", dept: "CSE", subject: "CN", category: "Discussion", title: "Can anyone explain the difference between TCP vs UDP clearly?", content: "I keep confusing TCP and UDP in my notes. Can any senior explain it in a way that would work for a 5-mark exam question?", helpful: 12, comments: 24, time: "8h ago", userHelped: false },
  { id: 4, author: "Dr. Priya Roy", role: "Admin", dept: "CSE", subject: "SE", category: "Announcement", title: "Software Engineering Final Exam Syllabus 2024", content: "The final exam will cover Units 1-5. Design Patterns (Unit 4) carries 20 marks. Make sure to study UML diagrams. The question pattern will remain similar to 2023.", helpful: 89, comments: 7, time: "1d ago", userHelped: true },
  { id: 5, author: "Tanvir Ahmed", role: "Senior", dept: "CSE", subject: "DBMS", category: "QP", title: "DBMS Question Pattern Analysis — 5 Year Summary", content: "After analyzing 5 years of DBMS finals: Normalization (appears every year, 10M), SQL (appears every year, 10M), ACID (appears 4/5 years, 5M), ER Diagram (appears 4/5 years, 10M). Plan accordingly!", helpful: 124, comments: 31, time: "2d ago", userHelped: false },
];

// Badge colour per author role and per post category
const roleColors: Record<string, string> = { Senior: 'purple', Admin: 'error', Student: 'default' };
const catColors: Record<string, string> = { Resource: 'success', Tip: 'info', Discussion: 'navy', Announcement: 'error', QP: 'warning' };

/**
 * Presentational sub-component: a single feed post card.
 * Renders author/role, category + subject badges, body text, and the
 * action row. Marking "helpful" is delegated up via the `onHelp` callback
 * so the parent owns the posts array.
 */
function PostCard({ post, onHelp }: { post: Post; onHelp: () => void }) {
  return (
    // Card wrapper; `hover` enables the elevation-on-hover style
    <Card hover>
      {/* Author block: avatar, name, role badge, department and time */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <Avatar name={post.author} size={38} />
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: C.navy, overflowWrap: 'anywhere' }}>{post.author}</span>
            <Badge variant={roleColors[post.role] as any}>{post.role}</Badge>
            <span style={{ fontSize: '12px', color: C.text3 }}>{post.dept} · {post.time}</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
            <Badge variant={catColors[post.category] as any}>{post.category}</Badge>
            <Badge variant="default">{post.subject}</Badge>
          </div>
        </div>
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: C.navy, marginBottom: '8px', lineHeight: 1.4, overflowWrap: 'anywhere' }}>{post.title}</h3>
      <p style={{ fontSize: '13.5px', color: C.text2, lineHeight: 1.65, marginBottom: '14px', overflowWrap: 'anywhere' }}>{post.content}</p>
      {/* Action row: helpful toggle, replies, and share (last two are visual only) */}
      <div className="actions-row" style={{ paddingTop: '12px', borderTop: `1px solid ${C.border}` }}>
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
  // Feed array — the single source of truth for rendered posts
  const [posts, setPosts] = useState<Post[]>(initPosts);

  // Active category filter ('all' shows everything)
  const [tab, setTab] = useState('all');

  // Visibility flag for the create-post modal
  const [postOpen, setPostOpen] = useState(false);

  // Draft values for the post being composed in the modal
  const [newPost, setNewPost] = useState({ title: '', subject: 'DBMS', category: 'Discussion', content: '' });

  // Flips a post's helpful flag; count shown in the card adds 1 when set
  const toggleHelp = (id: number) => setPosts(ps => ps.map(p => p.id === id ? { ...p, userHelped: !p.userHelped } : p));

  // Filter chips; 'all' is the special unfiltered case
  const categories = ['all', 'Discussion', 'Resource', 'Tip', 'QP', 'Announcement'];

  // Derived view list applying the active category filter
  const filtered = tab === 'all' ? posts : posts.filter(p => p.category === tab);

  // Validates the draft, prepends the new post to the feed, resets the form, closes the modal
  const addPost = () => {
    if (!newPost.title || !newPost.content) return;
    const p: Post = { id: Date.now(), author: "Alex Johnson", role: "Student", dept: "CSE", subject: newPost.subject, category: newPost.category, title: newPost.title, content: newPost.content, helpful: 0, comments: 0, time: "Just now", userHelped: false };
    setPosts(ps => [p, ...ps]);
    setNewPost({ title: '', subject: 'DBMS', category: 'Discussion', content: '' });
    setPostOpen(false);
  };

  return (
    // Page container: 900px max width (responsive padding via .page)
    <div className="page" style={{ maxWidth: '900px' }}>
      {/* Page title, subtitle, and the "New Post" button that opens the modal */}
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

      {/* Feed: one PostCard per post matching the active filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filtered.map(p => <PostCard key={p.id} post={p} onHelp={() => toggleHelp(p.id)} />)}
      </div>

      {/* Create-post modal: title, subject + category, body, and actions */}
      <Modal open={postOpen} onClose={() => setPostOpen(false)} title="Create a Post" width={560}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Post Title" placeholder="e.g., DBMS Normalization Notes — 2024" value={newPost.title} onChange={e => setNewPost(f => ({ ...f, title: e.target.value }))} fullWidth />
          <div className="form-2">
            <Select label="Subject" options={['DBMS','Algorithms','CN','SE','Numerical Methods'].map(s => ({ value: s, label: s }))} value={newPost.subject} onChange={e => setNewPost(f => ({ ...f, subject: e.target.value }))} />
            <Select label="Category" options={['Discussion','Resource','Tip','QP'].map(c => ({ value: c, label: c }))} value={newPost.category} onChange={e => setNewPost(f => ({ ...f, category: e.target.value }))} />
          </div>
          <Textarea label="Content" placeholder="Share your knowledge, tip, or question…" value={newPost.content} onChange={e => setNewPost(f => ({ ...f, content: e.target.value }))} style={{ minHeight: '120px' }} />
          <div className="actions-row" style={{ justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => setPostOpen(false)}>Cancel</Btn>
            <Btn onClick={addPost} disabled={!newPost.title || !newPost.content}>Post</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
