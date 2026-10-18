"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Target,
  Zap,
  CheckCircle2,
  FileText,
  BrainCircuit,
  Activity,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const DEMO_SUBJECTS = [
  {
    id: "cs",
    name: "Distributed Systems & Cloud",
    code: "CS-402",
    topic: "Raft Consensus & Byzantine Fault Tolerance",
    yield: "96.4%",
    priority: "CRITICAL",
    recurrence: "Found in 4 of last 5 past papers",
    question:
      "Explain the leader election phase in the Raft consensus protocol. Under what condition can split-brain occur, and how does randomized election timeout prevent it?",
    grounding: "Lecture 8 (Distributed Consensus, slide 42-58) • Midterm 2024 Q3",
    marks: "15 Marks",
  },
  {
    id: "med",
    name: "Human Pathology & Oncology",
    code: "MED-301",
    topic: "Mechanisms of Cellular Apoptosis vs Necrosis",
    yield: "94.8%",
    priority: "CRITICAL",
    recurrence: "Featured every year since 2021",
    question:
      "Differentiate between intrinsic and extrinsic apoptotic pathways with specific reference to caspase cascade activation and cytochrome c leakage.",
    grounding: "Robbins Pathologic Basis, Ch. 2, pp. 48-56 • Final 2025 Paper 1",
    marks: "20 Marks",
  },
  {
    id: "phys",
    name: "Advanced Quantum Mechanics",
    code: "PHY-410",
    topic: "Perturbation Theory & Stark Effect in Hydrogen",
    yield: "91.2%",
    priority: "HIGH",
    recurrence: "Alternate year cycle (Predicted for 2026/27)",
    question:
      "Calculate the first-order energy correction for the ground state of a hydrogen atom placed in a uniform electric field epsilon.",
    grounding: "Griffiths QM, Section 6.1 • 2023 Past Paper Section B",
    marks: "12 Marks",
  },
  {
    id: "law",
    name: "Commercial & Corporate Law",
    code: "LAW-205",
    topic: "Directors' Fiduciary Duties & Corporate Opportunity",
    yield: "89.5%",
    priority: "HIGH",
    recurrence: "3 of last 4 exam papers",
    question:
      "Analyze the test applied in Regal (Hastings) Ltd v Gulliver regarding accountability for profits derived from a director's fiduciary position.",
    grounding: "Cases & Materials on Company Law, pp. 312-325 • 2024 Exam Q2",
    marks: "25 Marks",
  },
];

