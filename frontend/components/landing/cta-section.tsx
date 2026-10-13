import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#05070c] py-28">
      {/* Background with Ambient Glow Cones */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpg"
          alt="ExamScope AI Study Globe"
          fill
          className="object-cover object-bottom opacity-20 filter brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070c] via-[#05070c]/80 to-[#05070c]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,180,216,0.22),transparent_70%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Glowing Logo */}
        <div className="relative mx-auto mb-6 flex size-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#00b4d8]/30 blur-xl animate-pulse" />
          <Image
            src="/logo.png"
            alt="ExamScope AI"
            width={72}
            height={72}
            className="relative size-18 object-contain drop-shadow-[0_0_24px_rgba(56,189,248,0.7)]"
          />
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Ready To Stop Cramming{" "}
          <span className="bg-gradient-to-r from-[#38bdf8] via-[#00b4d8] to-[#0466c8] bg-clip-text text-transparent">
            In The Dark?
          </span>
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          Join thousands of high-performing students who use ExamScope AI to predict high-yield
          topics, generate practice exams, and achieve top grades with evidence-grounded revision.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/register">
            <Button className="h-13 rounded-xl bg-gradient-to-r from-[#00b4d8] via-[#0466c8] to-[#023e7d] px-9 text-base font-bold text-white shadow-[0_0_30px_rgba(0,180,216,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_45px_rgba(56,189,248,0.7)]">
              <Sparkles className="mr-2 size-5 text-[#7dd3fc]" />
              Start Studying Free Now
              <ArrowRight className="ml-2 size-5" />
            </Button>
          </Link>

          <Link href="/login">
            <Button
              variant="outline"
              className="h-13 rounded-xl border-white/20 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-md hover:border-[#38bdf8]/50 hover:bg-[#00b4d8]/10 hover:text-[#38bdf8]"
            >
              Sign In To Account
            </Button>
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-[#38bdf8]" />
            Free to start
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-[#38bdf8]" />
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-[#38bdf8]" />
            Instant syllabus upload
          </span>
        </div>
      </div>
    </section>
  );
}
