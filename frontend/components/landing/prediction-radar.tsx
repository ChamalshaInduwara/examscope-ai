"use client";

import { Target, Cpu, TrendingUp, BookOpen, Crosshair, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const RADAR_STEPS = [
  {
    step: "01",
    title: "Deep Material Ingestion",
    subtitle: "OCR & Document Embedding",
    description:
      "Upload past papers, course outlines, and slide decks. ExamScope AI decomposes documents into semantic chunks and indexes key topic boundaries without missing equations or diagrams.",
    icon: BookOpen,
    tag: "Multi-Format Support",
  },
  {
    step: "02",
    title: "Exam Recurrence Modeling",
    subtitle: "Cyclical Pattern Detection",
    description:
      "Our AI algorithms correlate topics across consecutive exam years, isolating repeating subtopics, cyclical question structures, and mark-weight distribution trends.",
    icon: TrendingUp,
    tag: "94%+ Correlation",
  },
  {
    step: "03",
    title: "Evidence-Grounded Question Synthesis",
    subtitle: "MCQ, Structured & Essay Modes",
    description:
      "Generate questions calibrated to the exact difficulty, cognitive depth (Bloom's taxonomy), and formatting of your university or board exam, with verbatim source citations.",
    icon: Cpu,
    tag: "Strict Grounding",
  },
  {
    step: "04",
    title: "Adaptive Mock Simulator",
    subtitle: "Timed Exams & Real-Time Rubrics",
    description:
      "Simulate authentic exam sessions under strict time limits. Receive instant grading against official marking rubrics and pinpoint weak topics before exam day.",
    icon: Target,
    tag: "Real-time Scoring",
  },
];

export function PredictionRadar() {
  return (
    <section id="radar" className="relative w-full overflow-hidden bg-[#070a12] py-16 sm:py-24">
      {/* Background radial cyan glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[400px] rounded-full bg-[#00b4d8]/10 blur-[130px] sm:size-[650px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00b4d8]/30 bg-[#00b4d8]/10 px-4 py-1.5">
            <Crosshair className="size-4 text-[#38bdf8]" />
            <span className="text-xs font-semibold tracking-wider text-[#38bdf8] uppercase">
              The ExamScope Radar Engine
            </span>
          </div>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            How The Prediction Engine{" "}
            <span className="bg-gradient-to-r from-[#38bdf8] to-[#0466c8] bg-clip-text text-transparent">
              Scans & Targets
            </span>{" "}
            Your Exams
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base lg:text-lg">
            Traditional studying leaves you guessing what might appear. ExamScope AI uses
            deterministic document grounding and probabilistic trend analysis to give you a definitive study roadmap.
          </p>
        </div>

        {/* Radar Graphic & Step Cards Layout */}
        <div className="mt-12 grid items-center gap-8 sm:mt-16 sm:gap-12 lg:grid-cols-12">
          {/* Visual Radar Simulation Card */}
          <div className="relative lg:col-span-5">
            <div className="relative mx-auto aspect-square max-w-xs overflow-hidden rounded-3xl border border-[#00b4d8]/30 bg-gradient-to-b from-white/[0.04] to-black/80 p-4 shadow-2xl backdrop-blur-xl sm:max-w-md sm:p-6">
              {/* Radar Grid Rings */}
              <div className="relative flex h-full w-full items-center justify-center">
                {/* Outermost ring */}
                <div className="absolute size-48 rounded-full border border-[#00b4d8]/20 sm:size-72" />
                {/* Middle ring */}
                <div className="absolute size-36 rounded-full border border-[#00b4d8]/30 sm:size-52" />
                {/* Inner ring */}
                <div className="absolute size-24 rounded-full border border-[#00b4d8]/40 sm:size-32" />
                {/* Innermost ring */}
                <div className="absolute size-10 rounded-full border border-[#00b4d8]/60 bg-[#00b4d8]/10 shadow-[0_0_20px_rgba(56,189,248,0.5)] sm:size-14" />

                {/* Radar Crosshairs */}
                <div className="absolute h-full w-[1px] bg-[#00b4d8]/25" />
                <div className="absolute w-full h-[1px] bg-[#00b4d8]/25" />

                {/* Rotating Scanning Radar Sweep Line */}
                <div className="absolute size-48 rounded-full animate-radar-sweep pointer-events-none sm:size-72">
                  <div className="h-1/2 w-1/2 origin-bottom-right bg-gradient-to-br from-transparent via-[#00b4d8]/15 to-[#38bdf8]/40 rounded-tl-full" />
                </div>

                {/* Blips / Targeted Topics with Glowing Badges */}
                <div className="absolute top-8 right-10 flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-950/80 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.4)] sm:top-12 sm:right-16 sm:gap-1.5 sm:px-2 sm:text-[10px]">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Consensus (96%)
                </div>

                <div className="absolute bottom-10 left-6 flex items-center gap-1 rounded-full border border-sky-400/40 bg-sky-950/80 px-1.5 py-0.5 text-[9px] font-bold text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.4)] sm:bottom-16 sm:left-10 sm:gap-1.5 sm:px-2 sm:text-[10px]">
                  <span className="size-1.5 rounded-full bg-sky-400" />
                  Apoptosis (94%)
                </div>

                <div className="absolute top-20 left-8 flex items-center gap-1 rounded-full border border-indigo-400/40 bg-indigo-950/80 px-1.5 py-0.5 text-[9px] font-bold text-indigo-300 sm:top-28 sm:left-12 sm:gap-1.5 sm:px-2 sm:text-[10px]">
                  <span className="size-1.5 rounded-full bg-indigo-400" />
                  Stark Effect (91%)
                </div>

                <div className="absolute bottom-8 right-8 flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-950/80 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 sm:bottom-12 sm:right-14 sm:gap-1.5 sm:px-2 sm:text-[10px]">
                  <span className="size-1.5 rounded-full bg-amber-400" />
                  Fiduciary (89%)
                </div>
              </div>

              {/* Bottom live stats overlay */}
              <div className="absolute inset-x-4 bottom-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/70 px-3 py-2 backdrop-blur-md sm:inset-x-6 sm:bottom-5 sm:px-4 sm:py-2.5">
                <span className="text-[10px] font-semibold text-slate-300 sm:text-[11px]">Target Resolution</span>
                <span className="text-[10px] font-bold text-[#38bdf8] sm:text-xs">Sub-Module Precision</span>
              </div>
            </div>
          </div>

          {/* 4 Steps Column */}
          <div className="space-y-3 sm:space-y-4 lg:col-span-7">
            {RADAR_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-all duration-300 hover:border-[#00b4d8]/40 hover:bg-white/[0.04] hover:shadow-[0_8px_25px_-5px_rgba(0,180,216,0.15)] sm:p-5"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Step Number & Icon */}
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#00b4d8]/20 to-[#0466c8]/30 text-[#38bdf8] ring-1 ring-[#00b4d8]/40 transition-transform duration-300 group-hover:scale-110 sm:size-12">
                      <Icon className="size-5 sm:size-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Phase label + title on separate lines for mobile, same row for sm+ */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-xs font-mono font-bold text-[#38bdf8]">
                          PHASE {step.step}
                        </span>
                        <h3 className="text-sm font-bold text-white group-hover:text-[#38bdf8] transition-colors sm:text-base">
                          {step.title}
                        </h3>
                        <span className="ml-auto rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-300 sm:px-2.5">
                          {step.tag}
                        </span>
                      </div>

                      <p className="mt-1.5 text-xs leading-relaxed text-slate-300 sm:text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA bar */}
        <div className="mt-10 flex items-center justify-center sm:mt-14">
          <Link href="/register" className="w-full max-w-sm sm:w-auto sm:max-w-none">
            <Button className="h-11 w-full rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#0466c8] px-6 text-sm font-semibold text-white shadow-[0_0_20px_rgba(0,180,216,0.35)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] sm:h-auto sm:w-auto sm:px-6">
              Experience The Radar on Your Course Materials
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
