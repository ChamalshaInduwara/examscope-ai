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
    <header className="flex h-16 items-center gap-3 border-b bg-background px-4 md:px-6">
      <MobileSidebar />

      <div className="min-w-0 lg:hidden">
        <p className="truncate text-sm font-semibold">
          ExamScope AI
        </p>
      </div>

      <div className="hidden w-full max-w-md md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            aria-label="Search subjects, questions or topics"
            placeholder="Search subjects, questions or topics..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
        </Button>

        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {initials || "ST"}
            </AvatarFallback>
          </Avatar>

          <div className="hidden text-sm md:block">
            <p className="font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">
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
          >
            <LogOut className="size-5" />
          </Button>
        </form>
      </div>
    </header>
  );
}