export function HeroInteractive() {
  const [selectedSubject, setSelectedSubject] = useState(DEMO_SUBJECTS[0]);
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <section className="relative min-h-[85vh] w-full overflow-hidden bg-[#05070c] pt-6 pb-14 sm:min-h-[92vh] sm:pt-8 sm:pb-20">
      {/* Background Image Layer with Futuristic Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpg"
          alt="ExamScope AI Neural Globe Background"
          fill
          priority
          className="object-cover object-center opacity-35 filter brightness-90 contrast-110"
        />
        {/* Cinematic gradient washes */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070c] via-[#05070c]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070c] via-[#05070c]/50 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(0,180,216,0.18),transparent_55%)]" />
      </div>

      {/* Decorative Cyber Grid Lines */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Vision & Pitch */}
          <div className="space-y-5 text-center sm:space-y-6 lg:col-span-7 lg:text-left">
            {/* Live Hologram Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00b4d8]/40 bg-[#00b4d8]/10 px-3 py-1.5 backdrop-blur-md sm:gap-2.5 sm:px-4">
              <span className="relative flex size-2 sm:size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#38bdf8] opacity-80" />
                <span className="relative inline-flex size-2 rounded-full bg-[#00b4d8] shadow-[0_0_10px_#38bdf8] sm:size-2.5" />
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-[#38bdf8] uppercase sm:text-xs">
                Zero Guesswork • Verified Course Grounding
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl lg:leading-[1.12]">
              Target Every Exam Topic With{" "}
              <span className="bg-gradient-to-r from-[#38bdf8] via-[#00b4d8] to-[#0466c8] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(56,189,248,0.45)]">
                Predictive Precision.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base lg:mx-0 lg:text-lg">
              Stop drowning in thousands of lecture slides. Upload your syllabus and past papers —
              ExamScope AI analyzes historical exam recurrence, forecasts high-probability exam topics,
              and synthesizes authentic exam questions grounded in your course documents.
            </p>

            {/* Quick Feature Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 sm:gap-3 lg:justify-start">
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-slate-200 backdrop-blur-sm sm:px-3 sm:text-xs">
                <CheckCircle2 className="size-3.5 text-[#38bdf8] sm:size-4" />
                94.2% Prediction Accuracy
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-slate-200 backdrop-blur-sm sm:px-3 sm:text-xs">
                <ShieldCheck className="size-3.5 text-[#38bdf8] sm:size-4" />
                Zero Hallucinations (RAG Grounded)
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-slate-200 backdrop-blur-sm sm:px-3 sm:text-xs">
                <Zap className="size-3.5 text-[#38bdf8] sm:size-4" />
                Instant Practice Generation
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col items-stretch justify-center gap-3 pt-3 sm:flex-row sm:items-center sm:gap-4 lg:justify-start">
              <Link href="/register" className="w-full sm:w-auto">
                <Button className="h-11 w-full rounded-xl bg-gradient-to-r from-[#00b4d8] via-[#0466c8] to-[#023e7d] px-6 text-sm font-semibold text-white shadow-[0_0_30px_rgba(0,180,216,0.45)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(56,189,248,0.7)] sm:h-12 sm:px-8 sm:text-base sm:w-auto">
                  <Sparkles className="mr-2 size-4 text-[#7dd3fc] sm:size-5" />
                  Launch Free Preparation
                  <ArrowRight className="ml-2 size-4 sm:size-5" />
                </Button>
              </Link>

              <Link href="#radar" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-xl border-white/15 bg-white/5 px-6 text-sm font-medium text-white backdrop-blur-md transition-all duration-200 hover:border-[#38bdf8]/50 hover:bg-[#00b4d8]/10 hover:text-[#38bdf8] sm:h-12 sm:px-7 sm:text-base sm:w-auto"
                >
                  <Target className="mr-2 size-4 text-[#38bdf8] sm:size-5" />
                  See How Radar Works
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Live Interactive Scope HUD Display */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Outer Cyan Glow Backing */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#00b4d8]/30 via-[#0466c8]/20 to-[#38bdf8]/40 blur-xl opacity-80" />

              {/* HUD Frame */}
              <div className="relative overflow-hidden rounded-2xl border border-[#00b4d8]/30 bg-[#090d16]/90 p-4 shadow-2xl backdrop-blur-2xl sm:p-5">
                {/* HUD Top Bar */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="relative flex size-6 items-center justify-center rounded-lg bg-[#00b4d8]/20 text-[#38bdf8] ring-1 ring-[#00b4d8]/40 sm:size-7">
                      <Target className="size-3 animate-spin [animation-duration:12s] sm:size-4" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold tracking-wider text-white uppercase sm:text-xs">
                        Active Exam Scope HUD
                      </span>
                      <p className="text-[9px] text-slate-400">Live Prediction Simulation</p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-400 sm:gap-1.5 sm:text-[10px]">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Target Locked
                  </span>
                </div>

                {/* Subject Selector Tabs */}
                <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {DEMO_SUBJECTS.map((sub) => {
                    const isSelected = selectedSubject.id === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setSelectedSubject(sub);
                          setShowAnswer(false);
                        }}
                        className={`rounded-lg px-2 py-1.5 text-[10px] font-semibold whitespace-nowrap transition-all sm:px-2.5 sm:text-xs ${
                          isSelected
                            ? "bg-[#00b4d8] text-[#05070c] shadow-[0_0_12px_rgba(0,180,216,0.5)] font-bold"
                            : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {sub.code}
                      </button>
                    );
                  })}
                </div>

                {/* Scope Target Metric Card */}
                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:mt-4 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-[#38bdf8] sm:text-[11px]">{selectedSubject.name}</p>
                      <h4 className="mt-0.5 text-xs font-bold text-white sm:text-sm">{selectedSubject.topic}</h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block rounded-md bg-[#00b4d8]/20 px-1.5 py-0.5 text-xs font-extrabold text-[#38bdf8] ring-1 ring-[#00b4d8]/40 sm:px-2">
                        {selectedSubject.yield}
                      </span>
                      <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-rose-400">
                        {selectedSubject.priority}
                      </p>
                    </div>
                  </div>

                  {/* Recurrence telemetry bar */}
                  <div className="mt-2.5 flex flex-col gap-1 rounded-lg bg-black/40 px-2.5 py-1.5 text-[10px] text-slate-300 sm:mt-3 sm:flex-row sm:items-center sm:justify-between sm:px-3 sm:text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Activity className="size-3 text-[#00b4d8] sm:size-3.5" />
                      <span className="truncate">{selectedSubject.recurrence}</span>
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 sm:shrink-0 sm:text-[10px]">{selectedSubject.marks}</span>
                  </div>

                  {/* Synthesized Exam Question */}
                  <div className="mt-2.5 rounded-lg border border-[#00b4d8]/20 bg-[#00b4d8]/5 p-2.5 sm:mt-3 sm:p-3">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-bold text-[#38bdf8] uppercase tracking-wider sm:text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <FileText className="size-3 sm:size-3.5" />
                        Synthesized Exam Question
                      </span>
                      <span className="text-[9px] text-slate-400 font-normal normal-case sm:text-[10px]">AI Grounded</span>
                    </div>

                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-200 sm:mt-2 sm:text-xs">
                      &ldquo;{selectedSubject.question}&rdquo;
                    </p>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2 text-[9px] text-slate-400 sm:mt-2.5 sm:text-[10px]">
                      <span className="min-w-0 truncate flex-1">
                        📍 {selectedSubject.grounding}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAnswer(!showAnswer)}
                        className="shrink-0 font-semibold text-[#38bdf8] hover:underline whitespace-nowrap"
                      >
                        {showAnswer ? "Hide Guide" : "View Guide"}
                      </button>
                    </div>

                    {showAnswer && (
                      <div className="mt-2 rounded border border-white/10 bg-black/60 p-2 text-[10px] text-slate-300 sm:mt-2.5 sm:p-2.5 sm:text-[11px]">
                        <p className="font-semibold text-emerald-400">Model Rubric Points:</p>
                        <p className="mt-1 leading-normal text-slate-300">
                          1. Clear definition of Term (3 marks)<br />
                          2. Mechanistic pathway & enzyme cascade (6 marks)<br />
                          3. Contrast with alternate scenario & mitigation (6 marks)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Telemetry Footer */}
                <div className="mt-3 flex items-center justify-between px-1 text-[10px] text-slate-400 sm:mt-3.5 sm:text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <BrainCircuit className="size-3 text-[#00b4d8] sm:size-3.5" />
                    FastAPI Neural Vectorizer
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <Layers className="size-3 text-[#38bdf8] sm:size-3.5" />
                    31,400+ Syllabi Processed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
