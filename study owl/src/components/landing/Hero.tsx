import { useNavigate } from "react-router";
import { Btn } from "../ui";
import { Reveal } from "./Reveal";
import { DashboardPreview } from "./DashboardPreview";

/**
 * Hero — two-column: copy on the left, a real dashboard-style product preview
 * on the right (replaces the old full-width video card). CTA destinations are
 * unchanged: "Get Started — It's Free" navigates to /register and
 * "Explore Features" scrolls to #features.
 */
export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="landing-hero" aria-labelledby="landing-hero-title">
      <div className="landing-hero-grid">
        <Reveal>
          <span className="landing-eyebrow">Study Owl AI — Academic Platform</span>
          <h1 id="landing-hero-title" className="landing-hero-title">
            Your Entire Academic Life, In One Place.
          </h1>
          <p className="landing-hero-lead">
            Store resources, find previous question papers, study with AI,
            practice with quizzes, plan your studies, track progress, and share
            academic knowledge.
          </p>
          <div className="landing-hero-ctas">
            <Btn size="lg" onClick={() => navigate("/register")}>
              Get Started — It&apos;s Free
            </Btn>
            <Btn
              size="lg"
              variant="secondary"
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Explore Features
            </Btn>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <DashboardPreview />
        </Reveal>
      </div>
    </section>
  );
}
