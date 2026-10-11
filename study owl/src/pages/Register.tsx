import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { C, Btn, Input, Select } from "../components/ui";
import { IconAlertCircle } from "../components/Icons";

// Department options shown in the "Academic Details" step
const depts = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'MBA', 'MCA', 'Physics', 'Chemistry', 'Mathematics', 'English'].map(d => ({ value: d, label: d }));
// Semesters 1-8, formatted with the correct ordinal suffix (1st, 2nd, 3rd...)
const sems = Array.from({ length: 8 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}${['st','nd','rd','th','th','th','th','th'][i]} Semester` }));
// Admission batch years offered in the dropdown
const batches = ['2021', '2022', '2023', '2024', '2025'].map(b => ({ value: b, label: `Batch ${b}` }));

/**
 * Page: Register (/register) — public sign-up, no auth required.
 * Purpose: Two-step account creation form.
 *   Step 1 = Personal Information (name, student ID, email)
 *   Step 2 = Academic Details (department, semester, batch, password)
 * Data source: step fields are local state; submission calls
 *   supabase.auth.signUp with the form data as user metadata (a DB trigger
 *   copies identity fields into `profiles`). When email confirmation is off
 *   a session is returned immediately — we then sign in through
 *   AuthContext so the profile is loaded before routing to the dashboard.
 *   With confirmation on, a notice asks the user to verify their email.
 */
export default function Register() {
  const navigate = useNavigate();

  // Supplies `login` for the post-signup sign-in (see doc comment above)
  const { login } = useAuth();

  // Current wizard step (1 or 2) — drives which form half is rendered
  const [step, setStep] = useState(1);

  // Submission flag passed to the button to show its spinner
  const [loading, setLoading] = useState(false);

  // Validation / backend error banner text; empty when there is no error
  const [error, setError] = useState("");

  // Confirmation-required notice (rendered in the same banner slot)
  const [notice, setNotice] = useState("");

  // All form fields held in one object; updated field-by-field via `up` below
  const [form, setForm] = useState({ name: '', studentId: '', email: '', dept: 'CSE', semester: '6', batch: '2022', password: '', confirm: '' });

  // Generic field updater: merges one key into the form state
  const up = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // "Continue" on step 1 validates and advances; "Create Account" on step 2
  // creates the Supabase user, then signs in and routes (or asks to confirm)
  const handleNext = async () => {
    setError("");
    setNotice("");

    if (step === 1) {
      if (!form.name.trim() || !form.studentId.trim() || !form.email.trim()) {
        setError("Please fill in all fields.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        setError("Please enter a valid email address.");
        return;
      }
      setStep(2);
      return;
    }

    if (!form.password || !form.confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            // Copied into `profiles` by the handle_new_user trigger
            full_name: form.name.trim(),
            student_id: form.studentId.trim(),
            department: form.dept,
            batch: form.batch,
            // No profiles column — stays in auth user_metadata
            semester: form.semester,
          },
        },
      });

      if (signUpError) {
        const msg = signUpError.message.toLowerCase();
        setError(
          msg.includes("already") || msg.includes("registered")
            ? "An account with this email already exists. Please sign in."
            : msg.includes("student") || msg.includes("duplicate") || msg.includes("unique") || msg.includes("database error")
              ? "Could not create the account — the Student ID may already be in use."
              : signUpError.message
        );
        return;
      }

      if (data.session) {
        // Email confirmation is off: reuse login() so AuthContext loads the
        // profile before we navigate (the destination route needs `user`).
        const res = await login(form.email.trim(), form.password);
        if (!res.success) {
          setError(res.error || "Account created, but sign-in failed. Please sign in.");
          return;
        }
        navigate("/dashboard");
      } else {
        // Email confirmation is on: no session yet, surface a friendly notice.
        setNotice("Account created! Check your email to confirm your account, then sign in.");
        setLoading(false);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Outer centered page shell (dvh-aware via .login-page)
    <div className="login-page" style={{ minHeight: '100vh', backgroundColor: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      {/* Constrained 480px column holding the whole form */}
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '20px',
            padding: 0,
            border: 'none',
            background: 'none',
            color: C.text3,
            fontSize: '14px',
            fontWeight: 400,
          }}
        >
          <span aria-hidden="true">←</span> Back to home
        </button>
        {/* Brand block: logo, page title, tagline */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img src="/assets/ce79b.svg" alt="Study Owl AI" style={{ height: '40px', width: 'auto', margin: '0 auto 12px' }} />
          <h1 style={{ fontFamily: "'Merriweather', serif", fontSize: '22px', fontWeight: 700, color: C.navy }}>Create your account</h1>
          <p style={{ fontSize: '14px', color: C.text2, marginTop: '4px' }}>Join thousands of students on Study Owl AI</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
          {[1, 2].map(s => (
            <div key={s} style={{ width: '40px', height: '4px', borderRadius: '99px', backgroundColor: s <= step ? C.indigo : C.border }} />
          ))}
        </div>

        {/* The white form card wrapping both steps */}
        <div className="auth-card" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '32px' }}>
        {/* Error / confirmation banner, rendered only when set */}
        {(error || notice) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: error ? C.errorLight : "#ECFDF5",
              border: `1px solid ${error ? C.error + "33" : "#A7F3D0"}`,
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "20px",
              color: error ? C.error : "#059669",
              fontSize: "13px",
            }}
          >
            <IconAlertCircle size={16} color={error ? C.error : "#059669"} />
            <span style={{ flex: 1 }}>{error || notice}</span>
          </div>
        )}

        {/* Step 1 — Personal Information fields */}
          {step === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Personal Information</p>
              <Input label="Full Name" placeholder="Alex Johnson" value={form.name} onChange={e => up('name', e.target.value)} fullWidth />
              <Input label="Student ID" placeholder="CSE-2022-001" value={form.studentId} onChange={e => up('studentId', e.target.value)} fullWidth />
              <Input label="Email Address" type="email" placeholder="alex@university.edu" value={form.email} onChange={e => up('email', e.target.value)} fullWidth />
            </div>
          ) : (
            // Step 2 — Academic details, credentials, and the terms notice
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Academic Details</p>
              <Select label="Department" options={depts} value={form.dept} onChange={e => up('dept', e.target.value)} />
              <div className="form-2">
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

          {/* Navigation actions: Back (step 2 only) and the primary submit button */}
          <div className="actions-row" style={{ marginTop: '24px' }}>
            {step === 2 && <Btn variant="secondary" onClick={() => setStep(1)} fullWidth>Back</Btn>}
            <Btn onClick={handleNext} loading={loading} fullWidth>
              {step === 1 ? 'Continue' : 'Create Account'}
            </Btn>
          </div>

          {/* Footer: sign-in link for existing users */}
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: C.text2 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: C.indigo, fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
