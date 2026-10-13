import Link from "next/link";
import Image from "next/image";
import { Bell, LogOut, Search } from "lucide-react";

import { logout } from "@/lib/actions/auth";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TopHeaderProps = {
  name: string;
  email: string;
};

export function TopHeader({
  name,
  email,
}: TopHeaderProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/80 bg-background/80 px-4 backdrop-blur-md md:px-6">
      <MobileSidebar />

      <div className="min-w-0 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="ExamScope AI"
            width={28}
            height={28}
            className="size-7 object-contain drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
          />
          <div className="flex items-center gap-1">
            <span className="truncate text-sm font-bold">ExamScope</span>
            <span className="rounded bg-gradient-to-r from-[#00b4d8] to-[#0466c8] px-1 py-0.2 text-[9px] font-bold text-white uppercase">AI</span>
          </div>
        </Link>
      </div>

      <div className="hidden w-full max-w-md md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-[#0466c8]" />

          <Input
            aria-label="Search subjects, questions or topics"
            placeholder="Search subjects, questions or topics..."
            className="h-9 rounded-xl bg-muted/40 pl-9.5 text-sm transition-all focus:bg-background"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative text-muted-foreground hover:bg-[#0466c8]/10 hover:text-[#0466c8]"
        >
          <Bell className="size-4.5" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-[#0466c8] shadow-[0_0_6px_#0466c8]" />
        </Button>

        <div className="flex items-center gap-3 rounded-full border border-border/60 bg-muted/30 py-1 pl-1 pr-3 transition-colors hover:border-[#0466c8]/30">
          <Avatar className="size-7.5 ring-2 ring-[#0466c8]/30 transition-all hover:ring-[#0466c8]">
            <AvatarFallback className="bg-gradient-to-br from-[#0466c8] to-[#023e7d] text-[11px] font-bold text-white">
              {initials || "ST"}
            </AvatarFallback>
          </Avatar>

          <div className="hidden text-left md:block">
            <p className="text-xs font-semibold leading-tight text-foreground">{name}</p>
            <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">
              {email}
            </p>
          </div>
        </div>

        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            title="Sign out"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-4.5" />
          </Button>
        </form>
      </div>
    </header>
  );
}