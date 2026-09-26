import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "student" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  role: UserRole;
  department: string;
  semester: string;
  batch: string;
  academicYear?: string;
  joined?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUserSettings: (settings: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + "_study_owl_salt_v1");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const DEFAULT_USERS = [
  {
    id: "usr_student_01",
    name: "Alex Johnson",
    email: "alex@university.edu",
    studentId: "CSE-2022-007",
    role: "student" as UserRole,
    department: "CSE",
    semester: "6",
    batch: "2022",
    academicYear: "2022-2026",
    joined: "Jan 2022",
    passwordHash: "93e22574b1c93c32af0a4228a687913ad5cce1c17a2654d4cab7209614de0de2",
  },
  {
    id: "usr_admin_01",
    name: "Dr. Admin Rahman",
    email: "admin@studyowl.edu",
    studentId: "ADMIN-001",
    role: "admin" as UserRole,
    department: "CSE",
    semester: "8",
    batch: "Staff",
    academicYear: "Faculty",
    joined: "Aug 2020",
    passwordHash: "360818c8e6074376d44b3646c0626098159ea5da76355be38092291276fd36ab",
  },
];

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000;

function checkRateLimit(): { allowed: boolean; waitSeconds?: number } {
  try {
    const raw = localStorage.getItem(STORAGE_RATE_LIMIT_KEY);
    const now = Date.now();
    const attempts: number[] = raw ? JSON.parse(raw) : [];
    const recent = attempts.filter((ts) => now - ts < WINDOW_MS);
    if (recent.length >= MAX_ATTEMPTS) {
      const oldest = recent[0];
      const waitSeconds = Math.ceil((WINDOW_MS - (now - oldest)) / 1000);
      return { allowed: false, waitSeconds: Math.max(1, waitSeconds) };
    }
    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

function recordFailedAttempt() {
  try {
    const raw = localStorage.getItem(STORAGE_RATE_LIMIT_KEY);
    const now = Date.now();
    const attempts: number[] = raw ? JSON.parse(raw) : [];
    const recent = attempts.filter((ts) => now - ts < WINDOW_MS);
    recent.push(now);
    localStorage.setItem(STORAGE_RATE_LIMIT_KEY, JSON.stringify(recent));
  } catch {}
}

function clearRateLimit() {
  localStorage.removeItem(STORAGE_RATE_LIMIT_KEY);
}

function initUsersDb() {
  if (!localStorage.getItem(STORAGE_USERS_KEY)) {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initUsersDb();
    const storedToken = localStorage.getItem(STORAGE_SESSION_KEY);
    const storedUser = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        localStorage.removeItem(STORAGE_SESSION_KEY);
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (
    identifier: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    initUsersDb();
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `Too many failed login attempts. Please wait ${rateCheck.waitSeconds}s before trying again.`,
      };
    }

    const trimmedId = identifier.trim().toLowerCase();
    const usersJson = localStorage.getItem(STORAGE_USERS_KEY);
    const users = usersJson ? JSON.parse(usersJson) : DEFAULT_USERS;

    const matchedUser = users.find(
      (u: any) =>
        u.email.toLowerCase() === trimmedId ||
        u.studentId.toLowerCase() === trimmedId
    );

    const hashedInput = await hashPassword(password);

    if (!matchedUser || matchedUser.passwordHash !== hashedInput) {
      recordFailedAttempt();
      return { success: false, error: "Invalid credentials" };
    }

    clearRateLimit();

    const sanitizedUser: User = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      studentId: matchedUser.studentId,
      role: matchedUser.role,
      department: matchedUser.department,
      semester: matchedUser.semester,
      batch: matchedUser.batch,
      academicYear: matchedUser.academicYear,
      joined: matchedUser.joined,
    };

    const fakeJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
      JSON.stringify({ sub: sanitizedUser.id, role: sanitizedUser.role, iat: Date.now() })
    )}.mock_signature`;

    localStorage.setItem(STORAGE_SESSION_KEY, fakeJwt);
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(sanitizedUser));

    setUser(sanitizedUser);
    setToken(fakeJwt);

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    setUser(null);
    setToken(null);
  };

  const updateUserSettings = async (
    settings: Partial<User>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    if (settings.semester !== undefined) {
      const semNum = parseInt(settings.semester, 10);
      if (isNaN(semNum) || semNum < 1 || semNum > 8) {
        return { success: false, error: "Semester must be between 1 and 8." };
      }
    }

    const updatedUser: User = { ...user, ...settings };

    const usersJson = localStorage.getItem(STORAGE_USERS_KEY);
    if (usersJson) {
      const users = JSON.parse(usersJson);
      const idx = users.findIndex((u: any) => u.id === user.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...settings };
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
      }
    }

    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, updateUserSettings }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const STORAGE_USERS_KEY = "studyowl_users_db_v3";
export const STORAGE_SESSION_KEY = "studyowl_session_token_v3";
export const STORAGE_CURRENT_USER_KEY = "studyowl_current_user_v3";
export const STORAGE_RATE_LIMIT_KEY = "studyowl_login_attempts_v3";
