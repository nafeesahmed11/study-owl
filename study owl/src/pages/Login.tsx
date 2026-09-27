import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { C, Btn, Input } from "../components/ui";
import { IconAlertCircle } from "../components/Icons";


/**
 * Page: Login (/login) — public, no auth required.
 * Purpose: Email-or-student-ID sign-in, plus one-click demo credential
 *   buttons for the student and admin accounts.
 * Data source: `useAuth().login`, which validates against the localStorage
 *   users DB (see AuthContext) with SHA-256 hashing and a 5-attempts-per-minute
 *   rate limit. On success the session token and current user are persisted
 *   to localStorage by AuthContext; this file only handles routing.
 * Post-login routing: admins go to /admin, everyone else to /app/dashboard.
 * The role is re-read straight from localStorage rather than from the login
 *   return value, so the redirect is correct on the first render.
 */
export default function Login() {
  // Used for the logo, the post-login redirect, and the home link
  const navigate = useNavigate();

  // `login` returns { success, error? } and persists the session on success
  const { login } = useAuth();

  // Accepts either an email address or a student ID
  const [identifier, setIdentifier] = useState("");

  // Password is never stored in plain form; AuthContext hashes it
  const [password, setPassword] = useState("");

  // Submit in-flight flag driving the button spinner
  const [loading, setLoading] = useState(false);

  // Error banner text; empty when there is no error
  const [error, setError] = useState("");

  // Form submit handler: client-side validation, then the auth call, then
  // a role-based redirect
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const result = await login(identifier, password);
      if (!result.success) {
        setError(result.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      // Check current user role after login
      // Retrieve from storage directly for immediate routing
      const userStr = localStorage.getItem("studyowl_current_user_v3");
      const userObj = userStr ? JSON.parse(userStr) : null;

      if (userObj?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/app/dashboard");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fills both fields from a demo-credential button and clears any error
  const fillCredentials = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    setError("");
  };

  return (
    // Outer centered page shell
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        boxSizing: "border-box",
      }}
    >
      {/* Constrained 440px column holding the whole form */}
      <div style={{ width: "100%", maxWidth: "440px" }}>
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            onClick={() => navigate("/")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              marginBottom: "14px",
            }}
          >
            <img
              src="/assets/ce79b.svg"
              alt="Study Owl AI"
              style={{ height: "36px", width: "auto" }}
            />
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: C.navy,
                letterSpacing: "-0.01em",
              }}
            >
              Study Owl <span style={{ color: C.indigo }}>AI</span>
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Merriweather', serif",
              fontSize: "24px",
              fontWeight: 700,
              color: C.navy,
              margin: "0 0 6px 0",
              lineHeight: 1.25,
            }}
          >
            Welcome Back
          </h1>
          <p style={{ fontSize: "14px", color: C.text2, margin: 0 }}>
            Sign in to access your notes, question papers & AI tutor
          </p>
        </div>

        {/* Main Card */}
        <div
          style={{
            backgroundColor: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            boxSizing: "border-box",
          }}
        >
          {/* Error banner, rendered only when `error` is set */}
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: C.errorLight,
                border: `1px solid ${C.error}33`,
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "20px",
                color: C.error,
                fontSize: "13px",
              }}
            >
              <IconAlertCircle size={16} color={C.error} />
              <span style={{ flex: 1 }}>{error}</span>
            </div>
          )}

          {/* The sign-in form: identifier, password, and the submit button */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <Input
              label="Email Address or Student ID"
              placeholder="e.g. alex@university.edu or CSE-2022-007"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              fullWidth
              autoComplete="username"
            />

            {/* Password row: label + a "Forgot password?" link that only alerts */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: C.text,
                    userSelect: "none",
                  }}
                >
                  Password
                </label>
                <span
                  style={{
                    fontSize: "12px",
                    color: C.indigo,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                  onClick={() => alert("Please use one of the quick test credentials below.")}
                >
                  Forgot password?
                </span>
              </div>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                autoComplete="current-password"
              />
            </div>

            <Btn
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              style={{
                height: "44px",
                fontSize: "14.5px",
                fontWeight: 600,
                marginTop: "4px",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Btn>
          </form>

          {/* Quick Test Credentials */}
          <div
            style={{
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: `1px solid ${C.border}`,
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: C.text3,
                marginBottom: "12px",
                textAlign: "center",
              }}
            >
              Quick Test Credentials
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: "10px",
              }}
            >
              {/* Demo credential 1: the student account */}
              <button
                type="button"
                onClick={() => fillCredentials("alex@university.edu", "student123")}
                style={{
                  backgroundColor: C.surface2,
                  border: `1px solid ${C.border}`,
                  borderRadius: "10px",
                  padding: "10px 12px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.indigo;
                  e.currentTarget.style.backgroundColor = C.indigoLight;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.backgroundColor = C.surface2;
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: C.navy }}>
                    Student
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: C.indigo,
                      backgroundColor: "#fff",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    Auto-fill
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: C.text2, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  alex@university.edu
                </div>
                <div style={{ fontSize: "10.5px", color: C.text3 }}>
                  PW: student123
                </div>
              </button>

              {/* Demo credential 2: the admin account */}
              <button
                type="button"
                onClick={() => fillCredentials("admin@studyowl.edu", "admin123")}
                style={{
                  backgroundColor: C.surface2,
                  border: `1px solid ${C.border}`,
                  borderRadius: "10px",
                  padding: "10px 12px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.indigo;
                  e.currentTarget.style.backgroundColor = C.indigoLight;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.backgroundColor = C.surface2;
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: C.navy }}>
                    Admin
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: C.indigo,
                      backgroundColor: "#fff",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    Auto-fill
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: C.text2, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  admin@studyowl.edu
                </div>
                <div style={{ fontSize: "10.5px", color: C.text3 }}>
                  PW: admin123
                </div>
              </button>
            </div>
          </div>

          {/* Sign up prompt */}
          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: `1px solid ${C.border}`,
              fontSize: "13px",
              color: C.text2,
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: C.indigo,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Create one
            </Link>
          </div>
        </div>

        {/* Back Link */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              color: C.text3,
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.text3)}
          >
            <span>←</span>
            <span>Back to home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

