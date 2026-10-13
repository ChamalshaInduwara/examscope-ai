"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Registration failed.");
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Unable to create your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute -top-40 left-1/2 size-96 -translate-x-1/2 rounded-full bg-[#0466c8]/15 blur-3xl" />
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
            Create account
          </h1>

          <CardDescription className="text-sm">
            Start organizing subjects and preparing smarter for your exams.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold text-xs tracking-wide">Full name</Label>

              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-xs tracking-wide">Email</Label>

              <Input
                id="email"
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold text-xs tracking-wide">Password</Label>

              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-semibold text-xs tracking-wide">
                Confirm password
              </Label>

              <Input
                id="confirmPassword"
                type="password"
                placeholder="Enter password again"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                required
                minLength={8}
                className="h-10"
              />
            </div>

            {error ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            ) : null}

            <Button
              type="submit"
              className="w-full h-10 font-semibold shadow-md mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#0466c8] hover:underline underline-offset-4 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}