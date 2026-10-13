import { Check, X, Shield, Sparkles } from "lucide-react";

const COMPARISON_ROWS = [
  {
    feature: "Document-Grounded Knowledge",
    traditional: "Vague, relies on general Internet knowledge",
    genericAi: "Prone to hallucinations & unverified sources",
    examscope: "100% Grounded in your uploaded syllabus & slides",
  },
  {
    feature: "Historical Exam Trend Radar",
    traditional: "Manual counting of past paper topics",
    genericAi: "No historical exam dataset correlation",
    examscope: "Automated recurrence algorithm across 5-10 years",
  },
  {
    feature: "Authentic Question Formats",
    traditional: "Scattered textbook review exercises",
    genericAi: "Simple, generic multiple-choice questions",
    examscope: "Real past-paper grade multi-part problems & essays",
  },
  {
    feature: "Mark-Scheme Diagnostic Rubrics",
    traditional: "Must wait for professor or tutor feedback",
    genericAi: "Generic text summary without marking points",
    examscope: "Point-by-point rubric criteria & score allocation",
  },
  {
    feature: "Study Efficiency & Speed",
    traditional: "80+ hours reading low-yield material",
    genericAi: "Chatting without a focused structured plan",
    examscope: "10x Faster revision targeted at top 80% mark zones",
  },
];

export function ComparisonSection() {
  return (
    <section id="comparison" className="relative w-full bg-[#070a12] py-24">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00b4d8]/30 bg-[#00b4d8]/10 px-4 py-1.5">
            <Shield className="size-4 text-[#38bdf8]" />
            <span className="text-xs font-semibold tracking-wider text-[#38bdf8] uppercase">
              The ExamScope Advantage
            </span>
          </div>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Why Generic AI & Cramming{" "}
            <span className="bg-gradient-to-r from-[#38bdf8] to-[#0466c8] bg-clip-text text-transparent">
              Fail Students
            </span>
          </h2>

          <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
            Generic chatbots don&apos;t know your university&apos;s syllabus or grading rubrics.
            ExamScope AI is purpose-built to target official exam structures.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="mt-16 overflow-hidden rounded-2xl border border-white/10 bg-[#05070c]/90 shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="p-5 text-sm font-semibold text-slate-300">Capability</th>
                  <th className="p-5 text-sm font-semibold text-slate-400">Traditional Cramming</th>
                  <th className="p-5 text-sm font-semibold text-slate-400">Generic Chatbots</th>
                  <th className="p-5 text-sm font-bold text-[#38bdf8] bg-[#00b4d8]/10 border-l border-r border-[#00b4d8]/30">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="size-4" />
                      ExamScope AI
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-5 font-semibold text-white">{row.feature}</td>
                    <td className="p-5 text-slate-400">
                      <div className="flex items-center gap-2">
                        <X className="size-4 shrink-0 text-rose-400" />
                        <span>{row.traditional}</span>
                      </div>
                    </td>
                    <td className="p-5 text-slate-400">
                      <div className="flex items-center gap-2">
                        <X className="size-4 shrink-0 text-amber-400" />
                        <span>{row.genericAi}</span>
                      </div>
                    </td>
                    <td className="p-5 font-medium text-slate-100 bg-[#00b4d8]/[0.06] border-l border-r border-[#00b4d8]/20">
                      <div className="flex items-center gap-2">
                        <Check className="size-4 shrink-0 text-[#38bdf8]" />
                        <span className="text-white font-semibold">{row.examscope}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
