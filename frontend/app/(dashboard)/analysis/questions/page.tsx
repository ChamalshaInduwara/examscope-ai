import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  HelpCircle,
} from "lucide-react";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

import { QuestionHistoryFilters } from "@/components/analysis/question-history-filters";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type QuestionHistoryPageProps = {
  searchParams: Promise<{
    subject?: string;
    year?: string;
    type?: string;
    topic?: string;
  }>;
};

const QUESTION_TYPES = [
  "MCQ",
  "STRUCTURED",
  "ESSAY",
] as const;

type QuestionTypeFilter =
  (typeof QUESTION_TYPES)[number];

function formatType(
  type: QuestionTypeFilter
) {
  switch (type) {
    case "MCQ":
      return "MCQ";

    case "STRUCTURED":
      return "Structured";

    case "ESSAY":
      return "Essay";
  }
}

export default async function QuestionHistoryPage({
  searchParams,
}: QuestionHistoryPageProps) {
  const user = await requireUser();

  const params = await searchParams;

  const subjects =
    await prisma.subject.findMany({
      where: {
        userId: user.id,
        archived: false,
      },

      select: {
        id: true,
        name: true,
      },
    });

  const selectedSubjectId =
    subjects.some(
      (subject) =>
        subject.id === params.subject
    )
      ? params.subject
      : undefined;

  const topics =
    await prisma.topic.findMany({
      where: {
        subject: {
          userId: user.id,
          archived: false,
        },

        ...(selectedSubjectId
          ? {
              subjectId:
                selectedSubjectId,
            }
          : {}),
      },

      select: {
        id: true,
        name: true,
      },

      orderBy: {
        name: "asc",
      },
    });

  const selectedTopicId =
    topics.some(
      (topic) =>
        topic.id === params.topic
    )
      ? params.topic
      : undefined;

  const requestedYear =
    params.year
      ? Number(params.year)
      : undefined;

  const selectedYear =
    requestedYear &&
    Number.isInteger(requestedYear)
      ? requestedYear
      : undefined;

  const selectedType =
    QUESTION_TYPES.includes(
      params.type as QuestionTypeFilter
    )
      ? (params.type as QuestionTypeFilter)
      : undefined;

  const baseWhere = {
    subject: {
      userId: user.id,
      archived: false,
    },

    ...(selectedSubjectId
      ? {
          subjectId:
            selectedSubjectId,
        }
      : {}),

    ...(selectedTopicId
      ? {
          topicId:
            selectedTopicId,
        }
      : {}),

    ...(selectedType
      ? {
          type: selectedType,
        }
      : {}),
  };

  const [
    yearRecords,
    questionHistory,
    trendQuestions,
  ] = await Promise.all([
    prisma.question.findMany({
      where: {
        subject: {
          userId: user.id,
          archived: false,
        },

        ...(selectedSubjectId
          ? {
              subjectId:
                selectedSubjectId,
            }
          : {}),
      },

      select: {
        year: true,
      },

      distinct: ["year"],
    }),

    prisma.question.findMany({
      where: {
        ...baseWhere,

        ...(selectedYear
          ? {
              year: selectedYear,
            }
          : {}),
      },

      select: {
        id: true,
        number: true,
        text: true,
        type: true,
        marks: true,
        year: true,

        topic: {
          select: {
            id: true,
            name: true,
          },
        },

        document: {
          select: {
            id: true,
            title: true,
          },
        },

        subject: {
          select: {
            name: true,
            code: true,
          },
        },
      },

      orderBy: [
        {
          year: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    }),

    prisma.question.findMany({
      where: baseWhere,

      select: {
        year: true,
      },
    }),
  ]);

  const years = yearRecords
    .map((record) => record.year)
    .filter(
      (year): year is number =>
        year !== null
    )
    .sort((a, b) => b - a);

  const yearCounts =
    trendQuestions.reduce<
      Record<number, number>
    >((accumulator, question) => {
      if (question.year) {
        accumulator[question.year] =
          (accumulator[
            question.year
          ] ?? 0) + 1;
      }

      return accumulator;
    }, {});

  const maxYearCount = Math.max(
    ...Object.values(yearCounts),
    1
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Question History
          </h1>

          <p className="mt-2 text-muted-foreground">
            Review previous exam questions
            across years, topics and
            question types.
          </p>
        </div>

        <Button
          variant="outline"
          nativeButton={false}
          render={
            <Link href="/analysis" />
          }
        >
          <ArrowLeft className="size-4" />
          Back to Analysis
        </Button>
      </div>

      <QuestionHistoryFilters
        years={years}
        topics={topics}
        selectedYear={selectedYear}
        selectedType={selectedType}
        selectedTopicId={
          selectedTopicId
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Questions Found
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {questionHistory.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Years Available
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {years.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Topics Available
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {topics.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Questions by Year
          </CardTitle>

          <CardDescription>
            Historical question frequency
            based on analyzed past papers.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {Object.keys(yearCounts).length ===
          0 ? (
            <p className="text-sm text-muted-foreground">
              No year-based question data
              is available yet.
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(yearCounts)
                .sort(
                  ([a], [b]) =>
                    Number(b) -
                    Number(a)
                )
                .map(([year, count]) => {
                  const percentage =
                    Math.max(
                      5,
                      Math.round(
                        (count /
                          maxYearCount) *
                          100
                      )
                    );

                  return (
                    <div
                      key={year}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <CalendarDays className="size-4" />
                          {year}
                        </span>

                        <span className="text-sm text-muted-foreground">
                          {count} questions
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-foreground"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Question Records
          </CardTitle>

          <CardDescription>
            Questions extracted from your
            processed documents.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {questionHistory.length === 0 ? (
            <div className="py-12 text-center">
              <HelpCircle className="mx-auto size-10 text-muted-foreground" />

              <p className="mt-4 font-medium">
                No questions found
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Try changing the filters or
                process more past papers.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {questionHistory.map(
                (question) => (
                  <div
                    key={question.id}
                    className="rounded-lg border p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">
                            {formatType(
                              question.type
                            )}
                          </Badge>

                          {question.year ? (
                            <Badge variant="outline">
                              {question.year}
                            </Badge>
                          ) : null}

                          {question.marks ? (
                            <Badge variant="outline">
                              {question.marks} marks
                            </Badge>
                          ) : null}

                          {question.topic ? (
                            <Badge variant="outline">
                              {question.topic.name}
                            </Badge>
                          ) : null}
                        </div>

                        <p className="mt-4 leading-7">
                          {question.number
                            ? `${question.number}. `
                            : ""}
                          {question.text}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                          <span>
                            {question.subject.name}
                            {question.subject.code
                              ? ` (${question.subject.code})`
                              : ""}
                          </span>

                          {question.document ? (
                            <span className="flex items-center gap-1">
                              <FileText className="size-3" />
                              {
                                question
                                  .document
                                  .title
                              }
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}