import { useState, useEffect } from "react";
import { C, Card, Btn, Input, Select, Tabs, Badge, Modal, PageHeader } from "../components/ui";
import { IconUser, IconShield, IconBell, IconDrive, IconBrain, IconCheck, IconLink, IconLogout } from "../components/Icons";
import { useAuth } from "../context/AuthContext";

/**
 * Page: Settings (/app/settings) — student-only, inside AppLayout.
 * Purpose: Five-tab preferences panel (Account, Security, Notifications,
 *   Google Drive, AI Preferences).
 * Data source: the Account tab is the only genuinely persisted part — it reads
 *   `user` from AuthContext and writes back through `updateUserSettings`,
 *   which updates localStorage. The Google Drive connection and notification
 *   toggles are component state only and reset on reload. The Security and AI
 *   tabs are entirely non-functional (no handlers on their buttons/inputs).
 */
export default function Settings() {
  // `updateUserSettings` persists the account fields and refreshes context
  const { user, updateUserSettings } = useAuth();

  // Which of the five tabs is showing
  const [tab, setTab] = useState('account');

  // Transient "saved" confirmation banner, auto-cleared after 2.5s
  const [saved, setSaved] = useState(false);

  // Validation message from the save attempt; empty when there is no error
  const [saveError, setSaveError] = useState('');

  // Save in-flight flag driving the button spinner
  const [loading, setLoading] = useState(false);

  // Form states for account settings
  const [fullName, setFullName] = useState(user?.name || 'Alex Johnson');
  const [studentId, setStudentId] = useState(user?.studentId || 'CSE-2022-007');
  const [email, setEmail] = useState(user?.email || 'alex@university.edu');
  const [dept, setDept] = useState(user?.department || 'CSE');
  const [semester, setSemester] = useState(user?.semester || '6');
  const [batch, setBatch] = useState(user?.batch || '2022');
  const [academicYear, setAcademicYear] = useState(user?.academicYear || '2022-2026');

  // Re-sync the form whenever the context user changes (e.g. right after login)
  useEffect(() => {
    if (user) {
      setFullName(user.name);
      setStudentId(user.studentId);
      setEmail(user.email);
      setDept(user.department);
      setSemester(user.semester);
      setBatch(user.batch);
      if (user.academicYear) setAcademicYear(user.academicYear);
    }
  }, [user]);

  // Whether Google Drive is linked; local only, never persisted
  const [driveConnected, setDriveConnected] = useState(false);

  // Per-channel notification toggles; local only, never persisted
  const [notifs, setNotifs] = useState({ email: true, quiz: true, community: false, weekly: true });

  // Persists the account form. Note `email` is deliberately omitted from the
  // payload, which is why the email field is disabled below.
  const handleSave = async () => {
    setLoading(true);
    setSaveError('');
    const res = await updateUserSettings({
      name: fullName,
      studentId,
      department: dept,
      semester,
      batch,
      academicYear,
    });
    setLoading(false);

    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setSaveError(res.error || 'Failed to update settings');
    }
  };

  // Tab definitions, each with its own icon
  const tabs = [
    { id: 'account', label: 'Account', icon: <IconUser size={14} /> },
    { id: 'security', label: 'Security', icon: <IconShield size={14} /> },
    { id: 'notifications', label: 'Notifications', icon: <IconBell size={14} /> },
    { id: 'drive', label: 'Google Drive', icon: <IconDrive size={14} /> },
    { id: 'ai', label: 'AI Preferences', icon: <IconBrain size={14} /> },
  ];

  return (
    // Page container: narrow 740px — this is a form page, not a dashboard
    <div style={{ padding: '28px 32px', maxWidth: '740px' }}>
      {/* Page title + subtitle */}
      <PageHeader title="Settings" sub="Manage your account, security, and preferences" />

      {/* Settings tab bar */}
      <Tabs tabs={tabs} active={tab} onChange={setTab} style={{ marginBottom: '24px' }} />

      {/* Account tab — the only tab that persists changes */}
      {tab === 'account' && (
        <Card>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.navy, marginBottom: '20px' }}>Account Information</h3>
          {saveError && (
            <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {saveError}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Full Name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                fullWidth
              />
              <Input
                label="Student ID"
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                fullWidth
              />
            </div>
            <Input
              label="Email Address"
              type="email"
              value={email}
              disabled
              fullWidth
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <Select
                label="Department"
                options={['CSE','ECE','EEE','ME'].map(d => ({ value: d, label: d }))}
                value={dept}
                onChange={e => setDept(e.target.value)}
              />
              <Select
                label="Semester"
                options={Array.from({length:8},(_,i)=>({ value: String(i+1), label: `Sem ${i+1}` }))}
                value={semester}
                onChange={e => setSemester(e.target.value)}
              />
              <Select
                label="Batch"
                options={['2020','2021','2022','2023','2024','2025'].map(b=>({ value: b, label: `Batch ${b}` }))}
                value={batch}
                onChange={e => setBatch(e.target.value)}
              />
            </div>
            {/* Footer row: success banner (when saved) + the Save button */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: `1px solid ${C.border}` }}>
              {saved && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg animate-fade-in">
                  <IconCheck size={14} color="#059669" />
                  <span>Changes saved successfully!</span>
                </div>
              )}
              <Btn onClick={handleSave} loading={loading}>Save Changes</Btn>
            </div>
          </div>
        </Card>
      )}

      {/* Security tab: change-password form and the danger zone (neither is wired up) */}
      {tab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.navy, marginBottom: '16px' }}>Change Password</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Input label="Current Password" type="password" placeholder="Enter current password" fullWidth />
              <Input label="New Password" type="password" placeholder="Create a strong password" fullWidth />
              <Input label="Confirm New Password" type="password" placeholder="Repeat new password" fullWidth />
              <Btn style={{ alignSelf: 'flex-start' }}>Update Password</Btn>
            </div>
          </Card>
          <Card>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.navy, marginBottom: '8px' }}>Danger Zone</h3>
            <p style={{ fontSize: '13.5px', color: C.text2, marginBottom: '16px' }}>These actions are irreversible. Please proceed with caution.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Btn variant="danger" size="sm">Delete Account</Btn>
              <Btn variant="secondary" size="sm" icon={<IconLogout size={13} />}>Sign Out All Devices</Btn>
            </div>
          </Card>
        </div>
      )}

      {/* Notifications tab: one toggle switch per channel */}
      {tab === 'notifications' && (
        <Card>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.navy, marginBottom: '20px' }}>Notification Preferences</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Receive updates and alerts via email' },
              { key: 'quiz', label: 'Quiz Reminders', desc: 'Get reminded about scheduled quizzes' },
              { key: 'community', label: 'Community Replies', desc: 'Notify when someone replies to your posts' },
              { key: 'weekly', label: 'Weekly Progress Report', desc: 'Receive a weekly summary of your study activity' },
            // One row per channel: label + description on the left, switch on the right
            ].map((n, i, arr) => (
              <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: C.text }}>{n.label}</p>
                  <p style={{ fontSize: '12.5px', color: C.text3, marginTop: '2px' }}>{n.desc}</p>
                </div>
                <button onClick={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key as keyof typeof notifs] }))} style={{ width: '44px', height: '24px', borderRadius: '99px', border: 'none', backgroundColor: notifs[n.key as keyof typeof notifs] ? C.indigo : C.border, cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: '2px', left: notifs[n.key as keyof typeof notifs] ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Google Drive tab: connect/disconnect toggle, state held in memory only */}
      {tab === 'drive' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: driveConnected ? C.successLight : C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconDrive size={22} color={driveConnected ? C.success : C.text3} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.navy }}>Google Drive</h3>
                <Badge variant={driveConnected ? 'success' : 'default'}>{driveConnected ? 'Connected' : 'Not Connected'}</Badge>
              </div>
            </div>
            <p style={{ fontSize: '13.5px', color: C.text2, lineHeight: 1.6, marginBottom: '16px' }}>
              Connect your Google Drive to store large academic files. Study Owl AI manages the metadata while your files stay in your own Drive — giving you control and unlimited storage.
            </p>
            {driveConnected ? (
              <div style={{ padding: '12px 16px', backgroundColor: C.successLight, border: `1px solid ${C.success}30`, borderRadius: '10px', marginBottom: '14px', fontSize: '13.5px', color: C.success }}>
                ✓ Connected as alex@gmail.com · 2.1 GB of Drive used for academic files
              </div>
            ) : null}
            <Btn variant={driveConnected ? 'danger' : 'primary'} icon={<IconLink size={14} />} onClick={() => setDriveConnected(d => !d)}>
              {driveConnected ? 'Disconnect Google Drive' : 'Connect Google Drive'}
            </Btn>
          </Card>
        </div>
      )}

      {/* AI Preferences tab: answer language/depth plus optional behaviours (visual only) */}
      {tab === 'ai' && (
        <Card>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.navy, marginBottom: '20px' }}>AI Study Assistant Preferences</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Select label="Default Answer Language" options={[{ value: 'english', label: 'English' }, { value: 'bengali', label: 'Bengali' }]} value="english" onChange={() => {}} />
            <Select label="Default Answer Depth" options={[{ value: 'concise', label: 'Concise (exam-ready)' }, { value: 'detailed', label: 'Detailed (full explanation)' }]} value="concise" onChange={() => {}} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Include worked examples in answers', 'Auto-suggest related topics after each answer', 'Save AI conversations automatically'].map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px', accentColor: C.indigo }} />
                  <span style={{ fontSize: '13.5px', color: C.text }}>{opt}</span>
                </label>
              ))}
            </div>
            <Btn style={{ alignSelf: 'flex-start' }}>Save AI Preferences</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}
