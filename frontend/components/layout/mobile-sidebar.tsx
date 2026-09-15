"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, Menu } from "lucide-react";

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

      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BrainCircuit className="size-5" />
              </div>

              <div className="text-left">
                <p className="text-base font-semibold">ExamScope AI</p>
                <p className="text-xs font-normal text-muted-foreground">
                  Smart Exam Preparation
                </p>
              </div>
            </Link>
          </SheetTitle>
        </SheetHeader>

        <nav className="space-y-1 p-4">
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
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    />
  }
>
  <Icon className="size-4" />
  <span>{item.title}</span>
</SheetClose>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}