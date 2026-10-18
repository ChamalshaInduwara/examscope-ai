import {
  FileText,
  BrainCircuit,
  GraduationCap,
  MessageCircleQuestion,
  BarChart3,
  Sparkles,
  BookMarked,
} from "lucide-react";

const FEATURES = [
  {
    title: "Past Paper Pattern Analysis",
    description:
      "Detect topic frequency, mark distribution, and recurring exam structures across multiple years of past exam papers.",
    icon: FileText,
    badge: "Pattern Analytics",
  },
  {
    title: "AI Question Generator",
    description:
      "Generate custom MCQs, short answers, structured problems, and essays strictly grounded in your syllabus notes.",
    icon: Sparkles,
    badge: "Strict Grounding",
  },
  {
    title: "Predictive Topic Scope",
    description:
      "Calculate high-yield probability rankings for every topic so you know exactly which 20% of content drives 80% of exam marks.",
    icon: BrainCircuit,
    badge: "Predictive AI",
  },
  {
    title: "Full-Length Mock Exams",
    description:
      "Practice timed realistic mock exams matching your university or board format with automated mark-scheme grading.",
    icon: GraduationCap,
    badge: "Exam Simulation",
  },
  {
    title: "Evidence-Based Study Assistant",
    description:
      "Chat directly with your course materials. Ask complex conceptual questions and get instant answers with slide & page citations.",
    icon: MessageCircleQuestion,
    badge: "Course Q&A",
  },
  {
    title: "Readiness & Gap Analytics",
    description:
      "Track your mastery index across subjects, identify cognitive blind spots, and measure your expected exam score.",
    icon: BarChart3,
    badge: "Performance Index",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="relative w-full bg-[#05070c] py-16 sm:py-24">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00b4d8]/30 bg-[#00b4d8]/10 px-4 py-1.5">
            <BookMarked className="size-4 text-[#38bdf8]" />
            <span className="text-xs font-semibold tracking-wider text-[#38bdf8] uppercase">
              Engineered For Academic Excellence
            </span>
          </div>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Everything You Need To{" "}
            <span className="bg-gradient-to-r from-[#38bdf8] via-[#00b4d8] to-[#0466c8] bg-clip-text text-transparent">
              Outperform Your Class
            </span>
          </h2>

          <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
            Built for university students, high school candidates, and professional certification test-takers who want maximum score with minimal wasted time.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 sm:mt-16 sm:gap-6 lg:grid-cols-3">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#00b4d8]/40 hover:shadow-[0_12px_30px_-10px_rgba(0,180,216,0.2)]"
              >
                {/* Subtle top card glow */}
                <div className="absolute top-0 right-0 h-28 w-28 -mr-6 -mt-6 rounded-full bg-[#00b4d8]/10 blur-2xl group-hover:bg-[#38bdf8]/20 transition-all" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-[#00b4d8]/10 text-[#38bdf8] ring-1 ring-[#00b4d8]/30 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#00b4d8] group-hover:text-black group-hover:shadow-[0_0_20px_rgba(56,189,248,0.5)]">
                      <Icon className="size-6" />
                    </div>

                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-white group-hover:text-[#38bdf8] transition-colors">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
