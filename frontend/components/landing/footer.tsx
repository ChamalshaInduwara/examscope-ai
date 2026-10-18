import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#04060a] py-12 text-slate-400 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-5 sm:gap-10">
          {/* Brand info */}
          <div className="space-y-4 sm:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative flex size-9 items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="ExamScope AI Logo"
                  width={36}
                  height={36}
                  className="size-9 object-contain drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-white tracking-tight">ExamScope</span>
                <span className="rounded bg-gradient-to-r from-[#00b4d8] to-[#0466c8] px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                  AI
                </span>
              </div>
            </Link>

            <p className="max-w-sm text-xs leading-relaxed text-slate-400">
              ExamScope AI empowers students with probabilistic past-paper trend analysis,
              deterministic document grounding, and authentic practice exam generation.
            </p>

            <p className="text-[11px] text-slate-500">
              © {new Date().getFullYear()} ExamScope AI. All rights reserved.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:col-span-2 sm:grid-cols-3 md:col-span-3 md:gap-8">
            {/* Product Links */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-white">Platform</p>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="#radar" className="hover:text-[#38bdf8] transition-colors">
                    Prediction Radar
                  </Link>
                </li>
                <li>
                  <Link href="/generate" className="hover:text-[#38bdf8] transition-colors">
                    Question Generator
                  </Link>
                </li>
                <li>
                  <Link href="/mock-exams" className="hover:text-[#38bdf8] transition-colors">
                    Timed Mock Exams
                  </Link>
                </li>
                <li>
                  <Link href="/analysis" className="hover:text-[#38bdf8] transition-colors">
                    Past Paper Analytics
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-white">Resources</p>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="#comparison" className="hover:text-[#38bdf8] transition-colors">
                    Comparison Matrix
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-[#38bdf8] transition-colors">
                    FAQ & Methodology
                  </Link>
                </li>
                <li>
                  <Link href="/study-assistant" className="hover:text-[#38bdf8] transition-colors">
                    Study Assistant
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-white">Get Started</p>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/login" className="hover:text-[#38bdf8] transition-colors">
                    Student Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-[#38bdf8] transition-colors">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[#38bdf8] transition-colors">
                    Student Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
