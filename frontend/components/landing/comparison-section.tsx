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
    <section id="comparison" className="relative w-full bg-[#070a12] py-16 sm:py-24">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00b4d8]/30 bg-[#00b4d8]/10 px-4 py-1.5">
            <Shield className="size-4 text-[#38bdf8]" />
            <span className="text-xs font-semibold tracking-wider text-[#38bdf8] uppercase">
              The ExamScope Advantage
            </span>
          </div>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Why Generic AI & Cramming{" "}
            <span className="bg-gradient-to-r from-[#38bdf8] to-[#0466c8] bg-clip-text text-transparent">
              Fail Students
            </span>
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base lg:text-lg">
            Generic chatbots don&apos;t know your university&apos;s syllabus or grading rubrics.
            ExamScope AI is purpose-built to target official exam structures.
          </p>
        </div>

        {/* Desktop: Comparison Table (hidden on mobile) */}
        <div className="mt-12 hidden overflow-hidden rounded-2xl border border-white/10 bg-[#05070c]/90 shadow-2xl backdrop-blur-xl sm:mt-16 md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="p-4 text-sm font-semibold text-slate-300 lg:p-5">Capability</th>
                  <th className="p-4 text-sm font-semibold text-slate-400 lg:p-5">Traditional Cramming</th>
                  <th className="p-4 text-sm font-semibold text-slate-400 lg:p-5">Generic Chatbots</th>
                  <th className="p-4 text-sm font-bold text-[#38bdf8] bg-[#00b4d8]/10 border-l border-r border-[#00b4d8]/30 lg:p-5">
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
                    <td className="p-4 font-semibold text-white lg:p-5">{row.feature}</td>
                    <td className="p-4 text-slate-400 lg:p-5">
                      <div className="flex items-start gap-2">
                        <X className="size-4 shrink-0 text-rose-400 mt-0.5" />
                        <span>{row.traditional}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 lg:p-5">
                      <div className="flex items-start gap-2">
                        <X className="size-4 shrink-0 text-amber-400 mt-0.5" />
                        <span>{row.genericAi}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-100 bg-[#00b4d8]/[0.06] border-l border-r border-[#00b4d8]/20 lg:p-5">
                      <div className="flex items-start gap-2">
                        <Check className="size-4 shrink-0 text-[#38bdf8] mt-0.5" />
                        <span className="text-white font-semibold">{row.examscope}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile: Card-based comparison (shown only on mobile) */}
        <div className="mt-8 space-y-4 md:hidden">
          {COMPARISON_ROWS.map((row) => (
            <div
              key={row.feature}
              className="overflow-hidden rounded-2xl border border-white/10 bg-[#05070c]/90 shadow-xl backdrop-blur-xl"
            >
              {/* Feature Header */}
              <div className="border-b border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="text-sm font-bold text-white">{row.feature}</p>
              </div>

              <div className="divide-y divide-white/5 text-sm">
                {/* Traditional */}
                <div className="flex items-start gap-3 px-4 py-3">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-rose-500/10 mt-0.5">
                    <X className="size-3 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Traditional</p>
                    <p className="text-slate-400 text-xs leading-relaxed">{row.traditional}</p>
                  </div>
                </div>

                {/* Generic AI */}
                <div className="flex items-start gap-3 px-4 py-3">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 mt-0.5">
                    <X className="size-3 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Generic AI</p>
                    <p className="text-slate-400 text-xs leading-relaxed">{row.genericAi}</p>
                  </div>
                </div>

                {/* ExamScope */}
                <div className="flex items-start gap-3 bg-[#00b4d8]/[0.06] px-4 py-3">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#00b4d8]/20 mt-0.5">
                    <Check className="size-3 text-[#38bdf8]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#38bdf8] mb-0.5 flex items-center gap-1">
                      <Sparkles className="size-3" /> ExamScope AI
                    </p>
                    <p className="text-white font-semibold text-xs leading-relaxed">{row.examscope}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
