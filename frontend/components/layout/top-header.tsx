import { Bell, Search } from "lucide-react";

import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TopHeader() {
  return (
    <header className="flex h-16 items-center gap-3 border-b bg-background px-4 md:px-6">
      <MobileSidebar />

      <div className="min-w-0 lg:hidden">
        <p className="truncate text-sm font-semibold">ExamScope AI</p>
      </div>

      <div className="hidden w-full max-w-md md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search subjects, questions or topics..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-5" />
        </Button>

        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>ST</AvatarFallback>
          </Avatar>

          <div className="hidden text-sm md:block">
            <p className="font-medium">Student</p>
            <p className="text-xs text-muted-foreground">
              student@example.com
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}