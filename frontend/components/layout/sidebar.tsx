"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { dashboardNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 flex-col border-r border-slate-800/80 bg-[#070a12] text-slate-200 lg:flex">
      <div className="flex h-16 items-center border-b border-slate-800/80 px-5">
        <Link href="/dashboard" className="group flex items-center gap-3">
          <div className="relative flex size-10 shrink-0 items-center justify-center transition-all duration-300 group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="ExamScope AI"
              width={40}
              height={40}
              className="size-10 object-contain drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]"
              priority
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-white">ExamScope</span>
              <span className="rounded bg-gradient-to-r from-[#00b4d8] to-[#0466c8] px-1.5 py-0.2 text-[9px] font-bold tracking-wider text-white uppercase shadow-xs">AI</span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">
              Smart Exam Preparation
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1.5 p-3.5 overflow-y-auto">
        {dashboardNavigation.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0466c8]",
                isActive
                  ? "bg-gradient-to-r from-[#0466c8] to-[#0353a4] text-white shadow-[0_4px_16px_rgba(4,102,200,0.4)]"
                  : "text-slate-400 hover:bg-white/[0.08] hover:text-white hover:translate-x-1"
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-all duration-200",
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-[#388bfd] group-hover:scale-110"
                )}
              />
              <span className="truncate">{item.title}</span>
              {isActive && (
                <span className="ml-auto size-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800/80 p-3.5">
        <div className="relative overflow-hidden rounded-xl border border-[#0466c8]/30 bg-gradient-to-br from-[#0466c8]/15 via-white/[0.03] to-transparent p-3.5 backdrop-blur-sm transition-all duration-300 hover:border-[#0466c8]/60 hover:shadow-[0_0_20px_rgba(4,102,200,0.2)]">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0466c8] opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-[#0466c8]"></span>
            </span>
            <p className="text-xs font-semibold text-white tracking-wide">ExamScope Engine</p>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
            AI-powered exam prediction, subject analytics & tailored revision.
          </p>
        </div>
      </div>
    </aside>
  );
}