"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Menu, X, Sparkles, LogIn, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

type NavbarProps = {
  isLoggedIn?: boolean;
};

export function Navbar({ isLoggedIn = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#05070c]/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:h-20 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex size-11 shrink-0 items-center justify-center transition-all duration-300 group-hover:scale-105">
            <div className="absolute inset-0 rounded-full bg-[#00b4d8]/20 blur-md group-hover:bg-[#38bdf8]/35 transition-all" />
            <Image
              src="/logo.png"
              alt="ExamScope AI Logo"
              width={44}
              height={44}
              className="relative size-11 object-contain drop-shadow-[0_0_12px_rgba(56,189,248,0.6)]"
              priority
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-[#38bdf8] transition-colors sm:text-xl">
                ExamScope
              </span>
              <span className="rounded bg-gradient-to-r from-[#00b4d8] to-[#0466c8] px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-white uppercase shadow-[0_0_10px_rgba(4,102,200,0.5)]">
                AI
              </span>
            </div>
            <span className="hidden text-[10px] font-medium tracking-wide text-slate-400 sm:block">
              Exam Intelligence Engine
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="#features"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
          >
            How It Works
          </Link>
          <Link
            href="#radar"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
          >
            Exam Radar
          </Link>
          <Link
            href="#comparison"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
          >
            Comparison
          </Link>
          <Link
            href="#faq"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
          >
            FAQ
          </Link>
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button className="h-10 rounded-xl bg-gradient-to-r from-[#00b4d8] via-[#0466c8] to-[#023e7d] px-5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(4,102,200,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(56,189,248,0.6)]">
                <LayoutDashboard className="mr-2 size-4" />
                Go to Dashboard
                <ArrowRight className="ml-1.5 size-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="h-10 text-slate-300 hover:bg-white/[0.08] hover:text-white"
                >
                  <LogIn className="mr-1.5 size-4" />
                  Sign In
                </Button>
              </Link>

              <Link href="/register">
                <Button className="h-10 rounded-xl bg-gradient-to-r from-[#00b4d8] via-[#0466c8] to-[#023e7d] px-5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(4,102,200,0.45)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_28px_rgba(56,189,248,0.6)] active:scale-100">
                  <Sparkles className="mr-1.5 size-4 text-[#7dd3fc]" />
                  Get Started Free
                  <ArrowRight className="ml-1.5 size-4" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 md:hidden hover:text-white"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-[#070a12]/95 px-5 py-6 backdrop-blur-2xl md:hidden">
          <nav className="flex flex-col space-y-4">
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-300 hover:text-[#38bdf8]"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-300 hover:text-[#38bdf8]"
            >
              How It Works
            </Link>
            <Link
              href="#radar"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-300 hover:text-[#38bdf8]"
            >
              Exam Radar
            </Link>
            <Link
              href="#comparison"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-300 hover:text-[#38bdf8]"
            >
              Comparison
            </Link>
            <Link
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-300 hover:text-[#38bdf8]"
            >
              FAQ
            </Link>
          </nav>

          <div className="mt-6 flex flex-col gap-3 pt-4 border-t border-white/10">
            {isLoggedIn ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-[#00b4d8] to-[#0466c8] text-white">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-white/15 text-white">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-[#00b4d8] to-[#0466c8] text-white shadow-md">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
