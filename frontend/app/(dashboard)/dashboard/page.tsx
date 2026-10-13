import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  FileQuestion,
  FileText,
  GraduationCap,
  Sparkles,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardData } from "@/lib/actions/dashboard";

function formatRelativeTime(date: Date) {
  const now = Date.now();
  const difference = now - date.getTime();

  const minutes = Math.floor(
    difference / (1000 * 60),
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString();
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const overviewCards = [
    {
      title: "My Subjects",
      value: data.overview.subjects,
      description: "Active academic modules",
      icon: BookOpen,
      href: "/subjects",
    },
    {
      title: "Uploaded Files",
      value: data.overview.documents,
      description: "Syllabi & past papers",
      icon: Upload,
      href: "/uploads",
    },
    {
      title: "Predictions",
      value: data.overview.predictions,
      description: "AI pattern forecasts",
      icon: BrainCircuit,
      href: "/predictions",
    },
    {
      title: "Practice Questions",
      value: data.overview.generatedQuestions,
      description: "Generated exam questions",
      icon: FileQuestion,
      href: "/generate",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-background p-6 shadow-sm transition-all duration-300 hover:border-[#0466c8]/30 sm:p-8">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 size-48 rounded-full bg-[#0466c8]/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0466c8]/20 bg-[#0466c8]/10 px-3 py-1 text-xs font-semibold text-[#0466c8]">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0466c8] opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-[#0466c8]"></span>
              </span>
              ExamScope AI Intelligence
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Study Dashboard
            </h1>

            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Analyze past papers, discover high-yield exam predictions, and generate tailored practice questions grounded in your syllabus.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/uploads">
              <Button className="shadow-md">
                <Upload className="size-4" />
                Upload Papers
              </Button>
            </Link>

            <Link href="/generate">
              <Button variant="outline">
                <Sparkles className="size-4 text-[#0466c8]" />
                Generate Questions
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link key={card.title} href={card.href} className="group block focus-visible:outline-none">
              <Card className="h-full border border-border/80 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#0466c8]/50 hover:shadow-[0_12px_28px_-8px_rgba(4,102,200,0.2)]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {card.title}
                  </CardTitle>

                  <div className="flex size-9 items-center justify-center rounded-xl bg-[#0466c8]/10 text-[#0466c8] ring-1 ring-[#0466c8]/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#0466c8] group-hover:text-white group-hover:shadow-[0_0_16px_rgba(4,102,200,0.45)]">
                    <Icon className="size-4.5" />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="text-3xl font-extrabold tracking-tight text-foreground">
                    {card.value}
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{card.description}</span>
                    <ArrowRight className="size-3.5 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 text-[#0466c8]" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Grid: Recent Subjects & Activity */}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card className="border border-border/80">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
            <div>
              <CardTitle className="text-lg font-bold">Recent Subjects</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Your study modules and active courses</p>
            </div>

            <Link href="/subjects">
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-[#0466c8]">
                View All
                <ArrowRight className="size-3" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="pt-4">
            {data.recentSubjects.length === 0 ? (
              <div className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-border/80 p-6 text-center">
                <div>
                  <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-[#0466c8]/10 text-[#0466c8]">
                    <BookOpen className="size-5" />
                  </div>

                  <p className="mt-3 text-sm font-semibold">No subjects yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Create your first subject to start uploading papers and generating questions.
                  </p>

                  <Link href="/subjects" className="mt-4 inline-block">
                    <Button size="sm" variant="outline">
                      Create Subject
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentSubjects.map((subject) => (
                  <Link
                    key={subject.id}
                    href={`/subjects/${subject.id}`}
                    className="group block rounded-xl border border-border/70 p-4 transition-all duration-200 hover:border-[#0466c8]/40 hover:bg-[#0466c8]/[0.03] hover:shadow-xs hover:translate-x-1"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground group-hover:text-[#0466c8] transition-colors">
                            {subject.name}
                          </p>
                          {subject.code && (
                            <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                              {subject.code}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-xs text-muted-foreground sm:shrink-0 font-medium">
                        {formatRelativeTime(subject.updatedAt)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <FileText className="size-3.5 text-[#0466c8]" />
                        {subject.documentCount}{" "}
                        {subject.documentCount === 1 ? "document" : "documents"}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <FileQuestion className="size-3.5 text-[#0466c8]" />
                        {subject.generatedQuestionCount} practice{" "}
                        {subject.generatedQuestionCount === 1 ? "question" : "questions"}
                      </span>

                      <ArrowRight className="ml-auto size-3.5 text-[#0466c8] opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/80">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
            <div>
              <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Audit log of your study progression</p>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            {data.recentActivity.length === 0 ? (
              <div className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-border/80 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Your recent study activity, uploads, and tests will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {data.recentActivity.map((activity) => {
                  const Icon =
                    activity.type === "DOCUMENT"
                      ? FileText
                      : activity.type === "GENERATED_QUESTION"
                        ? GraduationCap
                        : FileQuestion;

                  const label =
                    activity.type === "DOCUMENT"
                      ? "Document uploaded"
                      : activity.type === "GENERATED_QUESTION"
                        ? "Practice question generated"
                        : "Mock exam created";

                  return (
                    <div
                      key={`${activity.type}-${activity.id}`}
                      className="group flex gap-3.5 rounded-xl border border-transparent p-2.5 transition-all duration-200 hover:border-border/60 hover:bg-muted/40"
                    >
                      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#0466c8]/10 text-[#0466c8] ring-1 ring-[#0466c8]/20 transition-transform group-hover:scale-105">
                        <Icon className="size-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">
                              {label}
                            </p>

                            <p className="mt-0.5 truncate text-sm text-muted-foreground">
                              {activity.title}
                            </p>

                            <span className="mt-1 inline-block rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                              {activity.subjectName}
                            </span>
                          </div>

                          <span className="text-xs text-muted-foreground sm:shrink-0 font-medium">
                            {formatRelativeTime(activity.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}