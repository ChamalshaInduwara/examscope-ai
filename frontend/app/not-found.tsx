import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <p className="text-sm font-semibold text-primary">404</p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Page not found
        </h1>

        <p className="mt-4 text-muted-foreground">
          The page you are looking for does not exist.
        </p>

        <Button
          className="mt-6"
          nativeButton={false}
          render={<Link href="/dashboard" />}
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
