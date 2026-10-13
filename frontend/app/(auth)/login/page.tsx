"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { authenticate } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute -top-40 left-1/2 size-96 -translate-x-1/2 rounded-full bg-[#00b4d8]/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 size-80 rounded-full bg-[#0466c8]/10 blur-3xl" />

      <Card className="relative w-full max-w-md border border-border/80 bg-card/90 shadow-[0_20px_50px_-15px_rgba(4,102,200,0.15)] backdrop-blur-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex size-16 items-center justify-center">
            <Image
              src="/logo.png"
              alt="ExamScope AI"
              width={64}
              height={64}
              className="size-16 object-contain drop-shadow-[0_0_16px_rgba(56,189,248,0.55)] transition-transform duration-300 hover:scale-105"
              priority
            />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Welcome back
          </h1>

          <CardDescription className="text-sm">
            Sign in to continue your ExamScope AI study journey.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form action={formAction} className="space-y-4.5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-xs tracking-wide">
                Email Address
              </Label>

              <Input
                id="email"
                name="email"
                type="email"
                placeholder="student@example.com"
                autoComplete="email"
                required
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold text-xs tracking-wide">
                Password
              </Label>

              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                minLength={8}
                required
                className="h-10"
              />
            </div>

            {errorMessage ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {errorMessage}
              </div>
            ) : null}

            <Button
              type="submit"
              className="w-full h-10 font-semibold shadow-md mt-2"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#0466c8] hover:underline underline-offset-4 transition-colors"
            >
              Create account
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}