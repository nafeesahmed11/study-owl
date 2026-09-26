import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { C, Btn, Input, Select } from "../components/ui";

const depts = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'MBA', 'MCA', 'Physics', 'Chemistry', 'Mathematics', 'English'].map(d => ({ value: d, label: d }));
const sems = Array.from({ length: 8 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}${['st','nd','rd','th','th','th','th','th'][i]} Semester` }));
const batches = ['2021', '2022', '2023', '2024', '2025'].map(b => ({ value: b, label: `Batch ${b}` }));

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', studentId: '', email: '', dept: 'CSE', semester: '6', batch: '2022', password: '', confirm: '' });

  const up = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleNext = () => {
    if (step === 1) setStep(2);
    else {
      setLoading(true);
      setTimeout(() => navigate('/app/dashboard'), 800);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img src="/assets/ce79b.svg" alt="Study Owl AI" style={{ height: '40px', marginBottom: '12px' }} />
          <h1 style={{ fontFamily: "'Merriweather', serif", fontSize: '22px', fontWeight: 700, color: C.navy }}>Create your account</h1>
          <p style={{ fontSize: '14px', color: C.text2, marginTop: '4px' }}>Join thousands of students on Study Owl AI</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
          {[1, 2].map(s => (
            <div key={s} style={{ width: '40px', height: '4px', borderRadius: '99px', backgroundColor: s <= step ? C.indigo : C.border }} />
          ))}
        </div>

        <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '32px' }}>
          {step === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Personal Information</p>
              <Input label="Full Name" placeholder="Alex Johnson" value={form.name} onChange={e => up('name', e.target.value)} fullWidth />
              <Input label="Student ID" placeholder="CSE-2022-001" value={form.studentId} onChange={e => up('studentId', e.target.value)} fullWidth />
              <Input label="Email Address" type="email" placeholder="alex@university.edu" value={form.email} onChange={e => up('email', e.target.value)} fullWidth />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Academic Details</p>
              <Select label="Department" options={depts} value={form.dept} onChange={e => up('dept', e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Select label="Semester" options={sems} value={form.semester} onChange={e => up('semester', e.target.value)} />
                <Select label="Batch" options={batches} value={form.batch} onChange={e => up('batch', e.target.value)} />
              </div>
              <Input label="Password" type="password" placeholder="Create a strong password" value={form.password} onChange={e => up('password', e.target.value)} fullWidth />
              <Input label="Confirm Password" type="password" placeholder="Repeat password" value={form.confirm} onChange={e => up('confirm', e.target.value)} fullWidth />
              <p style={{ fontSize: '11px', color: C.text3, lineHeight: 1.6 }}>
                By creating an account you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            {step === 2 && <Btn variant="secondary" onClick={() => setStep(1)} fullWidth>Back</Btn>}
            <Btn onClick={handleNext} loading={loading} fullWidth>
              {step === 1 ? 'Continue' : 'Create Account'}
            </Btn>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: C.text2 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: C.indigo, fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
