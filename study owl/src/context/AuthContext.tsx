import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import type { Session, User as SupabaseAuthUser } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type UserRole = "student" | "senior" | "admin";

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

/** Columns of `public.profiles` we read (see the schema SQL). */
interface ProfileRow {
  student_id: string | null;
  full_name: string | null;
  batch: string | null;
  department: string | null;
  role: string | null;
  created_at: string;
}

/** "2022-01-15T…" → "Jan 2022" (matches the previous mock data format). */
function formatJoined(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/**
 * Maps a Supabase auth user + their profile row onto the app's `User` shape.
 * `role` comes ONLY from `profiles.role` — never from client-writable metadata,
 * so a crafted signup cannot self-assign admin. Semester / academic year have
 * no profiles column and are kept in auth `user_metadata` instead.
 */
async function buildUser(authUser: SupabaseAuthUser): Promise<User> {
  const meta = (authUser.user_metadata ?? {}) as Record<string, string | undefined>;
  const { data } = await supabase
    .from("profiles")
    .select("student_id, full_name, batch, department, role, created_at")
    .eq("id", authUser.id)
    .maybeSingle();
  const row = (data ?? null) as ProfileRow | null;

  return {
    id: authUser.id,
    name: row?.full_name ?? meta.full_name ?? "",
    email: authUser.email ?? "",
    studentId: row?.student_id ?? meta.student_id ?? "",
    role: (row?.role as UserRole) ?? "student",
    department: row?.department ?? meta.department ?? "",
    semester: meta.semester ?? "",
    batch: row?.batch ?? meta.batch ?? "",
    academicYear: meta.academic_year,
    joined: row?.created_at ? formatJoined(row.created_at) : undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Uid of the session currently "signed in" from this client's point of view.
  // A stale profile fetch must never overwrite a newer sign-in/sign-out.
  const activeUidRef = useRef<string | null>(null);

  /** Applies a session to state, loading its profile before returning. */
  const applySession = useCallback(async (session: Session | null) => {
    if (!session) {
      activeUidRef.current = null;
      setUser(null);
      setToken(null);
      return;
    }
    activeUidRef.current = session.user.id;
    setToken(session.access_token);
    const next = await buildUser(session.user).catch(() => null);
    if (next && activeUidRef.current === next.id) setUser(next);
  }, []);

  useEffect(() => {
    let mounted = true;

    // One-time cleanup: drop the legacy localStorage auth keys (users DB,
    // fake session, rate-limit counter) left by the old mock auth system.
    try {
      localStorage.removeItem("studyowl_users_db_v3");
      localStorage.removeItem("studyowl_session_token_v3");
      localStorage.removeItem("studyowl_current_user_v3");
      localStorage.removeItem("studyowl_login_attempts_v3");
    } catch {
      // Storage unavailable (private mode) — nothing to clean up.
    }

    // Restore a persisted session on first load.
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (mounted) await applySession(data.session);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    // Stay in sync with token refreshes, sign-in and sign-out. The profile
    // read is deferred with setTimeout: supabase-js must not await client
    // calls from inside this callback (it can deadlock on navigator locks).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        activeUidRef.current = null;
        setUser(null);
        setToken(null);
        return;
      }
      activeUidRef.current = session.user.id;
      setToken(session.access_token);
      const uid = session.user.id;
      window.setTimeout(() => {
        if (activeUidRef.current !== uid) return;
        void buildUser(session.user).then((next) => {
          if (next && activeUidRef.current === uid) setUser(next);
        });
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [applySession]);

  /**
   * Email sign-in, or student-ID sign-in via the `email_by_student_id` RPC
   * (which verifies the password server-side and returns the email to use).
   * The profile is loaded before this resolves, so callers can redirect
   * immediately and the destination route already sees the user.
   */
  const login = useCallback(
    async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const trimmed = identifier.trim();
        if (!trimmed || !password) {
          return { success: false, error: "Please fill in all fields." };
        }

        let email = trimmed;
        if (!trimmed.includes("@")) {
          const { data: rpcEmail, error: rpcError } = await supabase.rpc("email_by_student_id", {
            p_student_id: trimmed,
            p_password: password,
          });
          if (rpcError || !rpcEmail) {
            return { success: false, error: "Invalid credentials" };
          }
          email = rpcEmail as string;
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // Keep the original generic message so the endpoint can't be used
          // to probe which emails exist.
          if (error.message.includes("Invalid login credentials")) {
            return { success: false, error: "Invalid credentials" };
          }
          if (error.message.includes("Email not confirmed")) {
            return { success: false, error: "Please confirm your email before signing in." };
          }
          return { success: false, error: error.message };
        }

        if (data.session) {
          activeUidRef.current = data.session.user.id;
          setToken(data.session.access_token);
          const next = await buildUser(data.session.user).catch(() => null);
          if (next && activeUidRef.current === next.id) setUser(next);
        }
        return { success: true };
      } catch {
        return { success: false, error: "An unexpected error occurred. Please try again." };
      }
    },
    []
  );

  /** Clears local state immediately, then revokes the Supabase session. */
  const logout = useCallback(() => {
    activeUidRef.current = null;
    setUser(null);
    setToken(null);
    void supabase.auth.signOut().catch(() => {});
  }, []);

  /**
   * Persists account edits. `name`/`studentId`/`department`/`batch` map to
   * profiles columns (RLS: own row only; `role` has no update grant);
   * `semester`/`academicYear` have no column and are stored in auth
   * `user_metadata`. `email`, `role`, `id` and `joined` are never written.
   */
  const updateUserSettings = useCallback(
    async (settings: Partial<User>): Promise<{ success: boolean; error?: string }> => {
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

      if (settings.semester !== undefined) {
        const semNum = parseInt(settings.semester, 10);
        if (isNaN(semNum) || semNum < 1 || semNum > 8) {
          return { success: false, error: "Semester must be between 1 and 8." };
        }
      }

      const columns: Record<string, string> = {};
      if (settings.name !== undefined) columns.full_name = settings.name;
      if (settings.studentId !== undefined) columns.student_id = settings.studentId;
      if (settings.department !== undefined) columns.department = settings.department;
      if (settings.batch !== undefined) columns.batch = settings.batch;

      const metadata: Record<string, string> = {};
      if (settings.semester !== undefined) metadata.semester = settings.semester;
      if (settings.academicYear !== undefined) metadata.academic_year = settings.academicYear;

      try {
        if (Object.keys(columns).length > 0) {
          const { error } = await supabase
            .from("profiles")
            .update(columns)
            .eq("id", user.id);
          if (error) return { success: false, error: error.message };
        }
        if (Object.keys(metadata).length > 0) {
          const { error } = await supabase.auth.updateUser({ data: metadata });
          if (error) return { success: false, error: error.message };
        }
      } catch {
        return { success: false, error: "An unexpected error occurred. Please try again." };
      }

      setUser({ ...user, ...settings });
      return { success: true };
    },
    [user]
  );

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
