"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { dashboardNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function MobileSidebar() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent side="left" className="w-72 border-r border-slate-800 bg-[#070a12] p-0 text-slate-200">
        <SheetHeader className="border-b border-slate-800 px-5 py-4">
          <SheetTitle>
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="relative flex size-9 shrink-0 items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="ExamScope AI"
                  width={36}
                  height={36}
                  className="size-9 object-contain drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                />
              </div>

              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold tracking-tight text-white">ExamScope</span>
                  <span className="rounded bg-gradient-to-r from-[#00b4d8] to-[#0466c8] px-1.5 py-0.2 text-[9px] font-bold text-white uppercase">AI</span>
                </div>
                <p className="text-[11px] font-normal text-slate-400">
                  Smart Exam Preparation
                </p>
              </div>
            </Link>
          </SheetTitle>
        </SheetHeader>

        <nav className="space-y-1.5 p-3.5">
          {dashboardNavigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(item.href));

            return (
              <SheetClose
                key={item.href}
                nativeButton={false}
                render={
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0466c8]",
                      isActive
                        ? "bg-gradient-to-r from-[#0466c8] to-[#0353a4] text-white shadow-[0_4px_16px_rgba(4,102,200,0.4)]"
                        : "text-slate-400 hover:bg-white/[0.08] hover:text-white"
                    )}
                  />
                }
              >
                <Icon className={cn("size-4", isActive ? "text-white" : "text-slate-400")} />
                <span>{item.title}</span>
              </SheetClose>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}