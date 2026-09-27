import Link from "next/link";

import {
  ArrowLeft,
  FileQuestion,
  Layers3,
  Repeat2,
} from "lucide-react";

import { PatternSubjectFilter } from "@/components/analysis/pattern-subject-filter";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

type PatternsPageProps = {
  searchParams: Promise<{
    subject?: string;
  }>;
};

function normalizeQuestionText(
  value: string
) {
  return value
    .toLowerCase()
    .replace(
      /^\s*(?:question\s*)?\d+[a-z]?(?:[.)\-:])?\s*/i,
      ""
    )
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function PatternsPage({
  searchParams,
}: PatternsPageProps) {
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
        code: true,
      },

      orderBy: {
        name: "asc",
      },
    });

  const selectedSubjectId =
    subjects.some(
      (subject) =>
        subject.id === params.subject
    )
      ? params.subject
      : undefined;

  const questions =
    await prisma.question.findMany({
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
        text: true,
        number: true,
        year: true,
        type: true,

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
      },

      orderBy: {
        year: "desc",
      },
    });

  const topicMap =
    new Map<
      string,
      {
        id: string;
        name: string;
        questionCount: number;
        years: Set<number>;
      }
    >();

  for (const question of questions) {
    if (!question.topic) {
      continue;
    }

    const existing =
      topicMap.get(question.topic.id);

    if (existing) {
      existing.questionCount += 1;

      if (question.year) {
        existing.years.add(
          question.year
        );
      }

      continue;
    }

    topicMap.set(
      question.topic.id,
      {
        id: question.topic.id,
        name: question.topic.name,
        questionCount: 1,
        years: new Set(
          question.year
            ? [question.year]
            : []
        ),
      }
    );
  }

  const topicStats =
    Array.from(
      topicMap.values()
    ).sort(
      (a, b) =>
        b.questionCount -
        a.questionCount
    );

  const maxTopicQuestions =
    Math.max(
      ...topicStats.map(
        (topic) =>
          topic.questionCount
      ),
      1
    );

  const repeatedMap =
    new Map<
      string,
      {
        text: string;
        count: number;
        years: Set<number>;
        documentIds: Set<string>;
        documents: Set<string>;
      }
    >();

  for (const question of questions) {
    const normalized =
      normalizeQuestionText(
        question.text
      );

    if (!normalized) {
      continue;
    }

    const existing =
      repeatedMap.get(normalized);

    if (existing) {
      existing.count += 1;

      if (question.year) {
        existing.years.add(
          question.year
        );
      }

      if (question.document) {
        existing.documentIds.add(
          question.document.id
        );

        existing.documents.add(
          question.document.title
        );
      }

      continue;
    }

    repeatedMap.set(
      normalized,
      {
        text: question.text,
        count: 1,

        years: new Set(
          question.year
            ? [question.year]
            : []
        ),

        documentIds: new Set(
          question.document
            ? [question.document.id]
            : []
        ),

        documents: new Set(
          question.document
            ? [question.document.title]
            : []
        ),
      }
    );
  }

  const recurringQuestions =
    Array.from(
      repeatedMap.values()
    )
      .filter(
        (question) =>
          question.count >= 2 &&
          question.documentIds.size >= 2
      )
      .sort(
        (a, b) =>
          b.count - a.count
      );

  const questionsWithTopics =
    questions.filter(
      (question) =>
        question.topic !== null
    ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Pattern Analysis
          </h1>

          <p className="mt-2 text-muted-foreground">
            Explore frequently appearing
            topics and repeated question
            patterns from processed past
            papers.
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

      <PatternSubjectFilter
        subjects={subjects}
        selectedSubjectId={
          selectedSubjectId
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              Questions Analyzed

              <FileQuestion className="size-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {questions.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              Active Topics

              <Layers3 className="size-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {topicStats.length}
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              {questionsWithTopics} questions
              mapped to topics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              Repeated Patterns

              <Repeat2 className="size-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {recurringQuestions.length}
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Repeated across multiple
              documents
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Topic Frequency
          </CardTitle>

          <CardDescription>
            Topics ranked by how many
            analyzed questions were mapped
            to them.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {topicStats.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No question-to-topic data is
              available yet.
            </p>
          ) : (
            <div className="space-y-5">
              {topicStats
                .slice(0, 15)
                .map((topic) => {
                  const percentage =
                    Math.max(
                      4,
                      Math.round(
                        (topic.questionCount /
                          maxTopicQuestions) *
                          100
                      )
                    );

                  const years =
                    Array.from(
                      topic.years
                    ).sort(
                      (a, b) =>
                        b - a
                    );

                  return (
                    <div
                      key={topic.id}
                      className="space-y-2"
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium">
                            {topic.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {years.length > 0
                              ? `Years: ${years.join(
                                  ", "
                                )}`
                              : "No year information"}
                          </p>
                        </div>

                        <Badge variant="secondary">
                          {
                            topic.questionCount
                          }{" "}
                          questions
                        </Badge>
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
            Recurring Questions
          </CardTitle>

          <CardDescription>
            Questions with repeated normalized
            wording across different source
            documents.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {recurringQuestions.length ===
          0 ? (
            <div className="py-10 text-center">
              <Repeat2 className="mx-auto size-10 text-muted-foreground" />

              <p className="mt-4 font-medium">
                No repeated question wording
                found
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                More processed past papers
                may reveal recurring patterns.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recurringQuestions
                .slice(0, 15)
                .map(
                  (
                    recurringQuestion,
                    index
                  ) => {
                    const years =
                      Array.from(
                        recurringQuestion
                          .years
                      ).sort(
                        (a, b) =>
                          b - a
                      );

                    return (
                      <div
                        key={`${index}-${recurringQuestion.text}`}
                        className="rounded-lg border p-5"
                      >
                        <div className="flex flex-wrap gap-2">
                          <Badge>
                            {
                              recurringQuestion
                                .count
                            }{" "}
                            occurrences
                          </Badge>

                          {years.map(
                            (year) => (
                              <Badge
                                key={year}
                                variant="outline"
                              >
                                {year}
                              </Badge>
                            )
                          )}
                        </div>

                        <p className="mt-4 leading-7">
                          {
                            recurringQuestion
                              .text
                          }
                        </p>

                        {recurringQuestion
                          .documents.size >
                        0 ? (
                          <p className="mt-3 text-xs text-muted-foreground">
                            Sources:{" "}
                            {Array.from(
                              recurringQuestion
                                .documents
                            ).join(", ")}
                          </p>
                        ) : null}
                      </div>
                    );
                  }
                )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            How to read these patterns
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Topic frequency shows which
            detected topics have appeared in
            more analyzed questions.
          </p>

          <p>
            Recurring questions are based on
            repeated normalized wording across
            different uploaded documents.
          </p>

          <p>
            These are historical patterns,
            not exam predictions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}