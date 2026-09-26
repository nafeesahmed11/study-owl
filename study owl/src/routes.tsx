import { createBrowserRouter } from "react-router";
import { AppLayout } from "./components/Layout";
import { ProtectedRoute, RoleBasedDashboard } from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import Resources from "./pages/Resources";
import QuestionPapers from "./pages/QuestionPapers";
import AIAnalysis from "./pages/AIAnalysis";
import ExamSuggestions from "./pages/ExamSuggestions";
import MarksGenerator from "./pages/MarksGenerator";
import AIStudy from "./pages/AIStudy";
import Quiz from "./pages/Quiz";
import Planner from "./pages/Planner";
import Progress from "./pages/Progress";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";

export const router = createBrowserRouter([
  { path: "/", Component: Landing },
  { path: "/login", Component: Login },
  { path: "/register", Component: Register },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <RoleBasedDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <Admin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute allowedRoles={["student"]}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Dashboard },
      { path: "dashboard", Component: Dashboard },
      { path: "subjects", Component: Subjects },
      { path: "resources", Component: Resources },
      { path: "question-papers", Component: QuestionPapers },
      { path: "ai-analysis", Component: AIAnalysis },
      { path: "exam-suggestions", Component: ExamSuggestions },
      { path: "marks-generator", Component: MarksGenerator },
      { path: "ai-study", Component: AIStudy },
      { path: "quiz", Component: Quiz },
      { path: "planner", Component: Planner },
      { path: "progress", Component: Progress },
      { path: "community", Component: Community },
      { path: "profile", Component: Profile },
      { path: "settings", Component: Settings },
    ],
  },
]);

