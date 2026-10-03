import { useNavigate } from "react-router";
import { Btn } from "../ui";
import { Reveal } from "./Reveal";

/**
 * FinalCTA — closing call to action. Destinations are unchanged:
 * primary navigates to /register, secondary navigates to /login.
 */
export function FinalCTA() {
  const navigate = useNavigate();
  return (
    <section aria-labelledby="landing-cta-title">
      <div className="landing-section" style={{ paddingTop: "64px", paddingBottom: "64px", textAlign: "center" }}>
        <Reveal>
          <div style={{ maxWidth: 600, margin: "0px auto" }}>
            <img src="/assets/ce79b.svg" alt="Study Owl AI" style={{ height: "48px", marginBottom: "20px" }} />
            <h2 id="landing-cta-title" className="landing-h2" style={{ width: "100%", textAlign: "center" }}>
              Start your academic journey today.
            </h2>
            <p className="landing-sub" style={{ width: "100%", textAlign: "center", marginBottom: "32px" }}>
              Join thousands of students who use Study Owl AI to study smarter, prepare better, and achieve more.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Btn size="lg" onClick={() => navigate("/register")}>Create Free Account</Btn>
              <Btn size="lg" variant="secondary" onClick={() => navigate("/login")}>Sign In</Btn>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
