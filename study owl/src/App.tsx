import { Agentation } from "agentation";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { IntegrationProvider } from "./context/IntegrationContext";

export default function App() {
  return (
    <AuthProvider>
      {/* Sits inside AuthProvider because the integration is scoped to the
          signed-in student (the OAuth round-trip is bound to their user id). */}
      <IntegrationProvider>
        <RouterProvider router={router} />
        {process.env.NODE_ENV === "development" && (
          <Agentation endpoint="http://localhost:4747" />
        )}
      </IntegrationProvider>
    </AuthProvider>
  );
}


