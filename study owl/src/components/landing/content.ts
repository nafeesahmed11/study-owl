/**
 * Landing content — static marketing copy only.
 * Every claim here mirrors a real route/page in src/pages/*. No data fetching,
 * no auth, no business logic. Icons are mapped in the section components.
 */
export const dropdownMenus: Record<string, string[]> = {
  Resources: ["Video Lectures", "Notes & PDFs", "Flashcards", "eBooks", "Practice Sets"],
  "Question Papers": ["Previous Year Papers", "Mock Tests", "Topic-wise Questions", "Solution Keys"],
  "AI Tools": ["AI Doubt Solver", "Marks Generator", "AI Analysis", "Exam Prep"],
  Community: ["Discussion Forum", "Study Groups", "Leaderboard", "Events"],
};

export const valueLabels = [
  "Academic Resources",
  "Question Papers",
  "AI Study Tools",
  "Study Planning",
  "Practice & Quiz",
  "Progress Tracking",
];

export type FeatureItem = { title: string; desc: string };
export type FeatureGroup = { label: string; items: FeatureItem[] };

export const featureGroups: FeatureGroup[] = [
  {
    label: "Academic Resources",
    items: [
      { title: "Academic Resource Library", desc: "Store and organize PDFs, lecture notes, assignments, and reference materials by department, semester, subject, and topic." },
      { title: "Question Paper Archive", desc: "Access a searchable archive of previous year papers, midterms, finals, and model questions — filtered by subject, year, and exam type." },
    ],
  },
  {
    label: "AI Study Tools",
    items: [
      { title: "AI Study Assistant", desc: "Ask academic questions, explain difficult topics, summarize chapters, generate notes, create MCQs, and prepare exam answers." },
      { title: "AI Question Paper Analysis", desc: "Upload past papers and let AI detect repeated questions, topic frequencies, marks distribution, and recurring concepts." },
      { title: "Exam Preparation Suggestions", desc: "Receive AI-generated recommendations on important topics, high-frequency concepts, and revision priorities based on real data." },
      { title: "Marks-Based Answer Generator", desc: "Enter a question and select 2, 3, 5, or 10 marks. Get a structured, exam-ready answer with definitions, examples, and conclusions." },
    ],
  },
  {
    label: "Productivity",
    items: [
      { title: "Smart Study Planner", desc: "Create a personalized day-by-day study plan based on your exam dates, subjects, and weak topics." },
      { title: "Progress Tracking", desc: "Monitor study activity, quiz performance, task completion, and learning consistency over time." },
      { title: "Quiz & Practice", desc: "Test your knowledge with subject-wise quizzes. Get detailed results, topic weakness analysis, and revision recommendations." },
    ],
  },
  {
    label: "Community",
    items: [
      { title: "Academic Community", desc: "Connect with seniors and juniors. Share resources, exam tips, course guidance, and verified academic knowledge." },
    ],
  },
];

export const steps = [
  { step: "01", title: "Collect", desc: "Upload and organize academic resources and question papers by subject, semester, and topic." },
  { step: "02", title: "Analyze", desc: "Use AI to detect repeated questions, topic frequencies, and marks distribution across past papers." },
  { step: "03", title: "Prepare", desc: "Turn insights into study plans, quizzes, structured exam answers, and tracked progress." },
];

export const aiFeatures = [
  { title: "AI Study Chat", desc: "Ask academic questions, explain difficult topics, summarize chapters, generate notes, create MCQs, and prepare exam answers." },
  { title: "AI Analysis", desc: "Upload past papers and let AI detect repeated questions, topic frequencies, marks distribution, and recurring concepts." },
  { title: "Exam Suggestions", desc: "Receive AI-generated recommendations on important topics, high-frequency concepts, and revision priorities based on real data." },
  { title: "Marks Generator", desc: "Enter a question and select 2, 3, 5, or 10 marks. Get a structured, exam-ready answer with definitions, examples, and conclusions." },
];

export type ShowcaseItem = { id: string; title: string; blurb: string; points: string[] };

export const showcase: ShowcaseItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    blurb: "Greeting, KPI stats, quick actions, subject progress, study tasks, recent resources, and AI insights.",
    points: ["47 saved resources", "23 question papers", "78% quiz average", "12-day study streak"],
  },
  {
    id: "ai-analysis",
    title: "AI Analysis",
    blurb: "Select past papers and surface repeated questions, topic frequencies, and marks distribution.",
    points: ["4 DBMS papers selected", "38 questions analyzed", "Normalization at 92%", "5 and 10-mark focus"],
  },
  {
    id: "resources",
    title: "Resources",
    blurb: "Searchable library of PDFs, notes, assignments, and references with verified and saved badges.",
    points: ["PDFs, notes, and assignments", "Verified faculty uploads", "Save items for revision"],
  },
  {
    id: "question-papers",
    title: "Question Papers",
    blurb: "Archive of previous finals, midterms, quizzes, and model papers with subject, year, and exam-type filters.",
    points: ["Finals and midterms", "Subject, year, and exam filters", "Jump straight to AI Analysis"],
  },
  {
    id: "planner",
    title: "Study Planner",
    blurb: "Tasks bucketed by Today, Upcoming, Overdue, and Done with priorities and due dates.",
    points: ["Today and upcoming buckets", "High, medium, and low priorities", "Due dates with overdue flags"],
  },
];
