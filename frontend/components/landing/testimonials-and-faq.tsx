"use client";

import { useState } from "react";
import { Star, ChevronDown, MessageSquareQuote } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "ExamScope AI predicted 7 out of 9 topics that appeared on our Final Pathology paper. Having questions with exact source citations took my grade from a B- to an A+.",
    name: "Dr. Amanda K.",
    role: "Final Year Medical Student",
    metric: "+24% Grade Jump",
  },
  {
    quote:
      "Instead of re-reading 400 pages of distributed systems slides, I generated practice questions from our syllabus. The mock exam scoring was identical to our professor's rubric.",
    name: "Kevin Chen",
    role: "Computer Science Major",
    metric: "3x Study Speed",
  },
  {
    quote:
      "The recurrence engine is mind-blowing. It picked up cyclical questions that appeared in 2021 and 2023, and they were verbatim on our 2025 Corporate Law midterm.",
    name: "Soraya V.",
    role: "LL.B Law Candidate",
    metric: "First Class Honors",
  },
];

const FAQS = [
  {
    q: "How does ExamScope AI predict exam questions without hallucinating?",
    a: "Unlike generic chatbots, ExamScope AI utilizes a deterministic Retrieval-Augmented Generation (RAG) vector database tied specifically to the syllabus documents and past papers you upload. It extracts historical patterns and only synthesizes questions that are directly cited in your verified course materials.",
  },
  {
    q: "What file formats can I upload for my course?",
    a: "You can upload PDF past papers, lecture slides in PPTX or PDF format, Microsoft Word (DOCX) study guides, and plain text (TXT) syllabus outlines up to 20MB per document.",
  },
  {
    q: "Can I generate different types of questions (MCQ, Essays, Structured)?",
    a: "Yes! ExamScope AI supports Multiple Choice Questions (with distractor explanations), Short Answer problems, Multipart Structured questions with mark allocations, and Comprehensive Essay questions complete with grading rubrics.",
  },
  {
    q: "Are my uploaded university materials and notes private?",
    a: "Yes. All uploaded files and generated revision records are strictly private to your account. Your course materials are never shared or used to train public language models.",
  },
];

export function TestimonialsAndFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section id="faq" className="relative w-full bg-[#05070c] py-24">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Testimonials */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00b4d8]/30 bg-[#00b4d8]/10 px-4 py-1.5">
            <MessageSquareQuote className="size-4 text-[#38bdf8]" />
            <span className="text-xs font-semibold tracking-wider text-[#38bdf8] uppercase">
              Proven Student Results
            </span>
          </div>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Trusted By Top-Scoring Students
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-[#00b4d8]/40 hover:-translate-y-1"
            >
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-400" />
                ))}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-300 italic">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <div>
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>

                <span className="rounded-full bg-[#00b4d8]/15 px-2.5 py-1 text-xs font-extrabold text-[#38bdf8] ring-1 ring-[#00b4d8]/30">
                  {t.metric}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mx-auto mt-28 max-w-3xl">
          <div className="text-center">
            <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Frequently Asked Questions
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Everything you need to know about ExamScope AI&apos;s predictive technology.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition-colors hover:border-white/20"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`size-5 text-[#38bdf8] transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-white/5 bg-black/40 px-5 py-4 text-xs sm:text-sm leading-relaxed text-slate-300">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
