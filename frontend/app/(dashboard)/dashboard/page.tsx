import Link from "next/link";

import {
  BookOpen,
  BrainCircuit,
  FileQuestion,
  FileText,
  GraduationCap,
  Upload,
} from "lucide-react";

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
      description: "Subjects added",
      icon: BookOpen,
    },
    {
      title: "Uploaded Files",
      value: data.overview.documents,
      description: "Documents uploaded",
      icon: Upload,
    },
    {
      title: "Predictions",
      value: data.overview.predictions,
      description: "Generated predictions",
      icon: BrainCircuit,
    },
    {
      title: "Practice Questions",
      value:
        data.overview.generatedQuestions,
      description: "Questions generated",
      icon: FileQuestion,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard
        </h1>

        <p className="mt-2 text-muted-foreground">
          Upload learning materials, analyze past papers,
          discover important topics and prepare for your
          upcoming exams.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>

                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {card.value}
                </div>

                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Recent Subjects
            </CardTitle>
          </CardHeader>

          <CardContent>
            {data.recentSubjects.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed">
                <div className="text-center">
                  <BookOpen className="mx-auto size-8 text-muted-foreground" />

                  <p className="mt-3 text-sm font-medium">
                    No subjects yet
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Create your first subject to begin
                    studying.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentSubjects.map(
                  (subject) => (
                    <Link
                      key={subject.id}
                      href={`/subjects/${subject.id}`}
                      className="block rounded-lg border p-4 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium">
                            {subject.name}
                          </p>

                          {subject.code ? (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {subject.code}
                            </p>
                          ) : null}
                        </div>

                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatRelativeTime(
                            subject.updatedAt,
                          )}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>
                          {subject.documentCount}{" "}
                          {subject.documentCount === 1
                            ? "document"
                            : "documents"}
                        </span>

                        <span>
                          {
                            subject.generatedQuestionCount
                          }{" "}
                          practice{" "}
                          {subject.generatedQuestionCount ===
                          1
                            ? "question"
                            : "questions"}
                        </span>
                      </div>
                    </Link>
                  ),
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Recent Activity
            </CardTitle>
          </CardHeader>

          <CardContent>
            {data.recentActivity.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">
                  Your recent study activity will appear
                  here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentActivity.map(
                  (activity) => {
                    const Icon =
                      activity.type === "DOCUMENT"
                        ? FileText
                        : activity.type ===
                            "GENERATED_QUESTION"
                          ? GraduationCap
                          : FileQuestion;

                    const label =
                      activity.type === "DOCUMENT"
                        ? "Document uploaded"
                        : activity.type ===
                            "GENERATED_QUESTION"
                          ? "Practice question generated"
                          : "Mock exam created";

                    return (
                      <div
                        key={`${activity.type}-${activity.id}`}
                        className="flex gap-3 border-b pb-3 last:border-b-0 last:pb-0"
                      >
                        <div className="mt-0.5 rounded-md border p-2">
                          <Icon className="size-4 text-muted-foreground" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-sm font-medium">
                                {label}
                              </p>

                              <p className="mt-1 truncate text-sm text-muted-foreground">
                                {activity.title}
                              </p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                {
                                  activity.subjectName
                                }
                              </p>
                            </div>

                            <span className="shrink-0 text-xs text-muted-foreground">
                              {formatRelativeTime(
                                activity.createdAt,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}